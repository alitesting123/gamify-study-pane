// src/types/game.ts
export interface GameTemplate {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  completionRate?: number;
  gameType?: 'plane' | 'fishing' | 'quiz'; // Add game type
}

export interface UserGame {
  id: string;
  templateId: number;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionsCount: number;
  maxPoints: number;
  currentProgress: number;
  completedAt?: string;
  createdAt: string;
  gameType?: 'plane' | 'fishing' | 'quiz'; // Add game type
}

export interface UserProgress {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalGamesCompleted: number;
  totalPoints: number;
}