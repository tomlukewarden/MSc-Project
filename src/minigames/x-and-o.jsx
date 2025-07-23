import Phaser from "phaser";

class XOGame {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.winner = null;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  makeMove(index) {
    if (this.board[index] || this.winner) return false;
    this.board[index] = this.currentPlayer;
    if (this.checkWin()) {
      this.winner = this.currentPlayer;
    } else {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }
    return true;
  }

  checkWin() {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6] // diags
    ];
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        return true;
      }
    }
    return false;
  }

  isDraw() {
    return this.board.every(cell => cell) && !this.checkWin();
  }

  reset() {
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.winner = null;
  }
}

class XOGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "XOGameScene" });
    this.gameLogic = new XOGame();
    this.cellSize = 100;
    this.boardOrigin = { x: 200, y: 150 };
    this.cells = [];
    this.statusText = null;
  }

  preload() {
    this.load.image("xIcon", "/assets/minigame/xo/xIcon.png");
    this.load.image("oIcon", "/assets/minigame/xo/oIcon.png");
    this.load.image("gameBoard", "/assets/minigame/xo/gameBoard.png");
  }

  create() {
    const { width, height } = this.sys.game.config;
    const bg = this.add.graphics();
    bg.fillStyle(0xb3e5fc, 1); 
    bg.fillRect(0, 0, width, height);

    this.drawBoard();
    this.statusText = this.add.text(200, 80, "Player X's turn", {
      fontSize: "28px",
      color: "#333",
      fontFamily: "Georgia"
    });

    // Add draggable X and O icons to the right of the board
    const iconYStart = this.boardOrigin.y + this.cellSize;
    const iconSpacing = 120;
    this.xIconDraggable = this.add.sprite(this.boardOrigin.x + this.cellSize * 3.5, iconYStart, "xIcon")
      .setOrigin(0.5)
      .setDisplaySize(80, 80)
      .setInteractive({ draggable: true });
    this.oIconDraggable = this.add.sprite(this.boardOrigin.x + this.cellSize * 3.5, iconYStart + iconSpacing, "oIcon")
      .setOrigin(0.5)
      .setDisplaySize(80, 80)
      .setInteractive({ draggable: true });

    this.input.setDraggable([this.xIconDraggable, this.oIconDraggable]);

    // Only allow dragging the current player's icon
    this.input.on('dragstart', (pointer, gameObject) => {
      const currentPlayer = this.gameLogic.getCurrentPlayer();
      if ((currentPlayer === "X" && gameObject.texture.key !== "xIcon") ||
          (currentPlayer === "O" && gameObject.texture.key !== "oIcon")) {
        gameObject.input.enabled = false;
        return;
      }
      // Do not change scale on drag
    });
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    this.input.on('drop', (pointer, gameObject, dropZone) => {
      const cellIndex = dropZone.getData('index');
      const currentPlayer = this.gameLogic.getCurrentPlayer();
      // Validate move
      if (this.cells[cellIndex].texture.key) return;
      if (
        (currentPlayer === "X" && gameObject.texture.key === "xIcon") ||
        (currentPlayer === "O" && gameObject.texture.key === "oIcon")
      ) {
        // Snap icon into place
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        this.handleMove(cellIndex, currentPlayer);
      }
      // Always reset icon position after drop
      if (gameObject.texture.key === "xIcon") {
        gameObject.x = this.boardOrigin.x + this.cellSize * 3.5;
        gameObject.y = iconYStart;
      } else {
        gameObject.x = this.boardOrigin.x + this.cellSize * 3.5;
        gameObject.y = iconYStart + iconSpacing;
      }
      gameObject.input.enabled = true;
    });

  }
 drawBoard() {
  this.add.image(
    this.boardOrigin.x + this.cellSize * 1.5,
    this.boardOrigin.y + this.cellSize * 1.5,
    "gameBoard"
  ).setOrigin(0.5).setDisplaySize(this.cellSize * 3, this.cellSize * 3);

  this.cells = [];
  this.dropZones = [];

  for (let i = 0; i < 9; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = this.boardOrigin.x + col * this.cellSize + this.cellSize / 2;
    const y = this.boardOrigin.y + row * this.cellSize + this.cellSize / 2;

    // Create a transparent drop zone
    const zone = this.add.zone(x, y, this.cellSize, this.cellSize)
      .setRectangleDropZone(this.cellSize, this.cellSize)
      .setData('index', i)
      .setName(`cell-${i}`);
    zone.setOrigin(0.5);
    this.dropZones.push(zone);

    // Cell sprites (with icon if any)
    const iconKey = this.gameLogic.board[i] === "X" ? "xIcon" :
                    this.gameLogic.board[i] === "O" ? "oIcon" : null;
    const cellSprite = this.add.sprite(x, y, iconKey).setOrigin(0.5).setDisplaySize(80, 80);
    this.cells.push(cellSprite);
  }
}


  getCellAt(x, y) {
    // Returns cell index if pointer is inside a cell, else null
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cellX = this.boardOrigin.x + col * this.cellSize;
      const cellY = this.boardOrigin.y + row * this.cellSize;
      if (x > cellX && x < cellX + this.cellSize && y > cellY && y < cellY + this.cellSize) {
        return i;
      }
    }
    return null;
  }

  handleMove(cell, playerOverride = null) {
    const currentPlayer = playerOverride || this.gameLogic.getCurrentPlayer();
    // Only allow move if cell is empty
    if (this.cells[cell].texture.key) return;
    // Only allow correct player to play
    if (playerOverride && currentPlayer !== this.gameLogic.getCurrentPlayer()) return;
    this.gameLogic.makeMove(cell);
    // Set icon for move
    const iconKey = currentPlayer === "X" ? "xIcon" : "oIcon";
    this.cells[cell].setTexture(iconKey);
    this.statusText.setText(`Player ${currentPlayer === "X" ? "O" : "X"}'s turn`);
    if (this.gameLogic.checkWin()) {
      this.statusText.setText(`Player ${currentPlayer} wins!`);
      this.input.off("pointerdown");
    } else if (this.gameLogic.isDraw()) {
      this.statusText.setText("It's a draw!");
      this.input.off("pointerdown");
    }
  }
}

export default XOGameScene;