// src/services/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '@/config/env';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl || 'http://localhost:8000',  // ✅ No /api suffix
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            // ✅ FIXED: Use apiClient's base URL, just provide the path
            const response = await axios.post(
              `${config.apiUrl || 'http://localhost:8000'}/api/auth/token/refresh/`,
              { refresh: refreshToken }
            );

            const newAccessToken = response.data.access;
            localStorage.setItem('authToken', newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Unwrap Django backend response format
   * Backend returns: { data: {...}, message: "...", success: true }
   * We need to extract just the 'data' part
   */
  private unwrapResponse<T>(response: AxiosResponse): T {
    // If backend returns wrapped format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data as T;
    }
    // Otherwise return as-is (for backward compatibility)
    return response.data as T;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse = await this.client.get(url, config);
    return this.unwrapResponse<T>(response);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse = await this.client.post(url, data, config);
    return this.unwrapResponse<T>(response);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse = await this.client.put(url, data, config);
    return this.unwrapResponse<T>(response);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse = await this.client.delete(url, config);
    return this.unwrapResponse<T>(response);
  }

  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return this.unwrapResponse<T>(response);
  }
}

export const apiClient = new ApiClient();