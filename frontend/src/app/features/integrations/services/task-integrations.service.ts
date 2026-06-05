import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import { environment } from "../../../../environments/environment";
import type { ApiResponse } from "../../../core/types/api.types";
import type { IntegrationProvider, IntegrationResponse, TaskIntegrationResult } from "../types/task-integrations.types";

type IntegrationApiPayload = ApiResponse<IntegrationResponse> | IntegrationResponse;

@Injectable({ providedIn: "root" })
export class TaskIntegrationsService {
  private readonly http = inject(HttpClient);

  connectGoogleCalendar(taskId: string): Observable<TaskIntegrationResult> {
    return this.request("google-calendar", taskId);
  }

  sendToNotion(taskId: string): Observable<TaskIntegrationResult> {
    return this.request("notion", taskId);
  }

  attachGoogleDrive(taskId: string): Observable<TaskIntegrationResult> {
    return this.request("google-drive", taskId);
  }

  redirectToAuth(authUrl: string): void {
    window.location.assign(authUrl);
  }

  private request(provider: IntegrationProvider, taskId: string): Observable<TaskIntegrationResult> {
    return this.http
      .post<IntegrationApiPayload>(`${environment.apiUrl}/integrations/${provider}/tasks/${taskId}`, null)
      .pipe(map((response) => this.normalizeResult(provider, taskId, this.unwrapResponse(response))));
  }

  private unwrapResponse(response: IntegrationApiPayload): IntegrationResponse {
    return "data" in response ? response.data : response;
  }

  private normalizeResult(
    provider: IntegrationProvider,
    taskId: string,
    response: IntegrationResponse,
  ): TaskIntegrationResult {
    return {
      authUrl: response.authUrl ?? null,
      message: response.message?.trim() || this.defaultMessage(provider),
      metadata: response.metadata ?? null,
      provider: response.provider ?? provider,
      success: response.success ?? true,
      taskId: response.taskId ?? taskId,
    };
  }

  private defaultMessage(provider: IntegrationProvider): string {
    switch (provider) {
      case "google-calendar":
        return "Task sent to Google Calendar.";
      case "notion":
        return "Task sent to Notion.";
      case "google-drive":
        return "Google Drive integration is ready.";
    }
  }
}
