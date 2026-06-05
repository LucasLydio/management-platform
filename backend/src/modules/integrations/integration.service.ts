import type { Task } from "@prisma/client";

import { env } from "../../core/config/env";
import { AppError } from "../../core/http/errors";
import type { TaskActor } from "../tasks/task.permissions";
import { canAccessTask } from "../tasks/task.permissions";
import { TaskRepository } from "../tasks/task.repository";
import { NotionService } from "./notion/notion.service";

type IntegrationProvider = "google-calendar" | "google-drive";

type TaskIntegrationResult = {
  authUrl: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  provider: "google-calendar" | "notion" | "google-drive";
  success: boolean;
  taskId: string;
};

const notionService = new NotionService();
const taskRepository = new TaskRepository();

export class IntegrationService {
  connectGoogleCalendar(taskId: string, actor: TaskActor) {
    return this.buildPlaceholderResult("google-calendar", taskId, actor);
  }

  sendToNotion(taskId: string, actor: TaskActor) {
    return notionService.sendTask(taskId, actor);
  }

  attachGoogleDrive(taskId: string, actor: TaskActor) {
    return this.buildPlaceholderResult("google-drive", taskId, actor);
  }

  notionCallback(query: {
    code?: string;
    error?: string;
    error_description?: string;
    state?: string;
  }) {
    return notionService.handleCallback(query);
  }

  notionCallbackErrorRedirect(error: unknown) {
    return notionService.callbackErrorRedirect(error);
  }

  private async buildPlaceholderResult(
    provider: IntegrationProvider,
    taskId: string,
    actor: TaskActor,
  ): Promise<TaskIntegrationResult> {
    const task = await this.getTaskOrThrow(taskId, actor);
    const authUrl = this.resolveAuthUrl(provider);

    return {
      authUrl,
      message: authUrl ? this.authMessage(provider) : this.readyMessage(provider),
      metadata: this.buildMetadata(provider, task),
      provider,
      success: true,
      taskId: task.id,
    };
  }

  private async getTaskOrThrow(taskId: string, actor: TaskActor): Promise<Task> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError("Task not found", 404);
    if (!canAccessTask(actor, task.ownerId)) throw new AppError("Forbidden", 403);
    return task;
  }

  private resolveAuthUrl(provider: IntegrationProvider): string | null {
    switch (provider) {
      case "google-calendar":
        return env.GOOGLE_CALENDAR_AUTH_URL || null;
      case "google-drive":
        return env.GOOGLE_DRIVE_AUTH_URL || null;
    }
  }

  private authMessage(provider: IntegrationProvider): string {
    switch (provider) {
      case "google-calendar":
        return "Continue to Google Calendar to authorize this task integration.";
      case "google-drive":
        return "Continue to Google Drive to authorize this task integration.";
    }
  }

  private readyMessage(provider: IntegrationProvider): string {
    switch (provider) {
      case "google-calendar":
        return "Task prepared for Google Calendar.";
      case "google-drive":
        return "Task prepared for Google Drive.";
    }
  }

  private buildMetadata(provider: IntegrationProvider, task: Task): Record<string, unknown> {
    switch (provider) {
      case "google-calendar":
        return {
          draft: {
            description: task.description,
            endsAt: task.dueDate?.toISOString() ?? null,
            startsAt: task.dueDate?.toISOString() ?? null,
            title: task.title,
          },
          taskStatus: task.status,
        };
      case "google-drive":
        return {
          draft: {
            fileName: `${this.slugify(task.title)}.txt`,
            mimeType: "text/plain",
            summary: task.description,
            title: task.title,
          },
          expects: ["authUrl", "fileId", "webViewLink"],
        };
    }
  }

  private slugify(value: string): string {
    const normalized = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return normalized || "task";
  }
}
