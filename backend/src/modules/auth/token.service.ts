import jwt from "jsonwebtoken";

import { env } from "../../core/config/env";

export type AuthTokenPayload = {
  email: string;
  name: string | null;
  role: "ADMIN" | "COMMON";
  sub: string;
  tokenVersion: number;
};

type JwtPayloadWithType = AuthTokenPayload & {
  type: "access" | "refresh";
};

const signToken = (
  payload: AuthTokenPayload,
  secret: string,
  expiresIn: string,
  type: "access" | "refresh",
) =>
  jwt.sign({ ...payload, type }, secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });

const verifyToken = (token: string, secret: string, type: "access" | "refresh") => {
  try {
    const payload = jwt.verify(token, secret) as JwtPayloadWithType;
    return payload.type === type ? payload : null;
  } catch {
    return null;
  }
};

export const createAccessToken = (payload: AuthTokenPayload) =>
  signToken(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN, "access");

export const createRefreshToken = (payload: AuthTokenPayload) =>
  signToken(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN, "refresh");

export const verifyAccessToken = (token: string) =>
  verifyToken(token, env.JWT_ACCESS_SECRET, "access");

export const verifyRefreshToken = (token: string) =>
  verifyToken(token, env.JWT_REFRESH_SECRET, "refresh");

