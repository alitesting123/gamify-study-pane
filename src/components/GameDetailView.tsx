import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Trophy, Clock, Target, BookOpen } from "lucide-react";
import { useGameContext } from "@/contexts/GameContext";
import { toast } from "sonner";

interface GameDetailViewProps {
  onBack: () => void;
}

export const GameDetailView = ({ onBack }: GameDetailViewProps) => {
  const { userGames, selectedGameId } = useGameContext();
  
  const game = userGames.find((g) => g.id === selectedGameId);

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
        <p className="text-muted-foreground">Game not found</p>
      </div>
    );
  }

  const difficultyColors = {
    Easy: "bg-success/20 text-success border-success/30",
    Medium: "bg-warning/20 text-warning border-warning/30",
    Hard: "bg-destructive/20 text-destructive border-destructive/30",
  };

  const handleStartGame = () => {
    toast.success("Starting game...", {
      description: "Get ready to test your knowledge!",
    });
    // This is where PixiJS game would be launched
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Library
      </Button>

      <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-card">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white">{game.title}</h1>
            <Badge className={`${difficultyColors[game.difficulty]} text-base`} variant="outline">
              {game.difficulty}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Game Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground text-sm">{game.description}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Category</h3>
              <Badge variant="secondary">{game.category}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Game Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm">Total Questions</span>
              </div>
              <span className="font-bold">{game.questionsCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                <span className="text-sm">Max Points</span>
              </div>
              <span className="font-bold text-warning">{game.maxPoints}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-secondary" />
                <span className="text-sm">Progress</span>
              </div>
              <span className="font-bold">{game.currentProgress}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/50 shadow-glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Ready to Play?</h3>
              <p className="text-sm text-muted-foreground">
                Answer all {game.questionsCount} questions correctly to earn {game.maxPoints} points!
              </p>
            </div>
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 shadow-glow"
              onClick={handleStartGame}
            >
              <Play className="h-5 w-5 mr-2" />
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
