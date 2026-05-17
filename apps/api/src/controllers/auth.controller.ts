import type { Request, Response } from "express";
import { asyncHandler } from "../utils/errors.js";
import * as service from "../services/auth.service.js";

export const login = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.login(req.body.email, req.body.password));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.refresh(req.body.refreshToken));
});
