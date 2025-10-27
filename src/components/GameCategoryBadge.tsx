// src/components/GameCategoryBadge.tsx
import { Zap, Brain, Timer, Puzzle, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GameCategoryType } from "@/types/game";

interface GameCategoryBadgeProps {
  categoryType: GameCategoryType;
  size?: "sm" | "md" | "lg";
}

const categoryConfig = {
  action: {
    label: "Action",
    icon: Zap,
    className: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20",
  },
  memory: {
    label: "Memory",
    icon: Brain,
    className: "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20",
  },
  "quick-think": {
    label: "Quick Think",
    icon: Timer,
    className: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/20",
  },
  puzzle: {
    label: "Puzzle",
    icon: Puzzle,
    className: "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20",
  },
  learning: {
    label: "Learning",
    icon: BookOpen,
    className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20",
  },
};

export const GameCategoryBadge = ({ categoryType, size = "md" }: GameCategoryBadgeProps) => {
  const config = categoryConfig[categoryType];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1 h-6",
    md: "text-sm px-3 py-1.5 h-7",
    lg: "text-base px-4 py-2 h-8",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${sizeClasses[size]} gap-1.5 font-medium transition-all duration-200`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </Badge>
  );
};
