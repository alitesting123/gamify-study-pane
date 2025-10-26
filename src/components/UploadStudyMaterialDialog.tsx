// src/components/UploadStudyMaterialDialog.tsx
// ✅ FLOW 2: Generate questions from study materials for EXISTING game templates
// This is the "Start Playing" feature - uses RAG to create questions for pre-existing games
// Does NOT create a new browsable game, just adds questions to a template

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Sparkles, Loader2, X, CheckCircle2, AlertCircle, BookOpen, Play } from "lucide-react";
import { toast } from "sonner";
import { useGameContext } from "@/contexts/GameContext";
import { GameTemplate } from "@/types/game";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { gameService } from "@/services/gameService";

interface UploadStudyMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameTemplate: GameTemplate;
}

export const UploadStudyMaterialDialog = ({
  open,
  onOpenChange,
  gameTemplate,
}: UploadStudyMaterialDialogProps) => {
  const { addUserGame, setSelectedGameId, syncWithBackend } = useGameContext();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Safety check: Don't render if no template
  if (!gameTemplate) {
    return null;
  }

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      return { valid: false, error: 'Invalid file type. Please upload PDF, DOC, DOCX, TXT, or MD files' };
    }

    return { valid: true };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validation = validateFile(selectedFile);
      
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
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
      setError(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setGenerationProgress(0);
    setUploadedFileId(null);
    setError(null);
  };

  /**
   * ✅ FLOW 2: Handle uploading file and generating questions for existing template
   * This creates a playable instance with custom questions, NOT a new browsable game
   */
  const handleStartPlaying = async () => {
    if (!file) {
      toast.error("Please select a study material file");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log('📤 FLOW 2: Generating questions from study material for existing template');
      console.log('📋 Template:', gameTemplate.title, '| File:', file.name);

      // ✅ STEP 1: Upload the study material file
      // API CALL: POST /api/study-materials/upload
      const uploadResponse = await gameService.uploadStudyMaterial(
        file,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      const fileId = uploadResponse.data.fileId;
      setUploadedFileId(fileId);
      
      console.log('✅ File uploaded successfully:', fileId);
      toast.info("File uploaded! Generating questions from your notes...");

      setIsUploading(false);
      setIsGenerating(true);

      // ✅ STEP 2: Generate questions using RAG from the study material
      // API CALL: POST /api/games/generate-questions
      // This extracts concepts from the study material and creates relevant questions
      const generateResponse = await gameService.generateQuestionsFromMaterial({
        templateId: gameTemplate.id,
        fileId: fileId,
        gameType: gameTemplate.gameType || 'quiz',
        questionsCount: 20,
        difficulty: gameTemplate.difficulty || 'Medium',
      });

      const gameInstance = generateResponse.data;
      console.log('✅ Started RAG question generation:', gameInstance);

      // ✅ STEP 3: Wait for RAG processing to complete
      // API CALL: GET /api/games/generate-questions/{gameId}/status
      // RAG reads the study material and generates contextual questions
      if (gameInstance.status === 'processing') {
        await gameService.waitForQuestionGeneration(
          gameInstance.id,
          (status) => {
            setGenerationProgress(status.progress);
            console.log(`⏳ RAG processing: ${status.progress}%`);
          }
        );
      }

      setGenerationProgress(100);

      // ✅ STEP 4: Add game instance to user's library
      // This creates a PLAYABLE INSTANCE with custom questions
      // NOT a new browsable game in the library
      const userGame = {
        id: gameInstance.id,
        templateId: gameTemplate.id, // Links to original template
        title: `${gameTemplate.title} - ${file.name.replace(/\.[^/.]+$/, "")}`,
        description: `Generated from ${file.name}`,
        category: gameTemplate.category,
        difficulty: (gameInstance.difficulty || gameTemplate.difficulty) as 'Easy' | 'Medium' | 'Hard',
        questionsCount: gameInstance.questionsCount || 20,
        maxPoints: (gameInstance.questionsCount || 20) * 10,
        currentProgress: 0,
        createdAt: new Date().toISOString(),
        gameType: (gameTemplate.gameType || 'quiz') as 'plane' | 'fishing' | 'circuit' | 'quiz',
      };

      addUserGame(userGame);
      
      // Sync with backend
      await syncWithBackend();

      // Auto-select this game and navigate to it
      setSelectedGameId(gameInstance.id);

      toast.success("Questions generated successfully!", {
        description: `Generated ${gameInstance.questionsCount} questions from your study material. Ready to play!`,
        action: {
          label: "Play Now",
          onClick: () => {
            handleClose();
            // Game will be shown in sidebar
          },
        },
      });

      handleClose();

    } catch (error: any) {
      console.error('❌ Error generating questions:', error);
      
      const errorMessage = error.message || "Failed to generate questions";
      setError(errorMessage);
      
      toast.error("Failed to generate questions", {
        description: errorMessage,
      });

      setUploadProgress(0);
      setGenerationProgress(0);
    } finally {
      setIsUploading(false);
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (isUploading || isGenerating) {
      toast.error("Cannot close while processing");
      return;
    }
    onOpenChange(false);
    setFile(null);
    setUploadProgress(0);
    setGenerationProgress(0);
    setUploadedFileId(null);
    setError(null);
  };

  const isBusy = isUploading || isGenerating;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Start Playing: {gameTemplate.title}
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <p>Upload your study notes to generate custom questions for this game template.</p>
            <p className="text-xs text-muted-foreground">
              💡 <strong>Flow 2:</strong> This generates questions from your notes for an existing game.
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

          {/* File Upload Area */}
          <div className="space-y-2">
            <Label htmlFor="studyMaterial">Study Material</Label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary"
              } ${isBusy ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Input
                id="studyMaterial"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
                disabled={isBusy}
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
                  {!isBusy && (
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
                <label htmlFor="studyMaterial" className="cursor-pointer block">
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
          {isUploading && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading file...
                </span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Question Generation Progress */}
          {isGenerating && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating questions with RAG AI...
                </span>
                <span className="font-medium">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                AI is reading your notes and creating relevant questions
              </p>
            </div>
          )}

          {/* Success Indicator */}
          {generationProgress === 100 && !isGenerating && (
            <div className="flex items-center gap-2 text-green-600 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Questions generated successfully!</span>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-green-900">
              <Sparkles className="h-4 w-4 text-green-700" />
              How RAG Generates Questions
            </h4>
            <ul className="text-xs text-green-700 space-y-1 ml-6 list-disc">
              <li>Your study material is uploaded securely</li>
              <li>RAG AI reads and understands the content</li>
              <li>Key concepts and topics are extracted</li>
              <li>Relevant questions are generated automatically</li>
              <li>Questions are added to {gameTemplate.title}</li>
              <li>Game instance appears in your sidebar ready to play</li>
            </ul>
          </div>

          {/* Flow Distinction Badge */}
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <BookOpen className="h-5 w-5 text-green-600" />
            <div className="text-sm">
              <p className="font-semibold text-green-900">Generating Questions for Template</p>
              <p className="text-xs text-green-700">
                This adds custom questions to "{gameTemplate.title}", not creating a new browsable game
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90" 
            onClick={handleStartPlaying}
            disabled={!file || isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUploading ? 'Uploading...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate & Play
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};