const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      credentials: fetchOptions.credentials ?? 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(() => {
          const token = localStorage.getItem('deploykar_token');
          return token ? { Authorization: `Bearer ${token}` } : {};
        })(),
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      if (
        errorBody &&
        typeof errorBody === 'object' &&
        'detail' in errorBody &&
        Array.isArray(errorBody.detail) &&
        errorBody.detail[0]?.msg
      ) {
        throw new Error(errorBody.detail[0].msg);
      }
      if (errorBody && typeof errorBody === 'object' && 'message' in errorBody && typeof errorBody.message === 'string') {
        throw new Error(errorBody.message);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { API_BASE_URL };
