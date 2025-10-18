// src/lib/pixiGames/planeGame.ts
import { Application, Graphics, Container, Text, TextStyle } from 'pixi.js';

interface GameCallbacks {
  onQuestionComplete: (isCorrect: boolean) => void;
  onGameComplete: (finalScore: number) => void;
  onScoreUpdate?: (score: number, distance: number) => void;
}

interface Particle extends Graphics {
  vx?: number;
  vy?: number;
  life?: number;
}

let keyboardHandler: ((e: KeyboardEvent) => void) | null = null;

// Quiz questions
const questions = [
  { question: "What is 15 + 23?", answer: "38" },
  { question: "How many wings does a bird have?", answer: "2" },
  { question: "What is 9 x 7?", answer: "63" },
  { question: "What do birds use to fly?", answer: "wings" },
  { question: "What is 100 - 47?", answer: "53" },
  { question: "What is 8 x 8?", answer: "64" },
  { question: "What do baby birds hatch from?", answer: "eggs" },
  { question: "What is 144 ÷ 12?", answer: "12" },
  { question: "Can penguins fly? (yes or no)", answer: "no" }
];

export async function initializePlaneGame(
  app: Application,
  callbacks: GameCallbacks
): Promise<void> {
  const gameState = {
    score: 0,
    distance: 0,
    speed: 3,
    gameOver: false,
    paused: false,
    birdsHit: 0,
    currentQuestion: null as any,
    planeHealth: 3,
    invincible: false,
    invincibleTimer: 0,
    debrisDestroyed: 0,
    combo: 0,
    callbacks,
  };

  const cloudsContainer = new Container();
  app.stage.addChild(cloudsContainer);

  const debrisContainer = new Container();
  app.stage.addChild(debrisContainer);

  const birdsContainer = new Container();
  app.stage.addChild(birdsContainer);

  // Create plane
  const plane = new Container();
  const planeBody = new Graphics();
  
  planeBody.beginFill(0xff4444);
  planeBody.drawRoundedRect(-40, -8, 80, 16, 8);
  planeBody.endFill();

  planeBody.beginFill(0x4a90e2);
  planeBody.drawCircle(20, 0, 12);
  planeBody.endFill();

  planeBody.beginFill(0xcc3333);
  planeBody.moveTo(-10, 0);
  planeBody.lineTo(-30, -35);
  planeBody.lineTo(-20, -35);
  planeBody.lineTo(0, -5);
  planeBody.closePath();
  planeBody.endFill();

  planeBody.beginFill(0xcc3333);
  planeBody.moveTo(-10, 0);
  planeBody.lineTo(-30, 35);
  planeBody.lineTo(-20, 35);
  planeBody.lineTo(0, 5);
  planeBody.closePath();
  planeBody.endFill();

  const propeller = new Graphics();
  propeller.beginFill(0x333333);
  propeller.drawRect(-2, -25, 4, 50);
  propeller.endFill();
  propeller.x = 35;
  planeBody.addChild(propeller);

  plane.addChild(planeBody);
  plane.x = 150;
  plane.y = app.screen.height / 2;
  app.stage.addChild(plane);

  const bulletsContainer = new Container();
  app.stage.addChild(bulletsContainer);

  const engineTrail = new Container();
  app.stage.addChild(engineTrail);

  const explosionsContainer = new Container();
  app.stage.addChild(explosionsContainer);

  // UI Text
  const scoreText = new Text({
    text: `Distance: 0m`,
    style: { fontFamily: 'Arial', fontSize: 24, fill: 0x2d3436, fontWeight: 'bold' }
  });
  scoreText.x = 20;
  scoreText.y = 20;
  app.stage.addChild(scoreText);

  const debrisText = new Text({
    text: `Debris: 0`,
    style: { fontFamily: 'Arial', fontSize: 20, fill: 0xff8800, fontWeight: 'bold' }
  });
  debrisText.x = 20;
  debrisText.y = 50;
  app.stage.addChild(debrisText);

  const healthText = new Text({
    text: `❤️ 3`,
    style: { fontFamily: 'Arial', fontSize: 28, fill: 0xff0000, fontWeight: 'bold' }
  });
  healthText.x = app.screen.width - 100;
  healthText.y = 20;
  app.stage.addChild(healthText);

  const instructionsText = new Text({
    text: 'MOUSE: Move | CLICK: Shoot | Destroy debris for points!',
    style: { fontFamily: 'Arial', fontSize: 18, fill: 0x2d3436, fontWeight: 'bold' }
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
  quizBox.lineStyle(5, 0xff4444);
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
    style: { fontFamily: 'Arial', fontSize: 32, fill: 0xff4444, fontWeight: 'bold' }
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
  let clouds: any[] = [];
  let birds: any[] = [];
  let debris: any[] = [];
  let bullets: any[] = [];
  let engineParticles: Particle[] = [];
  let targetY = app.screen.height / 2;
  let shootCooldown = 0;
  let cloudSpawnTimer = 0;
  let birdSpawnTimer = 0;
  let debrisSpawnTimer = 0;

  // Classes
  class Cloud {
    container: Container;
    speed: number;
    constructor() {
      this.container = new Container();
      const cloud = new Graphics();
      cloud.beginFill(0xffffff, 0.7);
      const size = 30 + Math.random() * 40;
      cloud.drawCircle(0, 0, size);
      cloud.drawCircle(size * 0.6, -size * 0.3, size * 0.8);
      cloud.drawCircle(size * 1.2, 0, size * 0.9);
      cloud.endFill();
      this.container.addChild(cloud);
      this.container.x = app.screen.width + 100;
      this.container.y = Math.random() * app.screen.height;
      this.speed = 0.5 + Math.random() * 0.5;
      cloudsContainer.addChild(this.container);
    }
    update(delta: number) {
      this.container.x -= this.speed * delta * gameState.speed;
      return this.container.x > -200;
    }
    remove() {
      cloudsContainer.removeChild(this.container);
    }
  }

  class Bird {
    container: Container;
    graphics: Graphics;
    speed: number;
    isHit: boolean;
    wingFlap: number;
    
    constructor() {
      this.container = new Container();
      this.graphics = new Graphics();
      this.wingFlap = 0;
      this.container.x = app.screen.width + 50;
      this.container.y = Math.random() * (app.screen.height - 100) + 50;
      this.speed = 2 + Math.random() * 2;
      this.isHit = false;
      this.container.addChild(this.graphics);
      birdsContainer.addChild(this.container);
      this.draw();
    }
    
    draw() {
      this.graphics.clear();
      if (this.isHit) {
        this.graphics.beginFill(0x666666);
        this.graphics.drawCircle(0, 0, 8);
        this.graphics.endFill();
        return;
      }
      this.graphics.beginFill(0x2d3436);
      this.graphics.drawEllipse(0, 0, 12, 8);
      this.graphics.drawCircle(10, 0, 6);
      this.graphics.endFill();
      const wingAngle = Math.sin(this.wingFlap) * 0.5;
      this.graphics.beginFill(0x34495e);
      this.graphics.moveTo(0, 0);
      this.graphics.lineTo(-15, -15 - wingAngle * 10);
      this.graphics.lineTo(-5, -2);
      this.graphics.closePath();
      this.graphics.endFill();
    }
    
    update(delta: number) {
      this.container.x -= (this.speed + gameState.speed) * delta;
      if (!this.isHit) {
        this.wingFlap += 0.15 * delta;
        this.draw();
      } else {
        this.container.rotation += 0.2 * delta;
        this.container.y += 3 * delta;
      }
      return this.container.x > -100 && this.container.y < app.screen.height + 50;
    }
    
    checkCollision(planeX: number, planeY: number) {
      if (this.isHit) return false;
      const dx = this.container.x - planeX;
      const dy = this.container.y - planeY;
      return Math.sqrt(dx * dx + dy * dy) < 35;
    }
    
    hit() {
      this.isHit = true;
      this.draw();
    }
    
    remove() {
      birdsContainer.removeChild(this.container);
    }
  }

  class Debris {
    container: Container;
    graphics: Graphics;
    speed: number;
    rotationSpeed: number;
    isDestroyed: boolean;
    
    constructor() {
      this.container = new Container();
      this.graphics = new Graphics();
      this.isDestroyed = false;
      this.graphics.beginFill(0x8B4513);
      this.graphics.drawRect(-20, -20, 40, 40);
      this.graphics.endFill();
      this.container.addChild(this.graphics);
      this.container.x = app.screen.width + 50;
      this.container.y = Math.random() * (app.screen.height - 100) + 50;
      this.speed = 1.5 + Math.random() * 1.5;
      this.rotationSpeed = (Math.random() - 0.5) * 0.1;
      debrisContainer.addChild(this.container);
    }
    
    update(delta: number) {
      this.container.x -= (this.speed + gameState.speed * 0.5) * delta;
      this.container.rotation += this.rotationSpeed * delta;
      return this.container.x > -100;
    }
    
    checkCollision(x: number, y: number, radius = 35) {
      if (this.isDestroyed) return false;
      const dx = this.container.x - x;
      const dy = this.container.y - y;
      return Math.sqrt(dx * dx + dy * dy) < radius;
    }
    
    destroy() {
      this.isDestroyed = true;
      createExplosion(this.container.x, this.container.y);
    }
    
    remove() {
      debrisContainer.removeChild(this.container);
    }
  }

  class Bullet {
    sprite: Graphics;
    speed: number;
    constructor(x: number, y: number) {
      this.sprite = new Graphics();
      this.sprite.beginFill(0xffff00);
      this.sprite.drawCircle(0, 0, 4);
      this.sprite.endFill();
      this.sprite.x = x;
      this.sprite.y = y;
      this.speed = 12;
      bulletsContainer.addChild(this.sprite);
    }
    update(delta: number) {
      this.sprite.x += this.speed * delta;
      return this.sprite.x < app.screen.width + 50;
    }
    checkCollision(obj: any) {
      const dx = this.sprite.x - obj.container.x;
      const dy = this.sprite.y - obj.container.y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    }
    remove() {
      bulletsContainer.removeChild(this.sprite);
    }
  }

  function createExplosion(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const particle = new Graphics() as Particle;
      particle.beginFill(0xff8800);
      particle.drawCircle(0, 0, 3);
      particle.endFill();
      particle.x = x;
      particle.y = y;
      particle.vx = (Math.random() - 0.5) * 5;
      particle.vy = (Math.random() - 0.5) * 5;
      particle.life = 20;
      explosionsContainer.addChild(particle);
      engineParticles.push(particle);
    }
  }

  // Mouse controls
  app.canvas.addEventListener('mousemove', (e) => {
    if (!gameState.paused && !gameState.gameOver) {
      const rect = app.canvas.getBoundingClientRect();
      targetY = e.clientY - rect.top;
    }
  });

  app.canvas.addEventListener('click', () => {
    if (!gameState.paused && !gameState.gameOver && shootCooldown <= 0) {
      bullets.push(new Bullet(plane.x + 40, plane.y));
      shootCooldown = 10;
    }
  });

  function showQuiz() {
    gameState.paused = true;
    gameState.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    userAnswer = '';
    quizOverlay.visible = true;
    quizBox.visible = true;
    quizQuestionText.text = "⚠️ BIRD STRIKE! ⚠️\n\n" + gameState.currentQuestion.question;
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
    gameState.invincible = true;
    gameState.invincibleTimer = 120;
  }

  function checkAnswer() {
    const correct = userAnswer.toLowerCase().trim() === gameState.currentQuestion.answer.toLowerCase();
    if (correct) {
      quizFeedbackText.text = '✓ Correct!';
      quizFeedbackText.style.fill = 0x00aa00;
      quizFeedbackText.visible = true;
      callbacks.onQuestionComplete?.(true);
      setTimeout(() => hideQuiz(), 1500);
    } else {
      quizFeedbackText.text = '✗ Wrong! Try again!';
      quizFeedbackText.style.fill = 0xff0000;
      quizFeedbackText.visible = true;
      userAnswer = '';
      quizAnswerText.text = '';
      callbacks.onQuestionComplete?.(false);
      setTimeout(() => { quizFeedbackText.visible = false; }, 1000);
    }
  }

  keyboardHandler = (e: KeyboardEvent) => {
    if (gameState.paused && !gameState.gameOver) {
      if (e.key === 'Enter') {
        checkAnswer();
      } else if (e.key === 'Backspace') {
        userAnswer = userAnswer.slice(0, -1);
        quizAnswerText.text = userAnswer;
      } else if (e.key.length === 1) {
        userAnswer += e.key;
        quizAnswerText.text = userAnswer;
      }
    }
  };
  window.addEventListener('keydown', keyboardHandler);

  // Game loop
  app.ticker.add((ticker) => {
    if (gameState.gameOver || gameState.paused) return;
    const delta = ticker.deltaTime;

    propeller.rotation += 0.5 * delta;

    const dy = targetY - plane.y;
    plane.y += dy * 0.1 * delta;
    plane.rotation = dy * 0.001;

    if (shootCooldown > 0) shootCooldown--;

    if (gameState.invincible) {
      gameState.invincibleTimer--;
      plane.alpha = Math.sin(gameState.invincibleTimer * 0.3) * 0.5 + 0.5;
      if (gameState.invincibleTimer <= 0) {
        gameState.invincible = false;
        plane.alpha = 1;
      }
    }

    // Spawn clouds
    cloudSpawnTimer += ticker.deltaMS;
    if (cloudSpawnTimer > 2000) {
      clouds.push(new Cloud());
      cloudSpawnTimer = 0;
    }

    // Spawn debris
    debrisSpawnTimer += ticker.deltaMS;
    if (debrisSpawnTimer > 800) {
      debris.push(new Debris());
      debrisSpawnTimer = 0;
    }

    // Spawn birds
    birdSpawnTimer += ticker.deltaMS;
    if (birdSpawnTimer > 2000) {
      birds.push(new Bird());
      birdSpawnTimer = 0;
    }

    // Update
    bullets = bullets.filter(b => {
      if (!b.update(delta)) { b.remove(); return false; }
      for (let i = debris.length - 1; i >= 0; i--) {
        if (b.checkCollision(debris[i])) {
          debris[i].destroy();
          debris[i].remove();
          debris.splice(i, 1);
          b.remove();
          gameState.debrisDestroyed++;
          debrisText.text = `Debris: ${gameState.debrisDestroyed}`;
          return false;
        }
      }
      return true;
    });

    clouds = clouds.filter(c => { const a = c.update(delta); if (!a) c.remove(); return a; });
    debris = debris.filter(d => {
      if (!d.update(delta)) { d.remove(); return false; }
      if (!gameState.invincible && d.checkCollision(plane.x, plane.y)) {
        d.destroy();
        gameState.planeHealth--;
        healthText.text = `❤️ ${gameState.planeHealth}`;
        if (gameState.planeHealth <= 0) {
          gameState.gameOver = true;
          callbacks.onGameComplete?.(gameState.debrisDestroyed * 10);
        }
        d.remove();
        return false;
      }
      return true;
    });

    birds = birds.filter(b => {
      if (!b.update(delta)) { b.remove(); return false; }
      if (!gameState.invincible && b.checkCollision(plane.x, plane.y)) {
        b.hit();
        gameState.birdsHit++;
        gameState.planeHealth--;
        healthText.text = `❤️ ${gameState.planeHealth}`;
        if (gameState.planeHealth <= 0) {
          gameState.gameOver = true;
          callbacks.onGameComplete?.(gameState.debrisDestroyed * 10);
        } else {
          showQuiz();
        }
      }
      return true;
    });

    engineParticles = engineParticles.filter(p => {
      if (p.vx !== undefined && p.vy !== undefined) {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
      }
      p.alpha -= 0.05 * delta;
      if (p.life !== undefined) {
        p.life--;
        if (p.life <= 0) {
          p.parent?.removeChild(p);
          return false;
        }
      }
      return true;
    });

    gameState.distance += Math.floor(gameState.speed * delta);
    gameState.speed += 0.001 * delta;
    scoreText.text = `Distance: ${gameState.distance}m`;
    callbacks.onScoreUpdate?.(gameState.debrisDestroyed * 10, gameState.distance);
  });
}