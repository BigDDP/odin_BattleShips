export default class Ship {
    constructor(value) {
        this.name = value[1]
        this.length = value[0];
        this.hits = value[0];
        this.sunk = false;
    }

    hit() {
        this.hits -= 1;
        if (this.hits < 1) return this.isSunk();
    }

    isSunk() {
        this.sunk = true;
        return true;
    }
}