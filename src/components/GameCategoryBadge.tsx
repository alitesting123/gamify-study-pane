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
    className: "bg-gradient-to-r from-orange-500 to-red-500 text-white border-none",
  },
  memory: {
    label: "Memory Booster",
    icon: Brain,
    className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none",
  },
  "quick-think": {
    label: "Quick Think",
    icon: Timer,
    className: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none",
  },
  puzzle: {
    label: "Puzzle",
    icon: Puzzle,
    className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none",
  },
  learning: {
    label: "Learning",
    icon: BookOpen,
    className: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none",
  },
};

export const GameCategoryBadge = ({ categoryType, size = "md" }: GameCategoryBadgeProps) => {
  const config = categoryConfig[categoryType];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge
      className={`${config.className} ${sizeClasses[size]} gap-1.5 font-semibold shadow-lg animate-fade-in`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </Badge>
  );
};
