import { createContext, useContext, useState, ReactNode } from "react";
import { UserGame, UserProgress } from "@/types/game";

interface GameContextType {
  userGames: UserGame[];
  addUserGame: (game: Omit<UserGame, "id" | "createdAt">) => void;
  selectedGameId: string | null;
  setSelectedGameId: (id: string | null) => void;
  userProgress: UserProgress;
  updateProgress: (points: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [userGames, setUserGames] = useState<UserGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalGamesCompleted: 0,
    totalPoints: 0,
  });

  const addUserGame = (game: Omit<UserGame, "id" | "createdAt">) => {
    const newGame: UserGame = {
      ...game,
      id: `game-${Date.now()}`,
      createdAt: new Date().toISOString(),
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
