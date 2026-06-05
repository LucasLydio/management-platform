import type { NotionConnection, Task } from "@prisma/client";
import jwt from "jsonwebtoken";

import { env } from "../../../core/config/env";
import { AppError } from "../../../core/http/errors";
import { canAccessTask, type TaskActor } from "../../tasks/task.permissions";
import { TaskRepository } from "../../tasks/task.repository";
import { NotionClient } from "./notion.client";
import { NotionRepository } from "./notion.repository";

type NotionCallbackQuery = {
  code?: string;
  error?: string;
  error_description?: string;
  state?: string;
};

type NotionConnectionResult = {
  authUrl: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  provider: "notion";
  success: boolean;
  taskId: string;
};

type NotionStatePayload = {
  role: "ADMIN" | "COMMON";
  taskId: string;
  userId: string;
};

const notionClient = new NotionClient();
const notionRepository = new NotionRepository();
const taskRepository = new TaskRepository();

export class NotionService {
  async sendTask(taskId: string, actor: TaskActor): Promise<NotionConnectionResult> {
    this.assertConfigured();

    const task = await this.getTaskOrThrow(taskId, actor);
    const connection = await notionRepository.findByUserId(actor.id);

    if (!connection) {
      return {
        authUrl: this.authorizationUrl(task.id, actor),
        message: "Continue to Notion to authorize this task integration.",
        metadata: { requiresAuthorization: true },
        provider: "notion",
        success: true,
        taskId: task.id,
      };
    }

    const page = await this.createPageWithRefresh(connection, task);

    return {
      authUrl: null,
      message: "Task added to Notion.",
      metadata: {
        pageId: page.id,
        pageUrl: page.url,
        workspaceName: connection.workspaceName,
      },
      provider: "notion",
      success: true,
      taskId: task.id,
    };
  }

  async handleCallback(query: NotionCallbackQuery) {
    if (query.error) {
      return this.redirectUrl({
        integration: "notion",
        message: query.error_description || "Notion authorization was canceled.",
        status: "error",
      });
    }

    const state = this.verifyState(query.state);
    const code = query.code?.trim();
    if (!code) throw new AppError("Missing Notion authorization code", 400);

    const token = await notionClient.exchangeAuthorizationCode(code);
    await notionRepository.upsertByUserId(state.userId, {
      accessToken: token.access_token,
      botId: token.bot_id,
      duplicatedTemplateId: token.duplicated_template_id,
      ownerUserEmail: token.owner?.user?.person?.email ?? null,
      ownerUserId: token.owner?.user?.id ?? null,
      ownerUserName: token.owner?.user?.name ?? null,
      refreshToken: token.refresh_token,
      workspaceIcon: token.workspace_icon,
      workspaceId: token.workspace_id,
      workspaceName: token.workspace_name,
    });

    const task = await this.getTaskOrThrow(state.taskId, {
      id: state.userId,
      role: state.role,
    });
    const page = await this.createPageWithRefresh(
      (await notionRepository.findByUserId(state.userId))!,
      task,
    );

    return this.redirectUrl({
      integration: "notion",
      message: "Task added to Notion.",
      pageUrl: page.url,
      status: "success",
      taskId: task.id,
    });
  }

  callbackErrorRedirect(error: unknown) {
    const message = error instanceof AppError ? error.message : "Could not finish Notion integration.";
    return this.redirectUrl({
      integration: "notion",
      message,
      status: "error",
    });
  }

  private assertConfigured(): void {
    if (!env.NOTION_CLIENT_ID || !env.NOTION_CLIENT_SECRET || !env.NOTION_REDIRECT_URI) {
      throw new AppError("Notion integration is not configured on the server", 503);
    }
  }

  private authorizationUrl(taskId: string, actor: TaskActor): string {
    const params = new URLSearchParams({
      client_id: env.NOTION_CLIENT_ID,
      owner: "user",
      redirect_uri: env.NOTION_REDIRECT_URI,
      response_type: "code",
      state: this.signState({ role: actor.role, taskId, userId: actor.id }),
    });

    return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
  }

  private async createPageWithRefresh(connection: NotionConnection, task: Task) {
    try {
      return await notionClient.createTaskPage(connection.accessToken, task);
    } catch (error) {
      if (!(error instanceof AppError) || error.statusCode !== 401) throw error;

      const refreshed = await notionClient.refreshAccessToken(connection.refreshToken);
      await notionRepository.updateByUserId(connection.userId, {
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
      });

      return notionClient.createTaskPage(refreshed.access_token, task);
    }
  }

  private async getTaskOrThrow(taskId: string, actor: TaskActor): Promise<Task> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError("Task not found", 404);
    if (!canAccessTask(actor, task.ownerId)) throw new AppError("Forbidden", 403);
    return task;
  }

  private redirectUrl(input: {
    integration: "notion";
    message: string;
    pageUrl?: string;
    status: "error" | "success";
    taskId?: string;
  }) {
    const url = new URL(env.FRONTEND_APP_URL);
    url.searchParams.set("integration", input.integration);
    url.searchParams.set("integrationMessage", input.message);
    url.searchParams.set("integrationStatus", input.status);
    if (input.pageUrl) url.searchParams.set("integrationPageUrl", input.pageUrl);
    if (input.taskId) url.searchParams.set("taskId", input.taskId);
    return url.toString();
  }

  private signState(payload: NotionStatePayload): string {
    return jwt.sign(payload, env.INTEGRATION_STATE_SECRET || env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
  }

  private verifyState(state: string | undefined): NotionStatePayload {
    if (!state) throw new AppError("Missing Notion integration state", 400);

    try {
      return jwt.verify(state, env.INTEGRATION_STATE_SECRET || env.JWT_ACCESS_SECRET) as NotionStatePayload;
    } catch {
      throw new AppError("Invalid or expired Notion integration state", 400);
    }
  }
}
