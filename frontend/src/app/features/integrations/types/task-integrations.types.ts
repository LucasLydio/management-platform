export type IntegrationProvider = "google-calendar" | "notion" | "google-drive";

export type IntegrationResponse = {
  authUrl?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  provider?: IntegrationProvider;
  success?: boolean;
  taskId?: string;
};

export type TaskIntegrationResult = {
  authUrl: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  provider: IntegrationProvider;
  success: boolean;
  taskId: string;
};
