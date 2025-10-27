// src/components/QuestionDemo.tsx
// Demo page showing all question types in action
import { useState } from "react";
import { QuestionPlayer, QuizQuestion } from "./QuestionPlayer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw } from "lucide-react";

const sampleQuestions: QuizQuestion[] = [
  // TRUE/FALSE QUESTION
  {
    id: "q1",
    type: "true-false",
    question: "Metal motherboards provide better heat dissipation than traditional FR-4 boards.",
    answers: [
      { id: "true", text: "True", isCorrect: true },
      { id: "false", text: "False", isCorrect: false },
    ],
    explanation: "Metal motherboards excel at thermal management due to their excellent heat conductivity, making them ideal for high-power CPUs and GPUs.",
    topic: "Hardware",
    difficulty: "Easy",
    points: 1,
    timeLimit: 20,
  },
  // MULTIPLE CHOICE QUESTION
  {
    id: "q2",
    type: "multiple-choice",
    question: "Which material is MOST commonly used for metal motherboards?",
    answers: [
      { id: "a", text: "Aluminum", isCorrect: true },
      { id: "b", text: "Steel", isCorrect: false },
      { id: "c", text: "Copper", isCorrect: false },
      { id: "d", text: "Titanium", isCorrect: false },
    ],
    explanation: "Aluminum is the most common choice due to its excellent balance of lightweight properties, strength, and thermal conductivity.",
    topic: "Materials",
    difficulty: "Medium",
    points: 2,
    timeLimit: 30,
  },
  // MULTI-SELECT QUESTION
  {
    id: "q3",
    type: "multi-select",
    question: "Which of the following are advantages of metal motherboards? (Select ALL that apply)",
    answers: [
      { id: "a", text: "Better heat dissipation", isCorrect: true },
      { id: "b", text: "Enhanced durability", isCorrect: true },
      { id: "c", text: "Lower cost", isCorrect: false },
      { id: "d", text: "Improved EMI shielding", isCorrect: true },
      { id: "e", text: "Lighter weight", isCorrect: false },
    ],
    explanation: "Metal motherboards offer better heat dissipation, enhanced durability, and improved EMI shielding. However, they are typically heavier and more expensive than traditional boards.",
    topic: "Advantages",
    difficulty: "Hard",
    points: 3,
    timeLimit: 45,
  },
  // ANOTHER TRUE/FALSE
  {
    id: "q4",
    type: "true-false",
    question: "MCPCB stands for Metal Circuit Board.",
    answers: [
      { id: "true", text: "True", isCorrect: false },
      { id: "false", text: "False", isCorrect: true },
    ],
    explanation: "MCPCB stands for Metal-Core PCB (Printed Circuit Board), not Metal Circuit Board.",
    topic: "Terminology",
    difficulty: "Easy",
    points: 1,
    timeLimit: 20,
  },
  // ANOTHER MULTIPLE CHOICE
  {
    id: "q5",
    type: "multiple-choice",
    question: "What is the main disadvantage of using copper in metal motherboards?",
    answers: [
      { id: "a", text: "Poor thermal conductivity", isCorrect: false },
      { id: "b", text: "Higher cost and weight", isCorrect: true },
      { id: "c", text: "Weak durability", isCorrect: false },
      { id: "d", text: "Low availability", isCorrect: false },
    ],
    explanation: "While copper offers superior heat transfer, it is more expensive and heavier than aluminum, making it less practical for many applications.",
    topic: "Materials",
    difficulty: "Medium",
    points: 2,
    timeLimit: 30,
  },
];

export const QuestionDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [finalScore, setFinalScore] = useState<{ score: number; total: number } | null>(null);

  const handleQuizComplete = (score: number, totalPoints: number) => {
    setFinalScore({ score, total: totalPoints });
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setIsPlaying(true);
    setFinalScore(null);
  };

  if (isPlaying) {
    return <QuestionPlayer questions={sampleQuestions} onComplete={handleQuizComplete} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-bold mb-2">Question Types Demo</h1>
        <p className="text-lg text-muted-foreground">
          Interactive demonstration of all question formats
        </p>
      </div>

      {/* Final Score Display */}
      {finalScore && (
        <Card className="p-8 bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/30">
          <div className="flex items-center gap-6">
            <div className="p-6 rounded-full bg-green-500">
              <Trophy className="h-16 w-16 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-black text-green-700 dark:text-green-400 mb-2">
                Quiz Complete!
              </p>
              <p className="text-2xl font-bold mb-1">
                You scored {finalScore.score} out of {finalScore.total} points
              </p>
              <p className="text-lg text-muted-foreground">
                {Math.round((finalScore.score / finalScore.total) * 100)}% accuracy
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Question Type Examples */}
      <div className="grid gap-6">
        <Card className="p-6 border-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-blue-500">1</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">True / False Questions</h3>
              <p className="text-muted-foreground mb-4">
                Large, easy-to-click buttons in a 2-column grid. Perfect for yes/no questions with
                clear visual feedback.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-semibold">
                  1 point
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-sm font-semibold">
                  20 seconds
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-orange-500">2</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Multiple Choice Questions</h3>
              <p className="text-muted-foreground mb-4">
                Classic A, B, C, D format with letter badges. Clean cards with smooth hover
                animations and clear selection states.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-sm font-semibold">
                  2 points
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-sm font-semibold">
                  30 seconds
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-red-500">3</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Multi-Select Questions</h3>
              <p className="text-muted-foreground mb-4">
                Select multiple correct answers. Checkbox-style indicators with "Select ALL that
                apply" instruction. Shows missed answers in orange.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-sm font-semibold">
                  3 points
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-sm font-semibold">
                  45 seconds
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Features List */}
      <Card className="p-6 bg-muted/30">
        <h3 className="text-xl font-bold mb-4">Features</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Real-time countdown timer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Auto-submit when time expires</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Instant visual feedback</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Detailed explanations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Progress tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Points-based scoring</span>
          </div>
        </div>
      </Card>

      {/* Start/Restart Button */}
      <Button
        onClick={handleRestart}
        size="lg"
        className="w-full h-16 text-xl font-bold"
      >
        {finalScore ? (
          <>
            <RotateCcw className="h-6 w-6 mr-2" />
            Try Again
          </>
        ) : (
          <>
            <Trophy className="h-6 w-6 mr-2" />
            Start Demo Quiz (5 Questions)
          </>
        )}
      </Button>
    </div>
  );
};
