// src/lib/storage.ts
import { UserGame, UserProgress } from "@/types/game";

const STORAGE_KEYS = {
  USER_GAMES: 'playstudy_user_games',
  USER_PROGRESS: 'playstudy_user_progress',
} as const;

/**
 * Storage utility for persisting game data to localStorage
 */
export const storage = {
  /**
   * Save user games to localStorage
   */
  saveUserGames: (games: UserGame[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_GAMES, JSON.stringify(games));
    } catch (error) {
      console.error('Failed to save user games:', error);
    }
  },

  /**
   * Load user games from localStorage
   */
  loadUserGames: (): UserGame[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_GAMES);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load user games:', error);
      return [];
    }
  },

  /**
   * Save user progress to localStorage
   */
  saveUserProgress: (progress: UserProgress): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save user progress:', error);
    }
  },

  /**
   * Load user progress from localStorage
   */
  loadUserProgress: (): UserProgress => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      return saved ? JSON.parse(saved) : {
        level: 1,
        currentXP: 0,
        xpToNextLevel: 100,
        totalGamesCompleted: 0,
        totalPoints: 0,
      };
    } catch (error) {
      console.error('Failed to load user progress:', error);
      return {
        level: 1,
        currentXP: 0,
        xpToNextLevel: 100,
        totalGamesCompleted: 0,
        totalPoints: 0,
      };
    }
  },

  /**
   * Clear all stored data
   */
  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_GAMES);
      localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },

  /**
   * Get a specific game by ID
   */
  getGameById: (gameId: string): UserGame | null => {
    const games = storage.loadUserGames();
    return games.find(game => game.id === gameId) || null;
  },

  /**
   * Update a specific game
   */
  updateGame: (gameId: string, updates: Partial<UserGame>): void => {
    const games = storage.loadUserGames();
    const updatedGames = games.map(game => 
      game.id === gameId ? { ...game, ...updates } : game
    );
    storage.saveUserGames(updatedGames);
  },

  /**
   * Delete a game
   */
  deleteGame: (gameId: string): void => {
    const games = storage.loadUserGames();
    const filteredGames = games.filter(game => game.id !== gameId);
    storage.saveUserGames(filteredGames);
  },
};