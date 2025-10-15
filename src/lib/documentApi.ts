// Local fallback interfaces to avoid path alias issues
// Keep fields minimal for this module's typing needs
export interface DocumentTemplate {
  id: number;
  name: string;
  category?: string;
  preview_url?: string;
  description?: string;
  usage_count?: number;
  is_system?: boolean;
  default_content?: any;
}

export interface DocumentVersion {
  id: number;
  document_id: number;
  version: number;
  change_description?: string | null;
  content?: any;
}

export interface Document {
  id: number;
  user_id: number;
  application_id?: number | null;
  program_id?: number | null;
  template_id?: number | null;
  title: string;
  category: string;
  type: 'document' | 'file_upload';
  content?: any;
  metadata?: any;
  language?: string;
  currentVersion?: DocumentVersion;
  template?: DocumentTemplate | null;
}

const API_BASE_URL = '/api/v1';

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Document API class
export class DocumentApi {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    // Try to get auth token from localStorage or session
    const authToken = localStorage.getItem('auth_token') || 
                     sessionStorage.getItem('auth_token') ||
                     document.querySelector('meta[name="api-token"]')?.getAttribute('content');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add CSRF token if available
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
    }

    // Add auth token if available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Helper to extract user_id from DOM
    const getUserIdFromDom = (): number | undefined => {
      try {
        // Check cached storage first
        const fromStorage = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
        if (fromStorage) {
          const n = parseInt(fromStorage, 10);
          if (Number.isFinite(n)) return n;
        }

        const root = document.getElementById('root') || document.getElementById('app');
        const attr = root?.getAttribute('data-user-id')
          || document.body.getAttribute('data-user-id')
          || document.querySelector('meta[name="user-id"]')?.getAttribute('content')
          || (window as any).__USER_ID__
          || (window as any).__USER__?.id
          || new URLSearchParams(window.location.search).get('user_id');
        const n = attr != null ? parseInt(String(attr), 10) : NaN;
        if (Number.isFinite(n)) {
          try {
            localStorage.setItem('user_id', String(n));
            sessionStorage.setItem('user_id', String(n));
          } catch {}
          return n;
        }
        return undefined;
      } catch { return undefined; }
    };

    // Inject user_id automatically when available
    let finalEndpoint = `${API_BASE_URL}${endpoint}`;
    const uid = getUserIdFromDom();
    const method = (options.method || 'GET').toUpperCase();

    if (uid) {
      headers['X-User-Id'] = String(uid);
      if (method === 'GET') {
        const hasQuery = finalEndpoint.includes('?');
        const hasUserId = /[?&]user_id=/.test(finalEndpoint);
        if (!hasUserId) {
          finalEndpoint += `${hasQuery ? '&' : '?'}user_id=${encodeURIComponent(String(uid))}`;
        }
      } else if (options.body && typeof options.body === 'string') {
        try {
          const parsed = JSON.parse(options.body);
          if (parsed && parsed.user_id == null) {
            parsed.user_id = uid;
            options.body = JSON.stringify(parsed);
          }
        } catch {
          // ignore body that isn't JSON
        }
      }
    }

    const response = await fetch(finalEndpoint, {
      ...options,
      headers,
      credentials: 'same-origin', // Include cookies for session-based auth
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private static async requestWithFile<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Templates
  static async getTemplates(): Promise<DocumentTemplate[]> {
    try {
      const response = await this.request<DocumentTemplate[]>('/templates');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  }

  static async getTemplatesByCategory(category: string): Promise<DocumentTemplate[]> {
    try {
      const response = await this.request<DocumentTemplate[]>(`/templates?category=${category}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch templates by category:', error);
      return [];
    }
  }

  static async getTemplate(id: number): Promise<DocumentTemplate> {
    const response = await this.request<DocumentTemplate>(`/templates/${id}`);
    return response.data;
  }

  static async getPopularTemplates(): Promise<DocumentTemplate[]> {
    try {
      const response = await this.request<DocumentTemplate[]>('/templates/popular');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch popular templates:', error);
      return [];
    }
  }

  // User Credits
  static async getUserCredits(): Promise<{ balance: number; plan: string; total_used: number; total_purchased: number; last_updated: string | null }> {
    try {
      const response = await this.request<{ balance: number; plan: string; total_used: number; total_purchased: number; last_updated: string | null }>('/user/credits');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user credits:', error);
      // Return mock credits as fallback
      return {
        balance: 100,
        plan: 'free',
        total_used: 0,
        total_purchased: 100,
        last_updated: new Date().toISOString()
      };
    }
  }

  // Documents
  static async getDocuments(
    applicationId: number,
    options: {
      programId?: number;
      category?: string;
      status?: string;
      search?: string;
      perPage?: number;
      page?: number;
    } = {}
  ): Promise<PaginatedResponse<Document>> {
    const params = new URLSearchParams();
    
    if (options.programId) params.append('program_id', options.programId.toString());
    if (options.category) params.append('category', options.category);
    if (options.status) params.append('status', options.status);
    if (options.search) params.append('search', options.search);
    if (options.perPage) params.append('per_page', options.perPage.toString());
    if (options.page) params.append('page', options.page.toString());

    const queryString = params.toString();
    const endpoint = `/applications/${applicationId}/documents${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<PaginatedResponse<Document>>(endpoint);
    return response.data;
  }

  static async getDocument(id: number | string, userId?: number): Promise<Document> {
    // Fallback to DOM-provided user id when not authenticated but frontend has session user
    const getUserIdFromDom = (): number | undefined => {
      try {
        const el = document.getElementById('root');
        const attr = el?.getAttribute('data-user-id') || document.body.getAttribute('data-user-id');
        const num = attr ? parseInt(attr, 10) : NaN;
        return Number.isFinite(num) ? num : undefined;
      } catch {
        return undefined;
      }
    };
    const effectiveUserId = userId ?? getUserIdFromDom();
    const qs = effectiveUserId ? `?user_id=${effectiveUserId}` : '';
    const response = await this.request<Document>(`/documents/${id}${qs}`);
    console.log(response.data);
    return response.data;
  }

  static async createDocument(
    applicationId: number,
    programId: number,
    data: {
      title: string;
      category: string;
      type: 'document' | 'file_upload';
      template_id?: number;
      content?: any;
      language?: string;
      file?: File;
    }
  ): Promise<Document> {
    if (data.file) {
      // Handle file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('category', data.category);
      formData.append('type', data.type);
      if (data.template_id) formData.append('template_id', data.template_id.toString());
      if (data.content) formData.append('content', JSON.stringify(data.content));
      if (data.language) formData.append('language', data.language);
      formData.append('file', data.file);

      const response = await this.requestWithFile<Document>(
        `/applications/${applicationId}/programs/${programId}/documents`,
        formData
      );
      return response.data;
    } else {
      // Handle JSON data
      const response = await this.request<Document>(
        `/applications/${applicationId}/programs/${programId}/documents`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return response.data;
    }
  }

  static async updateDocument(
    id: number,
    data: {
      title?: string;
      content?: any;
      status?: 'draft' | 'published' | 'archived';
      change_summary?: string;
      template_id?: number;
      user_id?: number;
    }
  ): Promise<Document> {
    const response = await this.request<Document>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // General save (no application/program required)
  static async saveDocument(data: {
    title: string;
    category: string;
    type: 'document' | 'file_upload';
    template_id?: number;
    content?: any;
    metadata?: any;
    language?: string;
    application_id?: number | null;
    program_id?: number | null;
  }): Promise<Document> {
    const response = await this.request<Document>(`/save-document`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  static async deleteDocument(id: number): Promise<void> {
    await this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // Document Versions
  static async getDocumentVersions(
    documentId: number,
    options: { perPage?: number; page?: number } = {}
  ): Promise<PaginatedResponse<DocumentVersion>> {
    const params = new URLSearchParams();
    if (options.perPage) params.append('per_page', options.perPage.toString());
    if (options.page) params.append('page', options.page.toString());

    const queryString = params.toString();
    const endpoint = `/documents/${documentId}/versions${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<PaginatedResponse<DocumentVersion>>(endpoint);
    return response.data;
  }

  static async getDocumentVersion(documentId: number, versionId: number): Promise<DocumentVersion> {
    const response = await this.request<DocumentVersion>(`/documents/${documentId}/versions/${versionId}`);
    return response.data;
  }

  static async createDocumentVersion(
    documentId: number,
    data: {
      content?: any;
      change_summary?: string;
      file?: File;
    }
  ): Promise<DocumentVersion> {
    if (data.file) {
      // Handle file upload
      const formData = new FormData();
      if (data.content) formData.append('content', JSON.stringify(data.content));
      if (data.change_summary) formData.append('change_summary', data.change_summary);
      formData.append('file', data.file);

      const response = await this.requestWithFile<DocumentVersion>(
        `/documents/${documentId}/versions`,
        formData
      );
      return response.data;
    } else {
      // Handle JSON data
      const response = await this.request<DocumentVersion>(
        `/documents/${documentId}/versions`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return response.data;
    }
  }

  static async restoreDocumentVersion(documentId: number, versionId: number): Promise<Document> {
    const response = await this.request<Document>(
      `/documents/${documentId}/versions/${versionId}/restore`,
      {
        method: 'POST',
      }
    );
    return response.data;
  }

  // AI Generation
  static async generateContent(
    documentId: number,
    data: {
      prompt: string;
      section?: string;
      model?: string;
      tone?: string;
      max_tokens?: number;
    }
  ): Promise<{ content: any; credits_used: number; credits_remaining: number }> {
    const response = await this.request<{ content: any; credits_used: number; credits_remaining: number }>(
      `/documents/${documentId}/generate`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  static async estimateCost(data: {
    prompt: string;
    model?: string;
    max_tokens?: number;
  }): Promise<{ estimated_cost: number; estimated_tokens: number }> {
    const response = await this.request<{ estimated_cost: number; estimated_tokens: number }>(
      '/documents/estimate-cost',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

}

// Export default instance
export default DocumentApi;
