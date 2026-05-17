import type { Request, Response } from "express";
import { asyncHandler } from "../utils/errors.js";
import { exportReport, getDashboard } from "../services/report.service.js";

export const dashboard = asyncHandler(async (req: Request, res: Response) => res.json(await getDashboard(req.user!.role, req.user!.id)));

export const exportGoals = asyncHandler(async (req: Request, res: Response) => {
  const format = req.query.format === "xlsx" ? "xlsx" : "csv";
  const buffer = await exportReport(format);
  res.setHeader("Content-Type", format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=goalsync-report.${format}`);
  res.send(buffer);
});
