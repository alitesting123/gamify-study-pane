// src/services/userService.ts
import { apiClient } from './api/client';
import { ApiResponse } from './api/types';
import { UserProgress } from '@/types/game';

export interface UpdateProgressRequest {
  points: number;
  gameId: string;
}

class UserService {
  private readonly baseUrl = '/api/users';

  async getUserProgress(userId: string): Promise<ApiResponse<UserProgress>> {
    return apiClient.get<ApiResponse<UserProgress>>(`${this.baseUrl}/${userId}/progress`);
  }

  async updateProgress(
    userId: string,
    request: UpdateProgressRequest
  ): Promise<ApiResponse<UserProgress>> {
    return apiClient.post<ApiResponse<UserProgress>>(
      `${this.baseUrl}/${userId}/progress`,
      request
    );
  }

  async syncLocalData(userId: string, localData: any): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`${this.baseUrl}/${userId}/sync`, localData);
  }
}

export const userService = new UserService();