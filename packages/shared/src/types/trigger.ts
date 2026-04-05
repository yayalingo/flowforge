export interface WebhookPayload {
  flowId: string;
  data: unknown;
  headers: Record<string, string>;
  query: Record<string, string>;
  timestamp: Date;
}

export interface ManualTriggerInput {
  flowId: string;
  input?: unknown;
}
