import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    API_PREFIX: z.string().default("api"),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().default(200),
    AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
    COOKIE_DOMAIN: z.string().optional().default(""),
    COOKIE_MAX_AGE_DAYS: z.coerce.number().default(30),
    COOKIE_NAME: z.string().default("management_refresh"),
    COOKIE_PATH: z.string().default("/"),
    COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
    COOKIE_SECURE: z.coerce.boolean().default(false),
    CORS_ORIGIN: z.string().optional(),
    CORS_ORIGINS: z.string().optional(),
    DATABASE_URL: z.string().optional(),
    DB_DATABASE: z.string().default("management"),
    DB_HOST: z.string().default("localhost"),
    DB_PASSWORD: z.string().default("postgres"),
    DB_PORT: z.coerce.number().default(5432),
    DB_USERNAME: z.string().default("postgres"),
    GOOGLE_CLIENT_ID: z.string().optional().default(""),
    JWT_ACCESS_EXPIRES_IN: z.string().default("45m"),
    JWT_ACCESS_SECRET: z.string().min(24),
    JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
    JWT_REFRESH_SECRET: z.string().min(24),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3333),
    REDIS_URL: z.string().optional().default(""),
  })
  .transform((values) => {
    const databaseUrl =
      values.DATABASE_URL ??
      `postgresql://${values.DB_USERNAME}:${values.DB_PASSWORD}@${values.DB_HOST}:${values.DB_PORT}/${values.DB_DATABASE}`;

    const corsOrigins = (values.CORS_ORIGINS ?? values.CORS_ORIGIN ?? "http://localhost:8080")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    return { ...values, CORS_ORIGINS: corsOrigins, DATABASE_URL: databaseUrl };
  });

export const env = envSchema.parse(process.env);

