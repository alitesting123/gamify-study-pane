// src/types/game.ts

export type GameCategoryType = 'action' | 'memory' | 'quick-think' | 'puzzle' | 'learning';

// Track individual question attempts with document references
export interface QuestionAttempt {
  questionText: string;          // The question asked
  userAnswer: string;             // What the user answered
  correctAnswer: string;          // The correct answer
  isCorrect: boolean;             // Whether user got it right
  topic: string;                  // Topic/concept tested (e.g., "Heat Dissipation")
  documentReference?: {           // Where this topic appears in the study material
    text: string;                 // The exact text from the document
    section: string;              // Section heading (e.g., "4. Advantages")
    context: string;              // Surrounding context for better understanding
  };
}

// Analyze weak areas by grouping mistakes by topic
export interface WeakArea {
  topic: string;                  // Topic name (e.g., "Heat Dissipation")
  totalQuestions: number;         // Total questions asked on this topic
  correctAnswers: number;         // How many were answered correctly
  accuracy: number;               // Percentage correct
  mistakes: QuestionAttempt[];    // All incorrect attempts for this topic
}

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
  questionAttempts?: QuestionAttempt[]; // Detailed record of each question attempt
  studyMaterialId?: string; // ID of the original study material (for backend reference)
}

export interface UserProgress {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalGamesCompleted: number;
  totalPoints: number;
}