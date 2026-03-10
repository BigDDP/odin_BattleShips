import ComPlay from "./computer.js"

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
        if (this.turn === this.p2 && this.p2.type === 0) {
            ComPlay(this);
            this.turn = this.p1; 
        }
    }

    gameover(winner) {
        this.gameOver = true;
        this.Winner = winner;
    }
}