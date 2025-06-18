class MemoryGame {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.movesElement = document.getElementById('moves');
        this.timeElement = document.getElementById('time');
        this.matchesElement = document.getElementById('matches');
        this.restartBtn = document.getElementById('restart-btn');
        this.victoryModal = document.getElementById('victory-modal');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.finalMovesElement = document.getElementById('final-moves');
        this.finalTimeElement = document.getElementById('final-time');

        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.gameTimer = null;
        this.isGameActive = false;

        // Motorcycle images for the game (12 different types for 24 cards)
        this.motorcycleImages = [
            'images/download-1.jpg',
            'images/download-2.jpg', 
            'images/download-3.jpg',
            'images/download-4.jpg',
            'images/download-5.jpg',
            'images/download-6.jpg',
            'images/download-7.jpg',
            'images/download-8.jpg',
            'images/download-9.jpg',
            'images/download-10.jpg',
            'images/images-1.jpg',
            'images/images-2.jpg'
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createGame();
    }

    setupEventListeners() {
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        
        // Close modal when clicking outside
        this.victoryModal.addEventListener('click', (e) => {
            if (e.target === this.victoryModal) {
                this.closeVictoryModal();
            }
        });
    }

    createGame() {
        this.resetGameState();
        this.createCards();
        this.shuffleCards();
        this.renderCards();
    }

    resetGameState() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isGameActive = false;
        this.startTime = null;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }

        this.updateUI();
        this.closeVictoryModal();
    }

    createCards() {
        // Create pairs of cards (24 cards = 12 pairs)
        this.motorcycleImages.forEach(imagePath => {
            // Add two cards for each image (pair)
            this.cards.push({
                id: Math.random().toString(36).substr(2, 9),
                imagePath: imagePath,
                isFlipped: false,
                isMatched: false
            });
            this.cards.push({
                id: Math.random().toString(36).substr(2, 9),
                imagePath: imagePath,
                isFlipped: false,
                isMatched: false
            });
        });
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    renderCards() {
        this.gameBoard.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.gameBoard.appendChild(cardElement);
        });
    }

    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.index = index;
        cardDiv.dataset.imagePath = card.imagePath;

        cardDiv.innerHTML = `
            <div class="card-face card-back">
                <div class="card-back-content">?</div>
            </div>
            <div class="card-face card-front">
                <img src="${card.imagePath}" alt="Motorcycle" class="motorcycle-image">
            </div>
        `;

        cardDiv.addEventListener('click', () => this.handleCardClick(index));

        return cardDiv;
    }

    handleCardClick(index) {
        const card = this.cards[index];
        const cardElement = this.gameBoard.children[index];

        // Ignore clicks on already flipped or matched cards
        if (card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
            return;
        }

        // Start timer on first move
        if (!this.isGameActive) {
            this.startGame();
        }

        // Flip the card
        this.flipCard(index);

        // Check for matches when two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateUI();
            
            setTimeout(() => {
                this.checkForMatch();
            }, 1000);
        }
    }

    flipCard(index) {
        const card = this.cards[index];
        const cardElement = this.gameBoard.children[index];

        card.isFlipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push(index);
    }

    checkForMatch() {
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];

        if (firstCard.imagePath === secondCard.imagePath) {
            // Match found
            this.handleMatch(firstIndex, secondIndex);
        } else {
            // No match
            this.handleNoMatch(firstIndex, secondIndex);
        }

        this.flippedCards = [];
    }

    handleMatch(firstIndex, secondIndex) {
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];
        const firstElement = this.gameBoard.children[firstIndex];
        const secondElement = this.gameBoard.children[secondIndex];

        firstCard.isMatched = true;
        secondCard.isMatched = true;
        
        firstElement.classList.add('matched');
        secondElement.classList.add('matched');

        this.matchedPairs++;
        this.updateUI();

        // Check for game completion
        if (this.matchedPairs === 12) {
            setTimeout(() => {
                this.endGame();
            }, 500);
        }
    }

    handleNoMatch(firstIndex, secondIndex) {
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];
        const firstElement = this.gameBoard.children[firstIndex];
        const secondElement = this.gameBoard.children[secondIndex];

        firstCard.isFlipped = false;
        secondCard.isFlipped = false;
        
        firstElement.classList.remove('flipped');
        secondElement.classList.remove('flipped');
    }

    startGame() {
        this.isGameActive = true;
        this.startTime = Date.now();
        this.gameTimer = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    endGame() {
        this.isGameActive = false;
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        this.showVictoryModal();
    }

    updateTimer() {
        if (!this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timeElement.textContent = timeString;
    }

    updateUI() {
        this.movesElement.textContent = this.moves;
        this.matchesElement.textContent = `${this.matchedPairs}/12`;
    }

    showVictoryModal() {
        const finalTime = this.timeElement.textContent;
        this.finalMovesElement.textContent = this.moves;
        this.finalTimeElement.textContent = finalTime;
        this.victoryModal.classList.add('show');
    }

    closeVictoryModal() {
        this.victoryModal.classList.remove('show');
    }

    restartGame() {
        this.createGame();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});

// Add some fun sound effects (optional - using Web Audio API)
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playFlipSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playMatchSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    playVictorySound() {
        if (!this.audioContext) return;
        
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const startTime = this.audioContext.currentTime + (index * 0.15);
            oscillator.frequency.setValueAtTime(freq, startTime);
            
            gainNode.gain.setValueAtTime(0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }
}

// Initialize sound effects
const soundEffects = new SoundEffects(); 