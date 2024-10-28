const aboutDialog = document.getElementById("about-dialog");
const settingsDialog = document.getElementById("settings-dialog");
const settingsForm = settingsDialog.querySelector("form");
const settingsOkBtn = document.getElementById("settings-ok-btn");
const settingsCancelBtn = document.getElementById("settings-cancel-btn");
const mineSweeperContainer = document.getElementById("mine-sweeper-container");
const gameMenuGame = document.getElementById('game-menu-game');
const gameMenuAbout = document.getElementById('game-menu-about');
const aboutOkBtn = document.getElementById("about-ok-btn");
const scoreBoardElement = document.getElementById('score-board');
const gameMinesLeft = document.getElementById('game-mines-left');
const gameTime = document.getElementById('game-time');
const gameGridElement = document.getElementById('game-grid');
const gameStartButtonElement = document.getElementById('game-start-button');
const gameGrid = document.getElementById('game-grid');
const gameMessage = document.getElementById('game-message');
const gameMessageText = document.getElementById('game-message-text');
const gameMessageEmoji = document.getElementById('game-message-emoji');
const gameMessageButton = document.getElementById('game-message-button');

gameMenuGame.addEventListener('click', settingsMenu);
gameMenuAbout.addEventListener('click', aboutMenu);
gameStartButtonElement.addEventListener('click', resetGame);
gameMessageButton.addEventListener('click', closeGameMessage);

const adjacentMinesColor = ["#0000FF", "#008000", "#FF0000", "#A50923", "#b86ceb", "#eb6cb4", "#fcbd86", "#f3f797"];
let CELLS_ROW = 8;
let CELLS_COL = 8;
let MINES = 10;

let revealedCells = 0;
let minesLeft = MINES;
let gameState = 'stopped';
let boardSize = 'small';
let scaleFactor = 1;

const cell = {
    column: 0,
    row: 0,
    adjacentMines: 0,
    hasMine: false,
    isRevealed: false,
    isMarked: false,
    element: null
}

let gameCells = [];


/* Timer functions */

let intervalId = null;

function startGameTimer() {
    let time = 0;
    if (!intervalId) {
        intervalId = setInterval(() => {
            time++;
            gameTime.innerText = time;
        }, 1000);
    }
    console.log('Game timer running');
}

/* Shared functions */

function stopGameTimer() {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Game timer stopped');
}

function minesCleared() {
    return revealedCells >= CELLS_ROW * CELLS_COL - MINES;
}

function forEachAdjacentCell(cell, callback) {
    const fromRow = Math.max(cell.row - 1, 0);
    const toRow = Math.min(cell.row + 1, CELLS_ROW - 1);
    const fromColumn = Math.max(cell.column - 1, 0);
    const toColumn = Math.min(cell.column + 1, CELLS_COL - 1);
    for (let i = fromRow; i <= toRow; i++) {
        for (let j = fromColumn; j <= toColumn; j++) {
            callback(gameCells[i][j]);
        }
    }
}

/* Settings Menu */

function settingsMenu() {
    settingsDialog.showModal();
}

settingsDialog.addEventListener("close", (event) => {
    settingsDialog.close();

    if (settingsDialog.returnValue === "cancel") {
        return;
    }

    boardSize = settingsDialog.returnValue;

    // Stop the current game (using the old CELLS_ROW and CELLS_COL values)
    stopGame();

    // Delete the current game board (using the old CELLS_ROW and CELLS_COL values)
    deleteBoard();

    switch (boardSize) {
        case "small":
            CELLS_ROW = 8;
            CELLS_COL = 8;
            MINES = Math.floor(CELLS_ROW*CELLS_COL*0.16);
            break;
        case "medium":
            CELLS_ROW = 16;
            CELLS_COL = 16;
            MINES  = Math.floor(CELLS_ROW*CELLS_COL*0.18);
            break;
        case "large":
            CELLS_ROW = 24;
            CELLS_COL = 24;
            MINES  = Math.floor(CELLS_ROW*CELLS_COL*0.21);
            break;
        default:
            scaleFactor = 1;
            CELLS_ROW = 8;
            CELLS_COL = 8;
            MINES = Math.floor(CELLS_ROW*CELLS_COL*0.16);
            break;
    }

    // Resize the grid element fontSize with scaleFactor
    scaleFactor = CELLS_ROW/8;

    // Resize the game grid
    gameGridElement.style.gridTemplateColumns = `repeat(${CELLS_COL}, 1fr)`;
    gameGridElement.style.gridTemplateRows = `repeat(${CELLS_ROW}, 1fr)`;

    // Re-create the game board (using the new CELLS_ROW and CELLS_COL values)
    createBoard(); 
});

