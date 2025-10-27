// src/components/GamePlayView.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useGameContext } from "@/contexts/GameContext";
import { initializeGame, cleanupGame, type GameQuestion } from "@/lib/pixiGame";
import type { GameType } from "@/lib/pixiGame";
import { GameQuestionModal } from "@/components/GameQuestionModal";

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
  const [secondaryStat, setSecondaryStat] = useState(0);

  // Question modal state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentGameQuestion, setCurrentGameQuestion] = useState<GameQuestion | null>(null);
  const questionCallbackRef = useRef<((isCorrect: boolean) => void) | null>(null);

  const { userGames, selectedGameId, updateProgress } = useGameContext();

  const game = userGames.find((g) => g.id === selectedGameId);
  const totalQuestions = game?.questionsCount || 10;
  const gameType: GameType = (game?.gameType as GameType) || 'plane';

  // Handle question modal answer
  const handleQuestionAnswer = useCallback((isCorrect: boolean, userAnswer: string) => {
    console.log('📝 Answer received:', isCorrect, userAnswer);
    try {
      // Call the game's callback
      if (questionCallbackRef.current) {
        console.log('✅ Calling game callback with:', isCorrect);
        questionCallbackRef.current(isCorrect);
      }

      // Update React state
      if (isCorrect) {
        setScore((prev) => prev + 10);
        setCurrentQuestion((prev) => prev + 1);
        setGameProgress(((currentQuestion + 1) / totalQuestions) * 100);
      }
    } catch (error) {
      console.error('Error handling question answer:', error);
    } finally {
      // Always close modal and clean up
      setShowQuestionModal(false);
      setCurrentGameQuestion(null);
      questionCallbackRef.current = null;
    }
  }, [currentQuestion, totalQuestions]);

  // Expose function to show question from game
  const showQuestion = useCallback((question: GameQuestion, callback: (isCorrect: boolean) => void) => {
    console.log('🎯 showQuestion called with:', question);
    try {
      if (!question || !question.question || !question.options) {
        console.error('Invalid question data:', question);
        // Call callback with false to resume game
        callback(false);
        return;
      }

      console.log('✅ Setting modal state to show question');
      setCurrentGameQuestion(question);
      setShowQuestionModal(true);
      questionCallbackRef.current = callback;
    } catch (error) {
      console.error('Error showing question:', error);
      // Call callback with false to resume game
      callback(false);
    }
  }, []);

  // Initialize game when component mounts
  useEffect(() => {
    if (!canvasRef.current || !game) return;

    console.log('🎮 Initializing game:', game.title, '- Type:', gameType);

    // Initialize PixiJS game
    initializeGame(
      canvasRef.current,
      {
        onQuestionComplete: (isCorrect: boolean) => {
          // This callback is now handled by the modal
          console.log('Question completed:', isCorrect);
        },
        onGameComplete: (finalScore: number) => {
          console.log('Game completed with score:', finalScore);
          updateProgress(finalScore);
        },
        onScoreUpdate: (newScore: number, secondary?: number) => {
          setScore(newScore);
          if (secondary !== undefined) {
            setSecondaryStat(secondary);
          }
        },
        onShowQuestion: showQuestion,
      },
      undefined,  // No backend config needed for built-in questions
      gameType
    );

    // Cleanup on unmount
    return () => {
      cleanupGame();
    };
  }, [game, gameType, showQuestion, updateProgress]);

  const handlePausePlay = () => {
    setIsPlaying(!isPlaying);
    // Add pause/play logic for PixiJS if needed
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

  const secondaryStatLabel = gameType === 'fishing' ? 'Fish Caught' : 'Distance';

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
                {gameType === 'fishing' ? 'Time Challenge' : `Question ${currentQuestion} of ${totalQuestions}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Card className="px-4 py-2">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold text-primary">{score}</p>
            </Card>

            {secondaryStat > 0 && (
              <Card className="px-4 py-2">
                <p className="text-sm text-muted-foreground">{secondaryStatLabel}</p>
                <p className="text-2xl font-bold text-secondary">{secondaryStat}</p>
              </Card>
            )}

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

        {gameType !== 'fishing' && (
          <div className="mt-4">
            <Progress value={gameProgress} className="h-2" />
          </div>
        )}
      </div>

      {/* Game Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-sky-400 to-sky-200">
        <div
          ref={canvasRef}
          className="w-full h-full"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Question Modal */}
      <GameQuestionModal
        open={showQuestionModal}
        question={currentGameQuestion}
        onAnswer={handleQuestionAnswer}
        title="Challenge Question"
        allowRetry={true}
      />
    </div>
  );
};