// src/pages/Index.tsx
// Main dashboard page showing game library with two distinct flows:
// FLOW 1: Create brand new complete games (Create with AI button)
// FLOW 2: Generate questions for existing templates (Start Playing button on cards)

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GameCard } from "@/components/GameCard";
import { GameDetailView } from "@/components/GameDetailView";
import { GamePlayView } from "@/components/GamePlayView";
import { UploadStudyMaterialDialog } from "@/components/UploadStudyMaterialDialog";
import { CreateNewGameDialog } from "@/components/CreateNewGameDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Sparkles, Library, Rocket, Play } from "lucide-react";
import { GameTemplate } from "@/types/game";
import { useGameContext } from "@/contexts/GameContext";
import { Card } from "@/components/ui/card";

// ✅ Pre-defined game templates for FLOW 2 (Start Playing)
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
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createGameDialogOpen, setCreateGameDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { userGames } = useGameContext();

  // ✅ FLOW 2: Handle clicking "Start Playing" on a template card
  // Opens dialog to upload study materials and generate questions
  const handleTemplateClick = (template: GameTemplate) => {
    setSelectedTemplate(template);
    setUploadDialogOpen(true);
  };

  const filteredTemplates = gameTemplates.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter user-created games (templateId === 0 means created via FLOW 1)
  const createdGames = userGames.filter(game => game.templateId === 0);
  
  // Filter game instances (templateId > 0 means created via FLOW 2)
  const gameInstances = userGames.filter(game => game.templateId > 0);

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
              onClick={() => setCreateGameDialogOpen(true)}
              className="bg-gradient-primary hover:opacity-90 shadow-glow"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Create New Game
            </Button>
          </div>

          {/* Flow Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Rocket className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-1">Flow 1: Create New Game</h3>
                  <p className="text-sm text-purple-700 mb-2">
                    Click "Create New Game" to build a complete custom game from scratch with AI
                  </p>
                  <ul className="text-xs text-purple-600 space-y-1 list-disc ml-4">
                    <li>Describe your game idea</li>
                    <li>AI generates complete game</li>
                    <li>Appears in "My Created Games"</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Play className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">Flow 2: Start Playing Templates</h3>
                  <p className="text-sm text-green-700 mb-2">
                    Click "Start Playing" on templates below to generate questions from your notes
                  </p>
                  <ul className="text-xs text-green-600 space-y-1 list-disc ml-4">
                    <li>Upload study materials</li>
                    <li>RAG generates questions</li>
                    <li>Ready to play instantly</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs for different game sections */}
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              Game Templates
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {filteredTemplates.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="created" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              My Created Games
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {createdGames.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="instances" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              My Game Instances
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {gameInstances.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab - FLOW 2 */}
          <TabsContent value="templates" className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Game Templates</h2>
                <span className="text-sm text-muted-foreground">
                  - Click "Start Playing" to generate questions from your notes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((game) => (
                  <GameCard
                    key={game.id}
                    {...game}
                    onClick={() => handleTemplateClick(game)}
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
          </TabsContent>

          {/* My Created Games Tab - FLOW 1 Results */}
          <TabsContent value="created" className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-semibold">My Created Games</h2>
                <span className="text-sm text-muted-foreground">
                  - Complete games you created with AI
                </span>
              </div>

              {createdGames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdGames.map((game) => (
                    <GameCard
                      key={game.id}
                      id={game.id}
                      title={game.title}
                      description={game.description}
                      category={game.category}
                      difficulty={game.difficulty}
                      estimatedTime={`${game.questionsCount} questions`}
                      completionRate={game.currentProgress}
                      gameType={game.gameType}
                      onClick={() => {
                        // Handle clicking on created game
                        console.log('Playing created game:', game.id);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                    <Rocket className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No games created yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first complete game using AI
                    </p>
                    <Button
                      onClick={() => setCreateGameDialogOpen(true)}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Create Your First Game
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* My Game Instances Tab - FLOW 2 Results */}
          <TabsContent value="instances" className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">My Game Instances</h2>
                <span className="text-sm text-muted-foreground">
                  - Templates with your custom questions
                </span>
              </div>

              {gameInstances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gameInstances.map((game) => (
                    <GameCard
                      key={game.id}
                      id={game.id}
                      title={game.title}
                      description={game.description}
                      category={game.category}
                      difficulty={game.difficulty}
                      estimatedTime={`${game.questionsCount} questions`}
                      completionRate={game.currentProgress}
                      gameType={game.gameType}
                      onClick={() => {
                        // Handle clicking on game instance
                        console.log('Playing game instance:', game.id);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <Play className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No game instances yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start playing a template by uploading your study materials
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click "Start Playing" on any template above
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <DashboardLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}

      {/* FLOW 2: Upload Study Material Dialog */}
      {selectedTemplate && (
        <UploadStudyMaterialDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          gameTemplate={selectedTemplate}
        />
      )}

      {/* FLOW 1: Create New Game Dialog */}
      <CreateNewGameDialog
        open={createGameDialogOpen}
        onOpenChange={setCreateGameDialogOpen}
      />
    </DashboardLayout>
  );
};

export default Index;