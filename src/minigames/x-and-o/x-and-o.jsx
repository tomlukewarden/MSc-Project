import Phaser from "phaser";

class XOGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "XOGameScene" });
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.cellSize = 180; // Increased cell size for a bigger board and icons
    this.cells = [];
    this.onWin = null;
  }

  preload() {
    this.load.image("xIcon", "/assets/minigame/xo/xIcon.png");
    this.load.image("oIcon", "/assets/minigame/xo/oIcon.png");
    this.load.image("gameBoard", "/assets/minigame/xo/gameBoard.png");
    this.load.image("xoBackground", "/assets/minigame/xo/xobackground.png");
  }

  create() {
    this.scene.sleep("HUDScene");
    const { width, height } = this.sys.game.config;
    // Get onWin callback from scene data if provided
    if (this.scene.settings && this.scene.settings.data && typeof this.scene.settings.data.onWin === "function") {
      this.onWin = this.scene.settings.data.onWin;
      console.log("[XOGameScene] onWin callback received from scene data.");
    } else {
      console.log("[XOGameScene] No onWin callback found in scene data.");
    }
    const boardSize = this.cellSize * 3;
    const boardX = (width - boardSize) / 2;
    const boardY = (height - boardSize) / 2;

    // Background
    this.add.image(width / 2, height / 2, "xoBackground").setDisplaySize(width, height);

    // Draw game board image
    this.add.image(boardX + boardSize / 2, boardY + boardSize / 2, "gameBoard")
      .setDisplaySize(boardSize, boardSize);

    // Reset cells array to avoid duplicate listeners after restart
    this.cells = [];
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      // Adjust horizontal position: left column more right, right column more left
      let x = boardX + col * this.cellSize + this.cellSize / 2;
      if (col === 0) x += this.cellSize * 0.15; // left column more right
      if (col === 2) x -= this.cellSize * 0.15; 
      let y = boardY + row * this.cellSize + this.cellSize / 2;
      if (row === 2) y -= this.cellSize * 0.15; 

      const cell = this.add.image(x, y, null)
        .setDisplaySize(this.cellSize * 0.6, this.cellSize * 0.6)
        .setInteractive()
        .on("pointerdown", () => this.handleMove(i, cell));

      this.cells.push(cell);
    }

    // Status text
    this.statusText = this.add.text(width / 2, boardY - 30, "Player X's turn", {
      fontSize: "24px",
      color: "#333",
      fontFamily: "Georgia"
    }).setOrigin(0.5);
  }

  handleMove(index, cell) {
    if (this.board[index] || this.checkWinner()) return;
    console.log(`[XOGameScene] handleMove called for index ${index}, currentPlayer: ${this.currentPlayer}`);

    this.board[index] = this.currentPlayer;
    const iconKey = this.currentPlayer === "X" ? "xIcon" : "oIcon";
    cell.setTexture(iconKey);
    cell.setDisplaySize(this.cellSize * 0.6, this.cellSize * 0.6); 

    if (this.checkWinner()) {
      this.statusText.setText(`Player ${this.currentPlayer} wins!`);
      this.disableBoard();
      this.showRestartButton();
      console.log(`[XOGameScene] WIN detected for player ${this.currentPlayer}`);
      // If X wins, call onWin callback to push back to MiniGameScene
      if (this.currentPlayer === "X") {
        if (this.onWin) {
          console.log("[XOGameScene] Calling onWin callback...");
          this.onWin();
        } else {
          console.warn("[XOGameScene] onWin callback is missing!");
        }
        // Stop XOGameScene and MiniGameScene after win
        this.scene.stop("XOGameScene");
        this.scene.stop("MiniGameScene");
      }
      return;
    } else if (this.board.every(cell => cell)) {
      this.statusText.setText("It's a draw!");
      this.disableBoard();
      this.showRestartButton();
      console.log("[XOGameScene] Game ended in a draw.");
      return;
    }

    // Switch turn
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    this.statusText.setText(`Player ${this.currentPlayer}'s turn`);

    // If it's O's turn, let computer play up to 3 random moves
    if (this.currentPlayer === "O") {
      if (!this.oMoves) this.oMoves = 0;
      if (this.oMoves < 3) {
        this.time.delayedCall(400, () => {
          const emptyIndices = this.board
            .map((v, i) => v === null ? i : null)
            .filter(i => i !== null);
          if (emptyIndices.length === 0) return;
          const randIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          this.oMoves++;
          this.handleMove(randIndex, this.cells[randIndex]);
        });
      }
    }
  }
  showRestartButton() {
    const { width, height } = this.sys.game.config;
    // Remove previous restart button if it exists
    if (this.restartGroup) {
      this.restartGroup.clear(true, true);
    }
    this.restartGroup = this.add.group();
    const button = this.add.rectangle(width / 2, height - 80, 220, 60, 0x1976d2, 1)
      .setStrokeStyle(2, 0x333)
      .setInteractive({ useHandCursor: true });
    const buttonText = this.add.text(width / 2, height - 80, "Restart Minigame", {
      fontSize: "26px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);
    this.restartGroup.addMultiple([button, buttonText]);
    button.on("pointerdown", () => {
      this.restartGroup.clear(true, true);
      this.scene.stop("XOGameScene");
      this.scene.start("XOTutorialScene");
    });
  }

  checkWinner() {
    const wins = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8], 
      [0, 4, 8], [2, 4, 6]            
    ];
    return wins.some(([a, b, c]) =>
      this.board[a] &&
      this.board[a] === this.board[b] &&
      this.board[a] === this.board[c]
    );
  }

  disableBoard() {
    this.cells.forEach(cell => cell.disableInteractive());
  }
}

export default XOGameScene;
