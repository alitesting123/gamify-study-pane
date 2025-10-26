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

// Pre-defined game templates
// These are existing game structures that can have questions added from study materials
const gameTemplates: GameTemplate[] = [
  {
    id: 1,
    title: "Sky Pilot Adventure",
    description: "Fly through the skies, avoid obstacles, and answer questions when you hit birds!",
    category: "Action",
    difficulty: "Medium",
    estimatedTime: "15-20 min",
    completionRate: 85,
    gameType: 'plane'
  },
  {
    id: 2,
    title: "Deep Sea Fishing",
    description: "Cast your line, catch fish, and answer questions for bonus time!",
    category: "Casual",
    difficulty: "Easy",
    estimatedTime: "10-15 min",
    completionRate: 92,
    gameType: 'fishing'
  },
  {
    id: 3,
    title: "Circuit Runner",
    description: "Navigate through electric circuits, dodge obstacles at high speed!",
    category: "Action",
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
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Student!</h1>
            <p className="text-muted-foreground">
              Transform your study materials into engaging games
            </p>
          </div>

          {/* Search and Create Button */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setStartPlayingDialogOpen(true)}
              className="bg-gradient-primary hover:opacity-90 shadow-glow"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Start Playing
            </Button>
          </div>

        </div>

        {/* Game Templates Section */}
        <div className="w-full space-y-4">

          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Available Game Templates</h2>
              <span className="text-sm text-muted-foreground">
                - Click "Start Playing" above to begin
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((game) => (
                <GameCard
                  key={game.id}
                  {...game}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No templates found matching your search
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