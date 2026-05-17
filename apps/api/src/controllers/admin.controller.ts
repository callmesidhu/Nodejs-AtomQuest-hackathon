import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/errors.js";
import { getActiveCycle } from "../utils/cycles.js";
import { listUsers, upsertUser } from "../services/user.service.js";

export const auditLogs = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await prisma.auditLog.findMany({ orderBy: { timestamp: "desc" }, take: 200 }));
});

export const cycle = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ activeCycle: getActiveCycle(), goalSettingStarts: "May 1", q1: "July", q2: "October", q3: "January", q4: "March/April" });
});

export const users = asyncHandler(async (_req: Request, res: Response) => res.json(await listUsers()));
export const saveUser = asyncHandler(async (req: Request, res: Response) => res.status(201).json(await upsertUser(req.body)));
