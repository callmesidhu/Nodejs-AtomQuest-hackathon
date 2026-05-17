import type { Request, Response } from "express";
import { asyncHandler } from "../utils/errors.js";
import * as service from "../services/goal.service.js";

export const list = asyncHandler(async (req: Request, res: Response) => res.json(await service.listGoals(req.user!)));
export const create = asyncHandler(async (req: Request, res: Response) => res.status(201).json(await service.createGoal(req.user!.id, req.body)));
export const update = asyncHandler(async (req: Request, res: Response) => res.json(await service.updateGoal(req.user!, String(req.params.id), req.body)));
export const remove = asyncHandler(async (req: Request, res: Response) => res.json(await service.deleteGoal(req.user!, String(req.params.id))));
export const submit = asyncHandler(async (req: Request, res: Response) => res.json(await service.submitGoals(req.user!.id)));
export const approve = asyncHandler(async (req: Request, res: Response) => res.json(await service.approveGoal(req.user!.id, String(req.params.id))));
export const reject = asyncHandler(async (req: Request, res: Response) => res.json(await service.rejectGoal(req.user!.id, String(req.params.id), req.body.comment)));
export const unlock = asyncHandler(async (req: Request, res: Response) => res.json(await service.unlockGoal(req.user!.id, String(req.params.id))));
export const createShared = asyncHandler(async (req: Request, res: Response) => res.status(201).json(await service.createSharedGoal(req.user!.id, req.body)));
