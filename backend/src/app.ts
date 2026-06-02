import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { env } from "./core/config/env";
import { errorHandler } from "./core/http/middlewares/error-handler";
import { notFoundHandler } from "./core/http/middlewares/not-found";
import { routes } from "./core/http/routes";

export const createApp = () => {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      credentials: true,
      origin: env.CORS_ORIGINS,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(pinoHttp());

  app.use(
    `/${env.API_PREFIX}/v1/auth`,
    rateLimit({
      legacyHeaders: false,
      limit: env.AUTH_RATE_LIMIT_MAX,
      standardHeaders: true,
      windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    }),
  );

  app.use(`/${env.API_PREFIX}/v1`, routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

