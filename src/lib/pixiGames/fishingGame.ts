// src/lib/pixiGames/fishingGame.ts
import { Application, Graphics, Container, Text } from 'pixi.js';

interface GameCallbacks {
  onQuestionComplete: (isCorrect: boolean) => void;
  onGameComplete: (finalScore: number) => void;
  onScoreUpdate?: (score: number, fishCaught: number) => void;
}

// Quiz questions - expanded set
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
  { question: "What is 9 x 9?", answer: "81" },
  { question: "What is 15 + 27?", answer: "42" },
  { question: "How many fins does a typical fish have?", answer: "7" },
  { question: "What is 6 x 7?", answer: "42" },
  { question: "Can fish drown? (yes or no)", answer: "yes" },
  { question: "What is 100 - 35?", answer: "65" },
  { question: "What is 8 x 9?", answer: "72" },
  { question: "Do all fish lay eggs? (yes or no)", answer: "no" },
  { question: "What is 50 ÷ 5?", answer: "10" },
];

export async function initializeFishingGame(
  app: Application,
  callbacks: GameCallbacks
): Promise<void> {
  const gameState = {
    score: 0,
    fishCaught: 0,
    timeLeft: 120,
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
    quizQuestions: [] as any[],
    currentQuizIndex: 0,
    totalQuizQuestions: 0,
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

  // Fish and bubbles containers FIRST (behind everything)
  const fishContainer = new Container();
  app.stage.addChild(fishContainer);

  const bubblesContainer = new Container();
  app.stage.addChild(bubblesContainer);

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

  // Fishing line container - on top of fish
  const lineContainer = new Container();
  app.stage.addChild(lineContainer);

  const fishingLine = new Graphics();
  lineContainer.addChild(fishingLine);

  // Hook - on top of line
  const hook = new Graphics();
  hook.beginFill(0xFFFFFF);
  hook.drawCircle(0, 0, 6);
  hook.endFill();
  hook.beginFill(0xC0C0C0);
  hook.drawCircle(0, 0, 4);
  hook.endFill();
  hook.x = boat.x + 30;
  hook.y = boat.y - 80;
  app.stage.addChild(hook);

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
    text: `Time: 120s`,
    style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffff00, fontWeight: 'bold' }
  });
  timeText.x = app.screen.width - 150;
  timeText.y = 20;
  app.stage.addChild(timeText);

  const instructionsText = new Text({
    text: 'SPACE: Cast/Reel | Catch fish to answer questions!',
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

  // Fish class with MORE VARIETY
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
    fishType: string;

    constructor() {
      this.container = new Container();
      this.graphics = new Graphics();
      this.type = Math.random();
      this.value = 0;
      this.caught = false;

      // More fish types with different sizes and speeds
      if (this.type < 0.2) {
        // Tiny fast fish
        this.fishType = "tiny";
        this.size = 15;
        this.color = 0x00CED1;
        this.value = 5;
        this.speed = 4;
      } else if (this.type < 0.4) {
        // Small fish
        this.fishType = "small";
        this.size = 20;
        this.color = 0xff6b6b;
        this.value = 10;
        this.speed = 3;
      } else if (this.type < 0.6) {
        // Medium fish
        this.fishType = "medium";
        this.size = 30;
        this.color = 0x4ecdc4;
        this.value = 20;
        this.speed = 2;
      } else if (this.type < 0.8) {
        // Large fish
        this.fishType = "large";
        this.size = 45;
        this.color = 0xf39c12;
        this.value = 30;
        this.speed = 1.2;
      } else {
        // Huge slow fish
        this.fishType = "huge";
        this.size = 60;
        this.color = 0x9b59b6;
        this.value = 50;
        this.speed = 0.8;
      }

      this.direction = Math.random() > 0.5 ? 1 : -1;
      this.drawFish();
      this.container.addChild(this.graphics);
      this.container.x = this.direction > 0 ? -100 : app.screen.width + 100;
      this.container.y = 250 + Math.random() * (app.screen.height - 300);
      fishContainer.addChild(this.container);
    }

    drawFish() {
      this.graphics.clear();
      
      // Body
      this.graphics.beginFill(this.color);
      this.graphics.drawEllipse(0, 0, this.size, this.size * 0.6);
      this.graphics.endFill();
      
      // Tail
      this.graphics.beginFill(this.color);
      this.graphics.moveTo(-this.size * this.direction, 0);
      this.graphics.lineTo(-this.size * 1.5 * this.direction, -this.size * 0.4);
      this.graphics.lineTo(-this.size * 1.5 * this.direction, this.size * 0.4);
      this.graphics.closePath();
      this.graphics.endFill();
      
      // Eye white
      this.graphics.beginFill(0xffffff);
      this.graphics.drawCircle(this.size * 0.5 * this.direction, -this.size * 0.2, this.size * 0.15);
      this.graphics.endFill();
      
      // Eye pupil
      this.graphics.beginFill(0x000000);
      this.graphics.drawCircle(this.size * 0.5 * this.direction, -this.size * 0.2, this.size * 0.08);
      this.graphics.endFill();

      // Stripes for variety
      if (this.fishType === "large" || this.fishType === "huge") {
        this.graphics.lineStyle(2, 0x000000, 0.3);
        for (let i = 0; i < 3; i++) {
          const x = (i - 1) * this.size * 0.3;
          this.graphics.moveTo(x, -this.size * 0.5);
          this.graphics.lineTo(x, this.size * 0.5);
        }
      }
    }

    update(delta: number) {
      if (!this.caught) {
        this.container.x += this.speed * this.direction * delta;
        this.container.y += Math.sin(Date.now() / 500 + this.container.x / 100) * 0.5;
        return this.container.x > -150 && this.container.x < app.screen.width + 150;
      }
      return true;
    }

    checkHookCollision(hookX: number, hookY: number) {
      if (this.caught) return false;
      const dx = this.container.x - hookX;
      const dy = this.container.y - hookY;
      return Math.sqrt(dx * dx + dy * dy) < (this.size * 0.8);
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
    if (gameState.lineOut) return;
    
    gameState.lineOut = true;
    gameState.reeling = false;
    gameState.hookY = boat.y - 80;
    hook.x = boat.x + 30;
    hook.y = gameState.hookY;
    
    const targetDepth = 200 + (gameState.castPower / 100) * (app.screen.height - 250);

    const castInterval = setInterval(() => {
      if (gameState.reeling) {
        clearInterval(castInterval);
        return;
      }
      
      gameState.hookY += 10;
      hook.y = gameState.hookY;
      
      if (gameState.hookY >= targetDepth) {
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
        
        if (gameState.caughtFish) {
          gameState.score += gameState.caughtFish.value;
          gameState.fishCaught++;
          scoreText.text = `Fish Caught: ${gameState.fishCaught} | Score: ${gameState.score}`;

          gameState.caughtFish.remove();
          gameState.caughtFish = null;

          callbacks.onScoreUpdate?.(gameState.score, gameState.fishCaught);

          // Show quiz after catching ANY fish
          showQuiz();
        }
        
        gameState.lineOut = false;
        gameState.reeling = false;
        gameState.castPower = 0;
        hook.y = boat.y - 80;
        hook.x = boat.x + 30;
      }
    }, 16);
  }

  function showQuiz() {
    gameState.paused = true;
    
    // Generate 3-5 random questions for this quiz
    const numQuestions = Math.floor(Math.random() * 3) + 3; // 3 to 5
    gameState.totalQuizQuestions = numQuestions;
    gameState.currentQuizIndex = 0;
    gameState.quizQuestions = [];
    
    // Get random unique questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    gameState.quizQuestions = shuffled.slice(0, numQuestions);
    
    showNextQuestion();
  }

  function showNextQuestion() {
    if (gameState.currentQuizIndex >= gameState.totalQuizQuestions) {
      // Quiz complete
      hideQuiz();
      return;
    }
    
    gameState.currentQuestion = gameState.quizQuestions[gameState.currentQuizIndex];
    userAnswer = '';
    
    quizOverlay.visible = true;
    quizBox.visible = true;
    quizQuestionText.text = `🎣 FISHING BREAK! 🎣\n\nQuestion ${gameState.currentQuizIndex + 1} of ${gameState.totalQuizQuestions}\n\n${gameState.currentQuestion.question}`;
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
      quizFeedbackText.text = '✓ Correct! +10s bonus!';
      quizFeedbackText.style.fill = 0x00aa00;
      quizFeedbackText.visible = true;
      gameState.timeLeft += 10;
      callbacks.onQuestionComplete(true);
      
      setTimeout(() => {
        gameState.currentQuizIndex++;
        showNextQuestion();
      }, 1000);
    } else {
      quizFeedbackText.text = `✗ Wrong! Answer: ${gameState.currentQuestion.answer}`;
      quizFeedbackText.style.fill = 0xff0000;
      quizFeedbackText.visible = true;
      callbacks.onQuestionComplete(false);
      
      setTimeout(() => {
        gameState.currentQuizIndex++;
        showNextQuestion();
      }, 2000);
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
      if (e.key === ' ') {
        e.preventDefault();
        
        if (!keys[' '] && !gameState.gameOver) {
          keys[' '] = true;
          
          if (!gameState.lineOut && !gameState.charging) {
            gameState.charging = true;
          } else if (gameState.lineOut && !gameState.reeling) {
            gameState.reeling = true;
            reelIn();
          }
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

    // Draw fishing line - ALWAYS VISIBLE with high contrast
    fishingLine.clear();
    fishingLine.lineStyle(5, 0xFFFFFF, 1); // WHITE, thick, fully opaque
    fishingLine.moveTo(boat.x + 30, boat.y - 80);
    fishingLine.lineTo(hook.x, hook.y);
    
    // Add a shadow/outline to make it even more visible
    fishingLine.lineStyle(3, 0x000000, 0.5);
    fishingLine.moveTo(boat.x + 30, boat.y - 80);
    fishingLine.lineTo(hook.x, hook.y);

    // Spawn MORE fish at faster rate
    fishSpawnTimer += ticker.deltaMS;
    if (fishSpawnTimer > 800) { // Reduced from 1500 to 800ms
      fishes.push(new Fish());
      fishSpawnTimer = 0;
    }

    // Spawn bubbles
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