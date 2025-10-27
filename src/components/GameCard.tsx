import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Clock, Trophy } from "lucide-react";
import { useState } from "react";

interface GameCardProps {
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  completionRate?: number;
  onClick?: () => void;
  gameType?: string;
}

export const GameCard = ({
  title,
  description,
  category,
  difficulty,
  estimatedTime,
  completionRate,
  onClick,
  gameType,
}: GameCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const difficultyColors = {
    Easy: "bg-success/20 text-success border-success/30",
    Medium: "bg-warning/20 text-warning border-warning/30",
    Hard: "bg-destructive/20 text-destructive border-destructive/30",
  };

  // Try to load cover image based on game type
  const coverImagePath = gameType ? `/assets/${gameType}.png` : null;

  return (
    <Card
      className={`group overflow-hidden border-2 transition-all duration-300 animate-fade-in ${
        onClick ? "cursor-pointer hover:border-primary hover:shadow-glow hover:scale-105" : ""
      }`}
      onClick={onClick}
    >
      <div className="h-32 bg-gradient-card relative overflow-hidden">
        {/* Cover Image */}
        {coverImagePath && !imageError && (
          <img
            src={coverImagePath}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Fallback: Gradient background with icon */}
        {(!coverImagePath || imageError || !imageLoaded) && (
          <>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Gamepad2 className="h-16 w-16 text-white/90" />
            </div>
          </>
        )}

        {/* Overlay for image */}
        {imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
        )}
        {completionRate !== undefined && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <Trophy className="h-4 w-4 text-warning" />
            <span className="text-white text-sm font-semibold">
              {completionRate}%
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <Badge className={difficultyColors[difficulty]} variant="outline">
            {difficulty}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{estimatedTime}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
