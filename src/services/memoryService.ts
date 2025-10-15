export interface AiMemoryQueryPayload {
  document_type: string;
  context: string;
  profile_id?: number | string | null;
  program_id?: number | string | null;
}

export interface AiMemoryStorePayload extends AiMemoryQueryPayload {
  questions: string[];
  suggestions?: string[];
  metadata?: Record<string, any>;
}

export interface AiMemoryQueryResponse {
  ok: boolean;
  id?: number | string;
  questions?: string[];
  suggestions?: string[];
  approx?: boolean;
  message?: string;
}

export async function queryAiMemory(payload: AiMemoryQueryPayload): Promise<AiMemoryQueryResponse> {
  try {
    const res = await fetch('/api/v1/ai/memory/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, message: data?.message || res.statusText };
    }
    return data as AiMemoryQueryResponse;
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Failed to query AI memory' };
  }
}

export async function storeAiMemory(payload: AiMemoryStorePayload): Promise<{ ok: boolean; id?: number | string; message?: string }> {
  try {
    const res = await fetch('/api/v1/ai/memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, message: data?.message || res.statusText };
    }
    return { ok: true, id: (data as any)?.id };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Failed to store AI memory' };
  }
}
