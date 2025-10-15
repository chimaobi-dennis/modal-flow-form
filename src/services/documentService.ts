export interface SaveDocumentPayload {
  title?: string;
  content: string;
  type: string;
  meta?: Record<string, any>;
}

export interface SaveDocumentResponse {
  ok: boolean;
  id?: string | number;
  message?: string;
}

export async function saveDocumentDraft(payload: SaveDocumentPayload): Promise<SaveDocumentResponse> {
  try {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, message: text };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: true, id: data?.id, message: data?.message };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Failed to save document' };
  }
}
