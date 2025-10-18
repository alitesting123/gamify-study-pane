// src/lib/pixiGame.ts
import { Application } from 'pixi.js';
import { initializePlaneGame } from './pixiGames/planeGame';
import { initializeFishingGame } from './pixiGames/fishingGame';

interface GameCallbacks {
  onQuestionComplete: (isCorrect: boolean) => void;
  onGameComplete: (finalScore: number) => void;
  onScoreUpdate?: (score: number, secondary?: number) => void;
}

export type GameType = 'plane' | 'fishing' | 'quiz';

let app: Application | null = null;

export async function initializeGame(
  container: HTMLDivElement,
  callbacks: GameCallbacks,
  gameType: GameType = 'plane'
): Promise<Application> {
  try {
    app = new Application();
    const bgColor = gameType === 'fishing' ? '#1e3a5f' : '#87CEEB';
    
    await app.init({
      background: bgColor,
      resizeTo: container,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    container.appendChild(app.canvas);

    switch (gameType) {
      case 'plane':
        await initializePlaneGame(app, callbacks);
        break;
      case 'fishing':
        await initializeFishingGame(app, callbacks);
        break;
      default:
        await initializePlaneGame(app, callbacks);
    }

    return app;
  } catch (error) {
    console.error('Failed to initialize game:', error);
    throw error;
  }
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