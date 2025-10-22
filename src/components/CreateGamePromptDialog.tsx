// src/components/CreateGamePromptDialog.tsx
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
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface CreateGamePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGamePromptDialog = ({
  open,
  onOpenChange,
}: CreateGamePromptDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success("Game created successfully!", {
        description: "Your game has been generated from the prompt.",
      });

      // Reset and close
      setPrompt("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to generate game", {
        description: "Please try again later."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    "Create a quiz about World War 2 history",
    "Generate questions on Python programming basics",
    "Make a game about the solar system for kids",
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Create Game with AI
          </DialogTitle>
          <DialogDescription>
            Describe what kind of game you want to create, and our AI will generate it for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-base font-semibold">
              Your Prompt
            </Label>
            <Textarea
              id="prompt"
              placeholder="E.g., Create a quiz game about biology covering cell structure, photosynthesis, and genetics with 20 questions..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[150px] resize-none"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              {prompt.length} / 500 characters
            </p>
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-warning" />
              Example Prompts
            </Label>
            <div className="space-y-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  disabled={isGenerating}
                  className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              How it works
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
              <li>AI analyzes your prompt and extracts key topics</li>
              <li>Generates relevant questions based on your description</li>
              <li>Creates a customized game tailored to your needs</li>
              <li>Game appears in your library ready to play</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Game
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};