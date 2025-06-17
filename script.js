const square = {
  1: { element: document.getElementById("1") },
  2: { element: document.getElementById("2") },
  3: { element: document.getElementById("3") },
  4: { element: document.getElementById("4") },
}

const gameState = {
  sequence: [],
  buttonPressCount: 0,
  isMobile: !!('ontouchstart' in window || navigator.maxTouchPoints > 0), // checks if on mobile, turns result into boolean value
}

function startScreen() {
  
}

async function main() {
  // add 1 rng to sequence
  gameState.sequence.push(RNG());

  // highlight the squares
  await highlightSquares(gameState.sequence);

  // let the user tap the squares
  toggleTapping(true);

  // record the user's inputs
  // end game immediately if user gets one wrong button press
  const roundWin = await waitForUserSequence();
  console.log(roundWin);

  // stop the user from tapping the squares (highlights)
  toggleTapping(false);

  // reset all variables that need to be reset to make game playable for next round
  gameState.buttonPressCount = 0;

  // if user completed sequence completely, restart this function, else pull up some game over screen
  // if the user has reached level 20, give confetti and pull up some winner screen
  if (!roundWin) {
    showGameOverScreen();
    return;
  }

  if (gameState.sequence.length === 10) {
    showWinScreen();
    return;
  }

  main();
};

function showWinScreen() {
  console.log("Game Win");
}

function showGameOverScreen() {
  console.log("Game Lose");
}

async function waitForUserSequence() {
  const roundWin = await new Promise((res) => {
    toggleRecordUserInputs(true, res);
  });
  toggleRecordUserInputs(false, null);
  return roundWin;
}

function addListenerRecordUserInput(e, resolve) {
  if (e.target.id === gameState.sequence[gameState.buttonPressCount].toString()) {
    console.log("correct");
    gameState.buttonPressCount += 1;
    if (gameState.buttonPressCount === gameState.sequence.length) resolve(true); // finish round when we've gone through all sequences
  } else {
    console.log("incorrect");
    resolve(false);
  }
}
async function toggleRecordUserInputs(toggleOn, resolve) {
  const eventType = gameState.isMobile ? "touchend" : "mouseup";
  for (let i = 1; i <= 4; i++) { // goes through all squares
    if (toggleOn) {
      square[i].recordHandler = function(e) {
        addListenerRecordUserInput(e, resolve);
      }
      square[i].element.addEventListener(eventType, square[i].recordHandler);
      console.log("added click listeners");
    } else {
      
      square[i].element.removeEventListener(eventType, square[i].recordHandler);
      square[i].recordHandler = null;
      console.log("removed click listeners");
    }
  }
}

function highlightSquare(e) { e.target.classList.add("highlight"); };
function unhighlightSquare(e) { e.target.classList.remove("highlight"); };
function toggleTapping(toggleOn) {
  const eventTypeClick = gameState.isMobile ? "touchstart" : "mousedown";
  const eventTypeUnclick = gameState.isMobile ? "touchend" : "mouseup";
  for (let i = 1; i <= 4; i++) { // goes through all squares
    if (toggleOn) { // if there's no event listener for a given square
      // adds a highlight to the square when clicked
      square[i].element.addEventListener(eventTypeClick, highlightSquare);
      square[i].element.addEventListener(eventTypeUnclick, unhighlightSquare);
      console.log("added highligh listeners");
    } else {
      // removes event listener
      square[i].element.removeEventListener(eventTypeClick, highlightSquare);
      square[i].element.removeEventListener(eventTypeUnclick, unhighlightSquare);
      console.log("removed highligh listeners");
    }
  }
}

async function highlightSquares(squaresArr) {
  for (const i of squaresArr) {
    await new Promise((res) => { setTimeout(res, 550) });
    square[i].element.classList.add("highlight");
    await new Promise((res) => { setTimeout(res, 300) });
    square[i].element.classList.remove("highlight");
  }
  return;
}

function RNG() {
  return Math.ceil(Math.random() * 4);
}

startScreen();