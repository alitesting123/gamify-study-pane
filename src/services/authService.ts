// src/services/authService.ts
import { apiClient } from './api/client';
import { ApiResponse } from './api/types';

interface LoginRequest {
  email: string;      // ✅ Changed from username to email
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  access: string;
  refresh: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly REFRESH_KEY = 'refreshToken';

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        '/api/auth/register/',
        data
      );

      console.log('🎉 Registration response:', response);

      // Store tokens
      this.setTokens(response.access, response.refresh);

      console.log('✅ User registered and tokens stored');

      return {
        data: response,
        success: true,
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user and store tokens
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      // Make the API call
      const response = await apiClient.post<LoginResponse>(
        '/api/auth/token/',
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

    try {
      // Use apiClient directly instead of axios
      const response = await apiClient.post<{ access: string }>(
        '/api/auth/token/refresh/',
        { refresh }
      );

      // Store new access token
      localStorage.setItem(this.TOKEN_KEY, response.access);
      
      return response.access;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // Clear tokens and redirect to login
      this.logout();
      throw error;
    }
  }
}

export const authService = new AuthService();