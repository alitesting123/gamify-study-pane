// src/components/QuestionModal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Clock, Trophy, CircleCheck, CircleX, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface QuestionOption {
  id: string;
  text: string;
}

export type QuestionType = "mcq" | "true-false" | "multiple-select";

export interface Question {
  id: string;
  questionText: string;
  type: QuestionType;  // Type of question
  options: QuestionOption[];
  correctAnswerId: string | string[];  // Single ID for mcq/true-false, array for multiple-select
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;  // 1 for easy, 2 for medium, 3 for hard
  explanation?: string;  // Optional explanation after answering
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
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  // Reset state when question changes
  useEffect(() => {
    if (question) {
      setSelectedAnswer(question.type === "multiple-select" ? [] : null);
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
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, showResult, question]);

  const handleSubmit = () => {
    if (showResult || !question || selectedAnswer === null) return;

    let correct = false;
    if (question.type === "multiple-select" && Array.isArray(question.correctAnswerId) && Array.isArray(selectedAnswer)) {
      const sortedCorrect = [...question.correctAnswerId].sort();
      const sortedSelected = [...selectedAnswer].sort();
      correct = JSON.stringify(sortedCorrect) === JSON.stringify(sortedSelected);
    } else {
      correct = selectedAnswer === question.correctAnswerId;
    }

    const pointsEarned = correct ? question.points : 0;

    setIsCorrect(correct);
    setShowResult(true);

    // Wait 2.5 seconds before calling onAnswer
    setTimeout(() => {
      const answerStr = Array.isArray(selectedAnswer) ? selectedAnswer.join(',') : selectedAnswer?.toString() || '';
      onAnswer(answerStr, correct, pointsEarned);
    }, 2500);
  };

  const handleOptionClick = (optionId: string) => {
    if (showResult) return;

    if (question?.type === "multiple-select") {
      setSelectedAnswer((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        if (prevArray.includes(optionId)) {
          return prevArray.filter(id => id !== optionId);
        } else {
          return [...prevArray, optionId];
        }
      });
    } else {
      setSelectedAnswer(optionId);
    }
  };

  if (!question) return null;

  const progress = (currentQuestion / totalQuestions) * 100;
  const timeProgress = (timeRemaining / timeLimit) * 100;

  const isOptionSelected = (optionId: string) => {
    if (Array.isArray(selectedAnswer)) {
      return selectedAnswer.includes(optionId);
    }
    return selectedAnswer === optionId;
  };

  const isOptionCorrect = (optionId: string) => {
    if (Array.isArray(question.correctAnswerId)) {
      return question.correctAnswerId.includes(optionId);
    }
    return question.correctAnswerId === optionId;
  };

  const hasSelection = question.type === "multiple-select"
    ? Array.isArray(selectedAnswer) && selectedAnswer.length > 0
    : selectedAnswer !== null;

  // Render different layouts based on question type
  const renderQuestionOptions = () => {
    if (question.type === "true-false") {
      return (
        <div className="grid grid-cols-2 gap-4">
          {question.options.map((option) => {
            const isSelected = isOptionSelected(option.id);
            const isCorrectOption = isOptionCorrect(option.id);
            const showCorrect = showResult && isCorrectOption;
            const showIncorrect = showResult && isSelected && !isCorrect;
            const isTrue = option.text.toLowerCase() === "true";

            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                disabled={showResult}
                className={cn(
                  "relative group p-8 rounded-xl border-2 transition-all duration-200",
                  "hover:scale-105 hover:shadow-lg",
                  "disabled:cursor-not-allowed disabled:hover:scale-100",
                  isSelected && !showResult && "border-primary bg-primary/10 scale-105",
                  showCorrect && "border-green-500 bg-green-500/10 scale-105",
                  showIncorrect && "border-red-500 bg-red-500/10 scale-105",
                  !isSelected && !showCorrect && !showIncorrect && "border-border hover:border-primary/50"
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                    isSelected && !showResult && "bg-primary text-primary-foreground",
                    showCorrect && "bg-green-500 text-white",
                    showIncorrect && "bg-red-500 text-white",
                    !isSelected && !showCorrect && !showIncorrect && "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    {showCorrect ? (
                      <Check className="h-8 w-8" />
                    ) : showIncorrect ? (
                      <X className="h-8 w-8" />
                    ) : isTrue ? (
                      <CircleCheck className="h-8 w-8" />
                    ) : (
                      <CircleX className="h-8 w-8" />
                    )}
                  </div>
                  <p className="text-2xl font-bold">{option.text}</p>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    // MCQ and Multiple Select
    return (
      <div className="space-y-3">
        {question.type === "multiple-select" && (
          <p className="text-sm text-muted-foreground italic">
            Select all correct answers
          </p>
        )}
        {question.options.map((option, index) => {
          const isSelected = isOptionSelected(option.id);
          const isCorrectOption = isOptionCorrect(option.id);
          const showCorrect = showResult && isCorrectOption;
          const showIncorrect = showResult && isSelected && !isCorrectOption;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={showResult}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01]",
                "disabled:cursor-not-allowed disabled:hover:scale-100",
                isSelected && !showResult && "border-primary bg-primary/10 shadow-md",
                showCorrect && "border-green-500 bg-green-500/10 shadow-md shadow-green-500/20",
                showIncorrect && "border-red-500 bg-red-500/10 shadow-md shadow-red-500/20",
                !isSelected && !showCorrect && !showIncorrect && "border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0 transition-all",
                  question.type === "multiple-select" && "rounded-md",
                  isSelected && !showResult && "bg-primary text-primary-foreground shadow-lg",
                  showCorrect && "bg-green-500 text-white shadow-lg",
                  showIncorrect && "bg-red-500 text-white shadow-lg",
                  !isSelected && !showCorrect && !showIncorrect && "bg-muted text-muted-foreground"
                )}>
                  {showCorrect ? (
                    <Check className="h-5 w-5" />
                  ) : showIncorrect ? (
                    <X className="h-5 w-5" />
                  ) : question.type === "multiple-select" ? (
                    isSelected ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>
                <p className="flex-1 font-medium text-base leading-relaxed">{option.text}</p>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-8 space-y-6">
          {/* Header with Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
                  Question {currentQuestion} of {totalQuestions}
                </Badge>
                <Badge variant="outline" className={cn(
                  "text-sm px-3 py-1",
                  question.difficulty === "Easy" && "bg-green-500/10 text-green-500 border-green-500/20",
                  question.difficulty === "Medium" && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                  question.difficulty === "Hard" && "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {question.difficulty}
                </Badge>
                <Badge variant="outline" className="bg-muted text-sm px-3 py-1">
                  {question.type === "mcq" && "Multiple Choice"}
                  {question.type === "true-false" && "True / False"}
                  {question.type === "multiple-select" && "Multiple Select"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20">
                <Trophy className="h-4 w-4 text-warning" />
                <span className="text-sm font-bold text-warning">{question.points} pts</span>
              </div>
            </div>

            <Progress value={progress} className="h-2.5" />

            {/* Timer */}
            {!showResult && (
              <Card className={cn(
                "p-4",
                timeRemaining <= 5 && "bg-red-500/10 border-red-500/20"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className={cn(
                      "h-5 w-5",
                      timeRemaining <= 5 ? "text-red-500" : "text-muted-foreground"
                    )} />
                    <span className="text-sm font-medium">Time Remaining</span>
                  </div>
                  <span className={cn(
                    "text-xl font-bold tabular-nums",
                    timeRemaining <= 5 && "text-red-500 animate-pulse"
                  )}>
                    {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                  </span>
                </div>
                <Progress
                  value={timeProgress}
                  className={cn(
                    "h-2 mt-2",
                    timeRemaining <= 5 && "[&>div]:bg-red-500"
                  )}
                />
              </Card>
            )}
          </div>

          {/* Question */}
          <Card className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 border-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <Circle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xl font-semibold leading-relaxed mb-2">{question.questionText}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Topic:</span> {question.topic}
                </p>
              </div>
            </div>
          </Card>

          {/* Options based on question type */}
          {renderQuestionOptions()}

          {/* Result Message */}
          {showResult && (
            <Card className={cn(
              "p-6 border-2 animate-fade-in-up",
              isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
            )}>
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-full flex-shrink-0",
                  isCorrect ? "bg-green-500" : "bg-red-500"
                )}>
                  {isCorrect ? (
                    <Check className="h-7 w-7 text-white" />
                  ) : (
                    <X className="h-7 w-7 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "font-bold text-2xl mb-1",
                    isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                  )}>
                    {isCorrect ? "Correct Answer!" : "Incorrect Answer"}
                  </p>
                  <p className="text-base text-foreground/80 mb-2">
                    {isCorrect
                      ? `Great job! You earned ${question.points} points.`
                      : "Don't worry, reviewing your mistakes helps you learn better."
                    }
                  </p>
                  {question.explanation && (
                    <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Explanation:</p>
                      <p className="text-sm">{question.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          {!showResult && (
            <Button
              onClick={handleSubmit}
              disabled={!hasSelection}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              {question.type === "multiple-select" ? "Submit Answers" : "Submit Answer"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
