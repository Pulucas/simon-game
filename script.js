const square = {
  1: { element: document.getElementById("1"), eventListenerTappingAnimation: false, eventListenerRecordUserInput: false },
  2: { element: document.getElementById("2"), eventListenerTappingAnimation: false, eventListenerRecordUserInput: false },
  3: { element: document.getElementById("3"), eventListenerTappingAnimation: false, eventListenerRecordUserInput: false },
  4: { element: document.getElementById("4"), eventListenerTappingAnimation: false, eventListenerRecordUserInput: false },
}

const gameState = {
  sequence: [],
  buttonPressCount: 0,
}

async function main() {
  // add 1 rng to sequence
  gameState.sequence.push(1);
  gameState.sequence.push(2);
  gameState.sequence.push(3);
  gameState.sequence.push(4);

  // highlight the squares
  await highlightSquares(gameState.sequence);

  // let the user tap the squares
  // toggleTapping();

  // record the user's inputs
  // end game immediately if user gets one wrong button press
  // toggleRecordUserInputs();

  // if user completed sequence completely, restart this function
};

function addListenerRecordUserInput(e) {
  if (e.target.id === gameState.sequence[gameState.buttonPressCount].toString()) {
    console.log("correct")
    gameState.buttonPressCount += 1
  } else {
    console.log("game over")
    gameState.buttonPressCount = 0;
    toggleTapping();
    toggleRecordUserInputs();
  }
}
function toggleRecordUserInputs() {
  for (let i = 1; i <= 4; i++) { // goes through all squares
    if (square[i].eventListenerRecordUserInput === false) {
      square[i].element.addEventListener("touchstart", addListenerRecordUserInput);
      square[i].element.addEventListener("mousedown", addListenerRecordUserInput);
      square[i].eventListenerRecordUserInput = true;
      console.log("added listeners")
    } else {
      square[i].element.removeEventListener("touchstart", addListenerRecordUserInput);
      square[i].element.removeEventListener("mousedown", addListenerRecordUserInput);
      square[i].eventListenerRecordUserInput = false;
      console.log("removed listeners")
    }
  }
}

function addListenerTappingAnimation(e) { e.target.classList.add("highlight"); };
function removeListenerTappingAnimation(e) { e.target.classList.remove("highlight"); };
function toggleTapping() {
  for (let i = 1; i <= 4; i++) { // goes through all squares
    if (square[i].eventListener === false) { // if there's no event listener for a given square
      // adds a highlight to the square when clicked
      square[i].element.addEventListener("touchstart", addListenerTappingAnimation);
      square[i].element.addEventListener("touchend", removeListenerTappingAnimation);
      square[i].element.addEventListener("mousedown", addListenerTappingAnimation);
      square[i].element.addEventListener("mouseup", removeListenerTappingAnimation);
      square[i].eventListener = true;
    } else {
      // removes event listener
      square[i].element.removeEventListener("touchstart", addListenerTappingAnimation);
      square[i].element.removeEventListener("touchend", removeListenerTappingAnimation);
      square[i].element.removeEventListener("mousedown", addListenerTappingAnimation);
      square[i].element.removeEventListener("mouseup", removeListenerTappingAnimation);
      square[i].eventListener = false;
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

main();