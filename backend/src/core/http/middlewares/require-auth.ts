import type { RequestHandler } from "express";

import { AppError } from "../errors";
import { verifyAccessToken } from "../../../modules/auth/token.service";

export const requireAuth: RequestHandler = (request, _response, next) => {
  const [, token] = request.headers.authorization?.split(" ") ?? [];
  const payload = token ? verifyAccessToken(token) : null;

  if (!payload) throw new AppError("Unauthorized", 401);

  request.user = {
    email: payload.email,
    id: payload.sub,
    name: payload.name,
    role: payload.role,
  };

  next();
};

