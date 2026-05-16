import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, "Invalid email or password");
  }

  const payload = { id: user.id, role: user.role, email: user.email, name: user.name };
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"] });
  const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_TTL as jwt.SignOptions["expiresIn"] });
  const decoded = jwt.decode(refreshToken) as { exp: number };

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(decoded.exp * 1000)
    }
  });

  return { accessToken, refreshToken, user: payload };
}

export async function refresh(refreshToken: string) {
  let decoded: { id: string };
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }

  const candidates = await prisma.refreshToken.findMany({
    where: { userId: decoded.id, expiresAt: { gt: new Date() } }
  });
  const match = await firstMatchingToken(candidates, refreshToken);
  if (!match) throw new AppError(401, "Refresh token revoked");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: decoded.id } });
  const payload = { id: user.id, role: user.role, email: user.email, name: user.name };
  return { accessToken: jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"] }) };
}

async function firstMatchingToken(tokens: { tokenHash: string }[], token: string) {
  for (const candidate of tokens) {
    if (await bcrypt.compare(token, candidate.tokenHash)) return candidate;
  }
  return null;
}
