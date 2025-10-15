export interface AiLogPayload {
  user_id?: number | string;
  document_id?: number | string;
  model?: string;
  prompt: string;
  response?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  credit_cost?: number;
  request_id?: string;
  status?: string;
  metadata?: any;
}

export async function logAiGeneration(payload: AiLogPayload): Promise<void> {
  try {
    await fetch('/api/v1/ai/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch {
    // silent fail; logging shouldn't block UX
  }
}
