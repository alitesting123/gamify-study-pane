// src/components/CreateNewGameDialog.tsx
// ✅ FEATURE 1: Create brand NEW game (plane, fishing, circuit, quiz)
// This creates an entirely new game experience, not just questions

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, Lightbulb, AlertCircle, Rocket } from "lucide-react";
import { toast } from "sonner";
import { gameService } from "@/services/gameService";
import { useGameContext } from "@/contexts/GameContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateNewGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateNewGameDialog = ({
  open,
  onOpenChange,
}: CreateNewGameDialogProps) => {
  const { addUserGame } = useGameContext();
  const [prompt, setPrompt] = useState("");
  const [gameType, setGameType] = useState<'plane' | 'fishing' | 'circuit' | 'quiz'>('plane');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle creating a brand new game
   */
  const handleCreate = async () => {
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
      console.log('🎮 Creating brand NEW game:', { prompt, gameType });
      
      // ✅ API CALL: Create brand new game
      const response = await gameService.createNewGame({
        prompt,
        gameType,
        category: extractCategory(prompt),
        difficulty: 'Medium',
      });

      const newGame = response.data;
      console.log('✅ New game created:', newGame);

      // Add to user's library
      addUserGame({
        id: newGame.id,
        templateId: 0,
        title: newGame.title,
        description: newGame.description,
        category: newGame.category || 'General',
        difficulty: (newGame.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
        questionsCount: 0,
        maxPoints: 0,
        currentProgress: 0,
        gameType: newGame.gameType as 'plane' | 'fishing' | 'circuit' | 'quiz',
      });

      toast.success(`${getGameTypeLabel(newGame.gameType)} created!`, {
        description: `"${newGame.title}" is ready to play`,
      });

      onOpenChange(false);
      setPrompt("");
      setGameType('plane');
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Rocket className="h-6 w-6 text-primary" />
            Create Brand New AI Game
          </DialogTitle>
          <DialogDescription>
            Describe the game you want to create. AI will generate a completely new game experience with custom mechanics and challenges.
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

          {/* Game Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="gameType" className="text-base font-semibold">
              Game Type
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

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-base font-semibold">
              Describe Your Game
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
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              How AI Creates Your Game
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
              <li>AI analyzes your game description</li>
              <li>Generates custom game mechanics and challenges</li>
              <li>Creates levels, obstacles, and rewards</li>
              <li>Embeds learning concepts into gameplay</li>
              <li>Game appears in your library ready to play</li>
            </ul>
          </div>

          {/* Processing Info */}
          {isCreating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating your game...
              </div>
              <p className="text-xs text-blue-600 mt-1">
                AI is designing game mechanics and generating content
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!prompt.trim() || prompt.length < 20 || isCreating}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Create Game
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