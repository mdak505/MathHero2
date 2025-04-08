// Game elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const playAgainButton = document.getElementById('play-again');
const submitButton = document.getElementById('submit-button');
const saveScoreButton = document.getElementById('save-score');

// Game variables
const timerText = document.getElementById('timer-text');
const timerFill = document.getElementById('timer-fill');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const newHighscoreElement = document.getElementById('new-highscore');
const nameInputContainer = document.getElementById('name-input-container');
const playerNameInput = document.getElementById('player-name');
const num1Element = document.getElementById('num1');
const num2Element = document.getElementById('num2');
const answerInput = document.getElementById('answer-input');
const feedbackElement = document.getElementById('feedback');
const leaderboardList = document.getElementById('leaderboard-list');
const finalLeaderboardList = document.getElementById('final-leaderboard-list');

// Sound effects
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const gameOverSound = document.getElementById('game-over-sound');

// Game constants
const GAME_DURATION = 60; // in seconds
const MAX_LEADERBOARD_ENTRIES = 5;
const MIN_NUMBER = 1;
const MAX_NUMBER = 20;

// Game state
let timer;
let timeLeft;
let score;
let currentAnswer;
let leaderboard = [];

// Initialize the game
function init() {
    // Load leaderboard from localStorage
    loadLeaderboard();
    displayLeaderboard(leaderboardList);
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', startGame);
    submitButton.addEventListener('click', checkAnswer);
    saveScoreButton.addEventListener('click', saveScore);
    
    answerInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Preload sounds
    correctSound.load();
    wrongSound.load();
    gameOverSound.load();
}

// Start a new game
function startGame() {
    // Reset game state
    score = 0;
    timeLeft = GAME_DURATION;
    
    // Update UI
    scoreElement.textContent = score;
    timerText.textContent = timeLeft;
    timerFill.style.width = '100%';
    
    // Show game screen, hide other screens
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Focus on answer input
    answerInput.value = '';
    answerInput.focus();
    
    // Generate first problem
    generateProblem();
    
    // Start timer
    timer = setInterval(updateTimer, 1000);
}

// Update the timer
function updateTimer() {
    timeLeft--;
    timerText.textContent = timeLeft;
    timerFill.style.width = (timeLeft / GAME_DURATION * 100) + '%';
    
    if (timeLeft <= 10) {
        timerFill.style.backgroundColor = '#dc3545';
    }
    
    if (timeLeft <= 0) {
        endGame();
    }
}

// Generate a new addition problem
function generateProblem() {
    // Clear previous feedback
    feedbackElement.textContent = '';
    feedbackElement.classList.remove('correct', 'wrong');
    
    // Generate random numbers
    const num1 = Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
    const num2 = Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
    
    // Display problem
    num1Element.textContent = num1;
    num2Element.textContent = num2;
    
    // Calculate correct answer
    currentAnswer = num1 + num2;
    
    // Clear input field
    answerInput.value = '';
    answerInput.focus();
}

// Check the player's answer
function checkAnswer() {
    // Get the player's answer
    const playerAnswer = parseInt(answerInput.value);
    
    // If input is empty, ignore
    if (isNaN(playerAnswer)) {
        return;
    }
    
    // Check if answer is correct
    if (playerAnswer === currentAnswer) {
        // Correct answer
        score++;
        scoreElement.textContent = score;
        
        // Show feedback
        feedbackElement.textContent = 'Correct!';
        feedbackElement.classList.add('correct');
        feedbackElement.classList.remove('wrong');
        
        // Play sound
        correctSound.currentTime = 0;
        correctSound.play();
    } else {
        // Wrong answer
        feedbackElement.textContent = 'Wrong! Try again.';
        feedbackElement.classList.add('wrong');
        feedbackElement.classList.remove('correct');
        
        // Play sound
        wrongSound.currentTime = 0;
        wrongSound.play();
    }
    
    // Generate new problem
    setTimeout(generateProblem, 1000);
}

// End the game
function endGame() {
    // Stop the timer
    clearInterval(timer);
    
    // Play game over sound
    gameOverSound.play();
    
    // Update final score
    finalScoreElement.textContent = score;
    
    // Check if it's a new high score
    const isNewHighScore = checkHighScore(score);
    newHighscoreElement.classList.toggle('hidden', !isNewHighScore);
    nameInputContainer.classList.toggle('hidden', !isNewHighScore);
    
    if (isNewHighScore) {
        playerNameInput.focus();
    }
    
    // Display leaderboard
    displayLeaderboard(finalLeaderboardList);
    
    // Show game over screen
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
}

// Check if the score is a new high score
function checkHighScore(score) {
    // If leaderboard isn't full yet, it's a high score
    if (leaderboard.length < MAX_LEADERBOARD_ENTRIES) {
        return true;
    }
    
    // Check if score is higher than the lowest score on the leaderboard
    const lowestScore = leaderboard[leaderboard.length - 1].score;
    return score > lowestScore;
}

// Save the player's score to the leaderboard
function saveScore() {
    const playerName = playerNameInput.value.trim() || 'Anonymous';
    
    // Add the score to the leaderboard
    leaderboard.push({ name: playerName, score: score });
    
    // Sort the leaderboard
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Trim the leaderboard
    if (leaderboard.length > MAX_LEADERBOARD_ENTRIES) {
        leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
    }
    
    // Save to localStorage
    saveLeaderboard();
    
    // Hide the name input
    nameInputContainer.classList.add('hidden');
    
    // Update leaderboard display
    displayLeaderboard(finalLeaderboardList);
}

// Load the leaderboard from localStorage
function loadLeaderboard() {
    const savedLeaderboard = localStorage.getItem('mathGameLeaderboard');
    if (savedLeaderboard) {
        leaderboard = JSON.parse(savedLeaderboard);
    }
}

// Save the leaderboard to localStorage
function saveLeaderboard() {
    localStorage.setItem('mathGameLeaderboard', JSON.stringify(leaderboard));
}

// Display the leaderboard
function displayLeaderboard(listElement) {
    // Clear the list
    listElement.innerHTML = '';
    
    // Add each score to the list
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score} points`;
        listElement.appendChild(li);
    });
    
    // Add placeholder entries if leaderboard is empty
    if (leaderboard.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No scores yet. Be the first!';
        listElement.appendChild(li);
    }
}

// Initialize the game when the page loads
window.addEventListener('load', init);