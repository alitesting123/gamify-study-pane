// src/lib/pixiGames/fishingGame.ts
import { Application, Graphics, Container, Text } from 'pixi.js';

interface GameCallbacks {
  onQuestionComplete: (isCorrect: boolean) => void;
  onGameComplete: (finalScore: number) => void;
  onScoreUpdate?: (score: number, fishCaught: number) => void;
}

// Quiz questions
const questions = [
  { question: "What do fish use to breathe underwater?", answer: "gills" },
  { question: "What is 12 + 18?", answer: "30" },
  { question: "What ocean is the largest?", answer: "pacific" },
  { question: "What is 7 x 8?", answer: "56" },
  { question: "Are sharks fish? (yes or no)", answer: "yes" },
  { question: "What is 144 ÷ 12?", answer: "12" },
  { question: "What is a baby fish called?", answer: "fry" },
  { question: "What is 25 - 13?", answer: "12" },
  { question: "Do fish have eyelids? (yes or no)", answer: "no" },
  { question: "What is 9 x 9?", answer: "81" }
];

export async function initializeFishingGame(
  app: Application,
  callbacks: GameCallbacks
): Promise<void> {
  const gameState = {
    score: 0,
    fishCaught: 0,
    timeLeft: 60,
    gameOver: false,
    paused: false,
    currentQuestion: null as any,
    lineOut: false,
    reeling: false,
    caughtFish: null as any,
    hookY: 0,
    castPower: 0,
    charging: false,
    callbacks,
  };

  // Create water surface
  const waterSurface = new Graphics();
  waterSurface.beginFill(0x2980b9, 0.3);
  waterSurface.drawRect(0, 200, app.screen.width, 5);
  waterSurface.endFill();
  app.stage.addChild(waterSurface);

  // Create underwater effect
  const underwater = new Graphics();
  underwater.beginFill(0x154360, 0.4);
  underwater.drawRect(0, 205, app.screen.width, app.screen.height - 205);
  underwater.endFill();
  app.stage.addChild(underwater);

  // Create boat
  const boat = new Container();
  const boatBody = new Graphics();
  boatBody.beginFill(0x8B4513);
  boatBody.moveTo(-60, 0);
  boatBody.lineTo(-50, 20);
  boatBody.lineTo(50, 20);
  boatBody.lineTo(60, 0);
  boatBody.closePath();
  boatBody.endFill();

  boatBody.beginFill(0xA0522D);
  boatBody.drawRect(-55, -15, 110, 15);
  boatBody.endFill();

  // Fisherman
  const fisherman = new Graphics();
  fisherman.beginFill(0xffd1a3);
  fisherman.drawCircle(0, -35, 8);
  fisherman.endFill();
  fisherman.beginFill(0x3498db);
  fisherman.drawRect(-8, -27, 16, 20);
  fisherman.endFill();
  fisherman.beginFill(0x2c3e50);
  fisherman.drawRect(-8, -7, 7, 15);
  fisherman.drawRect(1, -7, 7, 15);
  fisherman.endFill();

  boat.addChild(boatBody);
  boat.addChild(fisherman);
  boat.x = app.screen.width / 2;
  boat.y = 180;
  app.stage.addChild(boat);

  // Fishing rod
  const rod = new Graphics();
  rod.lineStyle(3, 0x654321);
  rod.moveTo(0, -40);
  rod.lineTo(30, -80);
  boat.addChild(rod);

  // Fishing line
  const fishingLine = new Graphics();
  app.stage.addChild(fishingLine);

  // Hook
  const hook = new Graphics();
  hook.beginFill(0xcccccc);
  hook.drawCircle(0, 0, 5);
  hook.endFill();
  hook.lineStyle(2, 0x999999);
  hook.arc(0, 5, 8, 0, Math.PI);
  hook.x = boat.x + 30;
  hook.y = boat.y - 80;
  app.stage.addChild(hook);

  const fishContainer = new Container();
  app.stage.addChild(fishContainer);

  const bubblesContainer = new Container();
  app.stage.addChild(bubblesContainer);

  // Power bar
  const powerBarBg = new Graphics();
  powerBarBg.beginFill(0x333333);
  powerBarBg.drawRect(20, 120, 200, 30);
  powerBarBg.endFill();
  app.stage.addChild(powerBarBg);

  const powerBarFill = new Graphics();
  app.stage.addChild(powerBarFill);

  const powerBarText = new Text({
    text: 'POWER (Hold SPACE)',
    style: { fontFamily: 'Arial', fontSize: 16, fill: 0xffffff }
  });
  powerBarText.x = 25;
  powerBarText.y = 95;
  app.stage.addChild(powerBarText);

  // UI Text
  const scoreText = new Text({
    text: `Fish Caught: 0 | Score: 0`,
    style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff, fontWeight: 'bold' }
  });
  scoreText.x = 20;
  scoreText.y = 20;
  app.stage.addChild(scoreText);

  const timeText = new Text({
    text: `Time: 60s`,
    style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffff00, fontWeight: 'bold' }
  });
  timeText.x = app.screen.width - 150;
  timeText.y = 20;
  app.stage.addChild(timeText);

  const instructionsText = new Text({
    text: 'SPACE: Cast/Reel | Catch 3 fish to answer a question!',
    style: { fontFamily: 'Arial', fontSize: 18, fill: 0xffffff }
  });
  instructionsText.anchor.set(0.5);
  instructionsText.x = app.screen.width / 2;
  instructionsText.y = app.screen.height - 30;
  app.stage.addChild(instructionsText);

  // Quiz overlay
  const quizOverlay = new Graphics();
  quizOverlay.beginFill(0x000000, 0.85);
  quizOverlay.drawRect(0, 0, app.screen.width, app.screen.height);
  quizOverlay.endFill();
  quizOverlay.visible = false;
  app.stage.addChild(quizOverlay);

  const quizBox = new Graphics();
  quizBox.beginFill(0xffffff);
  quizBox.lineStyle(5, 0x2980b9);
  quizBox.drawRoundedRect(-300, -180, 600, 360, 20);
  quizBox.endFill();
  quizBox.x = app.screen.width / 2;
  quizBox.y = app.screen.height / 2;
  quizBox.visible = false;
  app.stage.addChild(quizBox);

  const quizQuestionText = new Text({
    text: '',
    style: { fontFamily: 'Arial', fontSize: 26, fill: 0x000000, align: 'center', wordWrap: true, wordWrapWidth: 550 }
  });
  quizQuestionText.anchor.set(0.5);
  quizQuestionText.x = app.screen.width / 2;
  quizQuestionText.y = app.screen.height / 2 - 80;
  quizQuestionText.visible = false;
  app.stage.addChild(quizQuestionText);

  const quizInstructionText = new Text({
    text: 'Type your answer and press ENTER',
    style: { fontFamily: 'Arial', fontSize: 18, fill: 0x666666 }
  });
  quizInstructionText.anchor.set(0.5);
  quizInstructionText.x = app.screen.width / 2;
  quizInstructionText.y = app.screen.height / 2;
  quizInstructionText.visible = false;
  app.stage.addChild(quizInstructionText);

  const quizAnswerText = new Text({
    text: '',
    style: { fontFamily: 'Arial', fontSize: 32, fill: 0x2980b9, fontWeight: 'bold' }
  });
  quizAnswerText.anchor.set(0.5);
  quizAnswerText.x = app.screen.width / 2;
  quizAnswerText.y = app.screen.height / 2 + 60;
  quizAnswerText.visible = false;
  app.stage.addChild(quizAnswerText);

  const quizFeedbackText = new Text({
    text: '',
    style: { fontFamily: 'Arial', fontSize: 24, fill: 0x00aa00 }
  });
  quizFeedbackText.anchor.set(0.5);
  quizFeedbackText.x = app.screen.width / 2;
  quizFeedbackText.y = app.screen.height / 2 + 120;
  quizFeedbackText.visible = false;
  app.stage.addChild(quizFeedbackText);

  let userAnswer = '';
  let fishes: Fish[] = [];
  let bubbles: Bubble[] = [];
  let fishSpawnTimer = 0;
  let bubbleSpawnTimer = 0;
  let lastTime = Date.now();
  const keys: any = {};

  // Fish class
  class Fish {
    container: Container;
    graphics: Graphics;
    size: number;
    color: number;
    value: number;
    speed: number;
    caught: boolean;
    direction: number;
    type: number;

    constructor() {
      this.container = new Container();
      this.graphics = new Graphics();
      this.type = Math.random();
      this.value = 0;
      this.caught = false;

      if (this.type < 0.4) {
        this.size = 20;
        this.color = 0xff6b6b;
        this.value = 10;
        this.speed = 2;
      } else if (this.type < 0.7) {
        this.size = 30;
        this.color = 0x4ecdc4;
        this.value = 20;
        this.speed = 1.5;
      } else {
        this.size = 40;
        this.color = 0xf39c12;
        this.value = 50;
        this.speed = 1;
      }

      this.direction = Math.random() > 0.5 ? 1 : -1;
      this.drawFish();
      this.container.addChild(this.graphics);
      this.container.x = this.direction > 0 ? -50 : app.screen.width + 50;
      this.container.y = 250 + Math.random() * (app.screen.height - 300);
      fishContainer.addChild(this.container);
    }

    drawFish() {
      this.graphics.clear();
      this.graphics.beginFill(this.color);
      this.graphics.drawEllipse(0, 0, this.size, this.size * 0.6);
      this.graphics.endFill();
      this.graphics.beginFill(this.color);
      this.graphics.moveTo(-this.size * this.direction, 0);
      this.graphics.lineTo(-this.size * 1.5 * this.direction, -this.size * 0.4);
      this.graphics.lineTo(-this.size * 1.5 * this.direction, this.size * 0.4);
      this.graphics.closePath();
      this.graphics.endFill();
      this.graphics.beginFill(0xffffff);
      this.graphics.drawCircle(this.size * 0.5 * this.direction, -this.size * 0.2, this.size * 0.15);
      this.graphics.endFill();
      this.graphics.beginFill(0x000000);
      this.graphics.drawCircle(this.size * 0.5 * this.direction, -this.size * 0.2, this.size * 0.08);
      this.graphics.endFill();
    }

    update(delta: number) {
      if (!this.caught) {
        this.container.x += this.speed * this.direction * delta;
        this.container.y += Math.sin(Date.now() / 500 + this.container.x / 100) * 0.5;
        return this.container.x > -100 && this.container.x < app.screen.width + 100;
      }
      return true;
    }

    checkHookCollision(hookX: number, hookY: number) {
      if (this.caught) return false;
      const dx = this.container.x - hookX;
      const dy = this.container.y - hookY;
      return Math.sqrt(dx * dx + dy * dy) < this.size;
    }

    catch() {
      this.caught = true;
    }

    remove() {
      fishContainer.removeChild(this.container);
    }
  }

  // Bubble class
  class Bubble {
    sprite: Graphics;
    speed: number;

    constructor(x: number, y: number) {
      this.sprite = new Graphics();
      this.sprite.beginFill(0xffffff, 0.3);
      this.sprite.lineStyle(1, 0xffffff, 0.5);
      const size = 3 + Math.random() * 5;
      this.sprite.drawCircle(0, 0, size);
      this.sprite.endFill();
      this.sprite.x = x;
      this.sprite.y = y;
      this.speed = 0.5 + Math.random() * 1;
      bubblesContainer.addChild(this.sprite);
    }

    update(delta: number) {
      this.sprite.y -= this.speed * delta;
      this.sprite.x += Math.sin(this.sprite.y / 20) * 0.5;
      
      if (this.sprite.y < 200) {
        bubblesContainer.removeChild(this.sprite);
        return false;
      }
      return true;
    }
  }

  function castLine() {
    gameState.lineOut = true;
    gameState.hookY = boat.y - 80;
    const targetDepth = 200 + (gameState.castPower / 100) * (app.screen.height - 250);

    const castInterval = setInterval(() => {
      gameState.hookY += 10;
      hook.y = gameState.hookY;
      if (gameState.hookY >= targetDepth || gameState.reeling) {
        clearInterval(castInterval);
      }
    }, 16);
  }

  function reelIn() {
    const reelInterval = setInterval(() => {
      gameState.hookY -= 8;
      hook.y = gameState.hookY;

      if (gameState.caughtFish) {
        gameState.caughtFish.container.x = hook.x;
        gameState.caughtFish.container.y = hook.y;
      }

      if (gameState.hookY <= boat.y - 80) {
        clearInterval(reelInterval);
        gameState.lineOut = false;
        gameState.reeling = false;
        hook.y = boat.y - 80;

        if (gameState.caughtFish) {
          gameState.score += gameState.caughtFish.value;
          gameState.fishCaught++;
          scoreText.text = `Fish Caught: ${gameState.fishCaught} | Score: ${gameState.score}`;

          gameState.caughtFish.remove();
          gameState.caughtFish = null;

          callbacks.onScoreUpdate?.(gameState.score, gameState.fishCaught);

          if (gameState.fishCaught % 3 === 0) {
            showQuiz();
          }
        }
        gameState.castPower = 0;
      }
    }, 16);
  }

  function showQuiz() {
    gameState.paused = true;
    gameState.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    userAnswer = '';
    quizOverlay.visible = true;
    quizBox.visible = true;
    quizQuestionText.text = "🎣 FISHING BREAK! 🎣\n\n" + gameState.currentQuestion.question;
    quizQuestionText.visible = true;
    quizInstructionText.visible = true;
    quizAnswerText.text = '';
    quizAnswerText.visible = true;
    quizFeedbackText.visible = false;
  }

  function hideQuiz() {
    gameState.paused = false;
    quizOverlay.visible = false;
    quizBox.visible = false;
    quizQuestionText.visible = false;
    quizInstructionText.visible = false;
    quizAnswerText.visible = false;
    quizFeedbackText.visible = false;
  }

  function checkAnswer() {
    const correct = userAnswer.toLowerCase().trim() === gameState.currentQuestion.answer.toLowerCase();
    if (correct) {
      quizFeedbackText.text = '✓ Correct! Bonus: +10s!';
      quizFeedbackText.style.fill = 0x00aa00;
      quizFeedbackText.visible = true;
      gameState.timeLeft += 10;
      callbacks.onQuestionComplete(true);
      setTimeout(() => hideQuiz(), 1500);
    } else {
      quizFeedbackText.text = '✗ Wrong! Try again!';
      quizFeedbackText.style.fill = 0xff0000;
      quizFeedbackText.visible = true;
      userAnswer = '';
      quizAnswerText.text = '';
      callbacks.onQuestionComplete(false);
      setTimeout(() => { quizFeedbackText.visible = false; }, 1000);
    }
  }

  // Keyboard handling
  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameState.paused) {
      if (e.key === 'Enter') {
        checkAnswer();
      } else if (e.key === 'Backspace') {
        userAnswer = userAnswer.slice(0, -1);
        quizAnswerText.text = userAnswer;
      } else if (e.key.length === 1) {
        userAnswer += e.key;
        quizAnswerText.text = userAnswer;
      }
    } else {
      if (e.key === ' ' && !keys[' ']) {
        e.preventDefault();
        keys[' '] = true;
        if (!gameState.lineOut && !gameState.gameOver) {
          gameState.charging = true;
        } else if (gameState.lineOut && !gameState.reeling) {
          gameState.reeling = true;
        }
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      keys[' '] = false;
      if (gameState.charging) {
        castLine();
        gameState.charging = false;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Game loop
  app.ticker.add((ticker) => {
    if (gameState.gameOver || gameState.paused) return;
    const delta = ticker.deltaTime;
    const currentTime = Date.now();

    // Timer
    if (currentTime - lastTime >= 1000) {
      gameState.timeLeft--;
      timeText.text = `Time: ${gameState.timeLeft}s`;
      lastTime = currentTime;

      if (gameState.timeLeft <= 0) {
        gameState.gameOver = true;
        callbacks.onGameComplete(gameState.score);
      }
    }

    // Power bar
    if (gameState.charging) {
      gameState.castPower = Math.min(100, gameState.castPower + 2 * delta);
    }

    powerBarFill.clear();
    const powerColor = gameState.castPower < 33 ? 0x00ff00 : gameState.castPower < 66 ? 0xffff00 : 0xff0000;
    powerBarFill.beginFill(powerColor);
    powerBarFill.drawRect(25, 125, (gameState.castPower / 100) * 190, 20);
    powerBarFill.endFill();

    // Fishing line
    fishingLine.clear();
    fishingLine.lineStyle(2, 0x654321);
    fishingLine.moveTo(boat.x + 30, boat.y - 80);
    fishingLine.lineTo(hook.x, hook.y);

    // Spawn
    fishSpawnTimer += ticker.deltaMS;
    if (fishSpawnTimer > 2000) {
      fishes.push(new Fish());
      fishSpawnTimer = 0;
    }

    bubbleSpawnTimer += ticker.deltaMS;
    if (bubbleSpawnTimer > 200) {
      bubbles.push(new Bubble(Math.random() * app.screen.width, 250 + Math.random() * (app.screen.height - 250)));
      bubbleSpawnTimer = 0;
    }

    bubbles = bubbles.filter(b => b.update(delta));

    fishes = fishes.filter(fish => {
      if (!fish.update(delta)) {
        fish.remove();
        return false;
      }
      if (gameState.lineOut && !gameState.caughtFish && !gameState.reeling) {
        if (fish.checkHookCollision(hook.x, hook.y)) {
          fish.catch();
          gameState.caughtFish = fish;
        }
      }
      return true;
    });

    if (gameState.caughtFish && !gameState.reeling) {
      gameState.reeling = true;
      reelIn();
    }
  });
}