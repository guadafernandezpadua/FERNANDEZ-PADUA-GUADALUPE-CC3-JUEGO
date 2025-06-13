// Disney characters and their hints
const disneyWords = [
    // Nivel 1 - Palabras cortas y fáciles
    {
        word: "MICKEY",
        hint: "El ratón más famoso de Disney",
        level: 1
    },
    {
        word: "MINNIE",
        hint: "La novia de Mickey",
        level: 1
    },
    {
        word: "DONALD",
        hint: "El pato que siempre está enojado",
        level: 1
    },
    {
        word: "GOOFY",
        hint: "El perro torpe y divertido",
        level: 1
    },
    // Nivel 2 - Palabras medianas
    {
        word: "PLUTO",
        hint: "El perro mascota de Mickey",
        level: 2
    },
    {
        word: "PETER PAN",
        hint: "El niño que nunca crece",
        level: 2
    },
    {
        word: "CAMPANITA",
        hint: "El hada que acompaña a Peter Pan",
        level: 2
    },
    // Nivel 3 - Palabras largas y difíciles
    {
        word: "CENICIENTA",
        hint: "La princesa que perdió su zapatilla",
        level: 3
    },
    {
        word: "BLANCANIEVES",
        hint: "La princesa que vive con siete enanitos",
        level: 3
    },
    {
        word: "LA BELLA DURMIENTE",
        hint: "La princesa que se pincha con una rueca",
        level: 3
    }
];

// Game state
let currentWord = null;
let score = 0;
let wordsSolved = 0;
let gameOver = false;
let timer = null;
let timeLeft = 60;
let highScore = localStorage.getItem('disneyScrambleHighScore') || 0;
let draggedLetter = null;
let solvedWords = [];
let currentLevel = 1;
let wordsNeededForNextLevel = 3;
let skipsRemaining = 3; // Límite de saltos por nivel
let hintsRemaining = 2; // Límite de pistas por nivel
let hintCost = 5; // Costo base de puntos por pista

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const scrambledLetters = document.getElementById('scrambled-letters');
const hintDisplay = document.getElementById('hint');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const highScoreDisplay = document.getElementById('high-score');
const wordsSolvedDisplay = document.getElementById('words-solved');
const solvedWordsList = document.getElementById('solved-words-list');
const levelDisplay = document.getElementById('level');
const skipsDisplay = document.getElementById('skips-remaining');
const hintsDisplay = document.getElementById('hints-remaining');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const shuffleButton = document.getElementById('shuffle-button');
const hintButton = document.getElementById('hint-button');
const skipButton = document.getElementById('skip-button');
const endMessage = document.getElementById('end-message');

// Initialize high score display
highScoreDisplay.textContent = highScore;

// Event Listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', resetGame);
shuffleButton.addEventListener('click', shuffleLetters);
hintButton.addEventListener('click', showHint);
skipButton.addEventListener('click', skipWord);

function startGame() {
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    score = 0;
    wordsSolved = 0;
    solvedWords = [];
    currentLevel = 1;
    timeLeft = 60;
    skipsRemaining = 3;
    hintsRemaining = 2;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    wordsSolvedDisplay.textContent = wordsSolved;
    levelDisplay.textContent = `Nivel ${currentLevel}`;
    skipsDisplay.textContent = skipsRemaining;
    hintsDisplay.textContent = hintsRemaining;
    solvedWordsList.innerHTML = '';
    gameOver = false;
    startTimer();
    nextWord();
}

function resetGame() {
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    score = 0;
    wordsSolved = 0;
    solvedWords = [];
    currentLevel = 1;
    timeLeft = 60;
    skipsRemaining = 3;
    hintsRemaining = 2;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    wordsSolvedDisplay.textContent = wordsSolved;
    levelDisplay.textContent = `Nivel ${currentLevel}`;
    skipsDisplay.textContent = skipsRemaining;
    hintsDisplay.textContent = hintsRemaining;
    solvedWordsList.innerHTML = '';
    gameOver = false;
    startTimer();
    nextWord();
}

function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function nextWord() {
    if (gameOver) return;
    
    const availableWords = disneyWords.filter(word => 
        word.level === currentLevel && !solvedWords.includes(word.word)
    );
    
    if (availableWords.length === 0) {
        if (wordsSolved >= wordsNeededForNextLevel) {
            currentLevel++;
            wordsSolved = 0;
            solvedWords = [];
            wordsNeededForNextLevel = Math.min(3 + currentLevel, 5);
            levelDisplay.textContent = `Nivel ${currentLevel}`;
            showMessage(`¡Nivel ${currentLevel}! 🎉`, 'success');
            timeLeft += 30;
            timerDisplay.textContent = timeLeft;
            // Restaurar saltos y pistas al subir de nivel
            skipsRemaining = Math.min(3 + currentLevel, 5);
            hintsRemaining = Math.min(2 + currentLevel, 4);
            skipsDisplay.textContent = skipsRemaining;
            hintsDisplay.textContent = hintsRemaining;
        }
        if (currentLevel > 3) {
            currentLevel = 1;
            wordsSolved = 0;
            solvedWords = [];
            levelDisplay.textContent = `Nivel ${currentLevel}`;
        }
        currentWord = disneyWords.find(word => word.level === currentLevel);
    } else {
        currentWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    }
    
    createLetterElements();
    hintDisplay.textContent = '';
}

