import type { Task } from "@prisma/client";

import { env } from "../../../core/config/env";
import { AppError } from "../../../core/http/errors";

type NotionOAuthResponse = {
  access_token: string;
  bot_id: string;
  duplicated_template_id: string | null;
  owner?: {
    type?: string;
    user?: {
      id?: string;
      name?: string | null;
      person?: { email?: string | null };
    };
  };
  refresh_token: string;
  workspace_icon: string | null;
  workspace_id: string;
  workspace_name: string | null;
};

type NotionPageResponse = {
  id: string;
  url: string;
};

type NotionApiError = {
  code?: string;
  message?: string;
};

const NOTION_VERSION = "2026-03-11";

export class NotionClient {
  async exchangeAuthorizationCode(code: string) {
    return this.requestToken({
      code,
      grant_type: "authorization_code",
      redirect_uri: env.NOTION_REDIRECT_URI,
    });
  }

  async refreshAccessToken(refreshToken: string) {
    return this.requestToken({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });
  }

  async createTaskPage(accessToken: string, task: Task): Promise<NotionPageResponse> {
    const response = await fetch("https://api.notion.com/v1/pages", {
      body: JSON.stringify({
        children: this.pageChildren(task),
        parent: { workspace: true },
        properties: {
          title: {
            title: [{ text: { content: task.title } }],
          },
        },
      }),
      headers: this.apiHeaders(accessToken),
      method: "POST",
    });

    if (!response.ok) throw await this.toApiError(response, "Could not create the task in Notion");
    return (await response.json()) as NotionPageResponse;
  }

  private async requestToken(body: Record<string, string>) {
    const credentials = Buffer.from(`${env.NOTION_CLIENT_ID}:${env.NOTION_CLIENT_SECRET}`).toString("base64");
    const response = await fetch("https://api.notion.com/v1/oauth/token", {
      body: JSON.stringify(body),
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      method: "POST",
    });

    if (!response.ok) throw await this.toApiError(response, "Could not complete Notion authorization");
    return (await response.json()) as NotionOAuthResponse;
  }

  private apiHeaders(accessToken: string) {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    };
  }

  private pageChildren(task: Task) {
    const details = [
      `Priority: ${task.priority}`,
      `Status: ${task.status}`,
      task.dueDate ? `Due date: ${task.dueDate.toISOString()}` : null,
      task.description ? `Description: ${task.description}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return [
      {
        object: "block",
        paragraph: {
          rich_text: [{ text: { content: "Created from Management Tasks." }, type: "text" }],
        },
        type: "paragraph",
      },
      {
        object: "block",
        paragraph: {
          rich_text: [{ text: { content: details }, type: "text" }],
        },
        type: "paragraph",
      },
    ];
  }

  private async toApiError(response: Response, fallbackMessage: string) {
    let data: NotionApiError | null = null;
    try {
      data = (await response.json()) as NotionApiError;
    } catch {
      data = null;
    }

    if (response.status === 401) return new AppError("Notion authorization expired. Please connect again.", 401);
    if (response.status === 403) return new AppError("The Notion connection does not have permission to create this page.", 403);

    const message = data?.message?.trim() || fallbackMessage;
    return new AppError(message, response.status >= 400 && response.status < 500 ? response.status : 502);
  }
}
