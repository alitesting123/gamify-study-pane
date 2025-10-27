// src/components/QuestionPlayer.tsx
// NEW Advanced Question Player with Multiple Question Types
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Clock, Trophy, Star, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuestionType = "multiple-choice" | "true-false" | "multi-select";

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  answers: Answer[];
  explanation?: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  timeLimit: number; // seconds
}

interface QuestionPlayerProps {
  questions: QuizQuestion[];
  onComplete: (score: number, totalPoints: number) => void;
}

export const QuestionPlayer = ({ questions, onComplete }: QuestionPlayerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const timeProgress = (timeRemaining / currentQuestion.timeLimit) * 100;

  // Reset timer when question changes
  useEffect(() => {
    setTimeRemaining(currentQuestion.timeLimit);
  }, [currentQuestionIndex, currentQuestion.timeLimit]);

  // Timer countdown
  useEffect(() => {
    if (showResult) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult, currentQuestionIndex]);

  const handleAnswerSelect = (answerId: string) => {
    if (showResult) return;

    if (currentQuestion.type === "multi-select") {
      setSelectedAnswers((prev) =>
        prev.includes(answerId)
          ? prev.filter((id) => id !== answerId)
          : [...prev, answerId]
      );
    } else {
      setSelectedAnswers([answerId]);
    }
  };

  const handleSubmit = () => {
    if (showResult || selectedAnswers.length === 0) return;

    // Check if answer is correct
    const correctAnswerIds = currentQuestion.answers
      .filter((a) => a.isCorrect)
      .map((a) => a.id)
      .sort();

    const userAnswerIds = [...selectedAnswers].sort();
    const correct = JSON.stringify(correctAnswerIds) === JSON.stringify(userAnswerIds);

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore((prev) => prev + currentQuestion.points);
    }

    // Auto-advance after 3 seconds
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswers([]);
        setShowResult(false);
      } else {
        // Quiz complete
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
        onComplete(score + (correct ? currentQuestion.points : 0), totalPoints);
      }
    }, 3000);
  };

  const renderTrueFalse = () => (
    <div className="grid grid-cols-2 gap-6">
      {currentQuestion.answers.map((answer) => {
        const isSelected = selectedAnswers.includes(answer.id);
        const showCorrect = showResult && answer.isCorrect;
        const showWrong = showResult && isSelected && !answer.isCorrect;

        return (
          <button
            key={answer.id}
            onClick={() => handleAnswerSelect(answer.id)}
            disabled={showResult}
            className={cn(
              "group relative p-12 rounded-2xl border-4 transition-all duration-300",
              "hover:scale-105 active:scale-95",
              "disabled:hover:scale-100",
              isSelected && !showResult && "border-primary bg-primary/5 scale-105 shadow-2xl shadow-primary/20",
              showCorrect && "border-green-500 bg-green-500/10 scale-105 shadow-2xl shadow-green-500/30",
              showWrong && "border-red-500 bg-red-500/10 scale-105 shadow-2xl shadow-red-500/30",
              !isSelected && !showCorrect && !showWrong && "border-border hover:border-primary/50 hover:shadow-xl"
            )}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300",
                  "font-black text-4xl",
                  isSelected && !showResult && "bg-primary text-primary-foreground scale-110",
                  showCorrect && "bg-green-500 text-white scale-110",
                  showWrong && "bg-red-500 text-white scale-110",
                  !isSelected && !showCorrect && !showWrong && "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                )}
              >
                {showCorrect ? (
                  <Check className="h-16 w-16" strokeWidth={3} />
                ) : showWrong ? (
                  <X className="h-16 w-16" strokeWidth={3} />
                ) : answer.text === "True" ? (
                  "✓"
                ) : (
                  "✗"
                )}
              </div>
              <p className="text-3xl font-bold">{answer.text}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderMultipleChoice = () => (
    <div className="space-y-4">
      {currentQuestion.answers.map((answer, index) => {
        const isSelected = selectedAnswers.includes(answer.id);
        const showCorrect = showResult && answer.isCorrect;
        const showWrong = showResult && isSelected && !answer.isCorrect;
        const letter = String.fromCharCode(65 + index);

        return (
          <button
            key={answer.id}
            onClick={() => handleAnswerSelect(answer.id)}
            disabled={showResult}
            className={cn(
              "w-full text-left p-5 rounded-xl border-3 transition-all duration-200",
              "hover:scale-[1.02] active:scale-[0.98]",
              "disabled:hover:scale-100",
              isSelected && !showResult && "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.02]",
              showCorrect && "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/30",
              showWrong && "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/30",
              !isSelected && !showCorrect && !showWrong && "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 transition-all",
                  isSelected && !showResult && "bg-primary text-primary-foreground shadow-lg scale-110",
                  showCorrect && "bg-green-500 text-white shadow-lg scale-110",
                  showWrong && "bg-red-500 text-white shadow-lg scale-110",
                  !isSelected && !showCorrect && !showWrong && "bg-muted text-muted-foreground"
                )}
              >
                {showCorrect || showWrong ? (
                  showCorrect ? (
                    <Check className="h-7 w-7" strokeWidth={3} />
                  ) : (
                    <X className="h-7 w-7" strokeWidth={3} />
                  )
                ) : (
                  letter
                )}
              </div>
              <p className="flex-1 font-semibold text-lg leading-relaxed">{answer.text}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderMultiSelect = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <AlertCircle className="h-5 w-5 text-blue-500" />
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Select ALL correct answers
        </p>
      </div>
      {currentQuestion.answers.map((answer, index) => {
        const isSelected = selectedAnswers.includes(answer.id);
        const showCorrect = showResult && answer.isCorrect;
        const showWrong = showResult && isSelected && !answer.isCorrect;
        const shouldBeSelected = showResult && answer.isCorrect && !isSelected;

        return (
          <button
            key={answer.id}
            onClick={() => handleAnswerSelect(answer.id)}
            disabled={showResult}
            className={cn(
              "w-full text-left p-5 rounded-xl border-3 transition-all duration-200",
              "hover:scale-[1.02] active:scale-[0.98]",
              "disabled:hover:scale-100",
              isSelected && !showResult && "border-primary bg-primary/10 shadow-lg shadow-primary/20",
              showCorrect && "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/30",
              showWrong && "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/30",
              shouldBeSelected && "border-orange-500 bg-orange-500/10 border-dashed",
              !isSelected && !showCorrect && !showWrong && !shouldBeSelected && "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl flex-shrink-0 transition-all",
                  isSelected && !showResult && "bg-primary text-primary-foreground shadow-lg",
                  showCorrect && "bg-green-500 text-white shadow-lg",
                  showWrong && "bg-red-500 text-white shadow-lg",
                  shouldBeSelected && "bg-orange-500 text-white shadow-lg",
                  !isSelected && !showCorrect && !showWrong && !shouldBeSelected && "bg-muted text-muted-foreground border-2 border-border"
                )}
              >
                {showCorrect || showWrong || shouldBeSelected ? (
                  showCorrect ? (
                    <Check className="h-7 w-7" strokeWidth={3} />
                  ) : showWrong ? (
                    <X className="h-7 w-7" strokeWidth={3} />
                  ) : (
                    <AlertCircle className="h-7 w-7" />
                  )
                ) : isSelected ? (
                  <Check className="h-7 w-7" strokeWidth={3} />
                ) : (
                  <div className="w-6 h-6 rounded border-2 border-current" />
                )}
              </div>
              <p className="flex-1 font-semibold text-lg leading-relaxed">{answer.text}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="text-base px-4 py-1.5 bg-primary">
            Question {currentQuestionIndex + 1} / {questions.length}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-base px-4 py-1.5",
              currentQuestion.difficulty === "Easy" && "bg-green-500/10 text-green-600 border-green-500/30",
              currentQuestion.difficulty === "Medium" && "bg-orange-500/10 text-orange-600 border-orange-500/30",
              currentQuestion.difficulty === "Hard" && "bg-red-500/10 text-red-600 border-red-500/30"
            )}
          >
            {currentQuestion.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-amber-600 dark:text-amber-400">{score} pts</span>
          </div>
        </div>
      </div>

      <Progress value={progress} className="h-3" />

      {/* Timer Card */}
      {!showResult && (
        <Card
          className={cn(
            "p-5 border-2",
            timeRemaining <= 5 ? "bg-red-500/10 border-red-500/30" : "bg-muted/30"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock
                className={cn(
                  "h-6 w-6",
                  timeRemaining <= 5 ? "text-red-500 animate-pulse" : "text-muted-foreground"
                )}
              />
              <span className="font-semibold text-lg">Time Remaining</span>
            </div>
            <span
              className={cn(
                "text-3xl font-bold tabular-nums",
                timeRemaining <= 5 && "text-red-500 animate-pulse"
              )}
            >
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
            </span>
          </div>
          <Progress
            value={timeProgress}
            className={cn("h-2 mt-3", timeRemaining <= 5 && "[&>div]:bg-red-500")}
          />
        </Card>
      )}

      {/* Question Card */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-2xl font-bold leading-relaxed mb-3">{currentQuestion.question}</p>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-background">
                  {currentQuestion.topic}
                </Badge>
                <Badge variant="outline" className="bg-background">
                  {currentQuestion.type === "multiple-choice" && "Multiple Choice"}
                  {currentQuestion.type === "true-false" && "True or False"}
                  {currentQuestion.type === "multi-select" && "Select All That Apply"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
              <Trophy className="h-5 w-5" />
              <span className="font-bold text-lg">{currentQuestion.points} pts</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Answers */}
      {currentQuestion.type === "true-false" && renderTrueFalse()}
      {currentQuestion.type === "multiple-choice" && renderMultipleChoice()}
      {currentQuestion.type === "multi-select" && renderMultiSelect()}

      {/* Result */}
      {showResult && (
        <Card
          className={cn(
            "p-6 border-4 animate-fade-in-up",
            isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
          )}
        >
          <div className="flex items-start gap-5">
            <div
              className={cn(
                "p-4 rounded-full flex-shrink-0",
                isCorrect ? "bg-green-500" : "bg-red-500"
              )}
            >
              {isCorrect ? (
                <Check className="h-10 w-10 text-white" strokeWidth={3} />
              ) : (
                <X className="h-10 w-10 text-white" strokeWidth={3} />
              )}
            </div>
            <div className="flex-1">
              <p
                className={cn(
                  "text-3xl font-black mb-2",
                  isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                )}
              >
                {isCorrect ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-lg mb-3">
                {isCorrect
                  ? `Excellent work! You earned ${currentQuestion.points} points.`
                  : `The correct answer${currentQuestion.answers.filter(a => a.isCorrect).length > 1 ? 's were' : ' was'}: ${currentQuestion.answers.filter(a => a.isCorrect).map(a => a.text).join(", ")}`}
              </p>
              {currentQuestion.explanation && (
                <div className="p-4 rounded-lg bg-background/60 border-2 border-border">
                  <p className="font-semibold mb-1">Explanation:</p>
                  <p className="text-muted-foreground">{currentQuestion.explanation}</p>
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
          disabled={selectedAnswers.length === 0}
          className="w-full h-16 text-xl font-bold"
          size="lg"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
};
