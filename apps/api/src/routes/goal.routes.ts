import { Router } from "express";
import { Role } from "@prisma/client";
import * as controller from "../controllers/goal.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { goalSchema, idParamSchema, rejectSchema, sharedGoalSchema, updateGoalSchema } from "../validators/schemas.js";

export const goalRoutes = Router();

goalRoutes.use(authenticate);
goalRoutes.get("/", controller.list);
goalRoutes.post("/", authorize(Role.EMPLOYEE, Role.MANAGER, Role.ADMIN), validate(goalSchema), controller.create);
goalRoutes.put("/:id", validate(updateGoalSchema), controller.update);
goalRoutes.delete("/:id", validate(idParamSchema), controller.remove);
goalRoutes.post("/submit", authorize(Role.EMPLOYEE), controller.submit);
goalRoutes.post("/shared", authorize(Role.MANAGER, Role.ADMIN), validate(sharedGoalSchema), controller.createShared);
goalRoutes.post("/:id/unlock", authorize(Role.ADMIN), validate(idParamSchema), controller.unlock);
