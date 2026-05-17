import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export function listUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, managerId: true, createdAt: true },
    orderBy: { name: "asc" }
  });
}

export async function upsertUser(data: Prisma.UserUncheckedCreateInput) {
  const password = data.password.startsWith("$2") ? data.password : await bcrypt.hash(data.password, 10);
  return prisma.user.upsert({
    where: { email: data.email },
    update: { ...data, password },
    create: { ...data, password },
    select: { id: true, name: true, email: true, role: true, managerId: true }
  });
}
