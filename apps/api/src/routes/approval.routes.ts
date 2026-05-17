import { Router } from "express";
import { Role } from "@prisma/client";
import { approve, reject } from "../controllers/goal.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema, rejectSchema } from "../validators/schemas.js";

export const approvalRoutes = Router();

approvalRoutes.use(authenticate, authorize(Role.MANAGER));
approvalRoutes.post("/:id/approve", validate(idParamSchema), approve);
approvalRoutes.post("/:id/reject", validate(rejectSchema), reject);
