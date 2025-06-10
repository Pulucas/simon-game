const square = {
  1: { element: document.getElementById("1"), eventListener: false },
  2: { element: document.getElementById("2"), eventListener: false },
  3: { element: document.getElementById("3"), eventListener: false },
  4: { element: document.getElementById("4"), eventListener: false },
}

const gameState = {
  sequence: [],
}

async function main() {
  // add to sequence
  gameState.sequence.push(1);
  gameState.sequence.push(2);
  gameState.sequence.push(3);
  gameState.sequence.push(4);
  await highlightSquares(gameState.sequence);
  toggleTapping();
};

function addListener(e) { e.target.classList.add("highlight") };
function removeListener(e) { e.target.classList.remove("highlight") };

function toggleTapping() {
  for (let i = 1; i <= 4; i++) { // goes through all squares
    if (square[i].eventListener === false) { // if there's no event listener for a given square
      // adds a highlight to the square when clicked
      square[i].element.addEventListener("touchstart", addListener);
      square[i].element.addEventListener("touchend", removeListener);
      square[i].element.addEventListener("mousedown", addListener);
      square[i].element.addEventListener("mouseup", removeListener);
      square[i].eventListener = true;
    } else {
      // removes event listener
      square[i].element.removeEventListener("touchstart", addListener);
      square[i].element.removeEventListener("touchend", removeListener);
      square[i].element.removeEventListener("mousedown", addListener);
      square[i].element.removeEventListener("mouseup", removeListener);
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