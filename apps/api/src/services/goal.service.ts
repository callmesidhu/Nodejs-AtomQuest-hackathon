import type { ApprovalStatus, Goal, Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/errors.js";
import { calculateProgressScore } from "../utils/progress.js";
import { audit } from "./audit.service.js";
import { sendMail, templates } from "./mail.service.js";

const auditedFields = ["targetValue", "weightage"] as const;

export async function listGoals(user: { id: string; role: Role }) {
  if (user.role === "ADMIN") {
    return prisma.goal.findMany({ include: { employee: true, sharedGoal: true }, orderBy: { updatedAt: "desc" } });
  }
  if (user.role === "MANAGER") {
    return prisma.goal.findMany({
      where: { OR: [{ employeeId: user.id }, { employee: { managerId: user.id } }] },
      include: { employee: true, sharedGoal: true },
      orderBy: { updatedAt: "desc" }
    });
  }
  return prisma.goal.findMany({ where: { employeeId: user.id }, include: { sharedGoal: true }, orderBy: { updatedAt: "desc" } });
}

export async function createGoal(userId: string, data: Prisma.GoalUncheckedCreateInput) {
  await assertGoalLimit(userId);
  await assertProjectedWeightage(userId, Number(data.weightage));
  const goal = await prisma.goal.create({
    data: {
      ...data,
      employeeId: userId,
      progressScore: calculateProgressScore({
        uomType: data.uomType,
        targetValue: Number(data.targetValue),
        achievementValue: Number(data.achievementValue ?? 0)
      })
    }
  });
  await audit({ entityType: "Goal", entityId: goal.id, action: "GOAL_CREATED", newValue: goal, changedBy: userId });
  return goal;
}

export async function updateGoal(user: { id: string; role: Role }, id: string, data: Partial<Goal>) {
  const existing = await prisma.goal.findUniqueOrThrow({ where: { id }, include: { employee: true } });
  assertCanAccessGoal(user, existing);
  if (existing.isLocked) throw new AppError(409, "Locked goals cannot be edited");
  if (existing.sharedGoalId && user.role === "EMPLOYEE" && (data.title || data.targetValue || data.thrustArea)) {
    throw new AppError(409, "Shared goal title, thrust area and target are read-only for recipients");
  }

  if (data.weightage) await assertProjectedWeightage(existing.employeeId, Number(data.weightage), id);
  const next = await prisma.goal.update({
    where: { id },
    data: {
      ...data,
      progressScore: calculateProgressScore({
        uomType: data.uomType ?? existing.uomType,
        targetValue: Number(data.targetValue ?? existing.targetValue),
        achievementValue: Number(data.achievementValue ?? existing.achievementValue),
        deadline: existing.deadline
      })
    }
  });

  await audit({ entityType: "Goal", entityId: id, action: "GOAL_EDIT", oldValue: existing, newValue: next, changedBy: user.id });
  for (const field of auditedFields) {
    if (data[field] !== undefined && data[field] !== existing[field]) {
      await audit({ entityType: "Goal", entityId: id, action: `${field.toUpperCase()}_CHANGE`, oldValue: existing[field], newValue: data[field], changedBy: user.id });
    }
  }
  return next;
}

export async function deleteGoal(user: { id: string; role: Role }, id: string) {
  const existing = await prisma.goal.findUniqueOrThrow({ where: { id } });
  assertCanAccessGoal(user, existing);
  if (existing.isLocked) throw new AppError(409, "Locked goals cannot be deleted");
  await audit({ entityType: "Goal", entityId: id, action: "GOAL_DELETE", oldValue: existing, changedBy: user.id });
  return prisma.goal.delete({ where: { id } });
}

export async function submitGoals(employeeId: string) {
  const goals = await prisma.goal.findMany({ where: { employeeId, approvalStatus: { in: ["DRAFT", "REJECTED"] } }, include: { employee: { include: { manager: true } } } });
  if (!goals.length) throw new AppError(400, "No draft or rejected goals to submit");
  validateFinalSheet(goals);
  await prisma.goal.updateMany({ where: { employeeId, approvalStatus: { in: ["DRAFT", "REJECTED"] } }, data: { approvalStatus: "SUBMITTED" } });
  const manager = goals[0].employee.manager;
  if (manager) await sendMail(manager.email, "GoalSync goals submitted", templates.submitted(goals[0].employee.name));
  return prisma.goal.findMany({ where: { employeeId } });
}

export async function approveGoal(userId: string, id: string) {
  const goal = await prisma.goal.findUniqueOrThrow({ where: { id }, include: { employee: true } });
  if (goal.employee.managerId !== userId) throw new AppError(403, "Only the L1 manager can approve this goal");
  const updated = await prisma.goal.update({ where: { id }, data: { approvalStatus: "APPROVED", isLocked: true } });
  await audit({ entityType: "Goal", entityId: id, action: "GOAL_APPROVAL", oldValue: goal.approvalStatus, newValue: "APPROVED", changedBy: userId });
  await sendMail(goal.employee.email, "GoalSync goal approved", templates.approved());
  return updated;
}

export async function rejectGoal(userId: string, id: string, comment?: string) {
  const goal = await prisma.goal.findUniqueOrThrow({ where: { id }, include: { employee: true } });
  if (goal.employee.managerId !== userId) throw new AppError(403, "Only the L1 manager can reject this goal");
  const updated = await prisma.goal.update({ where: { id }, data: { approvalStatus: "REJECTED", isLocked: false } });
  await audit({ entityType: "Goal", entityId: id, action: "GOAL_APPROVAL", oldValue: goal.approvalStatus, newValue: { status: "REJECTED", comment }, changedBy: userId });
  await sendMail(goal.employee.email, "GoalSync goal rejected", templates.rejected(comment));
  return updated;
}

export async function unlockGoal(adminId: string, id: string) {
  const goal = await prisma.goal.findUniqueOrThrow({ where: { id } });
  if (goal.approvalStatus !== "APPROVED") throw new AppError(400, "Only approved goals can be unlocked");
  const updated = await prisma.goal.update({ where: { id }, data: { isLocked: false, approvalStatus: "DRAFT" } });
  await audit({ entityType: "Goal", entityId: id, action: "GOAL_UNLOCK", oldValue: goal, newValue: updated, changedBy: adminId });
  return updated;
}

export async function createSharedGoal(userId: string, data: {
  title: string; description: string; targetValue: number; thrustArea: string; assignedEmployees: string[]; weightage: number; deadline: Date; quarter: string;
}) {
  const shared = await prisma.sharedGoal.create({
    data: {
      createdBy: userId,
      title: data.title,
      description: data.description,
      targetValue: data.targetValue,
      thrustArea: data.thrustArea,
      assignedEmployees: data.assignedEmployees
    }
  });

  for (const employeeId of data.assignedEmployees) {
    await assertGoalLimit(employeeId);
    await assertProjectedWeightage(employeeId, data.weightage);
    await prisma.goal.create({
      data: {
        employeeId,
        sharedGoalId: shared.id,
        title: shared.title,
        description: shared.description,
        targetValue: shared.targetValue,
        thrustArea: shared.thrustArea,
        uomType: "MIN",
        weightage: data.weightage,
        quarter: data.quarter,
        deadline: data.deadline
      }
    });
  }
  await audit({ entityType: "SharedGoal", entityId: shared.id, action: "SHARED_GOAL_CREATED", newValue: shared, changedBy: userId });
  return shared;
}

export async function syncSharedAchievement(sharedGoalId: string, achievementValue: number) {
  const goals = await prisma.goal.findMany({ where: { sharedGoalId } });
  await Promise.all(goals.map((goal) => prisma.goal.update({
    where: { id: goal.id },
    data: {
      achievementValue,
      progressScore: calculateProgressScore({ uomType: goal.uomType, targetValue: goal.targetValue, achievementValue })
    }
  })));
}

async function assertGoalLimit(employeeId: string) {
  const count = await prisma.goal.count({ where: { employeeId } });
  if (count >= 8) throw new AppError(422, "Maximum 8 goals per employee");
}

async function assertProjectedWeightage(employeeId: string, newWeightage: number, excludeGoalId?: string) {
  if (newWeightage < 10) throw new AppError(422, "Minimum weightage per goal is 10%");
  const goals = await prisma.goal.findMany({ where: { employeeId, id: excludeGoalId ? { not: excludeGoalId } : undefined } });
  const total = goals.reduce((sum, goal) => sum + goal.weightage, 0) + newWeightage;
  if (total > 100) throw new AppError(422, "Total weightage cannot exceed 100%");
}

function validateFinalSheet(goals: Goal[]) {
  if (goals.length > 8) throw new AppError(422, "Maximum 8 goals per employee");
  if (goals.some((goal) => goal.weightage < 10)) throw new AppError(422, "Minimum weightage per goal is 10%");
  const total = goals.reduce((sum, goal) => sum + goal.weightage, 0);
  if (Math.abs(total - 100) > 0.001) throw new AppError(422, "Total weightage across all goals must equal exactly 100%");
}

function assertCanAccessGoal(user: { id: string; role: Role }, goal: Pick<Goal, "employeeId"> & { employee?: { managerId: string | null } }) {
  if (user.role === "ADMIN") return;
  if (goal.employeeId === user.id) return;
  if (user.role === "MANAGER" && goal.employee?.managerId === user.id) return;
  throw new AppError(403, "Goal not accessible");
}
