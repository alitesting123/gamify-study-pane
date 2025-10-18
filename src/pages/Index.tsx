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

const gameTemplates: GameTemplate[] = [
  {
    id: 1,
    title: "Math Quiz Challenge",
    description: "Test your math skills with dynamic problem-solving challenges",
    category: "Mathematics",
    difficulty: "Medium",
    estimatedTime: "15-20 min",
    completionRate: 85,
  },
  {
    id: 2,
    title: "Vocabulary Builder",
    description: "Expand your vocabulary through interactive word games",
    category: "Language",
    difficulty: "Easy",
    estimatedTime: "10-15 min",
    completionRate: 92,
  },
  {
    id: 3,
    title: "History Timeline",
    description: "Place historical events in the correct chronological order",
    category: "History",
    difficulty: "Hard",
    estimatedTime: "20-25 min",
  },
  {
    id: 4,
    title: "Science Lab",
    description: "Conduct virtual experiments and learn scientific principles",
    category: "Science",
    difficulty: "Medium",
    estimatedTime: "15-20 min",
  },
  {
    id: 5,
    title: "Geography Explorer",
    description: "Discover countries, capitals, and geographical features",
    category: "Geography",
    difficulty: "Easy",
    estimatedTime: "10-15 min",
    completionRate: 78,
  },
  {
    id: 6,
    title: "Logic Puzzles",
    description: "Sharpen your critical thinking with challenging logic problems",
    category: "Logic",
    difficulty: "Hard",
    estimatedTime: "20-30 min",
  },
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