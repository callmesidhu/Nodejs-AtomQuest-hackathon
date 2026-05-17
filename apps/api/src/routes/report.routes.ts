import { Router } from "express";
import { dashboard, exportGoals } from "../controllers/report.controller.js";
import { authenticate } from "../middleware/auth.js";

export const reportRoutes = Router();

reportRoutes.use(authenticate);
reportRoutes.get("/dashboard", dashboard);
reportRoutes.get("/export", exportGoals);
