const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
let highScore = 33; // 33 is worst (max pegs)
const highScoreElement = document.getElementById("highScore");

let board = [];
let selected = null;
let score = 0;
let firstClick = true;

// Generate a 7x7 board with pegs in cross shape
function initBoard() {
  document.getElementById("gameOverPopup").style.display = "none";
  document.getElementById("tutorialPopup").style.display = "none"; // hide tutorial too

  board = Array(7).fill(null).map(() => Array(7).fill(null));
  selected = null;
  score = 0;
  firstClick = true;

  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isCross = (
        (c >= 2 && c <= 4) || // vertical bar
        (r >= 2 && r <= 4)    // horizontal bar
      );
      board[r][c] = isCross ? 1 : null;
    }
  }

  renderBoard();
  updateScore();
  const storedHigh = parseInt(localStorage.getItem("highScore") || "33");
  updateHighScore(storedHigh);
}

function renderBoard() {
  boardElement.innerHTML = "";

  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] === null) {
        const spacer = document.createElement("div");
        spacer.style.visibility = "hidden"; // Maintain grid shape
        boardElement.appendChild(spacer);
        continue;
      }

      const peg = document.createElement("div");
      peg.classList.add("peg");

      if (board[r][c] === 1) {
        peg.addEventListener("click", () => onPegClick(r, c));
      } else if (board[r][c] === 0) {
        peg.classList.add("empty");
        peg.addEventListener("click", () => onEmptyClick(r, c));
      }

      if (selected && selected[0] === r && selected[1] === c) {
        peg.classList.add("selected");
      }

      boardElement.appendChild(peg);
    }
  }
}

function checkGameOver() {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] === 1) {
        const directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];
        for (const [dr, dc] of directions) {
          const nr = r + dr;
          const nc = c + dc;
          const mr = r + dr / 2;
          const mc = c + dc / 2;

          if (
            nr >= 0 && nr < 7 && nc >= 0 && nc < 7 &&
            board[nr][nc] === 0 && board[mr][mc] === 1
          ) {
            return false; // Valid move exists
          }
        }
      }
    }
  }

  const remainingPegs = countRemainingPegs();

  // Check and update high score
  const currentBest = parseInt(localStorage.getItem("highScore") || "33");
  if (remainingPegs < currentBest) {
    localStorage.setItem("highScore", remainingPegs.toString());
  }

  updateHighScore(remainingPegs); // ✅ FIXED: Call correct function

  let title = `You ended up with ${remainingPegs} peg${remainingPegs !== 1 ? 's' : ''}.`;
  let message = "";

  if (remainingPegs === 1) message = "Genius! 🧠";
  else if (remainingPegs === 2) message = "Very Smart! 💡";
  else if (remainingPegs === 3) message = "Smart! 🧠";
  else if (remainingPegs <= 5) message = "Above Average 🙂";
  else if (remainingPegs <= 8) message = "Average 😐";
  else message = "Keep Practicing 😅";

  showGameOverPopup(title, message);
  return true;
}

function countRemainingPegs() {
  let count = 0;
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] === 1) count++;
    }
  }
  return count;
}

function showGameOverPopup(title, message) {
  document.getElementById("popupTitle").innerText = title;
  document.getElementById("popupMessage").innerText = message;
  document.getElementById("gameOverPopup").style.display = "block";
}

function onPegClick(r, c) {
  if (firstClick) {
    board[r][c] = 0; // remove the peg
    firstClick = false;
    renderBoard();
    return;
  }

  selected = [r, c];
  renderBoard();
}

function onEmptyClick(r, c) {
  if (!selected) return;

  const [sr, sc] = selected;
  const dr = r - sr;
  const dc = c - sc;

  if (
    (Math.abs(dr) === 2 && dc === 0) ||
    (Math.abs(dc) === 2 && dr === 0)
  ) {
    const midR = sr + dr / 2;
    const midC = sc + dc / 2;

    if (board[midR][midC] === 1 && board[r][c] === 0) {
      board[sr][sc] = 0;
      board[midR][midC] = 0;
      board[r][c] = 1;

      score++;
      updateScore();
      checkGameOver(); // ✅ Ensure game over is checked
    }
  }

  selected = null;
  renderBoard();
}

function updateScore() {
  scoreElement.textContent = `Score: ${score}`;
}

function updateHighScore(pegsLeft) {
  if (pegsLeft < highScore) {
    highScore = pegsLeft;
  }
  const level = getLevelName(pegsLeft);
  highScoreElement.textContent = `🏅 Best: ${pegsLeft} pegs — ${level}`;
}

function getLevelName(pegsLeft) {
  if (pegsLeft === 1) return "You're a Genius!";
  if (pegsLeft === 2) return "Brilliant Brain!";
  if (pegsLeft <= 4) return "Above Average!";
  if (pegsLeft <= 8) return "You're Getting There!";
  return "Room for Improvement!";
}

function resetGame() {
  initBoard();
}

function showTutorial() {
  document.getElementById("tutorial").style.display = "block";
}
document.getElementById("tutorialBtn").addEventListener("click", () => {
  document.getElementById("tutorialPopup").style.display = "flex";
});

function hideTutorial() {
  document.getElementById("tutorialPopup").style.display = "none";
}

// Initialize the game
initBoard();
