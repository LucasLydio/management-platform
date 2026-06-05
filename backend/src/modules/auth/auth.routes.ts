import { Router } from "express";
import type { Response } from "express";

import { env } from "../../core/config/env";
import { requireAuth } from "../../core/http/middlewares/require-auth";
import { AuthService } from "./auth.service";
import { googleLoginSchema, loginSchema, registerSchema } from "./auth.schemas";

const authService = new AuthService();

export const authRoutes = Router();

const cookieOptions = {
  domain: env.COOKIE_DOMAIN || undefined,
  httpOnly: true,
  maxAge: env.COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  path: env.COOKIE_PATH,
  sameSite: env.COOKIE_SAMESITE,
  secure: env.COOKIE_SECURE,
} as const;

const respondWithSession = (
  response: Response,
  session: Awaited<ReturnType<AuthService["login"]>>,
  status = 200,
) => {
  response.cookie(env.COOKIE_NAME, session.refreshToken, cookieOptions);
  response.status(status).json({
    data: {
      accessToken: session.accessToken,
      user: session.user,
    },
  });
};

authRoutes.post("/register", async (request, response, next) => {
  try {
    const { body } = registerSchema.parse(request);
    const session = await authService.register(body);
    respondWithSession(response, session, 201);
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/login", async (request, response, next) => {
  try {
    const { body } = loginSchema.parse(request);
    const session = await authService.login(body);
    respondWithSession(response, session);
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/google", async (request, response, next) => {
  try {
    const { body } = googleLoginSchema.parse(request);
    const session = await authService.loginWithGoogle(body.idToken);
    respondWithSession(response, session);
  } catch (error) {
    next(error);
  }
});

authRoutes.get("/google/config", async (_request, response, next) => {
  try {
    response.status(200).json({ data: authService.googleConfig() });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/refresh", async (request, response, next) => {
  try {
    const session = await authService.refresh(request.cookies[env.COOKIE_NAME]);
    respondWithSession(response, session);
  } catch (error) {
    next(error);
  }
});

authRoutes.get("/me", requireAuth, async (request, response, next) => {
  try {
    const user = await authService.me(request.user!.id);
    response.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/logout", requireAuth, async (request, response, next) => {
  try {
    await authService.revokeAll(request.user!.id);
    response.clearCookie(env.COOKIE_NAME, cookieOptions);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
