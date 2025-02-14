const sounds = {
    green: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
    red: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
    yellow: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
    blue: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3')
};

const gameState = {
    sequence: [],
    playerSequence: [],
    score: 0,
    isPlaying: false,
    currentPlayer: ''
};

const screens = {
    mainMenu: document.getElementById('main-menu'),
    gameScreen: document.getElementById('game-screen'),
    gameOver: document.getElementById('game-over')
};

const elements = {
    playerName: document.getElementById('player-name'),
    startGame: document.getElementById('start-game'),
    startSequence: document.getElementById('start-sequence'),
    currentPlayer: document.getElementById('current-player'),
    currentScore: document.getElementById('current-score'),
    bestScore: document.getElementById('best-score'),
    finalScore: document.getElementById('final-score'),
    playAgain: document.getElementById('play-again'),
    returnMenu: document.getElementById('return-menu'),
    returnMenuEnd: document.getElementById('return-menu-end'),
    victoryCount: document.getElementById('victory-count'),
    scoresBody: document.getElementById('scores-body')
};

const buttons = {
    green: document.getElementById('green'),
    red: document.getElementById('red'),
    yellow: document.getElementById('yellow'),
    blue: document.getElementById('blue')
};

function initGame() {
    updateHighScores();
    updateVictoryCount();

    elements.startGame.addEventListener('click', startNewGame);
    elements.startSequence.addEventListener('click', startSequence);
    elements.playAgain.addEventListener('click', resetGame);
    elements.returnMenu.addEventListener('click', returnToMenu);
    elements.returnMenuEnd.addEventListener('click', returnToMenu);

    Object.values(buttons).forEach(button => {
        button.addEventListener('click', () => handlePlayerInput(button.dataset.color));
    });
}

function showScreen(screenToShow) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screenToShow.classList.remove('hidden');
}

function startNewGame() {
    const playerName = elements.playerName.value.trim();
    if (!playerName) {
        alert('Please enter your name!');
        return;
    }

    gameState.currentPlayer = playerName;
    gameState.score = 0;
    gameState.sequence = [];
    gameState.playerSequence = [];

    elements.currentPlayer.textContent = `Player: ${playerName}`;
    elements.currentScore.textContent = `Score: 0`;
    elements.bestScore.textContent = `Best: ${getBestScore(playerName)}`;

    showScreen(screens.gameScreen);
}

function getRandomColor() {
    const colors = ['green', 'red', 'yellow', 'blue'];
    return colors[Math.floor(Math.random() * colors.length)];
}

async function startSequence() {
    if (gameState.isPlaying) return;

    gameState.isPlaying = true;
    elements.startSequence.disabled = true;
    gameState.sequence.push(getRandomColor());

    for (const color of gameState.sequence) {
        await playButton(color);
    }

    gameState.playerSequence = [];
    gameState.isPlaying = false;
    elements.startSequence.disabled = false;
}

async function playButton(color) {
    const button = buttons[color];
    button.classList.add('active');
    sounds[color].currentTime = 0;
    sounds[color].play();

    await new Promise(resolve => setTimeout(resolve, 500));
    button.classList.remove('active');
    await new Promise(resolve => setTimeout(resolve, 200));
}

async function handlePlayerInput(color) {
    if (gameState.isPlaying) return;

    await playButton(color);
    gameState.playerSequence.push(color);

    const currentIndex = gameState.playerSequence.length - 1;

    if (color !== gameState.sequence[currentIndex]) {
        gameOver();
        return;
    }

    if (gameState.playerSequence.length === gameState.sequence.length) {
        gameState.score++;
        elements.currentScore.textContent = `Score: ${gameState.score}`;
        gameState.playerSequence = [];
        setTimeout(startSequence, 1000);
    }
}

function gameOver() {
    const finalScore = gameState.score;
    elements.finalScore.textContent = finalScore;

    updateHighScore(gameState.currentPlayer, finalScore);
    updateHighScores();

    showScreen(screens.gameOver);
}

function resetGame() {
    gameState.score = 0;
    gameState.sequence = [];
    gameState.playerSequence = [];
    elements.currentScore.textContent = 'Score: 0';
    showScreen(screens.gameScreen);
}

function returnToMenu() {
    showScreen(screens.mainMenu);
    elements.playerName.value = '';
    updateHighScores();
}

function updateHighScore(player, score) {
    const scores = JSON.parse(localStorage.getItem('simonScores')) || {};
    scores[player] = Math.max(score, scores[player] || 0);
    localStorage.setItem('simonScores', JSON.stringify(scores));

    if (score > (scores[player] || 0)) {
        const victories = parseInt(localStorage.getItem('totalVictories') || '0') + 1;
        localStorage.setItem('totalVictories', victories.toString());
        updateVictoryCount();
    }
}

function getBestScore(player) {
    const scores = JSON.parse(localStorage.getItem('simonScores')) || {};
    return scores[player] || 0;
}

function updateHighScores() {
    const scores = JSON.parse(localStorage.getItem('simonScores')) || {};
    const sortedScores = Object.entries(scores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

    elements.scoresBody.innerHTML = sortedScores
        .map(([player, score]) => `
            <tr>
                <td>${player}</td>
                <td>${score}</td>
            </tr>
        `).join('');
}

function updateVictoryCount() {
    const victories = localStorage.getItem('totalVictories') || '0';
    elements.victoryCount.textContent = victories;
}

document.addEventListener('DOMContentLoaded', initGame);
