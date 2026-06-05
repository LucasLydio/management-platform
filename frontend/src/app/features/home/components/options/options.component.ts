import { Component, computed, inject, input, output, signal } from "@angular/core";
import { finalize } from "rxjs";

import { TaskIntegrationsService } from "../../../integrations/services/task-integrations.service";
import type { IntegrationProvider, TaskIntegrationResult } from "../../../integrations/types/task-integrations.types";
import { AppButtonComponent } from "src/app/shared/ui/button/app-button.component";

type FeedbackTone = "error" | "info" | "success";
type FeedbackState = { text: string; tone: FeedbackTone } | null;

@Component({
  selector: "app-options",
  standalone: true,
  imports: [AppButtonComponent],
  templateUrl: "./options.component.html",
  styleUrl: "./options.component.css",
})
export class AppOptionsComponent {
  private readonly taskIntegrationsService = inject(TaskIntegrationsService);

  readonly disabled = input<boolean>(false);
  readonly taskId = input<string | null>(null);

  readonly onIntegrationCompleted = output<TaskIntegrationResult>();
  readonly onOptionSelected = output<IntegrationProvider>();

  readonly feedback = signal<FeedbackState>(null);
  readonly loadingProvider = signal<IntegrationProvider | null>(null);
  readonly isUnavailable = computed(() => this.disabled() || !this.taskId());

  connect(provider: IntegrationProvider): void {
    if (this.disabled()) return;

    const taskId = this.taskId();
    if (!taskId) {
      this.feedback.set({
        text: "Select a task in the notebook before using an integration.",
        tone: "info",
      });
      return;
    }

    if (this.loadingProvider()) return;

    this.onOptionSelected.emit(provider);
    this.loadingProvider.set(provider);
    this.feedback.set(null);

    this.integrationRequest(provider, taskId)
      .pipe(finalize(() => this.loadingProvider.set(null)))
      .subscribe({
        error: (error) => {
          this.feedback.set({
            text: error.error?.message ?? `Could not connect task to ${this.providerLabel(provider)}.`,
            tone: "error",
          });
        },
        next: (result) => {
          this.feedback.set({
            text: result.message,
            tone: result.success ? "success" : "error",
          });
          this.onIntegrationCompleted.emit(result);

          if (result.authUrl) this.taskIntegrationsService.redirectToAuth(result.authUrl);
        },
      });
  }

  isLoading(provider: IntegrationProvider): boolean {
    return this.loadingProvider() === provider;
  }

  providerLabel(provider: IntegrationProvider): string {
    switch (provider) {
      case "google-calendar":
        return "Google Calendar";
      case "notion":
        return "Notion";
      case "google-drive":
        return "Google Drive";
    }
  }

  private integrationRequest(provider: IntegrationProvider, taskId: string) {
    switch (provider) {
      case "google-calendar":
        return this.taskIntegrationsService.connectGoogleCalendar(taskId);
      case "notion":
        return this.taskIntegrationsService.sendToNotion(taskId);
      case "google-drive":
        return this.taskIntegrationsService.attachGoogleDrive(taskId);
    }
  }
}
