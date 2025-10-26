// src/services/gameService.ts
// ✅ CORRECTED: Two separate features with proper API calls

import { apiClient } from './api/client';
import { ApiResponse, PaginatedResponse } from './api/types';
import { UserGame, GameTemplate } from '@/types/game';

// ==========================================
// INTERFACES
// ==========================================

export interface GameFilters {
  category?: string;
  difficulty?: string;
  gameType?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ✅ FEATURE 1: Create brand NEW game
 */
export interface CreateNewGameRequest {
  title: string;
  prompt: string;
  gameType?: 'plane' | 'fishing' | 'circuit' | 'quiz';
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface CreateNewGameResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  gameType: string;
  playUrl: string;
  thumbnail?: string;
  createdAt: string;
  status: 'ready' | 'error';
}

/**
 * ✅ FEATURE 2: Generate questions from study materials
 */
export interface GenerateQuestionsRequest {
  templateId: number;
  fileId: string;
  gameType: 'plane' | 'fishing' | 'circuit' | 'quiz';
  questionsCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface GenerateQuestionsResponse {
  id: string;
  templateId: number;
  title: string;
  description: string;
  difficulty: string;
  questionsCount: number;
  status: 'processing' | 'ready' | 'error';
  progress: number;
  createdAt: string;
}

/**
 * ✅ FEATURE 2: Upload study material response
 */
export interface UploadMaterialResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

/**
 * ✅ Question generation status
 */
export interface QuestionGenerationStatus {
  gameId: string;
  status: 'processing' | 'ready' | 'error';
  progress: number; // 0-100
  message?: string;
  error?: string;
  questionsGenerated?: number;
  totalQuestions?: number;
}

// ==========================================
// SERVICE CLASS
// ==========================================

class GameService {
  private readonly baseUrl = '/api/games';

  // ==========================================
  // FEATURE 1: CREATE BRAND NEW GAME
  // ==========================================

  /**
   * ✅ FEATURE 1: Create a brand NEW game (plane, fishing, circuit, quiz)
   * This creates an entirely new game experience with custom mechanics
   * 
   * API CALL: POST /api/games/create-new-game
   */
  async createNewGame(
    request: CreateNewGameRequest
  ): Promise<ApiResponse<CreateNewGameResponse>> {
    try {
      console.log('🎮 API CALL: POST /api/games/create-new-game');
      console.log('Request:', request);
      
      // Validate request
      this.validateCreateNewGameRequest(request);
      
      const response = await apiClient.post<ApiResponse<CreateNewGameResponse>>(
        `${this.baseUrl}/create-new-game`,
        request
      );
      
      console.log('✅ New game created:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Error creating new game:', error);
      throw this.handleError(error, 'Failed to create new game');
    }
  }

  // ==========================================
  // FEATURE 2: GENERATE QUESTIONS FROM STUDY MATERIALS
  // ==========================================

