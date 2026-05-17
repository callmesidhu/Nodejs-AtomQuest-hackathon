import type { Request, Response } from "express";
import { asyncHandler } from "../utils/errors.js";
import * as service from "../services/checkin.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => res.status(201).json(await service.createCheckin(req.user!, req.body)));
export const list = asyncHandler(async (req: Request, res: Response) => res.json(await service.listCheckins(req.user!, String(req.params.goalId))));
