
class FlowerCatch {
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
    
}

export default FlowerCatch;