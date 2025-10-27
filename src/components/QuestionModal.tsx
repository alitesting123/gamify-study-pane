// src/components/QuestionModal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Clock, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: QuestionOption[];
  correctAnswerId: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;  // 1 for easy, 2 for medium, 3 for hard
}

interface QuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  onAnswer: (selectedAnswerId: string, isCorrect: boolean, points: number) => void;
  currentQuestion: number;
  totalQuestions: number;
  timeLimit?: number;  // seconds
}

export const QuestionModal = ({
  open,
  onOpenChange,
  question,
  onAnswer,
  currentQuestion,
  totalQuestions,
  timeLimit = 30,
}: QuestionModalProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  // Reset state when question changes
  useEffect(() => {
    if (question) {
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
      setTimeRemaining(timeLimit);
    }
  }, [question, timeLimit]);

  // Timer countdown
  useEffect(() => {
    if (!open || showResult || !question) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit wrong answer
          handleSubmit(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, showResult, question]);

  const handleSubmit = (answerId: string | null) => {
    if (showResult || !question) return;

    const correct = answerId === question.correctAnswerId;
    const pointsEarned = correct ? question.points : 0;

    setIsCorrect(correct);
    setShowResult(true);

    // Wait 2 seconds before calling onAnswer
    setTimeout(() => {
      onAnswer(answerId || '', correct, pointsEarned);
    }, 2000);
  };

  const handleOptionClick = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
  };

  if (!question) return null;

  const progress = (currentQuestion / totalQuestions) * 100;
  const timeProgress = (timeRemaining / timeLimit) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 space-y-6">
          {/* Header with Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Question {currentQuestion} / {totalQuestions}
                </Badge>
                <Badge variant="outline" className={cn(
                  question.difficulty === "Easy" && "bg-green-500/10 text-green-500 border-green-500/20",
                  question.difficulty === "Medium" && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                  question.difficulty === "Hard" && "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {question.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                <span className="text-sm font-semibold">{question.points} pts</span>
              </div>
            </div>

            <Progress value={progress} className="h-2" />

            {/* Timer */}
            {!showResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Time Remaining</span>
                  </div>
                  <span className={cn(
                    "font-semibold",
                    timeRemaining <= 5 && "text-red-500 animate-pulse"
                  )}>
                    {timeRemaining}s
                  </span>
                </div>
                <Progress
                  value={timeProgress}
                  className={cn(
                    "h-1",
                    timeRemaining <= 5 && "bg-red-500/20"
                  )}
                />
              </div>
            )}
          </div>

          {/* Question */}
          <Card className="p-6 bg-muted/30">
            <p className="text-lg font-medium leading-relaxed">{question.questionText}</p>
            <p className="text-sm text-muted-foreground mt-2">Topic: {question.topic}</p>
          </Card>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrectOption = option.id === question.correctAnswerId;
              const showCorrect = showResult && isCorrectOption;
              const showIncorrect = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  disabled={showResult}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    "disabled:cursor-not-allowed",
                    isSelected && !showResult && "border-primary bg-primary/10",
                    showCorrect && "border-green-500 bg-green-500/10",
                    showIncorrect && "border-red-500 bg-red-500/10",
                    !isSelected && !showCorrect && !showIncorrect && "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0",
                      isSelected && !showResult && "bg-primary text-primary-foreground",
                      showCorrect && "bg-green-500 text-white",
                      showIncorrect && "bg-red-500 text-white",
                      !isSelected && !showCorrect && !showIncorrect && "bg-muted text-muted-foreground"
                    )}>
                      {showCorrect ? (
                        <Check className="h-5 w-5" />
                      ) : showIncorrect ? (
                        <X className="h-5 w-5" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <p className="flex-1 font-medium">{option.text}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result Message */}
          {showResult && (
            <Card className={cn(
              "p-4 border-2",
              isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
            )}>
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <div className="p-2 rounded-full bg-green-500 text-white">
                    <Check className="h-6 w-6" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-red-500 text-white">
                    <X className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1">
                  <p className={cn(
                    "font-semibold text-lg",
                    isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                  )}>
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isCorrect
                      ? `You earned ${question.points} points!`
                      : "Don't worry, keep learning!"
                    }
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          {!showResult && (
            <Button
              onClick={() => handleSubmit(selectedAnswer)}
              disabled={!selectedAnswer}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Submit Answer
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
