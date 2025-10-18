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
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Sparkles, Loader2, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useGameContext } from "@/contexts/GameContext";
import { GameTemplate } from "@/types/game";
import { validateFile } from "@/lib/fileValidation";
import { useProcessNotes } from "@/hooks/useGames";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const { addUserGame } = useGameContext();
  
  // Use the mutation hook - comment this out if not using backend yet
  // const processNotes = useProcessNotes();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validation = validateFile(selectedFile);
      
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validation = validateFile(droppedFile);
      
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      
      setFile(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!file || !gameTemplate) {
      toast.error("Please select a file to upload");
      return;
    }

    // FOR PRODUCTION: Use this when backend is ready
    /*
    try {
      const result = await processNotes.mutateAsync({
        request: {
          file,
          templateId: gameTemplate.id,
        },
        onProgress: setUploadProgress,
      });

      // Add the game with data from backend
      addUserGame({
        templateId: gameTemplate.id,
        title: gameTemplate.title,
        description: gameTemplate.description,
        category: gameTemplate.category,
        difficulty: gameTemplate.difficulty,
        questionsCount: result.data.questionsGenerated,
        maxPoints: result.data.questionsGenerated * 10,
        currentProgress: 0,
      });

      toast.success("Game created successfully!", {
        description: "Check 'My Games' in the sidebar to play.",
      });
      
      onOpenChange(false);
      setFile(null);
      setUploadProgress(0);
    } catch (error) {
      // Error is handled by the mutation
    }
    */

    // FOR DEVELOPMENT: Simulate file processing
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

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

      toast.success("Game created successfully!", {
        description: "Check 'My Games' in the sidebar to play.",
      });
      
      onOpenChange(false);
      setFile(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error("Failed to process file", {
        description: "Please try again later."
      });
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (uploadProgress > 0 && uploadProgress < 100) {
      toast.error("Cannot close while processing");
      return;
    }
    onOpenChange(false);
    setFile(null);
    setUploadProgress(0);
  };

  const isProcessing = uploadProgress > 0 && uploadProgress < 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Upload Study Notes
          </DialogTitle>
          <DialogDescription>
            Upload your study materials for{" "}
            <span className="font-semibold text-foreground">
              {gameTemplate?.title}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label htmlFor="notes">Study Notes</Label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary"
              } ${isProcessing ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Input
                id="notes"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />
              
              {file ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  {!isProcessing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <label htmlFor="notes" className="cursor-pointer block">
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-primary">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, DOCX, TXT, or MD (max 10MB)
                      </p>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isProcessing && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing your notes...
                </span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Success Indicator */}
          {uploadProgress === 100 && (
            <div className="flex items-center gap-2 text-success animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Processing complete!</span>
            </div>
          )}

          {/* Info Box */}
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-gradient-primary hover:opacity-90" 
            onClick={handleUpload}
            disabled={!file || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Process
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};