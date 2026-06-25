export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  'https://api.tooltari.in/api/v1';

export const apiClient = {
  async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let jsonResponse: ApiResponse<T>;
      try {
        jsonResponse = await response.json();
      } catch (err) {
        jsonResponse = {
          success: false,
          error: `Failed to parse response: ${response.statusText}`,
          timestamp: Date.now(),
        };
      }

      if (!response.ok) {
        // Handle standard status codes
        const errMsg = 
          jsonResponse.error || 
          jsonResponse.message || 
          `HTTP Error ${response.status}: ${response.statusText}`;

        return {
          success: false,
          error: errMsg,
          timestamp: jsonResponse.timestamp || Date.now(),
        };
      }

      return jsonResponse;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network connection failed.',
        timestamp: Date.now(),
      };
    }
  },

  async get<T = any>(path: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET', headers });
  },

  async post<T = any>(path: string, body: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    });
  }
};
