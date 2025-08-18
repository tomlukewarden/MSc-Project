import Phaser from "phaser";

class XOGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "XOGameScene" });
    this.cellSize = 180;
  }

  preload() {
    this.load.image("xIcon", "/assets/minigame/xo/xIcon.png");
    this.load.image("oIcon", "/assets/minigame/xo/oIcon.png");
    this.load.image("gameBoard", "/assets/minigame/xo/gameBoard.png");
    this.load.image("xoBackground", "/assets/minigame/xo/xobackground.png");
  }

  create() {
    this.scene.sleep("HUDScene");
    
    // Reset game state every time scene is created
    this.resetGameState();
    
    const { width, height } = this.sys.game.config;
    
    // Get callbacks from scene data
    if (this.scene.settings && this.scene.settings.data) {
      if (typeof this.scene.settings.data.onWin === "function") {
        this.onWin = this.scene.settings.data.onWin;
        console.log("[XOGameScene] onWin callback received from scene data.");
      }
      if (typeof this.scene.settings.data.onLose === "function") {
        this.onLose = this.scene.settings.data.onLose;
        console.log("[XOGameScene] onLose callback received from scene data.");
      }
    } else {
      console.log("[XOGameScene] No callbacks found in scene data.");
    }
    
    const boardSize = this.cellSize * 3;
    const boardX = (width - boardSize) / 2;
    const boardY = (height - boardSize) / 2;

    // Background
    this.add.image(width / 2, height / 2, "xoBackground").setDisplaySize(width, height);

    // Draw game board image
    this.add.image(boardX + boardSize / 2, boardY + boardSize / 2, "gameBoard")
      .setDisplaySize(boardSize, boardSize);

    // Create game board and enable it
    this.createBoard(boardX, boardY);
    this.enableBoard(); // Enable board at start

    // Status text
    this.statusText = this.add.text(width / 2, boardY - 30, "Player X's turn", {
      fontSize: "24px",
      color: "#333",
      fontFamily: "Georgia"
    }).setOrigin(0.5);
  }

  enableBoard() {
    if (this.cells) {
      this.cells.forEach(cell => {
        if (cell && cell.setInteractive) {
          cell.setInteractive({ useHandCursor: true });
        }
      });
    }
    console.log("[XOGameScene] Board enabled - all tiles interactive");
  }

  resetGameState() {
    // Reset all game variables
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.oMoves = 0;
    this.gameEnded = false;
    
    // Clear restart button if it exists
    if (this.restartGroup) {
      this.restartGroup.clear(true, true);
      this.restartGroup = null;
    }
    
    console.log("[XOGameScene] Game state reset");
  }

  createBoard(boardX, boardY) {
    // Clear existing cells
    if (this.cells) {
      this.cells.forEach(cell => {
        if (cell && cell.destroy) {
          cell.destroy();
        }
      });
    }
    
    this.cells = [];
    
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      
      // Adjust horizontal position: left column more right, right column more left
      let x = boardX + col * this.cellSize + this.cellSize / 2;
      if (col === 0) x += this.cellSize * 0.15;
      if (col === 2) x -= this.cellSize * 0.15; 
      let y = boardY + row * this.cellSize + this.cellSize / 2;
      if (row === 2) y -= this.cellSize * 0.15; 

      const cell = this.add.image(x, y, null)
        .setDisplaySize(this.cellSize * 0.6, this.cellSize * 0.6)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.handleMove(i, cell));

      this.cells.push(cell);
    }
    
    console.log("[XOGameScene] Created fresh interactive board");
  }

  handleMove(index, cell) {
    if (this.gameEnded || this.board[index] || this.checkWinner()) return;
    console.log(`[XOGameScene] handleMove called for index ${index}, currentPlayer: ${this.currentPlayer}`);

    this.board[index] = this.currentPlayer;
    const iconKey = this.currentPlayer === "X" ? "xIcon" : "oIcon";
    cell.setTexture(iconKey);
    cell.setDisplaySize(this.cellSize * 0.6, this.cellSize * 0.6); 

    if (this.checkWinner()) {
      this.statusText.setText(`Player ${this.currentPlayer} wins!`);
      this.gameEnded = true;
      this.disableBoard();
      console.log(`[XOGameScene] WIN detected for player ${this.currentPlayer}`);
      
      // If X wins, call onWin callback and stop scene
      if (this.currentPlayer === "X") {
        if (this.onWin) {
          console.log("[XOGameScene] Calling onWin callback...");
          this.time.delayedCall(1500, () => {
            this.onWin();
            // Stop this scene after calling onWin
            this.scene.stop();
          });
        } else {
          console.warn("[XOGameScene] onWin callback is missing!");
          // Stop scene anyway if no callback
          this.time.delayedCall(1500, () => {
            this.scene.stop();
          });
        }
      } else {
        // Computer wins, show restart button
        this.showRestartButton();
        // Computer wins, call onLose callback
        if (this.onLose) {
          console.log("[XOGameScene] Computer won - calling onLose callback...");
          this.time.delayedCall(1500, () => {
            this.onLose();
            // Stop this scene after calling onLose
            this.scene.stop();
          });
        } else {
          // Stop scene anyway if no callback
          this.time.delayedCall(1500, () => {
            this.scene.stop();
          });
        }
      }
      return;
    } else if (this.board.every(cell => cell)) {
      this.statusText.setText("It's a draw!");
      this.gameEnded = true;
      this.disableBoard();
      this.showRestartButton();
      console.log("[XOGameScene] Game ended in a draw.");
      
      // Draw counts as a loss, call onLose callback
      if (this.onLose) {
        console.log("[XOGameScene] Draw - calling onLose callback...");
        this.time.delayedCall(1500, () => {
          this.onLose();
          // Stop this scene after calling onLose
          this.scene.stop();
        });
      } else {
        // Stop scene anyway if no callback
        this.time.delayedCall(1500, () => {
          this.scene.stop();
        });
      }
      return;
    }

    // Switch turn
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    this.statusText.setText(`Player ${this.currentPlayer}'s turn`);

    // If it's O's turn, let computer play up to 3 random moves
    if (this.currentPlayer === "O") {
      if (this.oMoves < 3) {
        this.time.delayedCall(400, () => {
          if (this.gameEnded) return; // Don't move if game ended
          
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
    // Only show restart button for computer wins, not for player wins
    if (this.currentPlayer === "X") {
      return; // Don't show restart button when player wins
    }
    
    const { width, height } = this.sys.game.config;
    
    // Remove previous restart button if it exists
    if (this.restartGroup) {
      this.restartGroup.clear(true, true);
    }
    
    this.restartGroup = this.add.group();
    const button = this.add.rectangle(width / 2, height - 80, 220, 60, 0x1976d2, 1)
      .setStrokeStyle(2, 0x333)
      .setInteractive({ useHandCursor: true });
    const buttonText = this.add.text(width / 2, height - 80, "Play Again", {
      fontSize: "26px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);
    this.restartGroup.addMultiple([button, buttonText]);
    
    button.on("pointerdown", () => {
      console.log("[XOGameScene] Play Again button clicked - resetting board");
      this.resetBoard();
    });
  }

  resetBoard() {
    // Reset game state
    this.resetGameState();
    
    // Recreate the board with fresh tiles
    const { width, height } = this.sys.game.config;
    const boardSize = this.cellSize * 3;
    const boardX = (width - boardSize) / 2;
    const boardY = (height - boardSize) / 2;
    
    this.createBoard(boardX, boardY);
    this.enableBoard(); // Re-enable board after reset
    
    // Reset status text
    this.statusText.setText("Player X's turn");
    
    console.log("[XOGameScene] Board reset complete - all tiles cleared and re-enabled");
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
    if (this.cells) {
      this.cells.forEach(cell => {
        if (cell && cell.disableInteractive) {
          cell.disableInteractive();
        }
      });
    }
    console.log("[XOGameScene] Board disabled");
  }
}

export default XOGameScene;