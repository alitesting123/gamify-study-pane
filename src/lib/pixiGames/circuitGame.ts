// src/lib/pixiGames/circuitGame.ts
import { Application, Graphics, Container, Text } from 'pixi.js';

interface GameCallbacks {
  onQuestionComplete: (isCorrect: boolean) => void;
  onGameComplete: (finalScore: number) => void;
  onScoreUpdate?: (score: number, distance: number) => void;
}

// Quiz questions
const questions = [
  { question: "What is 25 + 17?", answer: "42" },
  { question: "What is the capital of France?", answer: "paris" },
  { question: "What is 8 x 7?", answer: "56" },
  { question: "How many bytes in a kilobyte?", answer: "1024" },
  { question: "What is 144 ÷ 12?", answer: "12" },
  { question: "What does CPU stand for? (3 words)", answer: "central processing unit" },
  { question: "What is 9 x 9?", answer: "81" },
  { question: "What is RAM short for?", answer: "random access memory" },
  { question: "What is 100 - 37?", answer: "63" },
  { question: "What programming language runs in browsers?", answer: "javascript" }
];

export async function initializeCircuitGame(
  app: Application,
  callbacks: GameCallbacks
): Promise<void> {
  let player: Container;
  let circuitsContainer: Container;
  let circuits: any[] = [];
  let score = 0;
  let distance = 0;
  let obstaclesHit = 0;

  const gameState = {
    isGameOver: false,
    paused: false,
    speed: 4,
    maxSpeed: 10,
    playerLane: 1,
    laneWidth: 90,
    moving: false,
    currentQuestion: null as any,
    callbacks,
  };

  // Initialize containers
  circuitsContainer = new Container();
  app.stage.addChild(circuitsContainer);

  // UI Text
  const scoreText = new Text({
    text: `Score: 0`,
    style: { fontFamily: 'Arial', fontSize: 24, fill: 0x00ff00, fontWeight: 'bold' }
  });
  scoreText.x = 20;
  scoreText.y = 20;
  app.stage.addChild(scoreText);

  const distanceText = new Text({
    text: `Distance: 0m`,
    style: { fontFamily: 'Arial', fontSize: 20, fill: 0x00ffff, fontWeight: 'bold' }
  });
  distanceText.x = 20;
  distanceText.y = 50;
  app.stage.addChild(distanceText);

  const instructionsText = new Text({
    text: '← → ARROWS or A/D: Move | Dodge the obstacles!',
    style: { fontFamily: 'Arial', fontSize: 18, fill: 0xffffff, fontWeight: 'bold' }
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
  quizBox.beginFill(0x0a1628);
  quizBox.lineStyle(5, 0x00ff00);
  quizBox.drawRoundedRect(-300, -180, 600, 360, 20);
  quizBox.endFill();
  quizBox.x = app.screen.width / 2;
  quizBox.y = app.screen.height / 2;
  quizBox.visible = false;
  app.stage.addChild(quizBox);

  const quizQuestionText = new Text({
    text: '',
    style: { fontFamily: 'Arial', fontSize: 26, fill: 0x00ff00, align: 'center', wordWrap: true, wordWrapWidth: 550 }
  });
  quizQuestionText.anchor.set(0.5);
  quizQuestionText.x = app.screen.width / 2;
  quizQuestionText.y = app.screen.height / 2 - 80;
  quizQuestionText.visible = false;
  app.stage.addChild(quizQuestionText);

  const quizInstructionText = new Text({
    text: 'Type your answer and press ENTER',
    style: { fontFamily: 'Arial', fontSize: 18, fill: 0x00ffff }
  });
  quizInstructionText.anchor.set(0.5);
  quizInstructionText.x = app.screen.width / 2;
  quizInstructionText.y = app.screen.height / 2;
  quizInstructionText.visible = false;
  app.stage.addChild(quizInstructionText);

  const quizAnswerText = new Text({
    text: '',
    style: { fontFamily: 'Arial', fontSize: 32, fill: 0xffaa00, fontWeight: 'bold' }
  });
  quizAnswerText.anchor.set(0.5);
  quizAnswerText.x = app.screen.width / 2;
  quizAnswerText.y = app.screen.height / 2 + 60;
  quizAnswerText.visible = false;
  app.stage.addChild(quizAnswerText);

  const quizFeedbackText = new Text({
    text: '',
    style: { fontFamily: 'Arial', fontSize: 24, fill: 0x00ff00 }
  });
  quizFeedbackText.anchor.set(0.5);
  quizFeedbackText.x = app.screen.width / 2;
  quizFeedbackText.y = app.screen.height / 2 + 120;
  quizFeedbackText.visible = false;
  app.stage.addChild(quizFeedbackText);

  let userAnswer = '';

  function createPlayer() {
    player = new Container();
    
    // Create a running man figure on top of a server rack
    const serverRack = new Graphics();
    
    // Server box (like a data center rack)
    serverRack.beginFill(0x2c3e50);
    serverRack.drawRoundedRect(-25, 0, 50, 35, 4);
    serverRack.endFill();
    
    // Server lights/indicators
    for (let i = 0; i < 3; i++) {
      const lightY = 8 + i * 10;
      serverRack.beginFill(0x00ff00);
      serverRack.drawCircle(-15, lightY, 2);
      serverRack.endFill();
      serverRack.beginFill(0xff6600);
      serverRack.drawCircle(-8, lightY, 2);
      serverRack.endFill();
      serverRack.beginFill(0x00ffff);
      serverRack.drawCircle(-1, lightY, 2);
      serverRack.endFill();
    }
    
    // Server vents
    for (let i = 0; i < 4; i++) {
      serverRack.lineStyle(1, 0x95a5a6);
      serverRack.moveTo(5, 5 + i * 7);
      serverRack.lineTo(20, 5 + i * 7);
    }
    
    player.addChild(serverRack);
    
    // Running man on top of server
    const runningMan = new Container();
    runningMan.y = -15; // Position on top of server
    
    // Head
    const head = new Graphics();
    head.beginFill(0xffd1a3);
    head.drawCircle(0, -28, 6);
    head.endFill();
    
    // Safety helmet
    head.beginFill(0xffaa00);
    head.arc(0, -28, 7, Math.PI, 0, false);
    head.fill();
    
    runningMan.addChild(head);
    
    // Body
    const body = new Graphics();
    body.beginFill(0x3498db);
    body.drawRect(-4, -22, 8, 12);
    body.endFill();
    runningMan.addChild(body);
    
    // Arms (running position)
    const leftArm = new Graphics();
    leftArm.lineStyle(3, 0x3498db);
    leftArm.moveTo(-4, -18);
    leftArm.lineTo(-8, -12);
    runningMan.addChild(leftArm);
    
    const rightArm = new Graphics();
    rightArm.lineStyle(3, 0x3498db);
    rightArm.moveTo(4, -18);
    rightArm.lineTo(8, -14);
    runningMan.addChild(rightArm);
    
    // Legs (running position)
    const leftLeg = new Graphics();
    leftLeg.lineStyle(3, 0x2c3e50);
    leftLeg.moveTo(-2, -10);
    leftLeg.lineTo(-6, -2);
    runningMan.addChild(leftLeg);
    
    const rightLeg = new Graphics();
    rightLeg.lineStyle(3, 0x2c3e50);
    rightLeg.moveTo(2, -10);
    rightLeg.lineTo(6, -4);
    runningMan.addChild(rightLeg);
    
    player.addChild(runningMan);
    
    // Electric aura around player
    const glow = new Graphics();
    glow.circle(0, 0, 40);
    glow.fill({ color: '#00ffff', alpha: 0.2 });
    player.addChild(glow);
    
    updatePlayerPosition();
    player.y = app.screen.height - 150;
    
    app.stage.addChild(player);
  }

  function updatePlayerPosition() {
    const lanes = [
      app.screen.width / 2 - gameState.laneWidth,
      app.screen.width / 2,
      app.screen.width / 2 + gameState.laneWidth
    ];
    player.x = lanes[gameState.playerLane];
  }

  function createCircuit(yOffset: number) {
    const circuit = new Container();
    
    const isObstacle = Math.random() < 0.35;
    const obstacleType = Math.floor(Math.random() * 3);
    
    const colorSchemes = [
      { bg: '#00aa44', dark: '#005522', trace: '#00ff88', component: '#ffaa00' },
      { bg: '#0088cc', dark: '#004466', trace: '#00ccff', component: '#ff6b35' },
      { bg: '#8800cc', dark: '#440066', trace: '#cc00ff', component: '#ffd700' },
      { bg: '#cc0088', dark: '#660044', trace: '#ff00cc', component: '#00ffff' },
      { bg: '#ff6600', dark: '#883300', trace: '#ffaa00', component: '#00ff00' }
    ];
    
    for (let lane = 0; lane < 3; lane++) {
      const trace = new Graphics();
      const xPos = app.screen.width / 2 + (lane - 1) * gameState.laneWidth;
      const colors = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
      
      // Main circuit trace
      trace.roundRect(xPos - 28, 0, 56, 85, 8);
      trace.fill(colors.bg);
      trace.roundRect(xPos - 23, 5, 46, 75, 6);
      trace.fill(colors.dark);
      
      // Circuit lines
      for (let i = 0; i < 4; i++) {
        const lineY = 12 + i * 20;
        trace.rect(xPos - 18, lineY - 1, 36, 4);
        trace.fill({ color: colors.trace, alpha: 0.3 });
        trace.rect(xPos - 18, lineY, 36, 2);
        trace.fill(colors.trace);
      }
      
      // Electronic components
      const componentTypes = ['resistor', 'capacitor', 'chip', 'led'];
      for (let j = 0; j < 3; j++) {
        const compType = componentTypes[Math.floor(Math.random() * componentTypes.length)];
        const compX = xPos - 15 + j * 15;
        const compY = 40;
        
        if (compType === 'resistor') {
          trace.rect(compX - 4, compY - 3, 8, 6);
          trace.fill(colors.component);
        } else if (compType === 'capacitor') {
          trace.rect(compX - 3, compY - 4, 2, 8);
          trace.fill(colors.component);
          trace.rect(compX + 1, compY - 4, 2, 8);
          trace.fill(colors.component);
        } else if (compType === 'chip') {
          trace.rect(compX - 5, compY - 4, 10, 8);
          trace.fill('#2c3e50');
        } else {
          trace.circle(compX, compY, 3);
          trace.fill(colors.component);
        }
      }
      
      circuit.addChild(trace);
      
      // Add obstacle
      if (isObstacle && lane === obstacleType) {
        const obstacle = new Graphics();
        const obstacleTypeRandom = Math.random();
        
        if (obstacleTypeRandom < 0.33) {
          // Broken circuit with fire
          obstacle.roundRect(xPos - 32, 18, 64, 48, 6);
          obstacle.fill('#ff3300');
          
          for (let s = 0; s < 8; s++) {
            const sx = xPos + (Math.random() - 0.5) * 50;
            const sy = 35 + (Math.random() - 0.5) * 30;
            obstacle.circle(sx, sy, 2 + Math.random() * 3);
            obstacle.fill(Math.random() > 0.5 ? '#ffff00' : '#ff6600');
          }
        } else if (obstacleTypeRandom < 0.66) {
          // Electric hazard
          obstacle.circle(xPos, 40, 25);
          obstacle.fill({ color: '#ffff00', alpha: 0.3 });
          obstacle.circle(xPos, 40, 20);
          obstacle.fill('#ff00ff');
        } else {
          // Corrupted data block
          obstacle.rect(xPos - 28, 20, 56, 44);
          obstacle.fill('#9b59b6');
        }
        
        (obstacle as any).isObstacle = true;
        (obstacle as any).lane = lane;
        circuit.addChild(obstacle);
      }
    }
    
    circuit.y = yOffset;
    (circuit as any).passed = false;
    
    circuitsContainer.addChild(circuit);
    circuits.push(circuit);
  }

  function createInitialCircuits() {
    for (let i = 0; i < 15; i++) {
      createCircuit(-i * 100);
    }
  }

  function animatePlayerMove() {
    const targetX = [
      app.screen.width / 2 - gameState.laneWidth,
      app.screen.width / 2,
      app.screen.width / 2 + gameState.laneWidth
    ][gameState.playerLane];
    
    const startX = player.x;
    const diff = targetX - startX;
    let progress = 0;
    
    const moveInterval = (time: any) => {
      progress += 0.18;
      if (progress >= 1) {
        progress = 1;
        gameState.moving = false;
        app.ticker.remove(moveInterval);
      }
      player.x = startX + diff * progress;
    };
    
    app.ticker.add(moveInterval);
  }

  function showQuiz() {
    gameState.paused = true;
    gameState.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    userAnswer = '';
    
    quizOverlay.visible = true;
    quizBox.visible = true;
    quizQuestionText.text = "⚡ CIRCUIT OVERLOAD! ⚡\n\n" + gameState.currentQuestion.question;
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
      quizFeedbackText.text = '✓ Correct! System restored!';
      quizFeedbackText.style.fill = 0x00ff00;
      quizFeedbackText.visible = true;
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

  function endGame() {
    gameState.isGameOver = true;
    callbacks.onGameComplete(score);
  }

  // Keyboard controls
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
      return;
    }

    if (gameState.isGameOver) return;
    
    if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && !gameState.moving) {
      if (gameState.playerLane > 0) {
        gameState.playerLane--;
        gameState.moving = true;
        animatePlayerMove();
      }
    }
    
    if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && !gameState.moving) {
      if (gameState.playerLane < 2) {
        gameState.playerLane++;
        gameState.moving = true;
        animatePlayerMove();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  // Initialize
  createPlayer();
  createInitialCircuits();

  // Game loop
  app.ticker.add((time) => {
    if (gameState.isGameOver || gameState.paused) return;

    if (gameState.speed < gameState.maxSpeed) {
      gameState.speed += 0.002 * time.deltaTime;
    }

    circuits.forEach((circuit, index) => {
      circuit.y += gameState.speed * time.deltaTime;

      circuit.children.forEach((child: any) => {
        if (child.isObstacle) {
          const obstacleY = circuit.y + 40;
          const playerY = player.y;
          
          if (Math.abs(obstacleY - playerY) < 45 && child.lane === gameState.playerLane) {
            obstaclesHit++;
            
            // Show quiz after hitting obstacle
            showQuiz();
            
            // Remove the obstacle
            circuit.removeChild(child);
          }
        }
      });

      if (!circuit.passed && circuit.y > player.y) {
        circuit.passed = true;
        score += 10;
        scoreText.text = `Score: ${score}`;
        callbacks.onScoreUpdate?.(score, Math.floor(distance));
      }

      if (circuit.y > app.screen.height + 100) {
        circuitsContainer.removeChild(circuit);
        circuits.splice(index, 1);
        
        const lastCircuit = circuits[circuits.length - 1];
        if (lastCircuit) {
          createCircuit(lastCircuit.y - 100);
        }
      }
    });

    distance += gameState.speed * 0.1 * time.deltaTime;
    distanceText.text = `Distance: ${Math.floor(distance)}m`;

    // Animate running man
    const runAnimation = Math.sin(time.lastTime * 0.01);
    player.rotation = runAnimation * 0.05;
  });
}