settingsOkBtn.addEventListener("click", (event) => {
    event.preventDefault(); // We don't want to submit this form
    const data = new FormData(settingsForm);
    settingsDialog.close(data.get("board-size"));
});

settingsCancelBtn.addEventListener("click", (event) => {
    event.preventDefault();
    settingsDialog.close("cancel");
});

/* About Menu */

function aboutMenu() {
    aboutDialog.showModal();
}

aboutDialog.addEventListener("close", (event) => {
    aboutDialog.close("default");
})

aboutOkBtn.addEventListener("click", (event) => {
    aboutDialog.close();
});

/* Create Game */

createBoard();

function createBoard() {
    createBoardArray();
    createGameGrid();
}

function deleteBoard() {
    deleteGameGrid()
    deleteBoardArray();
} 

function createBoardArray() {
    // Creating a two-dimensional array
    gameCells = [];
    for (let row = 0; row < CELLS_ROW; row++) {
        gameCells[row] = [];
        for (let column = 0; column < CELLS_COL; column++) {
            gameCells[row][column] = {
                column: column,
                row: row,
                adjacentMines: 0,
                hasMine: false,
                isRevealed: false,
                isMarked: false,
                isEmpty: true,
                element: null
            };
        }
    }
}

function deleteBoardArray() {
    for (let row = 0; row < gameCells.length; row++) {
        gameCells[row].splice(0, gameCells[row].length);
    }
    gameCells.splice(0, gameCells.length);
}

function createGameGrid() {
    for (let row = 0; row < CELLS_ROW; row++) {
        for (let column = 0; column < CELLS_COL; column++) {
            const cell = gameCells[row][column];
            cell.element = createCellElement(cell);
        }
    }
}

function deleteGameGrid() {
    for (let row = 0; row < CELLS_ROW; row++) {
        for (let column = 0; column < CELLS_COL; column++) {
            const cell = gameCells[row][column];
            gameGridElement.removeChild(cell.element);
            delete cell.element;
        }
    }
}

function createCellElement(cell) {
    const cellElement = document.createElement('div');
    const fontSize = 2.5 / scaleFactor;
    cell.element = cellElement;
    cellElement.dataset.row = cell.row;
    cellElement.dataset.column = cell.column;
    cellElement.classList.add('cell');
    cellElement.style.fontSize = `${fontSize}rem`;
    cellElement.style.height = `${fontSize + 0.5}rem`;
    cellElement.style.width = `${fontSize + 0.5}rem`;
    gameGridElement.appendChild(cellElement);
    return cellElement;
}

/* Start Game */

function resetGame() {
    stopGame();
    resetGameGrid();
    resetGameCounters();
    generateGameGrid();
    clearGameBoard();

    gameStartButtonElement.innerText = '🙂';
    gameGrid.addEventListener('click', handleCellLeftClick);
    gameGrid.addEventListener('contextmenu', handleCellRightClick);
    gameState = 'stopped';
}


function resetGameGrid() {
    for (let row = 0; row < CELLS_ROW; row++) {
        for (let column = 0; column < CELLS_COL; column++) {
            const cell = gameCells[row][column];
            cell.adjacentMines = 0;
            cell.hasMine = false;
            cell.isRevealed = false;
            cell.isMarked = false;
            cell.isEmpty = true;
        }
    }
    resetGameCounters();
}

function resetGameCounters() {
    revealedCells = 0;
    minesLeft = MINES;
    gameMinesLeft.innerText = minesLeft;
    gameTime.innerText = '0';
}

