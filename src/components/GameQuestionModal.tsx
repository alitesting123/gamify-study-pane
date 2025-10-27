// src/components/GameQuestionModal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, X, Brain, Sparkles, Trophy } from "lucide-react";
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
  const [userAnswer, setUserAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Reset state when question changes
  useEffect(() => {
    if (question && open) {
      setUserAnswer("");
      setShowFeedback(false);
      setIsCorrect(false);
      setAttempts(0);
    }
  }, [question, open]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const input = document.querySelector('input[name="game-answer"]') as HTMLInputElement;
        input?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question || !userAnswer.trim()) return;

    const correct = userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();
    setIsCorrect(correct);
    setShowFeedback(true);
    setAttempts(attempts + 1);

    if (correct) {
      // Correct answer - close after delay
      setTimeout(() => {
        onAnswer(true, userAnswer);
      }, 1500);
    } else if (!allowRetry) {
      // Wrong and no retry - close after delay
      setTimeout(() => {
        onAnswer(false, userAnswer);
      }, 2000);
    } else {
      // Wrong but can retry - clear input after showing feedback
      setTimeout(() => {
        setShowFeedback(false);
        setUserAnswer("");
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showFeedback) {
      handleSubmit();
    }
  };

  if (!question) return null;

  // Detect question type for UI hints
  const isYesNo = question.question.toLowerCase().includes("(yes or no)");
  const isTrueFalse = question.question.toLowerCase().includes("(true or false)");
  const isNumeric = /\d+/.test(question.answer) && question.answer.length <= 5;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl p-0 border-2 bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden"
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
                  <div className="flex-1 space-y-2">
                    <p className="text-2xl font-bold leading-relaxed text-foreground">
                      {question.question}
                    </p>
                    {(isYesNo || isTrueFalse || isNumeric) && (
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-muted-foreground">
                          {isYesNo && "Type: yes or no"}
                          {isTrueFalse && "Type: true or false"}
                          {isNumeric && !isYesNo && !isTrueFalse && "Enter a number"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answer Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Your Answer
              </label>
              <div className="relative">
                <Input
                  name="game-answer"
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={showFeedback && isCorrect}
                  placeholder="Type your answer here..."
                  className={cn(
                    "h-16 text-xl font-semibold px-6 border-2 transition-all duration-300 shadow-lg",
                    showFeedback && isCorrect && "border-emerald-500 bg-emerald-500/10",
                    showFeedback && !isCorrect && "border-rose-500 bg-rose-500/10",
                    !showFeedback && "focus:border-primary focus:ring-2 focus:ring-primary/20"
                  )}
                />
                {showFeedback && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isCorrect ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300">
                        <Check className="h-6 w-6 text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300">
                        <X className="h-6 w-6 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Options for Yes/No or True/False */}
              {(isYesNo || isTrueFalse) && !showFeedback && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setUserAnswer(isYesNo ? "yes" : "true");
                      setTimeout(() => {
                        const input = document.querySelector('input[name="game-answer"]') as HTMLInputElement;
                        input?.focus();
                      }, 0);
                    }}
                    className="h-14 text-base font-semibold border-2 hover:border-primary hover:bg-primary/10 transition-all duration-200"
                  >
                    {isYesNo ? "Yes" : "True"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setUserAnswer(isYesNo ? "no" : "false");
                      setTimeout(() => {
                        const input = document.querySelector('input[name="game-answer"]') as HTMLInputElement;
                        input?.focus();
                      }, 0);
                    }}
                    className="h-14 text-base font-semibold border-2 hover:border-primary hover:bg-primary/10 transition-all duration-200"
                  >
                    {isYesNo ? "No" : "False"}
                  </Button>
                </div>
              )}
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
                        : `The correct answer was: ${question.answer}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {!showFeedback && (
              <Button
                type="submit"
                disabled={!userAnswer.trim()}
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
                  Submit Answer
                  <Check className="h-5 w-5" />
                </span>
              </Button>
            )}
          </form>

          {/* Helper Text */}
          {!showFeedback && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="px-2 py-1 rounded bg-muted/50 font-mono">Enter</div>
              <span>to submit</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
