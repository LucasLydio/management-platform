import { Router } from "express";

import { requireAuth } from "../../core/http/middlewares/require-auth";
import { integrationRequestSchema, notionCallbackSchema } from "./integration.schemas";
import { IntegrationService } from "./integration.service";

const integrationService = new IntegrationService();

export const integrationRoutes = Router();

integrationRoutes.get("/notion/callback", async (request, response) => {
  try {
    const { query } = notionCallbackSchema.parse(request);
    const redirectUrl = await integrationService.notionCallback(query);

    response.redirect(302, redirectUrl);
  } catch (error) {
    response.redirect(302, integrationService.notionCallbackErrorRedirect(error));
  }
});

integrationRoutes.use(requireAuth);

integrationRoutes.post("/google-calendar/tasks/:taskId", async (request, response, next) => {
  try {
    const {
      params: { taskId },
    } = integrationRequestSchema.parse(request);
    const result = await integrationService.connectGoogleCalendar(taskId, request.user!);

    response.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
});

integrationRoutes.post("/notion/tasks/:taskId", async (request, response, next) => {
  try {
    const {
      params: { taskId },
    } = integrationRequestSchema.parse(request);
    const result = await integrationService.sendToNotion(taskId, request.user!);

    response.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
});

integrationRoutes.post("/google-drive/tasks/:taskId", async (request, response, next) => {
  try {
    const {
      params: { taskId },
    } = integrationRequestSchema.parse(request);
    const result = await integrationService.attachGoogleDrive(taskId, request.user!);

    response.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
});
