// src/pages/Index.tsx
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GameCard } from "@/components/GameCard";
import { GameDetailView } from "@/components/GameDetailView";
import { GamePlayView } from "@/components/GamePlayView";
import { UploadNotesDialog } from "@/components/UploadNotesDialog";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp } from "lucide-react";
import { GameTemplate } from "@/types/game";

// Add this to your existing gameTemplates array in src/pages/Index.tsx

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
    gameType: 'circuit'  // NEW
  },
  // ... rest of templates
];
const Index = () => {
  const [currentView, setCurrentView] = useState<string>("library");
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleGameClick = (template: GameTemplate) => {
    setSelectedTemplate(template);
    setUploadDialogOpen(true);
  };

  const filteredGames = gameTemplates.filter((game) =>
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

    // My Notes View
    if (currentView === "notes") {
      return (
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-2">My Notes</h2>
          <p className="text-muted-foreground">This feature is coming soon!</p>
        </div>
      );
    }

    // Default: Library View
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, Student!</h1>
          <p className="text-muted-foreground">
            Transform your study materials into engaging games
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search game templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Game Templates</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                {...game}
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No games found matching your search
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}

      <UploadNotesDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        gameTemplate={selectedTemplate}
      />
    </DashboardLayout>
  );
};

export default Index;