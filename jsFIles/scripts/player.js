export default class Player {
    constructor(name, type, board, id) {
        this.id = id;
        this.boardEl = null;
        this.name = name;
        this.type = type;
        this.board = board;
    }
}