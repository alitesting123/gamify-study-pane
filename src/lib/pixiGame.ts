// src/lib/pixiGame.ts
import { Application } from 'pixi.js';
import { initializePlaneGame } from './pixiGames/planeGame';
import { initializeFishingGame } from './pixiGames/fishingGame';
import { initializeCircuitGame } from './pixiGames/circuitGame';
import type { GameConfig } from '@/services/gameService';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface GameQuestion {
  question: string;
  options: QuestionOption[];
  correctAnswer: string; // The id of the correct option
}

interface GameCallbacks {
  onQuestionComplete: (isCorrect: boolean) => void;
  onGameComplete: (finalScore: number) => void;
  onScoreUpdate?: (score: number, secondary?: number) => void;
  onShowQuestion?: (question: GameQuestion, callback: (isCorrect: boolean) => void) => void;
}

export type GameType = 'plane' | 'fishing' | 'circuit' | 'runner' | 'quiz';

let app: Application | null = null;

export async function initializeGame(
  container: HTMLDivElement,
  callbacks: GameCallbacks,
  gameConfig?: GameConfig,        // ← Keep this
  legacyGameType?: GameType       // ← Keep this
  // ❌ REMOVED: config?: any      // ← DELETE - This was causing the error!
): Promise<Application> {
  try {
    app = new Application();

    // Determine game type and configuration
    const gameType = gameConfig?.game_type || legacyGameType || 'plane';
    const backgroundColor = gameConfig?.config?.environment?.background_color || 
                           getDefaultBackgroundColor(gameType);
    
    console.log('🎮 Initializing game:', { gameType, hasConfig: !!gameConfig });

    await app.init({
      background: backgroundColor,
      resizeTo: container,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    container.appendChild(app.canvas);

    switch (gameType) {
      case 'plane':
        await initializePlaneGame(app, callbacks, gameConfig?.config);
        break;
      case 'fishing':
        await initializeFishingGame(app, callbacks, gameConfig?.config);
        break;
      case 'circuit':
        await initializeCircuitGame(app, callbacks, gameConfig?.config);
        break;

    }

    return app;
  } catch (error) {
    console.error('Failed to initialize game:', error);
    throw error;
  }
}

function getDefaultBackgroundColor(gameType: GameType): string {
  const defaults: Record<GameType, string> = {
    fishing: '#1e3a5f',
    circuit: '#0a1628',
    plane: '#87CEEB',
    runner: '#87CEEB',  // ← ADD THIS LINE
    quiz: '#ffffff',
  };
  return defaults[gameType] || '#87CEEB';
}

export function cleanupGame() {
  if (app) {
    app.destroy(true, { children: true, texture: true, textureSource: true });
    app = null;
  }
}

export function pauseGame() {
  if (app) {
    app.ticker.stop();
  }
}

export function resumeGame() {
  if (app) {
    app.ticker.start();
  }
}

export function toggleAudio(muted: boolean) {
  console.log('Audio toggled:', muted);
}