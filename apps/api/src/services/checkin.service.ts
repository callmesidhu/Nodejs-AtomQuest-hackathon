import type { Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/errors.js";
import { canCheckIn } from "../utils/cycles.js";
import { calculateProgressScore } from "../utils/progress.js";
import { audit } from "./audit.service.js";
import { syncSharedAchievement } from "./goal.service.js";

export async function createCheckin(user: { id: string; role: Role }, data: {
  goalId: string; quarter: string; achievement: number; employeeComment?: string; managerComment?: string; status?: "NOT_STARTED" | "ON_TRACK" | "COMPLETED";
}) {
  if (!canCheckIn(data.quarter)) throw new AppError(422, `${data.quarter} check-in window is not active`);
  const goal = await prisma.goal.findUniqueOrThrow({ where: { id: data.goalId }, include: { employee: true } });
  const isOwner = goal.employeeId === user.id;
  const isManager = user.role === "MANAGER" && goal.employee.managerId === user.id;
  if (!isOwner && !isManager && user.role !== "ADMIN") throw new AppError(403, "Check-in not accessible");

  const checkin = await prisma.quarterlyCheckin.create({
    data: {
      goalId: data.goalId,
      quarter: data.quarter,
      achievement: data.achievement,
      employeeComment: data.employeeComment,
      managerComment: data.managerComment
    }
  });

  const progressScore = calculateProgressScore({
    uomType: goal.uomType,
    targetValue: goal.targetValue,
    achievementValue: data.achievement,
    deadline: goal.deadline,
    completionDate: data.status === "COMPLETED" ? new Date() : undefined
  });

  await prisma.goal.update({
    where: { id: goal.id },
    data: { achievementValue: data.achievement, progressScore, status: data.status ?? goal.status }
  });

  if (goal.sharedGoalId) await syncSharedAchievement(goal.sharedGoalId, data.achievement);
  await audit({ entityType: "QuarterlyCheckin", entityId: checkin.id, action: "CHECKIN_CREATED", newValue: checkin, changedBy: user.id });
  return checkin;
}

export async function listCheckins(user: { id: string; role: Role }, goalId: string) {
  const goal = await prisma.goal.findUniqueOrThrow({ where: { id: goalId }, include: { employee: true } });
  if (user.role !== "ADMIN" && goal.employeeId !== user.id && goal.employee.managerId !== user.id) {
    throw new AppError(403, "Check-in not accessible");
  }
  return prisma.quarterlyCheckin.findMany({ where: { goalId }, orderBy: { createdAt: "desc" } });
}
