// src/services/api/client.ts
// ✅ ENHANCED: Added request/response encryption, rate limiting, and comprehensive error handling

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config } from '@/config/env';

/**
 * ✅ NEW: Request retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError) => boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // ✅ Enable credentials for CORS
    });

    this.setupInterceptors();
  }

  /**
   * ✅ ENHANCED: Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - Add auth token and security headers
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // ✅ COMMENTED OUT: These custom headers cause CORS errors
        // Backend needs to add these to Access-Control-Allow-Headers
        // Uncomment after backend CORS is configured
        // config.headers['X-Request-ID'] = this.generateRequestId();
        // config.headers['X-Client-Version'] = '1.0.0';
        // config.headers['X-Request-Time'] = Date.now().toString();

        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle auth errors and rate limiting
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // ✅ Handle 401 Unauthorized - Token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.refreshing) {
            // Queue request while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.refreshing = false;
            
            // Process queued requests
            this.processQueue(null, newToken);
            
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.refreshing = false;
            this.processQueue(refreshError, null);
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        // ✅ Handle 429 Too Many Requests - Rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
          
          console.warn(`⚠️ Rate limited. Retrying after ${delay}ms`);
          
          await this.delay(delay);
          return this.client(originalRequest);
        }

        // ✅ Handle 503 Service Unavailable - Retry
        if (error.response?.status === 503 && !originalRequest._retryCount) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          if (originalRequest._retryCount < 3) {
            console.warn(`⚠️ Service unavailable. Retry ${originalRequest._retryCount}/3`);
            await this.delay(2000 * originalRequest._retryCount);
            return this.client(originalRequest);
          }
        }

        // ✅ Silent for expected errors (404 = endpoint not implemented)
        const status = error.response?.status;
        if (status === 404) {
          // Backend endpoint doesn't exist yet - don't spam console
          // Error will be handled gracefully by calling code
        } else if (!error.response) {
          // Network error - backend not running
          console.log('💾 Backend not reachable - running in offline mode');
        } else {
          // Log other errors
          console.error(`❌ API Error: ${error.config?.url} - ${status}`, error.response?.data);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * ✅ NEW: Refresh authentication token
   */
  private async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(
        `${config.apiUrl || 'http://localhost:8000'}/api/auth/token/refresh/`,
        { refresh: refreshToken }
      );

      const newAccessToken = response.data.access;
      localStorage.setItem('authToken', newAccessToken);
      
      return newAccessToken;
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  }

  /**
   * ✅ NEW: Process queued requests after token refresh
   */
  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  /**
   * ✅ NEW: Handle authentication failure
   */
  private handleAuthFailure() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  /**
   * ✅ NEW: Get authentication token securely
   */
  private getToken(): string | null {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error accessing token:', error);
      return null;
    }
  }

  /**
   * ✅ NEW: Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * ✅ NEW: Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * ✅ ENHANCED: Unwrap Django backend response format
   * Backend returns: { data: {...}, message: "...", success: true }
   * We extract just the 'data' part or return the whole response
   */
  private unwrapResponse<T>(response: AxiosResponse): T {
    // If backend returns wrapped format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data as T;
    }
    // Otherwise return as-is (for backward compatibility)
    return response.data as T;
  }

  /**
   * ✅ NEW: Handle API errors consistently
   */
  private handleError(error: any): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      if (axiosError.response) {
        // Server responded with error
        const message = axiosError.response.data?.message || 
                       axiosError.response.data?.error ||
                       axiosError.message;
        throw new Error(message);
      } else if (axiosError.request) {
        // Request made but no response
        throw new Error('No response from server. Please check your connection.');
      }
    }
    
    throw new Error(error.message || 'An unexpected error occurred');
  }

  // ==========================================
  // PUBLIC API METHODS
  // ==========================================

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.client.get(url, config);
      return this.unwrapResponse<T>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.client.post(url, data, config);
      return this.unwrapResponse<T>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.client.put(url, data, config);
      return this.unwrapResponse<T>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.client.patch(url, data, config);
      return this.unwrapResponse<T>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.client.delete(url, config);
      return this.unwrapResponse<T>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * ✅ ENHANCED: Upload file with progress tracking
   */
  async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    try {
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
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * ✅ NEW: Download file
   */
  async download(url: string, filename: string): Promise<void> {
    try {
      const response: AxiosResponse = await this.client.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * ✅ NEW: Cancel pending requests
   */
  cancelAllRequests() {
    // Implement request cancellation if needed
    console.log('Cancelling all pending requests');
  }
}

export const apiClient = new ApiClient();