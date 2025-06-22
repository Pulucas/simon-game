const screen = {
  start: {
    element: {
      box: document.getElementById("start-screen-box"),
      background: document.getElementById("start-screen-background"),
      button: document.getElementById("start-button"),
    },
    open: () => {
      screen.start.element.box.classList.add("show");
      screen.start.element.background.classList.add("show");
    },
    close: () => {
      screen.start.element.box.classList.remove("show");
      screen.start.element.background.classList.remove("show");
    },
  },
  end: {
    element: {
      box: document.getElementById("end-screen-box"),
      background: document.getElementById("end-screen-background"),
      button: document.getElementById("end-screen-button"),
      message: document.getElementById("end-screen-message"),
      messageDesc: document.getElementById("end-screen-message-desc"),
    },
    open: () => {
      screen.end.element.box.classList.add("show");
      screen.end.element.background.classList.add("show");
    },
    close: () => {
      screen.end.element.box.classList.remove("show");
      screen.end.element.background.classList.remove("show");
    },
  },
  logo: {
    element: {
      text: document.getElementById("logo-text"),
    },
    update: (roundNum) => {
      const text = screen.logo.element.text.innerHTML.split("<br>");
      text[text.length - 1] = roundNum.toString();
      screen.logo.element.text.innerHTML = text.join("<br>");
    }
  }
}
const endScreenMessage = document.getElementById("end-screen-message")
const square = {
  1: { element: document.getElementById("1") },
  2: { element: document.getElementById("2") },
  3: { element: document.getElementById("3") },
  4: { element: document.getElementById("4") },
}

const gameState = {
  sequence: [],
  buttonPressCount: 0,
  winLength: 20,
  isMobile: !!('ontouchstart' in window || navigator.maxTouchPoints > 0), // checks if on mobile, turns result into boolean value
}

function startGame() {
  // present start screen
  screen.start.open();

  // wait until start button is pressed
  function waitForButtonPress(event) {
    console.log("Starting Game");

    // hide start screen
    screen.start.close();

    // play the game
    main();

    // remove event listener
    console.log("removed event listener on start screen button");
    screen.start.element.button.removeEventListener('click', waitForButtonPress);
  }
  console.log("added event listener on start screen button");
  screen.start.element.button.addEventListener('click', waitForButtonPress);
}

async function main() {
  // add 1 rng to sequence
  gameState.sequence.push(RNG());

  // update level number
  screen.logo.update(gameState.sequence.length);

  // highlight the squares
  await highlightSquares(gameState.sequence);

  // let the user tap the squares
  toggleTapping(true);

  // record the user's inputs
  // end game immediately if user gets one wrong button press
  const roundWin = await waitForUserSequence();
  console.log("Won round:", roundWin);

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

  if (gameState.sequence.length === gameState.winLength) {
    showWinScreen();
    return;
  }

  main();
};

function resetGame() {
  gameState.buttonPressCount = 0;
  gameState.sequence = [];
}

function waitForButtonPress(event) {
  // hide end screen
  screen.end.close();

  // show the start screen
  startGame();

  // remove event listener
  console.log("removed event listener on end screen button");
  event.target.removeEventListener('click', waitForButtonPress);
}

function showWinScreen() {
  console.log("Game Win");
  
  // display end screen
  screen.end.element.message.innerText = "You Won!";
  screen.end.open();

  // reset all game variables
  resetGame();

  // button runs startGame function
  console.log("added event listener on end screen button");
  screen.end.element.button.addEventListener('click', waitForButtonPress);
}

function showGameOverScreen() {
  console.log("Game Lose");
  
  // display end screen
  screen.end.element.message.innerText = "Game Over!";
  screen.end.element.messageDesc.innerText = `You lasted ${gameState.sequence.length - 1} ${gameState.sequence.length - 1 === 1 ? "round" : "rounds"}.`;
  screen.end.open();

  // reset all game variables
  resetGame();

  // button runs startGame function
  console.log("added event listener on end screen button");
  screen.end.element.button.addEventListener('click', waitForButtonPress);
}

async function waitForUserSequence() {
  const roundWin = await new Promise((res) => {
    toggleRecordUserInputs(true, res);
  });
  toggleRecordUserInputs(false, null);
  return roundWin;
}

function addListenerRecordUserInput(event, resolve) {
  if (event.target.id === gameState.sequence[gameState.buttonPressCount].toString()) {
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
      square[i].recordHandler = function(event) {
        addListenerRecordUserInput(event, resolve);
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

function highlightSquare(event) { event.target.classList.add("highlight"); };
function unhighlightSquare(event) { event.target.classList.remove("highlight"); };
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

startGame();