const scoreBoardElement = document.getElementById('score-board');
const gameGridElement = document.getElementById('game-grid');
const gameStartButtonElement = document.getElementById('game-start-button');

gameStartButtonElement.addEventListener('click', startGame);    


function startGame() {
    console.log('Game started');
}