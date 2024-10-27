const scoreBoardElement = document.getElementById('score-board');
const gameMinesLeft = document.getElementById('game-mines-left');
const gameTime = document.getElementById('game-time');
const gameGridElement = document.getElementById('game-grid');
const gameStartButtonElement = document.getElementById('game-start-button');
const gameGrid = document.getElementById('game-grid');

gameStartButtonElement.addEventListener('click', startGame);    

const adjacentMinesColor = ["#0000FF", "#008000", "#FF0000", "#A50923", "#b86ceb", "#eb6cb4", "#fcbd86", "#f3f797"];
const CELLS_ROW = 8;
const CELLS_COL = 8;
const MINES = 10;

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
                element: null
            };
        }
    }
}

function createGameGrid() {
    for (let row = 0; row < CELLS_ROW; row++) {
        for (let column = 0; column < CELLS_COL; column++) {
            gameCells[row][column].element = createCell(row, column);
        }
    }
}

function createCell(row, column) {
    const cellElement = document.createElement('div');
    gameCells[row][column].element = cellElement;
    cellElement.dataset.row = row;
    cellElement.dataset.column = column;
    cellElement.classList.add('cell');
    gameGridElement.appendChild(cellElement);
    return cellElement;
}

/* Start Game */

function startGame() {
    resetGame();
    generateGameGrid();
    renderGameGrid();
    startGameTimer();
    console.log('Game started');
}

function resetGame() {
    for (let row = 0; row < CELLS_ROW; row++) {
        for (let column = 0; column < CELLS_COL; column++) {
            const cell = gameCells[row][column];
            cell.adjacentMines = 0;
            cell.hasMine = false;
            cell.isRevealed = false;
            cell.isMarked = false;
            cell.element.style.backgroundColor = "#C1C2C2";
            gameGrid.addEventListener('click', handleCellLeftClick);
            gameGrid.addEventListener('contextmenu', handleCellRightClick);
        }
    }

    gameMinesLeft.innerText = '10';
    gameTime.innerText = '0';
}

function generateGameGrid() {
    let mines = MINES;
    while (mines > 0) {
        const row = Math.floor(Math.random() * CELLS_ROW);
        const column = Math.floor(Math.random() * CELLS_COL);
        if (!gameCells[row][column].hasMine) {
            gameCells[row][column].hasMine = true;
            incrementAdjacentMines(row, column);
            mines--;
        }
    }
}

function incrementAdjacentMines(row, column) {
    const fromRow = Math.max(row - 1, 0);
    const toRow = Math.min(row + 1, CELLS_ROW - 1);
    const fromColumn = Math.max(column - 1, 0);
    const toColumn = Math.min(column + 1, CELLS_COL - 1);
    for (let i = fromRow; i <= toRow; i++) {
        for (let j = fromColumn; j <= toColumn; j++) {
            gameCells[i][j].adjacentMines++;
        }
    }
}

function renderGameGrid() {
    for (let row = 0; row < CELLS_ROW; row++) {
        for (let column = 0; column < CELLS_COL; column++) {
            const cell = gameCells[row][column];
            cell.element.innerText = "";
        }
    }
}

let intervalId = null;

function startGameTimer() {
    let time = 0;
    if (!intervalId) {
        intervalId = setInterval(() => {
            time++;
            gameTime.innerText = time;
        }, 1000);
    }
}

/* Handle Game Events */

function handleCellLeftClick(event) {
    const row = event.target.dataset.row;
    const column = event.target.dataset.column;
    gameCells[row][column].isRevealed = true;
    revealCell(row, column);
    console.log(`Cell [${row}, ${column}] left clicked`);
}

function handleCellRightClick(event) {
    const row = event.target.dataset.row;
    const column = event.target.dataset.column;
    const cell = gameCells[row][column];
    cell.isMarked = !cell.isMarked;
    cell.element.innerText = "🚩";
    event.preventDefault();
    console.log(`Cell [${row}, ${column}] right clicked`);
}

function revealCell(row, column) {
    const cell = gameCells[row][column];
    cell.element.style.backgroundColor = "#dacfbf";
    if (cell.hasMine) {
        cell.element.innerText = "💣";
        gameOver();
    } else if(cell.adjacentMines > 0) {
        cell.element.innerText = cell.adjacentMines;
        cell.element.style.color = adjacentMinesColor[cell.adjacentMines - 1];
    } else {
        cell.element.innerText = "";
    }
    
}

function gameOver() {
    console.log('Game over');
    clearInterval(intervalId);
    intervalId = null;
    gameGrid.removeEventListener('click', handleCellLeftClick);
    gameGrid.removeEventListener('contextmenu', handleCellRightClick);
}

//Button emoji: 😀🙂