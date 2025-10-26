// src/components/StartPlayingDialog.tsx
// Unified dialog with two flows:
// 1. Create game from scratch -> navigates to game overview
// 2. Select existing template -> upload study material -> navigates to game overview

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Loader2,
  Lightbulb,
  AlertCircle,
  Rocket,
  GamepadIcon,
  Upload,
  FileText,
  X,
  CheckCircle2,
  BookOpen,
  Play
} from "lucide-react";
import { toast } from "sonner";
import { gameService } from "@/services/gameService";
import { useGameContext } from "@/contexts/GameContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GameTemplate } from "@/types/game";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface StartPlayingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameTemplates: GameTemplate[];
  onNavigateToGameDetail?: (gameId: string) => void;
}

export const StartPlayingDialog = ({
  open,
  onOpenChange,
  gameTemplates,
  onNavigateToGameDetail,
}: StartPlayingDialogProps) => {
  const { addUserGame, setSelectedGameId, syncWithBackend } = useGameContext();

  // Active tab
  const [activeTab, setActiveTab] = useState<"scratch" | "template">("template");

  // Create from Scratch states
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [isCreating, setIsCreating] = useState(false);

  // Use Template states
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

  // Common states
  const [error, setError] = useState<string | null>(null);

  // Handle creating game from scratch
  const handleCreateFromScratch = async () => {
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
      console.log('🎮 Creating brand NEW complete game from scratch');
      console.log('📋 Game Details:', { title, prompt, difficulty });

      const response = await gameService.createNewGame({
        title,
        prompt,
        category: extractCategory(prompt),
        difficulty,
      });

      const newGame = response.data;
      console.log('✅ New complete game created:', newGame);

      const userGame = {
        id: newGame.id,
        templateId: 0,
        title: newGame.title || title,
        description: newGame.description || prompt.substring(0, 100),
        category: newGame.category || extractCategory(prompt),
        difficulty: (newGame.difficulty || difficulty) as 'Easy' | 'Medium' | 'Hard',
        questionsCount: newGame.questionsCount || 20,
        maxPoints: (newGame.questionsCount || 20) * 10,
        currentProgress: 0,
        createdAt: new Date().toISOString(),
        gameType: (newGame.gameType || 'quiz') as 'plane' | 'fishing' | 'circuit' | 'quiz',
      };

      addUserGame(userGame);
      await syncWithBackend();

      // Navigate to game detail view
      setSelectedGameId(newGame.id);

      toast.success(`Game created successfully!`, {
        description: `"${userGame.title}" is ready to play`,
      });

      onOpenChange(false);
      resetForm();

      // Navigate to game overview
      if (onNavigateToGameDetail) {
        onNavigateToGameDetail(newGame.id);
      }

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

  // Handle using existing template
  const handleUseTemplate = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a game template");
      return;
    }

    if (!file) {
      toast.error("Please select a study material file");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log('📤 Generating questions from study material for existing template');
      console.log('📋 Template:', selectedTemplate.title, '| File:', file.name);

      // Upload the study material file
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

      // Generate questions using RAG
      const generateResponse = await gameService.generateQuestionsFromMaterial({
        templateId: selectedTemplate.id,
        fileId: fileId,
        gameType: selectedTemplate.gameType || 'quiz',
        questionsCount: 20,
        difficulty: selectedTemplate.difficulty || 'Medium',
      });

      const gameInstance = generateResponse.data;
      console.log('✅ Started RAG question generation:', gameInstance);

      // Wait for RAG processing to complete
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

      // Add game instance to user's library
      const userGame = {
        id: gameInstance.id,
        templateId: selectedTemplate.id,
        title: `${selectedTemplate.title}`,
        description: selectedTemplate.description,
        category: selectedTemplate.category,
        difficulty: (gameInstance.difficulty || selectedTemplate.difficulty) as 'Easy' | 'Medium' | 'Hard',
        questionsCount: gameInstance.questionsCount || 24,
        maxPoints: (gameInstance.questionsCount || 24) * 10,
        currentProgress: 0,
        createdAt: new Date().toISOString(),
        gameType: (selectedTemplate.gameType || 'quiz') as 'plane' | 'fishing' | 'circuit' | 'quiz',
      };

      addUserGame(userGame);
      await syncWithBackend();

      // Navigate to game detail view
      setSelectedGameId(gameInstance.id);

      toast.success("Questions generated successfully!", {
        description: `Generated ${gameInstance.questionsCount} questions. Ready to play!`,
      });

      onOpenChange(false);
      resetForm();

      // Navigate to game overview
      if (onNavigateToGameDetail) {
        onNavigateToGameDetail(gameInstance.id);
      }

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

  const resetForm = () => {
    setTitle("");
    setPrompt("");
    setDifficulty('Medium');
    setSelectedTemplate(null);
    setFile(null);
    setUploadProgress(0);
    setGenerationProgress(0);
    setUploadedFileId(null);
    setError(null);
    setActiveTab("template");
  };

  const handleClose = () => {
    if (isCreating || isUploading || isGenerating) {
      toast.error("Cannot close while processing");
      return;
    }
    onOpenChange(false);
    resetForm();
  };

  // File handling functions
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

  const examplePrompt = "Create an interactive learning game about world history. Include questions about major events, important figures, and cultural developments. Make it engaging with timed challenges and bonus points for streaks.";

  const difficultyColors = {
    Easy: "bg-success/20 text-success border-success/30",
    Medium: "bg-warning/20 text-warning border-warning/30",
    Hard: "bg-destructive/20 text-destructive border-destructive/30",
  };

  const isBusy = isCreating || isUploading || isGenerating;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Play className="h-6 w-6 text-primary" />
            Start Playing
          </DialogTitle>
          <DialogDescription>
            Choose how you want to start: create a custom game from scratch or use an existing template with your study materials.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "scratch" | "template")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template" disabled={isBusy}>
              <BookOpen className="h-4 w-4 mr-2" />
              Use Existing Template
            </TabsTrigger>
            <TabsTrigger value="scratch" disabled={isBusy}>
              <Rocket className="h-4 w-4 mr-2" />
              Create from Scratch
            </TabsTrigger>
          </TabsList>

          {/* Use Existing Template Tab */}
          <TabsContent value="template" className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!selectedTemplate ? (
              <>
                <div>
                  <Label className="text-base font-semibold mb-3 block">Select a Game Template</Label>
                  <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
                    {gameTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                          selectedTemplate?.id === template.id ? 'border-primary shadow-md' : ''
                        }`}
                        onClick={() => !isBusy && setSelectedTemplate(template)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base mb-1">{template.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                                <Badge className={`${difficultyColors[template.difficulty]} text-xs`} variant="outline">
                                  {template.difficulty}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-3xl">
                              {template.gameType === 'plane' && '✈️'}
                              {template.gameType === 'fishing' && '🎣'}
                              {template.gameType === 'circuit' && '⚡'}
                              {template.gameType === 'quiz' && '📝'}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  {/* Selected Template Display */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {selectedTemplate.gameType === 'plane' && '✈️'}
                        {selectedTemplate.gameType === 'fishing' && '🎣'}
                        {selectedTemplate.gameType === 'circuit' && '⚡'}
                        {selectedTemplate.gameType === 'quiz' && '📝'}
                      </div>
                      <div>
                        <p className="font-semibold">{selectedTemplate.title}</p>
                        <p className="text-xs text-muted-foreground">{selectedTemplate.category}</p>
                      </div>
                    </div>
                    {!isBusy && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(null);
                          setFile(null);
                          setError(null);
                        }}
                      >
                        Change
                      </Button>
                    )}
                  </div>

                  {/* File Upload Area */}
                  <div className="space-y-2">
                    <Label htmlFor="studyMaterial">Upload Study Material</Label>
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
                          Generating questions with AI...
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
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isBusy}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-primary hover:opacity-90"
                    onClick={handleUseTemplate}
                    disabled={!selectedTemplate || !file || isBusy}
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
                </div>
              </>
            )}
          </TabsContent>

          {/* Create from Scratch Tab */}
          <TabsContent value="scratch" className="space-y-4 py-4">
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
                placeholder={examplePrompt}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setError(null);
                }}
                className="min-h-[180px] resize-none"
                disabled={isCreating}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {prompt.length} / 500 characters • Describe the topic, learning objectives, and any specific requirements
              </p>
            </div>

            {/* Example Prompt Button */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-warning" />
                Example
              </Label>
              <button
                onClick={() => setPrompt(examplePrompt)}
                disabled={isCreating}
                className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                "{examplePrompt}"
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFromScratch}
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
                    Create & Play
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Helper function
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
