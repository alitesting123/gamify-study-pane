// src/components/MyStats.tsx
import { useGameContext } from "@/contexts/GameContext";
import { Card } from "@/components/ui/card";
import { Trophy, Target, TrendingUp, TrendingDown, AlertCircle, BookOpen, Award, XCircle, CheckCircle, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { WeakArea, QuestionAttempt } from "@/types/game";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface SubjectStats {
  subject: string;
  attempts: number;
  averageAccuracy: number;
  bestAccuracy: number;
  lastAccuracy: number;
  questionsAttempted: number;
  questionsCorrect: number;
  trend: 'improving' | 'stable' | 'declining';
  lastPlayed?: string;
  weakAreas: WeakArea[];
}

export const MyStats = () => {
  const { userGames, userProgress } = useGameContext();

  // Calculate stats by subject with weak area analysis
  const statsBySubject = userGames.reduce((acc, game) => {
    const subject = game.subject || "Unknown Subject";
    const accuracy = game.accuracy ?? game.currentProgress ?? 0;

    if (!acc[subject]) {
      acc[subject] = {
        attempts: [],
        questionsAttempted: 0,
        questionsCorrect: 0,
        lastPlayed: game.playedAt || game.createdAt,
        allQuestionAttempts: [],
      };
    }

    acc[subject].attempts.push({
      accuracy,
      date: game.playedAt || game.createdAt,
    });
    acc[subject].questionsAttempted += game.questionsCount || 0;
    acc[subject].questionsCorrect += game.questionsCorrect || Math.round((accuracy / 100) * (game.questionsCount || 0));

    // Collect all question attempts for weak area analysis
    if (game.questionAttempts) {
      acc[subject].allQuestionAttempts.push(...game.questionAttempts);
    }

    if (game.playedAt && (!acc[subject].lastPlayed || game.playedAt > acc[subject].lastPlayed)) {
      acc[subject].lastPlayed = game.playedAt;
    }

    return acc;
  }, {} as Record<string, {
    attempts: { accuracy: number; date: string }[];
    questionsAttempted: number;
    questionsCorrect: number;
    lastPlayed?: string;
    allQuestionAttempts: QuestionAttempt[];
  }>);

  // Calculate subject statistics with weak areas
  const subjectStats: SubjectStats[] = Object.entries(statsBySubject).map(([subject, data]) => {
    const sortedAttempts = data.attempts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const accuracies = sortedAttempts.map(a => a.accuracy);
    const averageAccuracy = Math.round(accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length);
    const bestAccuracy = Math.max(...accuracies);
    const lastAccuracy = accuracies[accuracies.length - 1];

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (accuracies.length >= 2) {
      const recent = accuracies.slice(-3);
      const earlier = accuracies.slice(0, Math.max(1, accuracies.length - 3));
      const recentAvg = recent.reduce((sum, acc) => sum + acc, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, acc) => sum + acc, 0) / earlier.length;

      if (recentAvg > earlierAvg + 5) trend = 'improving';
      else if (recentAvg < earlierAvg - 5) trend = 'declining';
    }

    // Analyze weak areas by grouping questions by topic
    const weakAreasByTopic = data.allQuestionAttempts.reduce((acc, attempt) => {
      if (!acc[attempt.topic]) {
        acc[attempt.topic] = {
          topic: attempt.topic,
          totalQuestions: 0,
          correctAnswers: 0,
          accuracy: 0,
          mistakes: [],
        };
      }

      acc[attempt.topic].totalQuestions += 1;
      if (attempt.isCorrect) {
        acc[attempt.topic].correctAnswers += 1;
      } else {
        acc[attempt.topic].mistakes.push(attempt);
      }

      return acc;
    }, {} as Record<string, WeakArea>);

    // Calculate accuracy for each weak area and sort by accuracy (worst first)
    const weakAreas = Object.values(weakAreasByTopic)
      .map(area => ({
        ...area,
        accuracy: Math.round((area.correctAnswers / area.totalQuestions) * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    return {
      subject,
      attempts: accuracies.length,
      averageAccuracy,
      bestAccuracy,
      lastAccuracy,
      questionsAttempted: data.questionsAttempted,
      questionsCorrect: data.questionsCorrect,
      trend,
      lastPlayed: data.lastPlayed,
      weakAreas,
    };
  });

  // Sort by last played (most recent first)
  subjectStats.sort((a, b) => {
    if (!a.lastPlayed) return 1;
    if (!b.lastPlayed) return -1;
    return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
  });

  // Overall stats
  const totalSubjects = subjectStats.length;
  const totalAttempts = userGames.length;
  const overallAccuracy = totalAttempts > 0
    ? Math.round(userGames.reduce((sum, game) => sum + (game.accuracy ?? game.currentProgress ?? 0), 0) / totalAttempts)
    : 0;

  // Subjects needing practice (accuracy < 70%)
  const needsPractice = subjectStats.filter(s => s.averageAccuracy < 70);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Statistics</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning progress by subject
        </p>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subjects Studied</p>
              <p className="text-2xl font-bold">{totalSubjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <Target className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Accuracy</p>
              <p className="text-2xl font-bold">{overallAccuracy}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-secondary/10">
              <Trophy className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
              <p className="text-2xl font-bold">{totalAttempts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <Award className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Level</p>
              <p className="text-2xl font-bold">{userProgress.level}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subjects Needing Practice */}
      {needsPractice.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Subjects Needing Practice</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {needsPractice.map((stat) => (
              <Card key={stat.subject} className="p-4 border-l-4 border-orange-500 hover-lift">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{stat.subject}</h3>
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                      {stat.averageAccuracy}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>Attempts: {stat.attempts}</div>
                    <div>Best: {stat.bestAccuracy}%</div>
                  </div>
                  <Progress value={stat.averageAccuracy} className="h-2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance by Subject with Weak Areas */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Performance by Subject</h2>

        {subjectStats.length > 0 ? (
          <div className="space-y-4">
            {subjectStats.map((stat) => (
              <Card key={stat.subject} className="p-6 hover-lift">
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{stat.subject}</h3>
                        {stat.trend === 'improving' && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Improving
                          </Badge>
                        )}
                        {stat.trend === 'declining' && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Declining
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Attempts</p>
                          <p className="font-semibold">{stat.attempts}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Average</p>
                          <p className="font-semibold">{stat.averageAccuracy}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Best Score</p>
                          <p className="font-semibold">{stat.bestAccuracy}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Score</p>
                          <p className="font-semibold">{stat.lastAccuracy}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Progress: {stat.questionsCorrect} / {stat.questionsAttempted} questions correct
                      </span>
                      <span className="font-semibold">{stat.averageAccuracy}%</span>
                    </div>
                    <Progress value={stat.averageAccuracy} className="h-2" />
                  </div>

                  {/* Weak Areas Section */}
                  {stat.weakAreas.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <h4 className="font-semibold text-sm">Areas to Improve</h4>
                      </div>
                      <div className="space-y-3">
                        {stat.weakAreas.map((weakArea) => (
                          <WeakAreaCard key={weakArea.topic} weakArea={weakArea} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No subjects studied yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start playing games to see your subject performance here
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

// Component to display weak areas with mistakes
const WeakAreaCard = ({ weakArea }: { weakArea: WeakArea }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border rounded-lg p-3 bg-muted/30">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded ${weakArea.accuracy < 50 ? 'bg-red-500/10' : 'bg-orange-500/10'}`}>
                {weakArea.accuracy < 50 ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{weakArea.topic}</p>
                <p className="text-xs text-muted-foreground">
                  {weakArea.correctAnswers}/{weakArea.totalQuestions} correct ({weakArea.accuracy}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={weakArea.accuracy < 50 ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}>
                {weakArea.mistakes.length} {weakArea.mistakes.length === 1 ? 'mistake' : 'mistakes'}
              </Badge>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <div className="space-y-3 pl-10">
            {weakArea.mistakes.map((mistake, idx) => (
              <div key={idx} className="bg-background rounded-lg p-3 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{mistake.questionText}</p>
                  </div>
                </div>

                <div className="pl-6 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-medium text-xs">Your answer:</span>
                    <span className="text-red-500 text-xs">{mistake.userAnswer}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5" />
                    <div>
                      <span className="text-green-500 font-medium text-xs">Correct answer: </span>
                      <span className="text-green-500 text-xs">{mistake.correctAnswer}</span>
                    </div>
                  </div>

                  {mistake.documentReference && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-start gap-2">
                        <FileText className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-medium text-primary">
                            Referenced in: {mistake.documentReference.section}
                          </p>
                          <div className="bg-primary/5 rounded p-2 border-l-2 border-primary">
                            <p className="text-xs text-muted-foreground italic">
                              "{mistake.documentReference.text}"
                            </p>
                          </div>
                          {mistake.documentReference.context && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {mistake.documentReference.context}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
