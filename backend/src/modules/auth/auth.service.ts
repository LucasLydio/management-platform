import bcrypt from "bcrypt";

import { env } from "../../core/config/env";
import { AppError } from "../../core/http/errors";
import { AuthRepository } from "./auth.repository";
import {
  type AuthTokenPayload,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "./token.service";

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string;
  name?: string;
  sub?: string;
};

const authRepository = new AuthRepository();

const publicUser = (user: {
  email: string;
  id: string;
  name: string | null;
  role: "ADMIN" | "COMMON";
}) => ({
  email: user.email,
  id: user.id,
  name: user.name,
  role: user.role,
});

const makePayload = (user: {
  email: string;
  id: string;
  name: string | null;
  role: "ADMIN" | "COMMON";
  tokenVersion: number;
}): AuthTokenPayload => ({
  email: user.email,
  name: user.name,
  role: user.role,
  sub: user.id,
  tokenVersion: user.tokenVersion,
});

const makeSession = (user: {
  email: string;
  id: string;
  name: string | null;
  role: "ADMIN" | "COMMON";
  tokenVersion: number;
}) => {
  const payload = makePayload(user);

  return {
    accessToken: createAccessToken(payload),
    refreshToken: createRefreshToken(payload),
    user: publicUser(user),
  };
};

export class AuthService {
  googleConfig() {
    return {
      clientId: env.GOOGLE_CLIENT_ID,
      enabled: Boolean(env.GOOGLE_CLIENT_ID),
    };
  }

  async register(input: { email: string; name: string; password: string }) {
    const existingUser = await authRepository.findByEmail(input.email);
    if (existingUser) throw new AppError("E-mail already registered", 409);

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await authRepository.createLocal({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    return makeSession(user);
  }

  async login(input: { email: string; password: string }) {
    const user = await authRepository.findByEmail(input.email);
    const canLogin = user?.passwordHash
      ? await bcrypt.compare(input.password, user.passwordHash)
      : false;

    if (!user || !canLogin) throw new AppError("Invalid credentials", 401);

    return makeSession(user);
  }

  async loginWithGoogle(idToken: string) {
    if (!env.GOOGLE_CLIENT_ID) throw new AppError("Google auth is not configured", 503);

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );

    if (!response.ok) throw new AppError("Invalid Google token", 401);

    const tokenInfo = (await response.json()) as GoogleTokenInfo;
    const validAudience = tokenInfo.aud === env.GOOGLE_CLIENT_ID;
    const verifiedEmail = tokenInfo.email_verified === "true";

    if (!validAudience || !verifiedEmail || !tokenInfo.email || !tokenInfo.sub) {
      throw new AppError("Invalid Google token", 401);
    }

    const user = await authRepository.upsertGoogle({
      email: tokenInfo.email,
      googleId: tokenInfo.sub,
      name: tokenInfo.name ?? tokenInfo.email,
    });

    return makeSession(user);
  }

  async me(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw new AppError("Unauthorized", 401);

    return publicUser(user);
  }

  async refresh(refreshToken: string | undefined) {
    const payload = refreshToken ? verifyRefreshToken(refreshToken) : null;
    if (!payload) throw new AppError("Unauthorized", 401);

    const user = await authRepository.findById(payload.sub);
    const validVersion = user?.tokenVersion === payload.tokenVersion;
    if (!user || !validVersion) throw new AppError("Unauthorized", 401);

    return makeSession(user);
  }

  async revokeAll(userId: string) {
    await authRepository.update(userId, { tokenVersion: { increment: 1 } });
  }
}
