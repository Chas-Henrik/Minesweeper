const scoreBoardElement = document.getElementById('score-board');
const gameMinesLeft = document.getElementById('game-mines-left');
const gameTime = document.getElementById('game-time');
const gameGridElement = document.getElementById('game-grid');
const gameStartButtonElement = document.getElementById('game-start-button');
const gameGrid = document.getElementById('game-grid');

gameStartButtonElement.addEventListener('click', resetGame);    

const adjacentMinesColor = ["#0000FF", "#008000", "#FF0000", "#A50923", "#b86ceb", "#eb6cb4", "#fcbd86", "#f3f797"];
const CELLS_ROW = 8;
const CELLS_COL = 8;
const MINES = 10;

let revealedCells = 0;
let minesLeft = MINES;
let gameState = 'stopped';

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

/* Create Game */

createBoard();

function createBoard() {
    createBoardArray();
    createGameGrid();
} 

function createBoardArray() {
    // Creating a two-dimensional array
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

function createGameGrid() {
    for (let row = 0; row < CELLS_ROW; row++) {
        for (let column = 0; column < CELLS_COL; column++) {
            const cell = gameCells[row][column];
            cell.element = createCellElement(cell);
        }
    }
}

function createCellElement(cell) {
    const cellElement = document.createElement('div');
    cell.element = cellElement;
    cellElement.dataset.row = cell.row;
    cellElement.dataset.column = cell.column;
    cellElement.classList.add('cell');
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
    if (cell.hasMine) {
        cell.element.innerText = "💣";
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
    console.log('Game over');
    stopGame();
    gameStartButtonElement.innerText = '😟';
}

function gameWin() {
    console.log('You win!');
    stopGame();
    gameStartButtonElement.innerText = '😀';
}
