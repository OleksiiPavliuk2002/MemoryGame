class MemoryGame {
  constructor() {
    this.gameBoard = document.getElementById("game-board");
    this.startBtn = document.getElementById("start-btn");
    this.pauseBtn = document.getElementById("pause-btn");
    this.levelSelect = document.getElementById("level-select");
    this.timerElement = document.getElementById("timer");
    this.scoreElement = document.getElementById("score");
    this.levelElement = document.getElementById("level");
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.score = 0;
    this.timeLeft = 60;
    this.timer = null;
    this.baseSymbols = [
      "🍎",
      "🍌",
      "🍒",
      "🍓",
      "🍑",
      "🍐",
      "🍋",
      "🍉",
      "🍇",
      "🍊",
    ];
    this.symbols = [];
    this.isGameActive = false;
    this.isPaused = false;
    this.currentLevel = "easy";
    this.touchStartTime = 0;
    this.touchTimeout = null;

    this.startBtn.addEventListener("click", () => this.startGame());
    this.pauseBtn.addEventListener("click", () => this.togglePause());
    this.levelSelect.addEventListener("change", (e) =>
      this.setLevel(e.target.value)
    );

    document.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    this.setLevel(this.currentLevel);
  }

  setLevel(level) {
    this.currentLevel = level;
    switch (level) {
      case "easy":
        this.timeLeft = 60;
        this.symbols = this.baseSymbols.slice(0, 6);
        break;
      case "medium":
        this.timeLeft = 45;
        this.symbols = this.baseSymbols.slice(0, 8);
        break;
      case "hard":
        this.timeLeft = 30;
        this.symbols = this.baseSymbols.slice(0, 12);
        break;
    }
    this.updateTimer();
    this.levelElement.textContent = this.currentLevel;
  }

  startGame() {
    this.resetGame();
    this.createCards();
    this.shuffleCards();
    this.renderCards();
    this.startTimer();
    this.isGameActive = true;
    this.startBtn.disabled = true;
    this.pauseBtn.disabled = false;
    this.levelSelect.disabled = true;
  }

  resetGame() {
    this.gameBoard.innerHTML = "";
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.score = 0;
    this.setLevel(this.currentLevel);
    this.updateScore();
    clearInterval(this.timer);
    this.isPaused = false;
  }

  createCards() {
    const symbolPairs = [...this.symbols, ...this.symbols];
    this.cards = symbolPairs.map((symbol, index) => ({
      id: index,
      symbol: symbol,
      isFlipped: false,
      isMatched: false,
    }));
  }

  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  renderCards() {
    const columns = Math.ceil(Math.sqrt(this.cards.length));
    this.gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    this.cards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");
      cardElement.dataset.id = card.id;

      const frontFace = document.createElement("div");
      frontFace.classList.add("front");
      frontFace.textContent = "?";

      const backFace = document.createElement("div");
      backFace.classList.add("back");
      backFace.textContent = card.symbol;

      cardElement.appendChild(frontFace);
      cardElement.appendChild(backFace);

      cardElement.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.touchStartTime = Date.now();
        this.touchTimeout = setTimeout(() => {
          this.flipCard(card);
        }, 100);
      });

      cardElement.addEventListener("touchend", () => {
        if (Date.now() - this.touchStartTime < 100) {
          clearTimeout(this.touchTimeout);
          this.flipCard(card);
        }
      });

      cardElement.addEventListener("click", () => this.flipCard(card));
      this.gameBoard.appendChild(cardElement);
    });
  }

  flipCard(card) {
    if (
      !this.isGameActive ||
      this.isPaused ||
      card.isFlipped ||
      card.isMatched ||
      this.flippedCards.length >= 2
    )
      return;

    card.isFlipped = true;
    this.flippedCards.push(card);

    const cardElement = document.querySelector(`.card[data-id="${card.id}"]`);
    cardElement.classList.add("flipped");

    if (this.flippedCards.length === 2) {
      setTimeout(() => this.checkMatch(), 500);
    }
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards;

    if (card1.symbol === card2.symbol) {
      this.matchedPairs++;
      this.score += 10;
      card1.isMatched = card2.isMatched = true;
      this.updateScore();

      const card1Element = document.querySelector(
        `.card[data-id="${card1.id}"]`
      );
      const card2Element = document.querySelector(
        `.card[data-id="${card2.id}"]`
      );
      card1Element.classList.add("matched");
      card2Element.classList.add("matched");

      if (this.matchedPairs === this.symbols.length) {
        this.endGame(true);
      }
    } else {
      card1.isFlipped = card2.isFlipped = false;
      const card1Element = document.querySelector(
        `.card[data-id="${card1.id}"]`
      );
      const card2Element = document.querySelector(
        `.card[data-id="${card2.id}"]`
      );
      setTimeout(() => {
        card1Element.classList.remove("flipped");
        card2Element.classList.remove("flipped");
      }, 500);
    }

    this.flippedCards = [];
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (!this.isPaused) {
        this.timeLeft--;
        this.updateTimer();

        if (this.timeLeft === 0) {
          this.endGame(false);
        }
      }
    }, 1000);
  }

  updateTimer() {
    this.timerElement.textContent = this.timeLeft;
  }

  updateScore() {
    this.scoreElement.textContent = this.score;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseBtn.textContent = this.isPaused ? "Продовжити" : "Пауза";
    if (this.isPaused) {
      clearInterval(this.timer);
    } else {
      this.startTimer();
    }
  }

  endGame(isWin) {
    clearInterval(this.timer);
    this.isGameActive = false;
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.levelSelect.disabled = false;

    setTimeout(() => {
      if (isWin) {
        alert(`Вітаємо! Ви виграли з рахунком ${this.score} балів!`);
      } else {
        alert(`Час вийшов! Ваш рахунок: ${this.score} балів.`);
      }
      this.saveScore();
    }, 0);
  }

  saveScore() {
    const highScores = JSON.parse(
      localStorage.getItem("memoryGameHighScores") || "[]"
    );
    highScores.push({ score: this.score, level: this.currentLevel });
    highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem(
      "memoryGameHighScores",
      JSON.stringify(highScores.slice(0, 5))
    );
  }
}

const game = new MemoryGame();
