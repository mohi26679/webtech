let player = document.getElementById("player");
let thief = document.getElementById("thief");
let gameArea = document.getElementById("gameArea");

let score = 0, life = 20, isJumping = false, gameActive = false, isInvincible = false;
let playerX = 50, thiefX = 600;
let obstacles = [];

// High Score Load
let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = highScore;

function startGame() {
  if (gameActive) return;
  gameActive = true;
  document.getElementById("gameSection").style.display = "block";
  document.getElementById("startBtn").style.display = "none";
  gameArea.style.animationPlayState = "running";
  
  gameLoop();
  spawnObstacles();
}

// কন্ট্রোল ফাংশন
function doJump() {
  if (!isJumping && gameActive) {
    isJumping = true;
    let pos = 0;
    let up = setInterval(() => {
      if (pos >= 120) {
        clearInterval(up);
        let down = setInterval(() => {
          if (pos <= 0) { clearInterval(down); isJumping = false; }
          pos -= 5;
          player.style.bottom = (20 + pos) + "px";
        }, 20);
      }
      pos += 5;
      player.style.bottom = (20 + pos) + "px";
    }, 20);
  }
}

function move(dir) {
  if (!gameActive) return;
  if (dir === "left" && playerX > 10) playerX -= 25;
  if (dir === "right" && playerX < 700) playerX += 25;
  player.style.left = playerX + "px";
}

// ইভেন্ট লিসেনার (Keyboard & Mobile)
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === " ") doJump();
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
});

document.getElementById("btnJump").onclick = doJump;
document.getElementById("btnLeft").onclick = () => move("left");
document.getElementById("btnRight").onclick = () => move("right");

function spawnObstacles() {
  setInterval(() => {
    if (!gameActive) return;
    let obs = document.createElement("div");
    obs.className = "obstacle";
    obs.style.left = "850px";
    gameArea.appendChild(obs);
    obstacles.push(obs);
  }, 2500);
}

function gameLoop() {
  let loop = setInterval(() => {
    if (!gameActive) { clearInterval(loop); return; }

    // চোর একটু সামনে এগিয়ে যাবে
    thiefX += 0.5;
    thief.style.left = thiefX + "px";

    // বাধা মুভমেন্ট
    obstacles.forEach((obs, index) => {
      let ox = parseInt(obs.style.left);
      obs.style.left = (ox - 6) + "px";

      if (ox < -30) { obs.remove(); obstacles.splice(index, 1); score += 5; }

      // প্লেয়ারের সাথে বাধার ধাক্কা
      if (checkCollision(player, obs) && !isInvincible) {
        life--;
        updateStats();
        triggerInvincibility();
        obs.remove();
        playerX = Math.max(10, playerX - 40); // ধাক্কা খেলে পিছিয়ে যাবে
      }
    });

    // চোর ধরার চেক
    if (checkCollision(player, thief)) {
       endGame("🏆 Success! Thief Caught.");
    }

    if (life <= 0) endGame("❌ Failed! Thief Escaped.");
    updateStats();
  }, 30);
}

function checkCollision(a, b) {
  let aR = a.getBoundingClientRect();
  let bR = b.getBoundingClientRect();
  return !(aR.right < bR.left || aR.left > bR.right || aR.bottom < bR.top || aR.top > bR.bottom);
}

function triggerInvincibility() {
  isInvincible = true;
  player.classList.add("invincible");
  setTimeout(() => {
    isInvincible = false;
    player.classList.remove("invincible");
  }, 1000);
}

function updateStats() {
  document.getElementById("score").innerText = score;
  document.getElementById("life").innerText = life;
}

function endGame(msg) {
  gameActive = false;
  gameArea.style.animationPlayState = "paused";
  if (score > highScore) localStorage.setItem("highScore", score);
  alert(msg + "\nFinal Score: " + score);
  location.reload();
}