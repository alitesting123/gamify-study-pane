// src/pages/Index.tsx
// Main dashboard page showing game library with game templates

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GameCard } from "@/components/GameCard";
import { GameDetailView } from "@/components/GameDetailView";
import { GamePlayView } from "@/components/GamePlayView";
import { StartPlayingDialog } from "@/components/StartPlayingDialog";
import { MyStats } from "@/components/MyStats";
import { Settings } from "@/components/Settings";
import { Subscription } from "@/components/Subscription";
import { QuestionDemo } from "@/components/QuestionDemo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Rocket } from "lucide-react";
import { GameTemplate } from "@/types/game";
import { config } from "@/config/env";

// Pre-defined game templates
// These are existing game structures that can have questions added from study materials
const gameTemplates: GameTemplate[] = [
  {
    id: 1,
    title: "Sky Pilot Adventure",
    description: "Fly through the skies, avoid obstacles, and answer questions when you hit birds!",
    category: "Action",
    categoryType: "action",
    difficulty: "Medium",
    estimatedTime: "15-20 min",
    completionRate: 85,
    gameType: 'plane'
  },
  {
    id: 2,
    title: "Deep Sea Fishing",
    description: "Cast your line, catch fish, and answer questions for bonus time!",
    category: "Memory",
    categoryType: "memory",
    difficulty: "Easy",
    estimatedTime: "10-15 min",
    completionRate: 92,
    gameType: 'fishing'
  },
  {
    id: 3,
    title: "Circuit Runner",
    description: "Navigate through electric circuits, dodge obstacles at high speed!",
    category: "Quick Think",
    categoryType: "quick-think",
    difficulty: "Hard",
    estimatedTime: "10-15 min",
    completionRate: 75,
    gameType: 'circuit'
  },
];

const Index = () => {
  const [currentView, setCurrentView] = useState<string>("library");
  const [startPlayingDialogOpen, setStartPlayingDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle navigation to game detail view
  const handleNavigateToGameDetail = (gameId: string) => {
    setCurrentView("game-detail");
  };

  const filteredTemplates = gameTemplates.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    // Game Play View
    if (currentView === "game-play") {
      return <GamePlayView onBack={() => setCurrentView("game-detail")} />;
    }

    // Game Detail View
    if (currentView === "game-detail") {
      return (
        <GameDetailView
          onBack={() => setCurrentView("library")}
          onPlay={() => setCurrentView("game-play")}
        />
      );
    }

    // My Stats View
    if (currentView === "stats") {
      return <MyStats />;
    }

    // Question Demo View
    if (currentView === "question-demo") {
      return <QuestionDemo />;
    }

    // Settings View
    if (currentView === "settings") {
      return <Settings />;
    }

    // Subscription View
    if (currentView === "subscription") {
      return <Subscription />;
    }

    // My Notes View - Full page layout with tree and editor
    if (currentView === "notes") {
      return null; // Notes view is handled in DashboardLayout
    }

    // Default: Library View
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        {/* Simplified Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Game Library</h1>
              <p className="text-muted-foreground mt-1">
                Transform your study materials into engaging games
              </p>
            </div>
            {config.enableGameCreation && (
              <Button
                onClick={() => setStartPlayingDialogOpen(true)}
                size="lg"
                className="h-10"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Start Playing
              </Button>
            )}
          </div>

          {/* Clean Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Games Organized by Category */}
        <div className="space-y-10">
          {/* Action Games */}
          {filteredTemplates.filter(g => g.categoryType === 'action').length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-l-4 border-orange-500 pl-4">
                <h2 className="text-xl font-semibold">Action Games</h2>
                <span className="text-sm text-muted-foreground">
                  ({filteredTemplates.filter(g => g.categoryType === 'action').length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates
                  .filter(g => g.categoryType === 'action')
                  .map((game) => (
                    <GameCard
                      key={game.id}
                      title={game.title}
                      description={game.description}
                      category={game.category}
                      categoryType={game.categoryType}
                      difficulty={game.difficulty}
                      estimatedTime={game.estimatedTime}
                      completionRate={game.completionRate}
                      gameType={game.gameType}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Memory Games */}
          {filteredTemplates.filter(g => g.categoryType === 'memory').length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-l-4 border-purple-500 pl-4">
                <h2 className="text-xl font-semibold">Memory Games</h2>
                <span className="text-sm text-muted-foreground">
                  ({filteredTemplates.filter(g => g.categoryType === 'memory').length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates
                  .filter(g => g.categoryType === 'memory')
                  .map((game) => (
                    <GameCard
                      key={game.id}
                      title={game.title}
                      description={game.description}
                      category={game.category}
                      categoryType={game.categoryType}
                      difficulty={game.difficulty}
                      estimatedTime={game.estimatedTime}
                      completionRate={game.completionRate}
                      gameType={game.gameType}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Quick Think Games */}
          {filteredTemplates.filter(g => g.categoryType === 'quick-think').length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-l-4 border-cyan-500 pl-4">
                <h2 className="text-xl font-semibold">Quick Think Games</h2>
                <span className="text-sm text-muted-foreground">
                  ({filteredTemplates.filter(g => g.categoryType === 'quick-think').length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates
                  .filter(g => g.categoryType === 'quick-think')
                  .map((game) => (
                    <GameCard
                      key={game.id}
                      title={game.title}
                      description={game.description}
                      category={game.category}
                      categoryType={game.categoryType}
                      difficulty={game.difficulty}
                      estimatedTime={game.estimatedTime}
                      completionRate={game.completionRate}
                      gameType={game.gameType}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Puzzle Games */}
          {filteredTemplates.filter(g => g.categoryType === 'puzzle').length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-l-4 border-green-500 pl-4">
                <h2 className="text-xl font-semibold">Puzzle Games</h2>
                <span className="text-sm text-muted-foreground">
                  ({filteredTemplates.filter(g => g.categoryType === 'puzzle').length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates
                  .filter(g => g.categoryType === 'puzzle')
                  .map((game) => (
                    <GameCard
                      key={game.id}
                      title={game.title}
                      description={game.description}
                      category={game.category}
                      categoryType={game.categoryType}
                      difficulty={game.difficulty}
                      estimatedTime={game.estimatedTime}
                      completionRate={game.completionRate}
                      gameType={game.gameType}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Learning Games */}
          {filteredTemplates.filter(g => g.categoryType === 'learning').length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-l-4 border-indigo-500 pl-4">
                <h2 className="text-xl font-semibold">Learning Games</h2>
                <span className="text-sm text-muted-foreground">
                  ({filteredTemplates.filter(g => g.categoryType === 'learning').length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates
                  .filter(g => g.categoryType === 'learning')
                  .map((game) => (
                    <GameCard
                      key={game.id}
                      title={game.title}
                      description={game.description}
                      category={game.category}
                      categoryType={game.categoryType}
                      difficulty={game.difficulty}
                      estimatedTime={game.estimatedTime}
                      completionRate={game.completionRate}
                      gameType={game.gameType}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border rounded-lg">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No games found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}

      {/* Start Playing Dialog - Unified dialog with two flows */}
      <StartPlayingDialog
        open={startPlayingDialogOpen}
        onOpenChange={setStartPlayingDialogOpen}
        gameTemplates={gameTemplates}
        onNavigateToGameDetail={handleNavigateToGameDetail}
      />
    </DashboardLayout>
  );
};

export default Index;