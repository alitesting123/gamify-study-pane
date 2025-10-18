// src/contexts/GameContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserGame, UserProgress } from "@/types/game";
import { storage } from "@/lib/storage";

interface GameContextType {
  userGames: UserGame[];
  addUserGame: (game: Omit<UserGame, "id" | "createdAt">) => void;
  selectedGameId: string | null;
  setSelectedGameId: (id: string | null) => void;
  userProgress: UserProgress;
  updateProgress: (points: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  // Load from localStorage on mount
  const [userGames, setUserGames] = useState<UserGame[]>(() => 
    storage.loadUserGames()
  );
  
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [userProgress, setUserProgress] = useState<UserProgress>(() =>
    storage.loadUserProgress()
  );

  // Persist userGames to localStorage whenever it changes
  useEffect(() => {
    storage.saveUserGames(userGames);
  }, [userGames]);

  // Persist userProgress to localStorage whenever it changes
  useEffect(() => {
    storage.saveUserProgress(userProgress);
  }, [userProgress]);

  const addUserGame = (game: Omit<UserGame, "id" | "createdAt">) => {
    const newGame: UserGame = {
      ...game,
      id: `game-${Date.now()}`,
      createdAt: new Date().toISOString(),
      gameType: game.gameType || 'quiz', // Ensure gameType is preserved
    };
    setUserGames((prev) => [newGame, ...prev]);
  };

  const updateProgress = (points: number) => {
    setUserProgress((prev) => {
      const newXP = prev.currentXP + points;
      const newLevel = Math.floor(newXP / prev.xpToNextLevel) + 1;
      
      return {
        ...prev,
        currentXP: newXP % prev.xpToNextLevel,
        level: newLevel > prev.level ? newLevel : prev.level,
        xpToNextLevel: 100 * newLevel,
        totalPoints: prev.totalPoints + points,
        totalGamesCompleted: prev.totalGamesCompleted + 1,
      };
    });
  };

  return (
    <GameContext.Provider
      value={{
        userGames,
        addUserGame,
        selectedGameId,
        setSelectedGameId,
        userProgress,
        updateProgress,
        isPlaying,
        setIsPlaying,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameProvider");
  }
  return context;
};