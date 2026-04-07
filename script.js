const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const COLORS = {
  I: '#38bdf8',
  O: '#facc15',
  T: '#c084fc',
  S: '#4ade80',
  Z: '#f87171',
  J: '#60a5fa',
  L: '#fb923c',
};

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

const boardCanvas = document.getElementById('board');
const boardCtx = boardCanvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');

const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startBtn');

let board = createEmptyBoard();
let current = null;
let next = randomPiece();
let animationId = null;
let dropCounter = 0;
let dropInterval = 900;
let lastTime = 0;
let paused = false;
let gameOver = true;

const state = {
  score: 0,
  lines: 0,
  level: 1,
};

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece() {
  const types = Object.keys(SHAPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const shape = SHAPES[type].map((row) => [...row]);
  return {
    type,
    matrix: shape,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0,
  };
}

function rotate(matrix, direction = 1) {
  const transposed = matrix[0].map((_, i) => matrix.map((row) => row[i]));
  return direction === 1
    ? transposed.map((row) => row.reverse())
    : transposed.reverse();
}

function collide(piece, offsetX = 0, offsetY = 0, testMatrix = piece.matrix) {
  for (let y = 0; y < testMatrix.length; y += 1) {
    for (let x = 0; x < testMatrix[y].length; x += 1) {
      if (!testMatrix[y][x]) continue;
      const bx = piece.x + x + offsetX;
      const by = piece.y + y + offsetY;
      if (bx < 0 || bx >= COLS || by >= ROWS) return true;
      if (by >= 0 && board[by][bx]) return true;
    }
  }
  return false;
}

function merge(piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) return;
      const by = piece.y + y;
      if (by >= 0) board[by][piece.x + x] = piece.type;
    });
  });
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }

  if (cleared > 0) {
    const scoreByLines = [0, 100, 300, 500, 800];
    state.score += scoreByLines[cleared] * state.level;
    state.lines += cleared;
    state.level = Math.floor(state.lines / 10) + 1;
    dropInterval = Math.max(120, 900 - (state.level - 1) * 80);
    updateStats();
  }
}

function spawn() {
  current = next;
  current.x = Math.floor((COLS - current.matrix[0].length) / 2);
  current.y = 0;
  next = randomPiece();
  if (collide(current)) {
    endGame();
  }
}

function softDrop() {
  if (!current) return;
  if (!collide(current, 0, 1)) {
    current.y += 1;
    return;
  }
  merge(current);
  clearLines();
  spawn();
}

function hardDrop() {
  if (!current || gameOver || paused) return;
  while (!collide(current, 0, 1)) {
    current.y += 1;
    state.score += 2;
  }
  updateStats();
  softDrop();
}

function move(dir) {
  if (!current || gameOver || paused) return;
  if (!collide(current, dir, 0)) current.x += dir;
}

function rotateCurrent(direction) {
  if (!current || gameOver || paused) return;
  const rotated = rotate(current.matrix, direction);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(current, kick, 0, rotated)) {
      current.x += kick;
      current.matrix = rotated;
      break;
    }
  }
}

function drawCell(ctx, x, y, color, blockSize) {
  ctx.fillStyle = color;
  ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function drawBoard() {
  boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) drawCell(boardCtx, x, y, COLORS[cell], BLOCK);
    });
  });

  if (!current) return;
  current.matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) return;
      drawCell(boardCtx, current.x + x, current.y + y, COLORS[current.type], BLOCK);
    });
  });
}

function drawNext() {
  const size = 24;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const matrix = next.matrix;
  const offsetX = Math.floor((nextCanvas.width / size - matrix[0].length) / 2);
  const offsetY = Math.floor((nextCanvas.height / size - matrix.length) / 2);
  matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) return;
      drawCell(nextCtx, offsetX + x, offsetY + y, COLORS[next.type], size);
    });
  });
}

function updateStats() {
  scoreEl.textContent = state.score;
  linesEl.textContent = state.lines;
  levelEl.textContent = state.level;
}

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;

  if (!paused && !gameOver) {
    dropCounter += delta;
    if (dropCounter > dropInterval) {
      softDrop();
      dropCounter = 0;
    }
  }

  drawBoard();
  drawNext();
  animationId = requestAnimationFrame(update);
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  statusEl.textContent = paused ? '⏸️ 일시정지 중 (P로 재개)' : '게임 진행 중';
}

function endGame() {
  gameOver = true;
  statusEl.textContent = `💥 게임 오버! 최종 점수: ${state.score}`;
}

function startGame() {
  board = createEmptyBoard();
  current = null;
  next = randomPiece();
  state.score = 0;
  state.lines = 0;
  state.level = 1;
  dropInterval = 900;
  dropCounter = 0;
  paused = false;
  gameOver = false;
  updateStats();
  spawn();
  statusEl.textContent = '게임 진행 중';
}

startBtn.addEventListener('click', () => {
  startGame();
  if (!animationId) {
    animationId = requestAnimationFrame(update);
  }
});

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (key === 'p') {
    togglePause();
    return;
  }

  if (gameOver || paused) return;

  if (key === 'arrowleft') move(-1);
  else if (key === 'arrowright') move(1);
  else if (key === 'arrowdown') {
    state.score += 1;
    updateStats();
    softDrop();
  } else if (key === 'arrowup' || key === 'x') rotateCurrent(1);
  else if (key === 'z') rotateCurrent(-1);
  else if (key === ' ') {
    event.preventDefault();
    hardDrop();
  }
});

updateStats();
drawBoard();
drawNext();
