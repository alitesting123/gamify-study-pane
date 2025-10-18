import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useGameContext } from "@/contexts/GameContext";
import { GameTemplate } from "@/types/game";

interface UploadNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameTemplate: GameTemplate | null;
}

export const UploadNotesDialog = ({
  open,
  onOpenChange,
  gameTemplate,
}: UploadNotesDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const { addUserGame } = useGameContext();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file || !gameTemplate) {
      toast.error("Please select a file to upload");
      return;
    }

    // Create a new user game
    const questionsCount = Math.floor(Math.random() * 10) + 15; // 15-25 questions
    const maxPoints = questionsCount * 10;

    addUserGame({
      templateId: gameTemplate.id,
      title: gameTemplate.title,
      description: gameTemplate.description,
      category: gameTemplate.category,
      difficulty: gameTemplate.difficulty,
      questionsCount,
      maxPoints,
      currentProgress: 0,
    });

    toast.success("Notes uploaded successfully! Processing...", {
      description: "Your game is now ready to play! Check 'My Games' in the sidebar.",
    });
    
    onOpenChange(false);
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Upload Study Notes
          </DialogTitle>
          <DialogDescription>
            Upload your study materials for <span className="font-semibold text-foreground">{gameTemplate?.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Study Notes</Label>
            <div className="flex flex-col gap-3">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Input
                  id="notes"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="notes" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <FileText className="h-8 w-8" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, TXT, or MD (max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              What happens next?
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6">
              <li>• Your notes will be analyzed by our AI</li>
              <li>• Key concepts will be extracted</li>
              <li>• Game questions will be generated</li>
              <li>• You'll be ready to play in minutes!</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-gradient-primary hover:opacity-90" 
            onClick={handleUpload}
            disabled={!file}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload & Process
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
