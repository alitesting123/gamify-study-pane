// src/components/MyStats.tsx
import { useGameContext } from "@/contexts/GameContext";
import { Card } from "@/components/ui/card";
import { Trophy, Target, Clock, TrendingUp, Brain, Zap, Timer, Puzzle, BookOpen } from "lucide-react";
import { GameCategoryType } from "@/types/game";
import { Progress } from "@/components/ui/progress";

const categoryIcons: Record<GameCategoryType, any> = {
  action: Zap,
  memory: Brain,
  "quick-think": Timer,
  puzzle: Puzzle,
  learning: BookOpen,
};

const categoryColors: Record<GameCategoryType, string> = {
  action: "text-orange-500",
  memory: "text-purple-500",
  "quick-think": "text-cyan-500",
  puzzle: "text-green-500",
  learning: "text-indigo-500",
};

export const MyStats = () => {
  const { userGames, userProgress } = useGameContext();

  // Calculate stats by category
  const statsByCategory = userGames.reduce((acc, game) => {
    const category = game.categoryType || "learning";
    if (!acc[category]) {
      acc[category] = {
        gamesPlayed: 0,
        totalAccuracy: 0,
        totalTime: 0,
      };
    }
    acc[category].gamesPlayed += 1;
    acc[category].totalAccuracy += game.currentProgress;
    return acc;
  }, {} as Record<GameCategoryType, { gamesPlayed: number; totalAccuracy: number; totalTime: number }>);

  // Calculate average accuracy per category
  const categoryStats = Object.entries(statsByCategory).map(([category, stats]) => ({
    category: category as GameCategoryType,
    gamesPlayed: stats.gamesPlayed,
    averageAccuracy: Math.round(stats.totalAccuracy / stats.gamesPlayed),
  }));

  // Overall stats
  const totalGames = userGames.length;
  const overallAccuracy = totalGames > 0
    ? Math.round(userGames.reduce((sum, game) => sum + game.currentProgress, 0) / totalGames)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Statistics</h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and performance across all games
        </p>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Games</p>
              <p className="text-2xl font-bold">{totalGames}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <Target className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Accuracy</p>
              <p className="text-2xl font-bold">{overallAccuracy}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-secondary/10">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Level</p>
              <p className="text-2xl font-bold">{userProgress.level}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold">{userProgress.totalPoints}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance by Category */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Performance by Category</h2>

        {categoryStats.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {categoryStats.map((stat) => {
              const Icon = categoryIcons[stat.category];
              const colorClass = categoryColors[stat.category];

              return (
                <Card key={stat.category} className="p-6 hover-lift">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                        <h3 className="font-semibold capitalize">{stat.category.replace('-', ' ')}</h3>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {stat.gamesPlayed} {stat.gamesPlayed === 1 ? 'game' : 'games'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="font-semibold">{stat.averageAccuracy}%</span>
                      </div>
                      <Progress value={stat.averageAccuracy} className="h-2" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No games played yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start playing games to see your statistics here
            </p>
          </Card>
        )}
      </div>

      {/* Recent Games */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Games</h2>

        {userGames.length > 0 ? (
          <div className="space-y-3">
            {userGames.slice(0, 5).map((game) => {
              const Icon = game.categoryType ? categoryIcons[game.categoryType] : BookOpen;
              const colorClass = game.categoryType ? categoryColors[game.categoryType] : "text-indigo-500";

              return (
                <Card key={game.id} className="p-4 hover-lift">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${colorClass}`} />
                      <div>
                        <h4 className="font-medium">{game.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {game.questionsCount} questions · {game.difficulty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{game.currentProgress}%</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No recent games
            </h3>
            <p className="text-sm text-muted-foreground">
              Your recently played games will appear here
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
