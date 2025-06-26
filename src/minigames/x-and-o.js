
class XOGame {
  constructor() {
    this.board = Array(9).fill(null); // 3x3 board
    this.currentPlayer = "X";
    this.winner = null;
    this.moves = 0;
  }

  printBoard() {
    let out = "";
    for (let i = 0; i < 9; i++) {
      out += this.board[i] ? ` ${this.board[i]} ` : "   ";
      if ((i + 1) % 3 === 0) {
        out += "\n";
        if (i < 8) out += "---+---+---\n";
      } else {
        out += "|";
      }
    }
    console.log(out);
  }

  makeMove(pos) {
    if (this.winner) {
      console.log(`Game over! Winner: ${this.winner}`);
      return;
    }
    if (pos < 0 || pos > 8 || this.board[pos]) {
      console.log("Invalid move.");
      return;
    }
    this.board[pos] = this.currentPlayer;
    this.moves++;
    if (this.checkWinner()) {
      this.printBoard();
      console.log(`Player ${this.currentPlayer} wins!`);
      this.winner = this.currentPlayer;
      return;
    }
    if (this.moves === 9) {
      this.printBoard();
      console.log("It's a draw!");
      this.winner = "Draw";
      return;
    }
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    this.printBoard();
    console.log(`Player ${this.currentPlayer}'s turn.`);
  }

  checkWinner() {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8], 
      [0,3,6],[1,4,7],[2,5,8], 
      [0,4,8],[2,4,6]          
    ];
    return wins.some(([a,b,c]) =>
      this.board[a] &&
      this.board[a] === this.board[b] &&
      this.board[a] === this.board[c]
    );
  }

  reset() {
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.winner = null;
    this.moves = 0;
    console.log("Game reset!");
    this.printBoard();
    console.log(`Player ${this.currentPlayer}'s turn.`);
  }
}

export default XOGame;