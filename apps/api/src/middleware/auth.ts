import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

export type AuthUser = { id: string; role: Role; email: string; name: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new AppError(401, "Missing access token");

  try {
    req.user = jwt.verify(header.slice(7), env.JWT_ACCESS_SECRET) as AuthUser;
    next();
  } catch {
    throw new AppError(401, "Invalid or expired access token");
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, "Unauthenticated");
    if (!roles.includes(req.user.role)) throw new AppError(403, "Insufficient permissions");
    next();
  };
}