function createLetterElements() {
    scrambledLetters.innerHTML = '';
    const letters = currentWord.word.split('');
    
    // Shuffle letters
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    letters.forEach(letter => {
        const letterElement = document.createElement('div');
        letterElement.className = 'letter';
        letterElement.textContent = letter;
        letterElement.draggable = true;
        
        letterElement.addEventListener('dragstart', handleDragStart);
        letterElement.addEventListener('dragend', handleDragEnd);
        letterElement.addEventListener('dragover', handleDragOver);
        letterElement.addEventListener('drop', handleDrop);
        
        scrambledLetters.appendChild(letterElement);
    });
}

function shuffleLetters() {
    const letters = Array.from(scrambledLetters.children);
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        scrambledLetters.appendChild(letters[j]);
    }
}

function showHint() {
    if (hintsRemaining <= 0) {
        showMessage('No te quedan pistas disponibles 😕', 'error');
        return;
    }

    // Calcular costo de la pista basado en nivel y puntos actuales
    const hintCost = Math.max(5, currentLevel * 2);
    
    if (score < hintCost) {
        showMessage(`Necesitas ${hintCost} puntos para una pista 💫`, 'error');
        return;
    }

    score -= hintCost;
    scoreDisplay.textContent = score;
    hintsRemaining--;
    hintsDisplay.textContent = hintsRemaining;
    
    // Mostrar pista con efecto de revelación
    hintDisplay.textContent = currentWord.hint;
    hintDisplay.style.animation = 'revealHint 0.5s ease-out';
    
    showMessage(`Pista usada (-${hintCost} puntos) 💡`, 'info');
}

function handleDragStart(e) {
    draggedLetter = this;
    this.classList.add('dragging');
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedLetter = null;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (this !== draggedLetter) {
        const allLetters = Array.from(scrambledLetters.children);
        const draggedIndex = allLetters.indexOf(draggedLetter);
        const droppedIndex = allLetters.indexOf(this);
        
        if (draggedIndex < droppedIndex) {
            this.parentNode.insertBefore(draggedLetter, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedLetter, this);
        }
        
        checkWord();
    }
}

function checkWord() {
    const currentArrangement = Array.from(scrambledLetters.children)
        .map(letter => letter.textContent)
        .join('');
    
    if (currentArrangement === currentWord.word) {
        // Calcular puntos basados en nivel y longitud de la palabra
        let points = currentWord.word.length * currentLevel;
        
        score += points;
        wordsSolved++;
        scoreDisplay.textContent = score;
        wordsSolvedDisplay.textContent = wordsSolved;
        
        solvedWords.push(currentWord.word);
        addSolvedWord(currentWord.word, points);
        
        showMessage(`¡Correcto! +${points} puntos 🎉`, 'success');
        setTimeout(nextWord, 1500);
    }
}

function addSolvedWord(word, points) {
    const wordElement = document.createElement('div');
    wordElement.className = 'solved-word';
    wordElement.textContent = `${word} (+${points})`;
    solvedWordsList.insertBefore(wordElement, solvedWordsList.firstChild);
}

function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

function endGame() {
    gameOver = true;
    clearInterval(timer);
    
    let resultMessage = '';
    
    if (currentLevel > 1) {
        resultMessage = `¡Juego terminado! 🎮\nLlegaste al nivel ${currentLevel}\nResolviste ${wordsSolved} palabras\nPuntuación final: ${score}`;
        endMessage.className = 'end-message win';
    } else {
        resultMessage = `¡Se acabó el tiempo! ⏰\nSolo resolviste ${wordsSolved} palabras\nPuntuación final: ${score}`;
        endMessage.className = 'end-message lose';
    }
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('disneyScrambleHighScore', highScore);
        highScoreDisplay.textContent = highScore;
        resultMessage += '\n¡Nuevo récord! 🏆';
    }
    
    endMessage.textContent = resultMessage;
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

function skipWord() {
    if (skipsRemaining <= 0) {
        showMessage('No te quedan saltos disponibles 😕', 'error');
        return;
    }

    skipsRemaining--;
    skipsDisplay.textContent = skipsRemaining;
    showMessage(`Palabra saltada (${skipsRemaining} saltos restantes) ⏭️`, 'info');
    nextWord();
} 