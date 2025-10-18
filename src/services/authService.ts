// src/services/authService.ts
import { apiClient } from './api/client';
import { ApiResponse } from './api/types';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly REFRESH_KEY = 'refreshToken';

  /**
   * Login user and store tokens
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      // Make the API call
      const response = await apiClient.post<LoginResponse>(
        '/auth/login/',
        credentials
      );

      console.log('🔑 Login response:', response);

      // Store tokens
      this.setTokens(response.access, response.refresh);

      console.log('✅ Tokens stored successfully');

      return {
        data: response,
        success: true,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    window.location.href = '/login';
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  /**
   * Store tokens
   */
  setTokens(access: string, refresh: string): void {
    console.log('💾 Storing tokens...');
    localStorage.setItem(this.TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_KEY, refresh);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const hasToken = !!this.getAccessToken();
    console.log('🔒 isAuthenticated:', hasToken);
    return hasToken;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<string> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ access: string }>(
      '/auth/refresh/',
      { refresh }
    );

    localStorage.setItem(this.TOKEN_KEY, response.access);
    return response.access;
  }
}

export const authService = new AuthService();