import { Router } from "express";
import { Role } from "@prisma/client";
import { auditLogs, cycle, saveUser, users } from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const adminRoutes = Router();

adminRoutes.use(authenticate, authorize(Role.ADMIN));
adminRoutes.get("/audit-logs", auditLogs);
adminRoutes.get("/cycle", cycle);
adminRoutes.get("/users", users);
adminRoutes.post("/users", saveUser);
