// src/components/UserProgressDropdown.tsx
import { Trophy, Star, TrendingUp, Award } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGameContext } from "@/contexts/GameContext";

export const UserProgressDropdown = () => {
  const { userProgress } = useGameContext();
  const progressPercentage = (userProgress.currentXP / userProgress.xpToNextLevel) * 100;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 h-10 px-3 hover:bg-accent"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground">Level</span>
              <span className="text-sm font-bold text-primary">{userProgress.level}</span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Your Progress</span>
          <Badge variant="secondary" className="gap-1">
            <Star className="h-3 w-3 fill-warning text-warning" />
            {userProgress.totalPoints}
          </Badge>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <div className="p-4 space-y-4">
          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Level {userProgress.level}</span>
              <span className="font-medium">
                {userProgress.currentXP} / {userProgress.xpToNextLevel} XP
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {userProgress.xpToNextLevel - userProgress.currentXP} XP to level {userProgress.level + 1}
            </p>
          </div>

          <DropdownMenuSeparator />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Award className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Games</span>
                <span className="text-sm font-bold">{userProgress.totalGamesCompleted}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="h-4 w-4 text-success" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Points</span>
                <span className="text-sm font-bold">{userProgress.totalPoints}</span>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer">
          View Achievements
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          View Statistics
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};