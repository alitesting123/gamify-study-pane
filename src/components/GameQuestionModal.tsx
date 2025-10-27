// src/components/GameQuestionModal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle } from "lucide-react";
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
  title = "Challenge Question",
  allowRetry = true,
}: GameQuestionModalProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Reset state when question changes
  useEffect(() => {
    if (question && open) {
      console.log('🎨 GameQuestionModal: Opening with question:', question.question);
      setSelectedOption(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setAttempts(0);
    }
  }, [question, open]);

  const handleOptionClick = (optionId: string) => {
    if (showFeedback) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!question || !selectedOption) return;

    try {
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
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Ensure modal closes even on error
      onAnswer(false, selectedOption);
    }
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-3xl p-0 border shadow-2xl bg-white dark:bg-slate-900"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Select the correct answer
                  </p>
                </div>
              </div>
              {attempts > 0 && (
                <Badge variant="outline" className="text-xs px-3 py-1">
                  Attempt {attempts}
                </Badge>
              )}
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            {/* Question */}
            <div className="py-4">
              <p className="text-2xl font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                {question.question}
              </p>
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
                    "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
                    "hover:border-slate-400 dark:hover:border-slate-500",
                    "disabled:cursor-not-allowed disabled:opacity-100",
                    isSelected && !showFeedback && "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800",
                    showCorrectMark && "border-green-600 bg-green-50 dark:bg-green-950",
                    showIncorrectMark && "border-red-600 bg-red-50 dark:bg-red-950",
                    !isSelected && !showCorrectMark && !showIncorrectMark && "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Letter badge */}
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-base flex-shrink-0 transition-all",
                      isSelected && !showFeedback && "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900",
                      showCorrectMark && "bg-green-600 text-white",
                      showIncorrectMark && "bg-red-600 text-white",
                      !isSelected && !showCorrectMark && !showIncorrectMark && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}>
                      {showCorrectMark ? (
                        <Check className="h-5 w-5" strokeWidth={2.5} />
                      ) : showIncorrectMark ? (
                        <X className="h-5 w-5" strokeWidth={2.5} />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>

                    <p className={cn(
                      "flex-1 font-medium text-base leading-relaxed",
                      showCorrectMark && "text-green-900 dark:text-green-100",
                      showIncorrectMark && "text-red-900 dark:text-red-100",
                      !showCorrectMark && !showIncorrectMark && "text-slate-700 dark:text-slate-300"
                    )}>
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
                "p-4 rounded-lg border-2",
                isCorrect
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                  : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isCorrect ? "bg-green-600" : "bg-red-600"
                  )}
                >
                  {isCorrect ? (
                    <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                  ) : (
                    <X className="h-5 w-5 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-semibold text-base",
                      isCorrect
                        ? "text-green-900 dark:text-green-100"
                        : "text-red-900 dark:text-red-100"
                    )}
                  >
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                  <p className={cn(
                    "text-sm mt-1",
                    isCorrect
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  )}>
                    {isCorrect
                      ? "Well done! Continuing game..."
                      : allowRetry
                      ? "Try again!"
                      : `Correct answer: ${question.options.find(o => o.id === question.correctAnswer)?.text}`}
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
                "w-full h-12 rounded-lg font-semibold text-base transition-all",
                "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900",
                "hover:bg-slate-800 dark:hover:bg-slate-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 dark:disabled:hover:bg-slate-100"
              )}
            >
              Submit Answer
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
