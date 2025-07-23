import Phaser from "phaser";

class XOGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "XOGameScene" });
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.cellSize = 180; // Increased cell size for a bigger board and icons
    this.cells = [];
  }

  preload() {
    this.load.image("xIcon", "/assets/minigame/xo/xIcon.png");
    this.load.image("oIcon", "/assets/minigame/xo/oIcon.png");
    this.load.image("gameBoard", "/assets/minigame/xo/gameBoard.png");
    this.load.image("background", "/assets/minigame/xo/xobackground.png");
  }

  create() {
    const { width, height } = this.sys.game.config;
    const boardSize = this.cellSize * 3;
    const boardX = (width - boardSize) / 2;
    const boardY = (height - boardSize) / 2;

    // Background
    this.add.image(width / 2, height / 2, "background").setDisplaySize(width, height);

    // Draw game board image
    this.add.image(boardX + boardSize / 2, boardY + boardSize / 2, "gameBoard")
      .setDisplaySize(boardSize, boardSize);

    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      let x = boardX + col * this.cellSize + this.cellSize / 2;
      if (col === 0) x += this.cellSize * 0.15;
      if (col === 2) x -= this.cellSize * 0.15; 
      let y = boardY + row * this.cellSize + this.cellSize / 2;
      if (row === 2) y -= this.cellSize * 0.15; 

      const cell = this.add.image(x, y, null)
        .setDisplaySize(this.cellSize * 0.6, this.cellSize * 0.6) 
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

    this.board[index] = this.currentPlayer;
    const iconKey = this.currentPlayer === "X" ? "xIcon" : "oIcon";
    cell.setTexture(iconKey);
    cell.setDisplaySize(this.cellSize * 0.6, this.cellSize * 0.6); // Match icon size to cell

    if (this.checkWinner()) {
      this.statusText.setText(`Player ${this.currentPlayer} wins!`);
      this.disableBoard();
    } else if (this.board.every(cell => cell)) {
      this.statusText.setText("It's a draw!");
    } else {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
      this.statusText.setText(`Player ${this.currentPlayer}'s turn`);
    }
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
