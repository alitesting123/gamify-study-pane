// src/components/GamePlayView.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useGameContext } from "@/contexts/GameContext";
import { initializeGame, cleanupGame } from "@/lib/pixiGame";

interface GamePlayViewProps {
  onBack: () => void;
}

export const GamePlayView = ({ onBack }: GamePlayViewProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [gameProgress, setGameProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);
  const { userGames, selectedGameId, updateProgress } = useGameContext();

  const game = userGames.find((g) => g.id === selectedGameId);
  const totalQuestions = game?.questionsCount || 10;

  useEffect(() => {
    if (!canvasRef.current || !game) return;

    // Initialize PixiJS game
    const gameInstance = initializeGame(canvasRef.current, {
      onQuestionComplete: (isCorrect: boolean) => {
        if (isCorrect) {
          setScore((prev) => prev + 10);
        }
        setCurrentQuestion((prev) => prev + 1);
        setGameProgress(((currentQuestion + 1) / totalQuestions) * 100);
      },
      onGameComplete: (finalScore: number) => {
        updateProgress(finalScore);
        // Show completion dialog
      },
    });

    // Cleanup on unmount
    return () => {
      cleanupGame();
    };
  }, [game]);

  const handlePausePlay = () => {
    setIsPlaying(!isPlaying);
    // Add pause/play logic for PixiJS
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // Add mute/unmute logic
  };

  if (!game) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Game not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{game.title}</h2>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion} of {totalQuestions}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Card className="px-4 py-2">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold text-primary">{score}</p>
            </Card>

            <Button
              variant="outline"
              size="icon"
              onClick={handlePausePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleMuteToggle}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={gameProgress} className="h-2" />
        </div>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
};