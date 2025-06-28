const screen = {
  square: {
    1: { element: document.getElementById("1") },
    2: { element: document.getElementById("2") },
    3: { element: document.getElementById("3") },
    4: { element: document.getElementById("4") },
  },
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
      message: document.getElementById("end-screen-message"),
      messageDesc: document.getElementById("end-screen-message-desc"),
      messageHighscore: document.getElementById("end-screen-message-highscore"),
      button: document.getElementById("end-screen-button"),
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
      const element = screen.logo.element.text;
      const newTextArr = element.innerText.split(" ");
      newTextArr[1] = roundNum.toString(); // update round number
      screen.logo.element.text.innerText = newTextArr.join(" ");
    }
  },
  audio: {
    context: new AudioContext,
    frequencies: {
      1: 165,
      2: 220,
      3: 277,
      4: 330,
    },
    activeOscillators: {
      1: undefined,
      2: undefined,
      3: undefined,
      4: undefined,
    },
    startSound: (color) => {
      const context = screen.audio.context;

      // make oscillator
      const oscillator = context.createOscillator();

      // configure oscillator
      oscillator.type = "triangle";
      oscillator.frequency.value = screen.audio.frequencies[color];
      oscillator.connect(context.destination);

      // play sound
      oscillator.start();

      // save current oscillator
      screen.audio.activeOscillators[color] = oscillator;
    },
    stopSound: (color) => {
      const oscillator = screen.audio.activeOscillators[color];
      oscillator.stop();
    },
  },
}

const gameState = {
  lengthBetweenHighlights: 300,
  sequence: [],
  buttonPressCount: 0,
  winLength: 20,
  highscore: 0, // may change in loadGame()
  isMobile: !!('ontouchstart' in window || navigator.maxTouchPoints > 0), // checks if on mobile, turns result into boolean value
}

function loadGame() {
  // change size of logo
  if (gameState.isMobile) {
    const logo = document.getElementsByClassName("logo");
    const logoUnder = document.getElementsByClassName("logo-under");

    logo[0].classList.add("mobile");
    logoUnder[0].classList.add("mobile");
  }

  // get previous highscore from localStorage
  const localHighscore = localStorage.getItem("highscore");
  if (localHighscore !== null) gameState.highscore = parseInt(localHighscore);
}

function startGame() {
  // present start screen
  screen.start.open();
  
  // wait until start button is pressed
  async function waitForButtonPress(event) {
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
  
  // if user failed to repeat the entire sequence in the right order, show game over screen
  if (!roundWin) {
    // if user got new highscore, update it
    if (gameState.sequence.length - 1 > gameState.highscore) setNewHighscore(gameState.sequence.length - 1);
    showGameOverScreen();
    return;
  }
  
  // if the user has reached level 20, give confetti and pull up winner screen
  if (gameState.sequence.length === gameState.winLength) {
    // if user got new highscore, update it
    if (gameState.sequence.length > gameState.highscore) setNewHighscore(gameState.winLength);
    showWinScreen();
    return;
  }
  
  // if user completed sequence completely, restart this function
  main();
};

function setNewHighscore(score) {
  console.log("Updated localStorage (highscore) to", score);
  gameState.highscore = score;
  localStorage.setItem("highscore", score);
}

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
  screen.end.element.messageDesc.innerText = `You lasted ${gameState.winLength} ${gameState.winLength === 1 ? "round" : "rounds"}.`;
  screen.end.element.messageHighscore.style.display = "none"; // hide highscore because it looks bad
  screen.end.element.button.innerText = "Go Again";
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
  screen.end.element.messageHighscore.innerText = `Your highscore is ${gameState.highscore}`;
  screen.end.element.messageHighscore.style.display = "unset";
  screen.end.element.button.innerText = "Try Again";
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
      screen.square[i].recordHandler = function(event) {
        addListenerRecordUserInput(event, resolve);
      }
      screen.square[i].element.addEventListener(eventType, screen.square[i].recordHandler);
      console.log("added click listeners");
    } else {
      
      screen.square[i].element.removeEventListener(eventType, screen.square[i].recordHandler);
      screen.square[i].recordHandler = null;
      console.log("removed click listeners");
    }
  }
}

function highlightSquare(event) { event.target.classList.add("highlight"); screen.audio.startSound(event.target.id); };
function unhighlightSquare(event) { event.target.classList.remove("highlight"); screen.audio.stopSound(event.target.id); };
function toggleTapping(toggleOn) {
  const eventTypeClick = gameState.isMobile ? "touchstart" : "mousedown";
  const eventTypeUnclick = gameState.isMobile ? "touchend" : "mouseup";
  for (let i = 1; i <= 4; i++) { // goes through all squares
    if (toggleOn) { // if there's no event listener for a given square
      // adds a highlight to the square when clicked
      screen.square[i].element.addEventListener(eventTypeClick, highlightSquare);
      screen.square[i].element.addEventListener(eventTypeUnclick, unhighlightSquare);
      console.log("added highligh listeners");
    } else {
      // removes event listener
      screen.square[i].element.removeEventListener(eventTypeClick, highlightSquare);
      screen.square[i].element.removeEventListener(eventTypeUnclick, unhighlightSquare);
      console.log("removed highligh listeners");
    }
  }
}

async function highlightSquares(squaresArr) {
  for (const i of squaresArr) {
    await new Promise((res) => { setTimeout(res, gameState.lengthBetweenHighlights + 100) });
    screen.square[i].element.classList.add("highlight");
    screen.audio.startSound(i);
    await new Promise((res) => { setTimeout(res, gameState.lengthBetweenHighlights) });
    screen.square[i].element.classList.remove("highlight");
    screen.audio.stopSound(i);
  }
  return;
}

function RNG() {
  return Math.ceil(Math.random() * 4);
}

loadGame(); // loads variables from game save
startGame(); // run the main game