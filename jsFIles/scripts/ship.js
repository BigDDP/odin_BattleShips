export default class Ship {
    constructor(value) {
        this.placed = false;
        this.name = value[1]
        this.length = value[0];
        this.hits = value[0];
        this.sunk = false;
    }

    hit() {
        this.hits -= 1;
        if (this.hits < 1) {
           this.sunk = true;
            return true;
        } else {
            return false;
        };
    }
}