// src/components/CreateNewGameDialog.tsx
// ✅ FLOW 1: Create brand NEW complete game from scratch
// This creates an entirely new game that will appear in the game browse page

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, Lightbulb, AlertCircle, Rocket, GamepadIcon } from "lucide-react";
import { toast } from "sonner";
import { gameService } from "@/services/gameService";
import { useGameContext } from "@/contexts/GameContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface CreateNewGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateNewGameDialog = ({
  open,
  onOpenChange,
}: CreateNewGameDialogProps) => {
  const { addUserGame, syncWithBackend } = useGameContext();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [gameType, setGameType] = useState<'plane' | 'fishing' | 'circuit' | 'quiz'>('plane');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ✅ FLOW 1: Handle creating a brand new complete game
   * This creates a full game experience that appears in the browse page
   */
  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a game title");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please describe the game you want to create");
      return;
    }

    if (prompt.length < 20) {
      toast.error("Please provide more details about your game");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      console.log('🎮 FLOW 1: Creating brand NEW complete game from scratch');
      console.log('📋 Game Details:', { title, prompt, gameType, difficulty });
      
      // ✅ API CALL: Create brand new complete game
      // Backend should: 
      // 1. Generate game concept and mechanics from prompt
      // 2. Create game structure with levels/challenges
      // 3. Generate questions/content
      // 4. Return complete playable game
      const response = await gameService.createNewGame({
        title,
        prompt,
        gameType,
        category: extractCategory(prompt),
        difficulty,
      });

      const newGame = response.data;
      console.log('✅ New complete game created:', newGame);

      // ✅ Add to user's game library (this makes it appear in browse page)
      const userGame = {
        id: newGame.id,
        templateId: 0, // 0 indicates this is a custom created game, not from template
        title: newGame.title || title,
        description: newGame.description || prompt.substring(0, 100),
        category: newGame.category || extractCategory(prompt),
        difficulty: (newGame.difficulty || difficulty) as 'Easy' | 'Medium' | 'Hard',
        questionsCount: newGame.questionsCount || 20,
        maxPoints: (newGame.questionsCount || 20) * 10,
        currentProgress: 0,
        createdAt: new Date().toISOString(),
        gameType: newGame.gameType as 'plane' | 'fishing' | 'circuit' | 'quiz',
      };

      addUserGame(userGame);
      
      // Sync with backend
      await syncWithBackend();

      toast.success(`${getGameTypeLabel(newGame.gameType)} created successfully!`, {
        description: `"${userGame.title}" has been added to your game library`,
        action: {
          label: "Play Now",
          onClick: () => {
            onOpenChange(false);
            // Navigate to the game
            navigate(`/game/${newGame.id}`);
          },
        },
      });

      // Reset form and close dialog
      onOpenChange(false);
      resetForm();
      
    } catch (error: any) {
      console.error('❌ Failed to create game:', error);
      
      const errorMessage = error.message || "Failed to create game";
      setError(errorMessage);
      
      toast.error("Failed to create game", {
        description: errorMessage,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setPrompt("");
    setGameType('plane');
    setDifficulty('Medium');
    setError(null);
  };

  const examplePrompts = {
    plane: "Create a plane game where you fly through clouds collecting math equations. Solve equations to gain altitude and avoid obstacles.",
    fishing: "Create a fishing game where you catch fish with vocabulary words. Match the word to its definition to reel in the fish.",
    circuit: "Create a circuit game where you connect logic gates to solve programming puzzles. Complete circuits to power up systems.",
    quiz: "Create an interactive quiz game about world history with timed questions and power-ups for streak bonuses.",
  };

  const gameTypeOptions = [
    { 
      value: 'plane', 
      label: '✈️ Plane Game', 
      description: 'Flying adventure with learning challenges',
      example: 'Fly and collect concepts while avoiding obstacles'
    },
    { 
      value: 'fishing', 
      label: '🎣 Fishing Game', 
      description: 'Catch and match learning concepts',
      example: 'Catch fish by matching questions to answers'
    },
    { 
      value: 'circuit', 
      label: '⚡ Circuit Game', 
      description: 'Connect concepts and solve puzzles',
      example: 'Build circuits by connecting related concepts'
    },
    { 
      value: 'quiz', 
      label: '📝 Quiz Game', 
      description: 'Traditional Q&A with gamification',
      example: 'Answer questions to earn points and power-ups'
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open && !isCreating) {
        resetForm();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Rocket className="h-6 w-6 text-primary" />
            Create Brand New Game
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <p>Create a completely new game from scratch that will appear in your game library.</p>
            <p className="text-xs text-muted-foreground">
              💡 <strong>Flow 1:</strong> This creates a full game experience with custom mechanics and content.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Game Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">
              Game Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Math Adventure, Vocabulary Quest, History Challenge"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              disabled={isCreating}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Give your game a catchy, memorable title
            </p>
          </div>

          {/* Game Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="gameType" className="text-base font-semibold">
              Game Type *
            </Label>
            <Select
              value={gameType}
              onValueChange={(value: any) => setGameType(value)}
              disabled={isCreating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select game type" />
              </SelectTrigger>
              <SelectContent>
                {gameTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col py-1">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {gameTypeOptions.find(o => o.value === gameType)?.example}
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-base font-semibold">
              Difficulty Level
            </Label>
            <Select
              value={difficulty}
              onValueChange={(value: any) => setDifficulty(value)}
              disabled={isCreating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">
                  <div className="flex flex-col">
                    <span className="font-medium">🟢 Easy</span>
                    <span className="text-xs text-muted-foreground">Perfect for beginners</span>
                  </div>
                </SelectItem>
                <SelectItem value="Medium">
                  <div className="flex flex-col">
                    <span className="font-medium">🟡 Medium</span>
                    <span className="text-xs text-muted-foreground">Balanced challenge</span>
                  </div>
                </SelectItem>
                <SelectItem value="Hard">
                  <div className="flex flex-col">
                    <span className="font-medium">🔴 Hard</span>
                    <span className="text-xs text-muted-foreground">Advanced players</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-base font-semibold">
              Describe Your Game *
            </Label>
            <Textarea
              id="prompt"
              placeholder={examplePrompts[gameType]}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError(null);
              }}
              className="min-h-[150px] resize-none"
              disabled={isCreating}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {prompt.length} / 500 characters
            </p>
          </div>

          {/* Example Prompt Button */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-warning" />
              Example for {getGameTypeLabel(gameType)}
            </Label>
            <button
              onClick={() => setPrompt(examplePrompts[gameType])}
              disabled={isCreating}
              className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              "{examplePrompts[gameType]}"
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-900">
              <GamepadIcon className="h-4 w-4 text-blue-700" />
              What happens when you create a game?
            </h4>
            <ul className="text-xs text-blue-700 space-y-1 ml-6 list-disc">
              <li>AI generates a complete game with custom mechanics</li>
              <li>Educational content is created based on your description</li>
              <li>Game appears in your library and browse page</li>
              <li>Ready to play immediately with 20+ questions</li>
              <li>Can be shared with other users (coming soon)</li>
            </ul>
          </div>

          {/* Flow Distinction Badge */}
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <div className="text-sm">
              <p className="font-semibold text-purple-900">Creating a Complete Game</p>
              <p className="text-xs text-purple-700">
                This is different from "Start Playing" which adds questions to existing templates
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              if (!isCreating) {
                onOpenChange(false);
                resetForm();
              }
            }}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!title.trim() || !prompt.trim() || prompt.length < 20 || isCreating}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Game...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Create Complete Game
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper functions
function extractCategory(prompt: string): string {
  const categories = {
    'physics': 'Physics',
    'biology': 'Biology',
    'chemistry': 'Chemistry',
    'math': 'Mathematics',
    'history': 'History',
    'geography': 'Geography',
    'literature': 'Literature',
    'programming': 'Programming',
    'language': 'Language',
    'science': 'Science',
    'technology': 'Technology',
  };

  const lowerPrompt = prompt.toLowerCase();
  for (const [key, value] of Object.entries(categories)) {
    if (lowerPrompt.includes(key)) {
      return value;
    }
  }
  
  return 'General';
}

function getGameTypeLabel(gameType: string): string {
  const labels = {
    plane: 'Plane Game',
    fishing: 'Fishing Game',
    circuit: 'Circuit Game',
    quiz: 'Quiz Game',
  };
  return labels[gameType] || 'Game';
}