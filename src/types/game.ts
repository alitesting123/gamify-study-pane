export interface GameTemplate {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  completionRate?: number;
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
}

export interface UserProgress {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalGamesCompleted: number;
  totalPoints: number;
}
