// src/components/GameQuestionModal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, X, Brain, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { GameQuestion } from "@/lib/pixiGame";

interface GameQuestionModalProps {
  open: boolean;
  question: GameQuestion | null;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
  title?: string;
  allowRetry?: boolean;
}

export const GameQuestionModal = ({
  open,
  question,
  onAnswer,
  title = "⚠️ Challenge Question!",
  allowRetry = true,
}: GameQuestionModalProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Reset state when question changes
  useEffect(() => {
    if (question && open) {
      setSelectedOption(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setAttempts(0);
    }
  }, [question, open]);

  const handleOptionClick = (optionId: string) => {
    if (showFeedback) return; // Don't allow changes after submitting
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!question || !selectedOption) return;

    const correct = selectedOption === question.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setAttempts(attempts + 1);

    if (correct) {
      // Correct answer - close after delay
      setTimeout(() => {
        onAnswer(true, selectedOption);
      }, 1500);
    } else if (!allowRetry) {
      // Wrong and no retry - close after delay
      setTimeout(() => {
        onAnswer(false, selectedOption);
      }, 2000);
    } else {
      // Wrong but can retry - reset after showing feedback
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedOption(null);
      }, 1500);
    }
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-3xl p-0 border-2 bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />

        <div className="relative p-8 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 text-sm px-4 py-1.5 shadow-lg font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                {title}
              </Badge>
              {attempts > 0 && (
                <Badge variant="outline" className="text-xs px-3 py-1">
                  Attempt {attempts}
                </Badge>
              )}
            </div>

            {/* Question Card */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-border/50 bg-gradient-to-br from-muted/40 via-muted/30 to-background/50 shadow-xl">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0 shadow-lg">
                    <Brain className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold leading-relaxed text-foreground">
                      {question.question}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MCQ Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === option.id;
              const isCorrectOption = option.id === question.correctAnswer;
              const showCorrectMark = showFeedback && isCorrectOption;
              const showIncorrectMark = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  disabled={showFeedback}
                  className={cn(
                    "group relative w-full text-left overflow-hidden rounded-xl border-2 p-5 transition-all duration-300",
                    "hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:scale-[1.01] hover:shadow-lg",
                    "active:scale-[0.99]",
                    "disabled:cursor-not-allowed disabled:hover:scale-100",
                    isSelected && !showFeedback && "border-primary bg-gradient-to-r from-primary/15 via-primary/8 to-transparent shadow-lg shadow-primary/10 scale-[1.01]",
                    showCorrectMark && "border-emerald-500 bg-gradient-to-r from-emerald-500/15 via-emerald-500/8 to-transparent shadow-lg shadow-emerald-500/20",
                    showIncorrectMark && "border-rose-500 bg-gradient-to-r from-rose-500/15 via-rose-500/8 to-transparent shadow-lg shadow-rose-500/20",
                    !isSelected && !showCorrectMark && !showIncorrectMark && "border-border/50 bg-gradient-to-r from-background/50 to-muted/20"
                  )}
                >
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                  <div className="relative flex items-center gap-4">
                    {/* Letter badge */}
                    <div className={cn(
                      "relative w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 transition-all duration-300 shadow-md",
                      isSelected && !showFeedback && "bg-gradient-to-br from-primary to-primary/80 text-white shadow-primary/50 shadow-lg scale-110",
                      showCorrectMark && "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/50 shadow-lg scale-110",
                      showIncorrectMark && "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-500/50 shadow-lg scale-110",
                      !isSelected && !showCorrectMark && !showIncorrectMark && "bg-gradient-to-br from-muted to-muted/70 text-muted-foreground group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary"
                    )}>
                      {showCorrectMark && (
                        <div className="absolute inset-0 rounded-xl bg-emerald-500 animate-ping opacity-30" />
                      )}
                      {showCorrectMark ? (
                        <Check className="h-6 w-6 relative z-10" strokeWidth={3} />
                      ) : showIncorrectMark ? (
                        <X className="h-6 w-6 relative z-10" strokeWidth={3} />
                      ) : (
                        <span className="relative z-10">{String.fromCharCode(65 + index)}</span>
                      )}
                    </div>

                    <p className="flex-1 font-medium text-lg leading-relaxed pr-2">
                      {option.text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback Message */}
          {showFeedback && (
            <div
              className={cn(
                "p-5 rounded-xl border-2 animate-in slide-in-from-bottom-4 duration-500 shadow-lg",
                isCorrect
                  ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-emerald-500/5"
                  : "border-rose-500/50 bg-gradient-to-br from-rose-500/15 via-rose-500/10 to-rose-500/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    isCorrect ? "bg-emerald-500/20" : "bg-rose-500/20"
                  )}
                >
                  {isCorrect ? (
                    <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                  ) : (
                    <X className="h-5 w-5 text-rose-600 dark:text-rose-400" strokeWidth={3} />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-bold text-lg",
                      isCorrect
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-700 dark:text-rose-400"
                    )}
                  >
                    {isCorrect ? "Excellent! Correct Answer!" : "Incorrect Answer"}
                  </p>
                  <p className="text-sm text-foreground/80 mt-1">
                    {isCorrect
                      ? "Great job! Moving forward..."
                      : allowRetry
                      ? "Try again! You can do this!"
                      : `The correct answer was: ${question.options.find(o => o.id === question.correctAnswer)?.text}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!showFeedback && (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={cn(
                "relative w-full h-16 text-lg font-bold overflow-hidden group transition-all duration-300 rounded-xl",
                "shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]",
                "bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground",
                "disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              )}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <span className="relative z-10 flex items-center justify-center gap-2">
                Submit Answer
                <Check className="h-5 w-5" />
              </span>
            </button>
          )}

          {/* Helper hint */}
          {!showFeedback && !selectedOption && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Select an option to continue</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
