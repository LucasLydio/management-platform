import { Router } from "express";

import { authRoutes } from "../../../modules/auth/auth.routes";
import { healthRoutes } from "../../../modules/health/health.routes";
import { integrationRoutes } from "../../../modules/integrations/integration.routes";
import { taskRoutes } from "../../../modules/tasks/task.routes";

export const routes = Router();

routes.use("/health", healthRoutes);
routes.use("/auth", authRoutes);
routes.use("/integrations", integrationRoutes);
routes.use("/tasks", taskRoutes);
