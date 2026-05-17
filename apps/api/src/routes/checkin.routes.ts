import { Router } from "express";
import { create, list } from "../controllers/checkin.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { checkinSchema } from "../validators/schemas.js";

export const checkinRoutes = Router();

checkinRoutes.use(authenticate);
checkinRoutes.post("/", validate(checkinSchema), create);
checkinRoutes.get("/:goalId", list);
