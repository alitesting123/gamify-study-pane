// src/services/gameService.ts
import { apiClient } from './api/client';
import { ApiResponse, PaginatedResponse } from './api/types';
import { UserGame, GameTemplate } from '@/types/game';

// ==========================================
// INTERFACES (Define OUTSIDE the class)
// ==========================================

export interface ProcessNotesRequest {
  file: File;
  templateId: number;
}

export interface ProcessNotesResponse {
  gameId: string;
  questionsGenerated: number;
  processingTime: number;
}

export interface GameFilters {
  category?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ✅ NEW: Game configuration interface
export interface GameConfig {
  template_id: number;
  game_type: 'plane' | 'fishing' | 'circuit' | 'runner' | 'quiz';
  config: {
    player: {
      sprite_type?: string;
      speed?: number;
      controls?: string;
      hitbox_size?: number;
      health?: number;
      [key: string]: any;
    };
    obstacles?: Array<{
      type: string;
      spawn_rate: number;
      speed: number;
      collision_action?: string;
      [key: string]: any;
    }>;
    fish?: Array<{
      type: string;
      size: number;
      color: string;
      value: number;
      speed: number;
      spawn_weight: number;
    }>;
    environment: {
      background_color: string;
      scroll_speed?: number;
      [key: string]: any;
    };
    quiz: {
      trigger: string;
      questions_per_collision?: number;
      min_questions?: number;
      max_questions?: number;
      correct_answer_reward?: string;
      [key: string]: any;
    };
    scoring?: {
      distance_multiplier?: number;
      obstacle_points?: number;
      question_correct_points?: number;
      [key: string]: any;
    };
    gameplay?: {
      time_limit?: number;
      bonus_time_per_correct?: number;
      [key: string]: any;
    };
  };
  version: string;
}

// ==========================================
// SERVICE CLASS
// ==========================================

class GameService {
  private readonly baseUrl = '/games';

  /**
   * Get all game templates with optional filters
   */
  async getTemplates(filters?: GameFilters): Promise<PaginatedResponse<GameTemplate>> {
    return apiClient.get<PaginatedResponse<GameTemplate>>(`${this.baseUrl}/templates`, {
      params: filters,
    });
  }

  /**
   * Get a specific game template by ID
   */
  async getTemplate(id: number): Promise<ApiResponse<GameTemplate>> {
    return apiClient.get<ApiResponse<GameTemplate>>(`${this.baseUrl}/templates/${id}`);
  }

  /**
   * ✅ NEW: Get game configuration by template ID
   * This fetches the backend configuration for a game type
   */
  async getGameConfig(templateId: number): Promise<ApiResponse<GameConfig>> {
    return apiClient.get<ApiResponse<GameConfig>>(
      `${this.baseUrl}/configurations/by-template/${templateId}`
    );
  }

  /**
   * Get all games for a specific user
   */
  async getUserGames(userId: string): Promise<ApiResponse<UserGame[]>> {
    return apiClient.get<ApiResponse<UserGame[]>>(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * Get a specific game by ID
   */
  async getGameById(gameId: string): Promise<ApiResponse<UserGame>> {
    return apiClient.get<ApiResponse<UserGame>>(`${this.baseUrl}/${gameId}`);
  }

  /**
   * Process uploaded notes and create a game
   */
  async processNotes(
    request: ProcessNotesRequest,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<ProcessNotesResponse>> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('templateId', request.templateId.toString());

    return apiClient.upload<ApiResponse<ProcessNotesResponse>>(
      `${this.baseUrl}/process-notes`,
      request.file,
      onProgress
    );
  }

  /**
   * Delete a game
   */
  async deleteGame(gameId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${gameId}`);
  }

  /**
   * Update game progress
   */
  async updateGameProgress(
    gameId: string,
    progress: number
  ): Promise<ApiResponse<UserGame>> {
    return apiClient.put<ApiResponse<UserGame>>(`${this.baseUrl}/${gameId}/progress`, {
      progress,
    });
  }

  /**
   * Submit game score and completion
   */
  async submitGameScore(
    gameId: string,
    score: number,
    completedAt: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`${this.baseUrl}/${gameId}/score`, {
      score,
      completedAt,
    });
  }

  /**
   * Get game questions (for playing the game)
   */
  async getGameQuestions(gameId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>(`${this.baseUrl}/${gameId}/questions`);
  }

  /**
   * Search games
   */
  async searchGames(query: string, filters?: GameFilters): Promise<PaginatedResponse<UserGame>> {
    return apiClient.get<PaginatedResponse<UserGame>>(`${this.baseUrl}/search`, {
      params: { query, ...filters },
    });
  }
}

export const gameService = new GameService();