  /**
   * ✅ FEATURE 2: Upload study material (PDF, DOC, TXT, MD)
   * 
   * API CALL: POST /api/study-materials/upload
   */
  async uploadStudyMaterial(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadMaterialResponse>> {
    try {
      console.log('📤 API CALL: POST /api/study-materials/upload');
      console.log('File:', file.name, file.size, 'bytes');
      
      // Validate file
      this.validateFile(file);
      
      const response = await apiClient.upload<ApiResponse<UploadMaterialResponse>>(
        '/api/study-materials/upload',
        file,
        onProgress
      );
      
      console.log('✅ File uploaded:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Error uploading file:', error);
      throw this.handleError(error, 'Failed to upload study material');
    }
  }

  /**
   * ✅ FEATURE 2: Generate questions from uploaded study material using RAG
   * 
   * API CALL: POST /api/games/generate-questions
   */
  async generateQuestionsFromMaterial(
    request: GenerateQuestionsRequest
  ): Promise<ApiResponse<GenerateQuestionsResponse>> {
    try {
      console.log('🎮 API CALL: POST /api/games/generate-questions');
      console.log('Request:', request);
      
      // Validate request
      this.validateGenerateQuestionsRequest(request);
      
      const response = await apiClient.post<ApiResponse<GenerateQuestionsResponse>>(
        `${this.baseUrl}/generate-questions`,
        request
      );
      
      console.log('✅ Question generation started:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Error generating questions:', error);
      throw this.handleError(error, 'Failed to generate questions');
    }
  }

  /**
   * ✅ FEATURE 2: Check question generation status
   * 
   * API CALL: GET /api/games/generate-questions/{gameId}/status
   */
  async getQuestionGenerationStatus(
    gameId: string
  ): Promise<ApiResponse<QuestionGenerationStatus>> {
    try {
      console.log(`🔍 API CALL: GET /api/games/generate-questions/${gameId}/status`);
      
      const response = await apiClient.get<ApiResponse<QuestionGenerationStatus>>(
        `${this.baseUrl}/generate-questions/${gameId}/status`
      );
      
      return response;
    } catch (error: any) {
      console.error('❌ Error checking status:', error);
      throw this.handleError(error, 'Failed to check generation status');
    }
  }

  /**
   * ✅ FEATURE 2: Wait for question generation to complete (polls status)
   * Polls the backend every 2 seconds until questions are ready
   */
  async waitForQuestionGeneration(
    gameId: string,
    onProgress?: (status: QuestionGenerationStatus) => void,
    maxAttempts: number = 60
  ): Promise<QuestionGenerationStatus> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.getQuestionGenerationStatus(gameId);
        const status = response.data;

        if (onProgress) {
          onProgress(status);
        }

        console.log(`⏳ Progress: ${status.progress}% - ${status.message || 'Processing...'}`);

        if (status.status === 'ready') {
          console.log('✅ Question generation complete!');
          return status;
        }

        if (status.status === 'error') {
          throw new Error(status.error || 'Question generation failed');
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new Error('Question generation timeout - took too long');
  }

  // ==========================================
  // EXISTING METHODS (Keep these)
  // ==========================================

  /**
   * Get all available game templates
   */
  async getTemplates(filters?: GameFilters): Promise<PaginatedResponse<GameTemplate>> {
    try {
      return await apiClient.get<PaginatedResponse<GameTemplate>>(
        `${this.baseUrl}/templates`,
        { params: filters }
      );
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      throw this.handleError(error, 'Failed to fetch game templates');
    }
  }

  /**
   * Get all user games (for game library)
   */
  async getUserGames(filters?: GameFilters): Promise<PaginatedResponse<UserGame>> {
    try {
      return await apiClient.get<PaginatedResponse<UserGame>>(
        `${this.baseUrl}/user`,
        { params: filters }
      );
    } catch (error: any) {
      // ✅ Silent for expected errors (backend not ready)
      // Only log actual unexpected errors
      const status = error.response?.status;
      
      if (status === 404) {
        // Backend endpoint doesn't exist yet - completely silent
        throw new Error('Backend API not implemented');
      } else if (!error.response) {
        // Network error - backend not running
        throw new Error('Backend not running');
      } else {
        // Actual error - log it
        console.error('❌ Unexpected error fetching games:', error);
        throw this.handleError(error, 'Failed to fetch your games');
      }
    }
  }

  /**
   * Get a specific game by ID
   */
  async getGameById(gameId: string): Promise<ApiResponse<UserGame>> {
    try {
      return await apiClient.get<ApiResponse<UserGame>>(`${this.baseUrl}/${gameId}`);
    } catch (error: any) {
      console.error('Error fetching game:', error);
      throw this.handleError(error, 'Failed to fetch game details');
    }
  }

  /**
   * Delete a game
   */
  async deleteGame(gameId: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${gameId}`);
    } catch (error: any) {
      console.error('Error deleting game:', error);
      throw this.handleError(error, 'Failed to delete game');
    }
  }

  /**
   * Update game progress
   */
  async updateGameProgress(
    gameId: string,
    progress: number
  ): Promise<ApiResponse<UserGame>> {
    try {
      return await apiClient.put<ApiResponse<UserGame>>(
        `${this.baseUrl}/${gameId}/progress`,
        { progress }
      );
    } catch (error: any) {
      console.error('Error updating progress:', error);
      throw this.handleError(error, 'Failed to update progress');
    }
  }

  /**
   * Submit game score and completion
   */
  async submitGameScore(
    gameId: string,
    score: number,
    completedAt: string
  ): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<ApiResponse<void>>(
        `${this.baseUrl}/${gameId}/score`,
        { score, completedAt }
      );
    } catch (error: any) {
      console.error('Error submitting score:', error);
      throw this.handleError(error, 'Failed to submit score');
    }
  }

  /**
   * Get game questions (for playing the game)
   */
  async getGameQuestions(gameId: string): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get<ApiResponse<any[]>>(
        `${this.baseUrl}/${gameId}/questions`
      );
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      throw this.handleError(error, 'Failed to fetch game questions');
    }
  }

  /**
   * Search games
   */
  async searchGames(
    query: string,
    filters?: GameFilters
  ): Promise<PaginatedResponse<UserGame>> {
    try {
      return await apiClient.get<PaginatedResponse<UserGame>>(
        `${this.baseUrl}/search`,
        { params: { query, ...filters } }
      );
    } catch (error: any) {
      console.error('Error searching games:', error);
      throw this.handleError(error, 'Failed to search games');
    }
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  /**
   * Validate create new game request
   */
  private validateCreateNewGameRequest(request: CreateNewGameRequest): void {
    if (!request.title?.trim()) {
      throw new Error('Game title is required');
    }
    if (!request.prompt?.trim()) {
      throw new Error('Game description is required');
    }
    if (request.prompt.length < 20) {
      throw new Error('Please provide a more detailed game description');
    }
    if (request.gameType && !['plane', 'fishing', 'circuit', 'quiz'].includes(request.gameType)) {
      throw new Error('Invalid game type');
    }
  }

  /**
   * Validate generate questions request
   */
  private validateGenerateQuestionsRequest(request: GenerateQuestionsRequest): void {
    if (!request.templateId) {
      throw new Error('Template ID is required');
    }
    if (!request.fileId) {
      throw new Error('File ID is required');
    }
    if (!request.gameType) {
      throw new Error('Game type is required');
    }
    if (request.questionsCount < 1 || request.questionsCount > 50) {
      throw new Error('Questions count must be between 1 and 50');
    }
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
    ];

    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      throw new Error('Invalid file type. Please upload PDF, DOC, DOCX, TXT, or MD files');
    }
  }

  /**
   * Handle and format errors consistently
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error(defaultMessage);
  }
}

export const gameService = new GameService();