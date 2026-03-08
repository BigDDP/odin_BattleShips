export default class GameController {
    constructor() {
        this.turn = null;
        this.p1 = null;
        this.p2 = null;
        this.gameOver = false;
        this.Winner = null;
    }

    nextTurn() {
        this.turn = this.turn === this.p1 ? this.p2 : this.p1;
    }

    gameover(winner) {
        this.gameOver = true;
        this.Winner = winner;
    }
}