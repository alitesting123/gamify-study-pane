import { Progress } from "@/components/ui/progress";
import { Trophy, Star } from "lucide-react";
import { useGameContext } from "@/contexts/GameContext";

export const LevelProgressBar = () => {
  const { userProgress } = useGameContext();
  const progressPercentage = (userProgress.currentXP / userProgress.xpToNextLevel) * 100;

  return (
    <div className="bg-card border-b border-border px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Level</span>
            <span className="text-lg font-bold text-primary">{userProgress.level}</span>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {userProgress.currentXP} / {userProgress.xpToNextLevel} XP
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3 text-warning fill-warning" />
              {userProgress.totalPoints} points
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="text-right min-w-[100px]">
          <div className="text-xs text-muted-foreground">Games Completed</div>
          <div className="text-lg font-semibold">{userProgress.totalGamesCompleted}</div>
        </div>
      </div>
    </div>
  );
};
