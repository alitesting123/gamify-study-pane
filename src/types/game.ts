// src/types/game.ts

export type GameCategoryType = 'action' | 'memory' | 'quick-think' | 'puzzle' | 'learning';

export interface GameTemplate {
  id: number;
  title: string;
  description: string;
  category: string;
  categoryType?: GameCategoryType; // Visual category for UI
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  completionRate?: number;
  gameType?: 'plane' | 'fishing' | 'circuit' | 'quiz'; // Add game type
}

export interface UserGame {
  id: string;
  templateId: number;
  title: string;
  description: string;
  category: string;
  categoryType?: GameCategoryType; // Visual category for UI
  difficulty: "Easy" | "Medium" | "Hard";
  questionsCount: number;
  maxPoints: number;
  currentProgress: number;
  completedAt?: string;
  createdAt: string;
  gameType?:'plane' | 'fishing' | 'circuit' | 'quiz'; // Add game type
  subject?: string; // Study topic (e.g., "Metal Motherboards")
  accuracy?: number; // Percentage of correct answers (0-100)
  questionsCorrect?: number; // Number of correct answers
  playedAt?: string; // When the game was last played
}

export interface UserProgress {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalGamesCompleted: number;
  totalPoints: number;
}