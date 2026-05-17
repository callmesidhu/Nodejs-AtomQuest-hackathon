import ExcelJS from "exceljs";
import { stringify } from "csv-stringify/sync";
import { prisma } from "../config/prisma.js";

export async function getDashboard(role: string, userId: string) {
  const where = role === "ADMIN" ? {} : role === "MANAGER" ? { employee: { managerId: userId } } : { employeeId: userId };
  const goals = await prisma.goal.findMany({ where, include: { employee: true } });
  const completed = goals.filter((goal) => goal.status === "COMPLETED").length;
  const pendingApprovals = goals.filter((goal) => goal.approvalStatus === "SUBMITTED").length;
  const avgProgress = goals.length ? goals.reduce((sum, goal) => sum + goal.progressScore, 0) / goals.length : 0;
  const distribution = Object.entries(groupBy(goals, "approvalStatus")).map(([name, value]) => ({ name, value: value.length }));
  const byThrustArea = Object.entries(groupBy(goals, "thrustArea")).map(([name, value]) => ({
    name,
    progress: Math.round(value.reduce((sum, goal) => sum + goal.progressScore, 0) / value.length)
  }));
  return {
    totalGoals: goals.length,
    completed,
    completionRate: goals.length ? Math.round((completed / goals.length) * 100) : 0,
    pendingApprovals,
    avgProgress: Math.round(avgProgress),
    distribution,
    byThrustArea
  };
}

export async function exportReport(format: "csv" | "xlsx" = "csv") {
  const goals = await prisma.goal.findMany({ include: { employee: true } });
  const rows = goals.map((goal) => ({
    Employee: goal.employee.name,
    Email: goal.employee.email,
    ThrustArea: goal.thrustArea,
    Title: goal.title,
    Target: goal.targetValue,
    Achievement: goal.achievementValue,
    Weightage: goal.weightage,
    Progress: goal.progressScore,
    Status: goal.status,
    Approval: goal.approvalStatus
  }));

  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Planned vs Achievement");
    sheet.columns = Object.keys(rows[0] ?? { Employee: "" }).map((key) => ({ header: key, key, width: 22 }));
    sheet.addRows(rows);
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
  return Buffer.from(stringify(rows, { header: true }));
}

function groupBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const value = String(item[key] ?? "Unassigned");
    acc[value] = [...(acc[value] ?? []), item];
    return acc;
  }, {});
}
