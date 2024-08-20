const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const menuElement = document.getElementById('menu');
const aboutPageElement = document.getElementById('about-page');
const newGameButton = document.getElementById('new-game');
const continueGameButton = document.getElementById('continue-game');
const aboutButton = document.getElementById('about');
const backToMenuButton = document.getElementById('back-to-menu');

const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let score = 0;
let level = 1;
let currentPiece;
let currentX;
let currentY;
let gameInterval;
let isGamePaused = false;
let isGameOver = false;

const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];
const shapes = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
];

function createPiece() {
    const shapeIndex = Math.floor(Math.random() * shapes.length);
    const colorIndex = Math.floor(Math.random() * colors.length);
    return { shape: shapes[shapeIndex], color: colors[colorIndex] };
}

function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                ctx.fillStyle = colors[board[y][x] - 1];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#000';
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece() {
    ctx.fillStyle = currentPiece.color;
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                ctx.fillRect((currentX + x) * BLOCK_SIZE, (currentY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#000';
                ctx.strokeRect((currentX + x) * BLOCK_SIZE, (currentY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function isValidMove(pieceShape, pieceX, pieceY) {
    for (let y = 0; y < pieceShape.length; y++) {
        for (let x = 0; x < pieceShape[y].length; x++) {
            if (pieceShape[y][x]) {
                if (pieceX + x < 0 || pieceX + x >= BOARD_WIDTH || pieceY + y >= BOARD_HEIGHT) {
                    return false;
                }
                if (pieceY + y >= 0 && board[pieceY + y][pieceX + x]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function rotatePiece() {
    const rotated = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse());
    if (isValidMove(rotated, currentX, currentY)) {
        currentPiece.shape = rotated;
        playSound('rotate');
    }
}

function movePiece(dx, dy) {
    if (isValidMove(currentPiece.shape, currentX + dx, currentY + dy)) {
        currentX += dx;
        currentY += dy;
        if (dx !== 0) playSound('move');
        return true;
    }
    return false;
}

function mergePiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                board[currentY + y][currentX + x] = colors.indexOf(currentPiece.color) + 1;
            }
        }
    }
}

function checkLines() {
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * linesCleared * 100;
        scoreElement.textContent = `Score: ${score}`;
        level = Math.floor(score / 1000) + 1;
        levelElement.textContent = `Level: ${level}`;
        playSound('clear');
    }
}

function gameLoop() {
    if (!movePiece(0, 1)) {
        mergePiece();
        checkLines();
        currentPiece = createPiece();
        currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
        currentY = 0;

        if (!isValidMove(currentPiece.shape, currentX, currentY)) {
            gameOver();
            return;
        }
        playSound('drop');
    }

    drawBoard();
    drawPiece();
}

function startGame() {
    resetGame();
    gameInterval = setInterval(() => {
        if (!isGamePaused) {
            gameLoop();
        }
    }, 1000 / level);
    menuElement.style.display = 'none';
}

function pauseGame() {
    isGamePaused = true;
    menuElement.style.display = 'block';
    continueGameButton.style.display = 'block';
}

function continueGame() {
    isGamePaused = false;
    menuElement.style.display = 'none';
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    playSound('game-over');
    menuElement.style.display = 'block';
    continueGameButton.style.display = 'none';
}

function resetGame() {
    clearInterval(gameInterval);
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    level = 1;
    isGamePaused = false;
    isGameOver = false;
    scoreElement.textContent = `Score: ${score}`;
    levelElement.textContent = `Level: ${level}`;
    currentPiece = createPiece();
    currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;
}

function playSound(soundName) {
    const audio = new Audio(`sounds/${soundName}.mp3`);
    audio.play();
}

document.addEventListener('keydown', (e) => {
    if (!isGamePaused && !isGameOver) {
        switch (e.key) {
            case 'ArrowLeft':
                movePiece(-1, 0);
                break;
            case 'ArrowRight':
                movePiece(1, 0);
                break;
            case 'ArrowDown':
                movePiece(0, 1);
                break;
            case 'ArrowUp':
                rotatePiece();
                break;
            case ' ':
                while (movePiece(0, 1)) {}
                break;
        }
        drawBoard();
        drawPiece();
    }

    if (e.key === 'Escape') {
        if (isGamePaused) {
            continueGame();
        } else {
            pauseGame();
        }
    }
});

// Pulsing effect
let pulseDirection = 1;
let pulseIntensity = 0;

function pulsePieces() {
    pulseIntensity += 0.05 * pulseDirection;
    if (pulseIntensity >= 1 || pulseIntensity <= 0) {
        pulseDirection *= -1;
    }

    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                const baseColor = colors[board[y][x] - 1];
                const pulsedColor = pulsateColor(baseColor, pulseIntensity);
                ctx.fillStyle = pulsedColor;
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#000';
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    if (!isGamePaused && !isGameOver) {
        requestAnimationFrame(pulsePieces);
    }
}

function pulsateColor(baseColor, intensity) {
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    const newR = Math.min(255, r + Math.floor(intensity * 50));
    const newG = Math.min(255, g + Math.floor(intensity * 50));
    const newB = Math.min(255, b + Math.floor(intensity * 50));

    return `rgb(${newR}, ${newG}, ${newB})`;
}

newGameButton.addEventListener('click', startGame);
continueGameButton.addEventListener('click', continueGame);
aboutButton.addEventListener('click', () => {
    menuElement.style.display = 'none';
    aboutPageElement.style.display = 'block';
});
backToMenuButton.addEventListener('click', () => {
    aboutPageElement.style.display = 'none';
    menuElement.style.display = 'block';
});

// Initial setup
drawBoard();
pulsePieces();