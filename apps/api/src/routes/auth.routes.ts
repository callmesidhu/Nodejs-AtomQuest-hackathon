import { Router } from "express";
import { login, refresh } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, refreshSchema } from "../validators/schemas.js";

export const authRoutes = Router();

authRoutes.post("/login", validate(loginSchema), login);
authRoutes.post("/refresh", validate(refreshSchema), refresh);
