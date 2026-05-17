import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Role } from "@prisma/client";
import { env } from "./config/env.js";
import { sanitize } from "./middleware/sanitize.js";
import { authenticate, authorize } from "./middleware/auth.js";
import { errorHandler } from "./utils/errors.js";
import { auditLogs } from "./controllers/admin.controller.js";
import { authRoutes } from "./routes/auth.routes.js";
import { goalRoutes } from "./routes/goal.routes.js";
import { approvalRoutes } from "./routes/approval.routes.js";
import { checkinRoutes } from "./routes/checkin.routes.js";
import { reportRoutes } from "./routes/report.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use(express.json({ limit: "1mb" }));
app.use(sanitize);
app.use(morgan("tiny"));

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "GoalSync API", version: "1.0.0" },
    servers: [{ url: "http://localhost:4000" }]
  },
  apis: ["./src/routes/*.ts"]
});

app.get("/health", (_req, res) => res.json({ ok: true, app: "GoalSync" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
app.use("/auth", authRoutes);
app.use("/goals", goalRoutes);
app.use("/approval", approvalRoutes);
app.use("/checkins", checkinRoutes);
app.use("/reports", reportRoutes);
app.get("/audit-logs", authenticate, authorize(Role.ADMIN), auditLogs);
app.use("/admin", adminRoutes);
app.use(errorHandler);
