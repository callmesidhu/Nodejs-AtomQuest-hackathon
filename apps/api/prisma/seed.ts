import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@goalsync.com" },
    update: {},
    create: { name: "Asha Rao", email: "admin@goalsync.com", password, role: "ADMIN" }
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@goalsync.com" },
    update: {},
    create: { name: "Maya Singh", email: "manager@goalsync.com", password, role: "MANAGER" }
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@goalsync.com" },
    update: { managerId: manager.id },
    create: { name: "Rohan Mehta", email: "employee@goalsync.com", password, role: "EMPLOYEE", managerId: manager.id }
  });

  const existing = await prisma.goal.count({ where: { employeeId: employee.id } });
  if (!existing) {
    await prisma.goal.createMany({
      data: [
        {
          employeeId: employee.id,
          thrustArea: "Customer Success",
          title: "Improve implementation NPS",
          description: "Raise onboarding NPS through proactive milestone reviews.",
          uomType: "MIN",
          targetValue: 85,
          achievementValue: 62,
          weightage: 40,
          progressScore: 72.94,
          status: "ON_TRACK",
          approvalStatus: "SUBMITTED",
          quarter: "FY26",
          deadline: new Date("2026-09-30")
        },
        {
          employeeId: employee.id,
          thrustArea: "Operational Excellence",
          title: "Reduce ticket aging",
          description: "Keep average aging for priority tickets under target.",
          uomType: "MAX",
          targetValue: 5,
          achievementValue: 7,
          weightage: 30,
          progressScore: 71.43,
          status: "ON_TRACK",
          approvalStatus: "SUBMITTED",
          quarter: "FY26",
          deadline: new Date("2026-10-31")
        },
        {
          employeeId: employee.id,
          thrustArea: "People",
          title: "Complete mentoring plan",
          description: "Run structured mentorship sessions for new analysts.",
          uomType: "MIN",
          targetValue: 10,
          achievementValue: 4,
          weightage: 30,
          progressScore: 40,
          status: "NOT_STARTED",
          approvalStatus: "SUBMITTED",
          quarter: "FY26",
          deadline: new Date("2026-12-31")
        }
      ]
    });
  }

  console.log({ admin: admin.email, manager: manager.email, employee: employee.email });
}

main().finally(async () => prisma.$disconnect());
