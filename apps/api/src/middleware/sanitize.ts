import type { NextFunction, Request, Response } from "express";
import xss from "xss";

function clean(value: unknown): unknown {
  if (typeof value === "string") return xss(value.trim());
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clean(item)]));
  }
  return value;
}

export function sanitize(req: Request, _res: Response, next: NextFunction) {
  req.body = clean(req.body) as typeof req.body;
  next();
}
