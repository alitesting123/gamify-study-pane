// src/pages/Index.tsx
// Main dashboard page showing game library with game templates

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GameCard } from "@/components/GameCard";
import { GameDetailView } from "@/components/GameDetailView";
import { GamePlayView } from "@/components/GamePlayView";
import { StartPlayingDialog } from "@/components/StartPlayingDialog";
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

    // My Notes View - Full page layout with tree and editor
    if (currentView === "notes") {
      return null; // Notes view is handled in DashboardLayout
    }

    // Default: Library View
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-8 border-2 border-primary/30 shadow-2xl">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome back, Student!
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Transform your study materials into engaging games
                </p>
              </div>
            </div>

            {/* Search and Create Button */}
            <div className="flex gap-3 mt-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  className="pl-12 h-12 text-base border-2 bg-background/50 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {config.enableGameCreation && (
                <Button
                  onClick={() => setStartPlayingDialogOpen(true)}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 shadow-glow h-12 px-6 text-base font-semibold"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Start Playing
                </Button>
              )}
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl -z-0" />
        </div>

        {/* Game Templates Section */}
        <div className="w-full space-y-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Available Game Templates</h2>
                  {config.enableGameCreation && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Click "Start Playing" above to begin your learning adventure
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((game) => (
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

            {filteredTemplates.length === 0 && (
              <div className="text-center py-16 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/30">
                <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No games found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search terms or create a new game
                </p>
              </div>
            )}
          </div>
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