function generateGameGrid() {
    let mines = MINES;
    while (mines > 0) {
        const row = Math.floor(Math.random() * CELLS_ROW);
        const column = Math.floor(Math.random() * CELLS_COL);
        const cell = gameCells[row][column];
        if (!cell.hasMine) {
            cell.hasMine = true;
            cell.isEmpty = false;
            forEachAdjacentCell(cell, incrementAdjacentMines);
            mines--;
        }
    }
}

function incrementAdjacentMines(cell) {
    cell.adjacentMines++;
    cell.isEmpty = false;
}

function clearGameBoard() {
    for (let row = 0; row < CELLS_ROW; row++) {
        for (let column = 0; column < CELLS_COL; column++) {
            const cell = gameCells[row][column];
            cell.element.innerText = "";
            cell.element.style.backgroundColor = "#C1C2C2";
        }
    }
}

/* Handle Game Events */

function startGame() {
    startGameTimer();
    gameStartButtonElement.innerText = '😀';
    gameState = 'running';
}

function handleCellLeftClick(event) {
    event.preventDefault();

    (gameState === 'stopped') ? startGame(): null;

    if(event.target !== gameGrid) {
        const cell = gameCells[event.target.dataset.row][event.target.dataset.column];
        cell.isRevealed = true;
        revealCell(cell);
        console.log(`Cell [${cell.row}, ${cell.column}] left clicked`);
    }
}

function handleCellRightClick(event) {
    event.preventDefault();

    (gameState === 'stopped') ? startGame(): null;

    if(event.target !== gameGrid) {
        const cell = gameCells[event.target.dataset.row][event.target.dataset.column];
        if(!cell.isRevealed) {
            cell.isMarked = !cell.isMarked;
            if(cell.isMarked) {
                cell.element.innerText = "🚩"
                minesLeft--;
            } else {
                cell.element.innerText = ""
                minesLeft++;
            }
            if(minesLeft>=0) gameMinesLeft.innerText = minesLeft;
        }

        console.log(`Cell [${cell.row}, ${cell.column}] right clicked`);
    }
}

function revealCell(cell) {
    cell.element.style.backgroundColor = "#dacfbf";
    cell.isRevealed = true;
    revealedCells++;
    // Clean marker if marked
    if(cell.isMarked) {
        cell.isMarked = false;
        minesLeft++;
        if(minesLeft>=0) gameMinesLeft.innerText = minesLeft;
    }

    // Reveal cell content
    if (cell.hasMine) {
        cell.element.innerText = "💣";
        cell.element.style.backgroundColor = "red";
        gameOver();
    } else if(cell.adjacentMines > 0) {
        cell.element.innerText = cell.adjacentMines;
        cell.element.style.color = adjacentMinesColor[cell.adjacentMines - 1];
    } else if (cell.isEmpty) {  
        cell.element.innerText = "";
        forEachAdjacentCell(cell, revealAdjacentCells);
    }

    if (minesCleared()) {
        gameWin();
    }
}

function revealAdjacentCells(cell) {
    if(!cell.isRevealed && cell.isEmpty) {
        revealCell(cell);
    }
}

function stopGame() {
    stopGameTimer();
    gameGrid.removeEventListener('click', handleCellLeftClick);
    gameGrid.removeEventListener('contextmenu', handleCellRightClick);
    gameState = 'stopped';
}

function gameOver() {
    console.log('Game over!');
    stopGame();
    revealMines();
    gameStartButtonElement.innerText = '😟';
    gameMessageText.color = 'red';
    gameMessageText.innerText = 'Game Over!';
    gameMessageEmoji.innerText = '😟';
    gameMessage.classList.toggle("collapsed");
}

function gameWin() {
    console.log('You win!!!');
    stopGame();
    gameStartButtonElement.innerText = '😀';
    gameMessageText.color = 'green';
    gameMessageText.innerText = 'You win!!!';
    gameMessageEmoji.innerText = '😀';
    gameMessage.classList.toggle("collapsed");
}

function revealMines() {
    gameCells.forEach(row => {  
        row.forEach(cell => {
            if(cell.hasMine) {
                cell.element.innerText = "💣";
            }
        });
    });
}

function closeGameMessage() {
    gameMessage.classList.toggle("collapsed");
}
