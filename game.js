// Snake Game - Phaser.js

let snake;
let food;
let cursors;
let score = 0;
let scoreText;
let gameOver = false;
let gameOverText;
let restartText;
let direction = 'right';
let lastMoveTime = 0;
let moveDelay = 150;
let gridSize = 20;
let tileCount = 25;

function preload() {
    // Create simple textures programmatically
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Snake body texture (green square)
    graphics.fillStyle(0x00ff00);
    graphics.fillRect(0, 0, gridSize, gridSize);
    graphics.generateTexture('snake', gridSize, gridSize);
    
    // Food texture (red square)
    graphics.clear();
    graphics.fillStyle(0xff0000);
    graphics.fillRect(0, 0, gridSize, gridSize);
    graphics.generateTexture('food', gridSize, gridSize);
}

function create() {
    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Create snake array
    snake = [];
    const startX = Math.floor(tileCount / 2) * gridSize;
    const startY = Math.floor(tileCount / 2) * gridSize;
    
    // Create initial snake (3 segments)
    for (let i = 0; i < 3; i++) {
        const segment = this.add.rectangle(startX - i * gridSize, startY, gridSize, gridSize, 0x00ff00);
        snake.push(segment);
    }
    
    // Create food
    food = this.add.rectangle(0, 0, gridSize, gridSize, 0xff0000);
    placeFood.call(this);
    
    // Controls
    cursors = this.input.keyboard.createCursorKeys();
    
    // Score text
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Arial'
    });
    
    // Game over text (hidden initially)
    gameOverText = this.add.text(400, 250, 'GAME OVER', {
        fontSize: '48px',
        fill: '#ff0000',
        fontFamily: 'Arial'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setVisible(false);
    
    // Restart text (hidden initially)
    restartText = this.add.text(400, 300, 'Press SPACE to Restart', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Arial'
    });
    restartText.setOrigin(0.5);
    restartText.setVisible(false);
    
    // Instructions
    this.add.text(16, 550, 'Use arrow keys to move', {
        fontSize: '18px',
        fill: '#ffffff',
        fontFamily: 'Arial'
    });
}

function update(time) {
    if (gameOver) {
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey('SPACE'))) {
            restartGame.call(this);
        }
        return;
    }
    
    // Handle input
    if (cursors.left.isDown && direction !== 'right') {
        direction = 'left';
    } else if (cursors.right.isDown && direction !== 'left') {
        direction = 'right';
    } else if (cursors.up.isDown && direction !== 'down') {
        direction = 'up';
    } else if (cursors.down.isDown && direction !== 'up') {
        direction = 'down';
    }
    
    // Move snake based on time delay
    if (time - lastMoveTime > moveDelay) {
        moveSnake.call(this);
        lastMoveTime = time;
    }
}

function placeFood() {
    const x = Math.floor(Math.random() * tileCount) * gridSize + gridSize / 2;
    const y = Math.floor(Math.random() * tileCount) * gridSize + gridSize / 2;
    food.setPosition(x, y);
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (Math.abs(segment.x - x) < gridSize && Math.abs(segment.y - y) < gridSize) {
            placeFood.call(this);
            return;
        }
    }
}

function moveSnake() {
    const head = snake[0];
    let newX = head.x;
    let newY = head.y;
    
    // Calculate new head position
    switch (direction) {
        case 'left':
            newX -= gridSize;
            break;
        case 'right':
            newX += gridSize;
            break;
        case 'up':
            newY -= gridSize;
            break;
        case 'down':
            newY += gridSize;
            break;
    }
    
    // Check wall collision
    if (newX < 0 || newX >= tileCount * gridSize || newY < 0 || newY >= tileCount * gridSize) {
        endGame.call(this);
        return;
    }
    
    // Check self collision
    for (let segment of snake) {
        if (Math.abs(segment.x - newX) < gridSize && Math.abs(segment.y - newY) < gridSize) {
            endGame.call(this);
            return;
        }
    }
    
    // Create new head
    const newHead = this.add.rectangle(newX, newY, gridSize, gridSize, 0x00ff00);
    snake.unshift(newHead);
    
    // Check food collision
    if (Math.abs(newX - food.x) < gridSize && Math.abs(newY - food.y) < gridSize) {
        // Ate food
        score += 10;
        scoreText.setText('Score: ' + score);
        placeFood.call(this);
        
        // Increase speed slightly
        moveDelay = Math.max(50, moveDelay - 2);
    } else {
        // Remove tail if no food eaten
        const tail = snake.pop();
        tail.destroy();
    }
}

function endGame() {
    gameOver = true;
    gameOverText.setVisible(true);
    restartText.setVisible(true);
}

function restartGame() {
    // Reset game state
    gameOver = false;
    score = 0;
    direction = 'right';
    moveDelay = 150;
    
    // Clear snake
    for (let segment of snake) {
        segment.destroy();
    }
    
    // Recreate snake
    snake = [];
    const startX = Math.floor(tileCount / 2) * gridSize;
    const startY = Math.floor(tileCount / 2) * gridSize;
    
    for (let i = 0; i < 3; i++) {
        const segment = this.add.rectangle(startX - i * gridSize, startY, gridSize, gridSize, 0x00ff00);
        snake.push(segment);
    }
    
    // Reset UI
    scoreText.setText('Score: 0');
    gameOverText.setVisible(false);
    restartText.setVisible(false);
    
    // Place new food
    placeFood.call(this);
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Initialize game
const game = new Phaser.Game(config);