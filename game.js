const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Full screen setup
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load images
const playerImg = new Image();
playerImg.src = 'player.png';

const enemyImg = new Image();
enemyImg.src = 'enemy.png';

const bulletImg = new Image();
bulletImg.src = 'playerbulletcomplete.png';

const titleImg = new Image();
titleImg.src = 'GameTextComplete.png';


// Game variables
let player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 80,
  width: 50,
  height: 50,
  speed: 6
};

let score = 0;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let enemyDirection = 1;
let enemySpeed = 0.5;
let enemyMoveCounter = 0;

let phase = 1;
let powerUp = false;
let keys = {};
let timeLeft = 40;
let gameOver = false;

// Controls
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

document.addEventListener('keydown', e => {
  if (e.key === ' ') {
    bullets.push({
      x: player.x + player.width / 2 - 6,
      y: player.y,
      width: 12,
      height: 24
    });
  }

  if (e.key === 'Enter' && gameOver) {
    resetGame();
  }
});


// Timer
setInterval(() => {
  if (!gameOver) {
    timeLeft--;
    if (timeLeft <= 0) {
      gameOver = true;
    }
  }
}, 1000);

// Enemy spawn
function spawnEnemies() {
  enemies = [];
  let count = 5 + (phase - 1) * 2;
  const totalWidth = count * 60;
  const startX = canvas.width / 2 - totalWidth / 2;

  for (let i = 0; i < count; i++) {
    enemies.push({
      x: startX + i * 60,
      y: 140,
      width: 40,
      height: 40
    });
  }
}

// Enemy shooting
setInterval(() => {
  if (enemies.length > 0 && !gameOver) {
    let randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    enemyBullets.push({
      x: randomEnemy.x + randomEnemy.width / 2 - 2,
      y: randomEnemy.y + randomEnemy.height,
      width: 4,
      height: 10
    });
  }
}, 1200);

function update() {
  if (gameOver) return;

  // Player movement
  if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;

  // Player bullets
  bullets.forEach(b => b.y -= 8);
  bullets = bullets.filter(b => b.y > 0);

  // Enemy bullets
  enemyBullets.forEach(b => b.y += 4);
  enemyBullets = enemyBullets.filter(b => b.y < canvas.height);

  // Collisions (player bullets → enemies)
  // Collisions (player bullets → enemies)
bullets.forEach((b, bi) => {
  enemies.forEach((e, ei) => {
    if (
      b.x < e.x + e.width &&
      b.x + b.width > e.x &&
      b.y < e.y + e.height &&
      b.y + b.height > e.y
    ) {
      enemies.splice(ei, 1);
      bullets.splice(bi, 1);
      score += 5; // ⭐ Add score
    }
  });
});


  // Collisions (enemy bullets → player)
  enemyBullets.forEach(b => {
    if (b.x < player.x + player.width &&
        b.x + b.width > player.x &&
        b.y < player.y + player.height &&
        b.y + b.height > player.y) {
      gameOver = true;
    }
  });

  // Phase complete
  if (enemies.length === 0) {
    phase++;
    if (phase <= 5) {
      player.speed += 1;
      timeLeft = 30;
      spawnEnemies();
    } else {
      gameOver = true;
    }
  }

  // Enemy movement
  enemyMoveCounter += enemySpeed;
  if (enemyMoveCounter > 30) {
    enemies.forEach(e => {
      e.x += enemyDirection * 10;
    });
    enemyMoveCounter = 0;

    let changeDir = enemies.some(e => e.x <= 0 || e.x + e.width >= canvas.width);
    if (changeDir) {
      enemyDirection *= -1;
      enemies.forEach(e => e.y += 20);
    }
  }
}

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawEnemies() {
  enemies.forEach(e => {
    ctx.drawImage(enemyImg, e.x, e.y, e.width, e.height);
  });
}

function drawBullets() {
  // Draw player bullets using image
  bullets.forEach(b => {
    ctx.drawImage(bulletImg, b.x, b.y, b.width, b.height);
  });

  // Draw enemy bullets as red rectangles
  ctx.fillStyle = 'red';
  enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function drawUI() {
  // === Game Title Image (Top Center) ===
  ctx.drawImage(titleImg, canvas.width / 2 - 150, 10, 300, 80);

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Time: ${timeLeft}s`, 20, 30);

  // === Wave Counter Box (Top Right) ===
  const boxWidth = 140;
  const boxHeight = 40;
  const boxX = canvas.width - boxWidth - 20;
  const boxY = 20;

  // Outer box
  ctx.fillStyle = '#f1c40f'; // Golden yellow
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  // Inner dark background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(boxX + 4, boxY + 4, boxWidth - 8, boxHeight - 8);

  // Wave Text
  ctx.fillStyle = '#f1c40f';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`WAVE ${Math.min(phase, 5)}`, boxX + boxWidth / 2, boxY + 26);

  // === Score Box Under Wave Box ===
  const scoreBoxY = boxY + boxHeight + 10;

  ctx.fillStyle = '#00ffff'; // Cyan border
  ctx.fillRect(boxX, scoreBoxY, boxWidth, boxHeight);

  ctx.fillStyle = '#000000'; // Inner black
  ctx.fillRect(boxX + 4, scoreBoxY + 4, boxWidth - 8, boxHeight - 8);

  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText(`SCORE: ${score}`, boxX + boxWidth / 2, scoreBoxY + 26);

  // === Game Over ===
  // === Game Over ===
if (gameOver) {
  ctx.fillStyle = 'red';
  ctx.font = '40px Arial';
  ctx.textAlign = 'center'; // center horizontally
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = 'yellow';
  ctx.font = '20px Arial';
  ctx.fillText("Press ENTER to restart", canvas.width / 2, canvas.height / 2 + 40);

  ctx.textAlign = 'left'; // reset after
}


}

  

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  drawPlayer();
  drawEnemies();
  drawBullets();
  drawUI();
  requestAnimationFrame(loop);
}

spawnEnemies();
loop();

function resetGame() {
  score = 0;
  bullets = [];
  enemyBullets = [];
  enemies = [];
  enemyDirection = 1;
  enemyMoveCounter = 0;
  player.x = canvas.width / 2 - 25;
  player.speed = 6;
  phase = 1;
  timeLeft = 40;
  gameOver = false;
  spawnEnemies();
}

