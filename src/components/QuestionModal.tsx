// src/components/QuestionModal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Clock, Trophy, CircleCheck, CircleX, Sparkles, Brain, Target } from "lucide-react";
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

  // Difficulty badge styling
  const getDifficultyStyles = (difficulty: string) => {
    switch(difficulty) {
      case "Easy":
        return "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-emerald-500/10";
      case "Medium":
        return "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-amber-500/10";
      case "Hard":
        return "bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-rose-500/10";
      default:
        return "";
    }
  };

  // Render different layouts based on question type
  const renderQuestionOptions = () => {
    if (question.type === "true-false") {
      return (
        <div className="grid grid-cols-2 gap-6">
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
                  "group relative overflow-hidden rounded-2xl border-2 p-10 transition-all duration-300",
                  "hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]",
                  "disabled:cursor-not-allowed disabled:hover:scale-100",
                  "backdrop-blur-sm",
                  isSelected && !showResult && "border-primary bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 scale-[1.02] shadow-xl shadow-primary/20",
                  showCorrect && "border-emerald-500 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 scale-[1.02] shadow-xl shadow-emerald-500/30",
                  showIncorrect && "border-rose-500 bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-rose-500/5 scale-[1.02] shadow-xl shadow-rose-500/30",
                  !isSelected && !showCorrect && !showIncorrect && "border-border/50 hover:border-primary/40 bg-gradient-to-br from-background/80 to-muted/30"
                )}
              >
                {/* Animated background gradient */}
                <div className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-500",
                  "bg-gradient-to-br from-primary/10 via-transparent to-primary/5",
                  isSelected && !showResult && "opacity-100"
                )} />

                <div className="relative flex flex-col items-center gap-4">
                  {/* Icon container with glow effect */}
                  <div className={cn(
                    "relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
                    "shadow-lg",
                    isSelected && !showResult && "bg-gradient-to-br from-primary to-primary/80 text-white shadow-primary/50 shadow-2xl",
                    showCorrect && "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/50 shadow-2xl animate-bounce",
                    showIncorrect && "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-500/50 shadow-2xl",
                    !isSelected && !showCorrect && !showIncorrect && "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary group-hover:shadow-xl"
                  )}>
                    {/* Pulse effect for correct answer */}
                    {showCorrect && (
                      <div className="absolute inset-0 rounded-2xl bg-emerald-500 animate-ping opacity-20" />
                    )}

                    {showCorrect ? (
                      <Check className="h-10 w-10 relative z-10" strokeWidth={3} />
                    ) : showIncorrect ? (
                      <X className="h-10 w-10 relative z-10" strokeWidth={3} />
                    ) : isTrue ? (
                      <CircleCheck className="h-10 w-10 relative z-10" strokeWidth={2.5} />
                    ) : (
                      <CircleX className="h-10 w-10 relative z-10" strokeWidth={2.5} />
                    )}
                  </div>

                  <div className="space-y-1 text-center">
                    <p className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {option.text}
                    </p>
                    {isSelected && !showResult && (
                      <p className="text-xs font-medium text-primary">Selected</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    // MCQ and Multiple Select
    return (
      <div className="space-y-4">
        {question.type === "multiple-select" && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-primary">
              Select all correct answers
            </p>
          </div>
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
                "group relative w-full text-left overflow-hidden rounded-xl border-2 p-5 transition-all duration-300",
                "hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:scale-[1.01] hover:shadow-lg",
                "active:scale-[0.99]",
                "disabled:cursor-not-allowed disabled:hover:scale-100",
                isSelected && !showResult && "border-primary bg-gradient-to-r from-primary/15 via-primary/8 to-transparent shadow-lg shadow-primary/10 scale-[1.01]",
                showCorrect && "border-emerald-500 bg-gradient-to-r from-emerald-500/15 via-emerald-500/8 to-transparent shadow-lg shadow-emerald-500/20",
                showIncorrect && "border-rose-500 bg-gradient-to-r from-rose-500/15 via-rose-500/8 to-transparent shadow-lg shadow-rose-500/20",
                !isSelected && !showCorrect && !showIncorrect && "border-border/50 bg-gradient-to-r from-background/50 to-muted/20"
              )}
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

              <div className="relative flex items-center gap-4">
                {/* Letter/Icon badge */}
                <div className={cn(
                  "relative w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 transition-all duration-300 shadow-md",
                  question.type === "multiple-select" && "rounded-lg",
                  isSelected && !showResult && "bg-gradient-to-br from-primary to-primary/80 text-white shadow-primary/50 shadow-lg scale-110",
                  showCorrect && "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/50 shadow-lg scale-110",
                  showIncorrect && "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-500/50 shadow-lg scale-110",
                  !isSelected && !showCorrect && !showIncorrect && "bg-gradient-to-br from-muted to-muted/70 text-muted-foreground group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary"
                )}>
                  {showCorrect && (
                    <div className="absolute inset-0 rounded-xl bg-emerald-500 animate-ping opacity-30" />
                  )}
                  {showCorrect ? (
                    <Check className="h-6 w-6 relative z-10" strokeWidth={3} />
                  ) : showIncorrect ? (
                    <X className="h-6 w-6 relative z-10" strokeWidth={3} />
                  ) : question.type === "multiple-select" ? (
                    isSelected ? (
                      <Check className="h-6 w-6 relative z-10" strokeWidth={2.5} />
                    ) : (
                      <div className="h-5 w-5 rounded border-2 border-current relative z-10" />
                    )
                  ) : (
                    <span className="relative z-10">{String.fromCharCode(65 + index)}</span>
                  )}
                </div>

                <p className="flex-1 font-medium text-base leading-relaxed pr-2">
                  {option.text}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-2 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="p-8 space-y-6">
          {/* Header with Progress */}
          <div className="space-y-5">
            {/* Top meta information */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 text-sm px-4 py-1.5 shadow-sm font-semibold">
                  <Target className="h-3.5 w-3.5 mr-1.5" />
                  Question {currentQuestion} of {totalQuestions}
                </Badge>
                <Badge className={cn(
                  "text-sm px-4 py-1.5 shadow-sm font-semibold border",
                  getDifficultyStyles(question.difficulty)
                )}>
                  {question.difficulty}
                </Badge>
                <Badge className="bg-gradient-to-r from-muted to-muted/70 text-foreground border-muted-foreground/20 text-sm px-4 py-1.5 shadow-sm">
                  {question.type === "mcq" && "Multiple Choice"}
                  {question.type === "true-false" && "True / False"}
                  {question.type === "multiple-select" && "Multiple Select"}
                </Badge>
              </div>

              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {question.points} {question.points === 1 ? 'point' : 'points'}
                </span>
              </div>
            </div>

            {/* Progress bar with gradient */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </div>
              </div>
            </div>

            {/* Timer */}
            {!showResult && (
              <Card className={cn(
                "relative overflow-hidden border-2 transition-all duration-300",
                timeRemaining <= 5 ? "border-rose-500/40 bg-gradient-to-br from-rose-500/15 via-rose-500/10 to-rose-500/5 shadow-lg shadow-rose-500/20" : "border-border/50 bg-gradient-to-br from-background/80 to-muted/30"
              )}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        timeRemaining <= 5 ? "bg-rose-500/20" : "bg-muted/50"
                      )}>
                        <Clock className={cn(
                          "h-5 w-5",
                          timeRemaining <= 5 ? "text-rose-500" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className="text-sm font-semibold">Time Remaining</span>
                    </div>
                    <span className={cn(
                      "text-2xl font-bold tabular-nums",
                      timeRemaining <= 5 && "text-rose-500 animate-pulse"
                    )}>
                      {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="relative h-2.5 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all duration-1000",
                        timeRemaining <= 5
                          ? "bg-gradient-to-r from-rose-500 to-rose-600"
                          : "bg-gradient-to-r from-primary to-primary/80"
                      )}
                      style={{ width: `${timeProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Question */}
          <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-muted/40 via-muted/30 to-background/50 shadow-lg">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />

            <div className="relative p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0 shadow-lg">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-xl font-semibold leading-relaxed text-foreground">
                    {question.questionText}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="px-3 py-1 rounded-lg bg-muted/50 border border-border/50">
                      <span className="font-medium text-muted-foreground">Topic:</span>{" "}
                      <span className="font-semibold text-foreground">{question.topic}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Options based on question type */}
          {renderQuestionOptions()}

          {/* Result Message */}
          {showResult && (
            <Card className={cn(
              "relative overflow-hidden border-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
              isCorrect
                ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-emerald-500/5 shadow-xl shadow-emerald-500/20"
                : "border-rose-500/50 bg-gradient-to-br from-rose-500/15 via-rose-500/10 to-rose-500/5 shadow-xl shadow-rose-500/20"
            )}>
              {/* Animated background effect */}
              <div className={cn(
                "absolute inset-0 opacity-20",
                isCorrect
                  ? "bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3),transparent_70%)]"
                  : "bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.3),transparent_70%)]"
              )} />

              <div className="relative p-6">
                <div className="flex items-start gap-5">
                  <div className={cn(
                    "relative p-4 rounded-2xl flex-shrink-0 shadow-2xl",
                    isCorrect ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-rose-500 to-rose-600"
                  )}>
                    {isCorrect && (
                      <div className="absolute inset-0 rounded-2xl bg-emerald-400 animate-ping opacity-30" />
                    )}
                    {isCorrect ? (
                      <Check className="h-8 w-8 text-white relative z-10" strokeWidth={3} />
                    ) : (
                      <X className="h-8 w-8 text-white relative z-10" strokeWidth={3} />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className={cn(
                        "font-bold text-2xl mb-1",
                        isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                      )}>
                        {isCorrect ? "Excellent Work!" : "Not Quite Right"}
                      </p>
                      <p className="text-base text-foreground/80">
                        {isCorrect
                          ? `Outstanding! You've earned ${question.points} ${question.points === 1 ? 'point' : 'points'}.`
                          : "That's okay! Every mistake is a learning opportunity."
                        }
                      </p>
                    </div>
                    {question.explanation && (
                      <div className="p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm">
                        <div className="flex items-start gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm font-semibold text-primary">Explanation</p>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/90 pl-6">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          {!showResult && (
            <Button
              onClick={handleSubmit}
              disabled={!hasSelection}
              className={cn(
                "relative w-full h-16 text-lg font-bold overflow-hidden group transition-all duration-300",
                "shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]",
                "bg-gradient-to-r from-primary via-primary/90 to-primary/80",
                "disabled:opacity-50 disabled:hover:scale-100"
              )}
              size="lg"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <span className="relative z-10 flex items-center justify-center gap-2">
                {question.type === "multiple-select" ? "Submit Answers" : "Submit Answer"}
                <Check className="h-5 w-5" />
              </span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
