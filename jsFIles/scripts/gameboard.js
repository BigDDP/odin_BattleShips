import Ship from "/ship.js"

class Node {
    constructor(coo) {
        this.ship = null;
        this.coo = coo;
        this.t = null;
        this.b = null;
        this.l = null;
        this.r = null;
    }
}

export default class gameBoard {
    constructor() {
        this.root = null;
        this.pieces = [];
        this.missed = null;
        this.hits = null;
    }

    generateBoard(queue = [], node = null, x = 0, maxX = 7, y = 0) {

        if (x === maxX) {
            [[2,Patrol], [3,Submarine], [3,Destroyer], [4,Battleship], [5,Carrier]].forEach(boat => {
                this.pieces = push(new Ship(boat));
            });
            return;
        };
        let curr;
        for (let i = 0; i < maxX; i++) {
            y = i;
            let newNode = new Node([x,y]);
            curr = newNode;
            if (x === 0 && y === 0) this.root = newNode;
            if (y !== 0) {
                newNode.l = queue.at(-1);
                queue.at(-1).r = newNode;
            }
            
            if (queue.length > maxX - 1 && newNode.coo[1] === queue[0].coo[1]) {
                newNode.t = queue[0];
                queue[0].b = newNode;
                queue.shift();
            }   
            queue.push(newNode);
        }
        this.generateBoard(queue, null, x + 1, maxX, 0);
    }

    nextNode(node, v) {
        if (!node) return null;
        if (node.coo[0] === v[0] && node.coo[1] === v[1]) return node;
        if (v[0] !== node.coo[0]) {
            if (v[0] > node.coo[0]) {
                return this.nextNode(node.b,v); 
            } else {
                return this.nextNode(node.t,v);
            };
        } else {
            if (v[1] > node.coo[1]) {
                return this.nextNode(node.r,v);
            } else {
                return this.nextNode(node.l,v);
            };
        };
    };

    getNode(value) {
        return this.nextNode(this.root, value);
    };

    randomPlace() {
        const MAX_TRIES = 20;
        const allNodes = []
        let nodeX = this.root;
        while (nodeX) {
            let nodeY = nodeX;
            while (nodeY) {
                allNodes.push(nodeY);
                nodeY = nodeY.r
            };
            nodeX = nodeX.b;
        }

        function getRandomNode() {
            return allNodes[Math.floor(Math.random() * allNodes.length)];
        }

        function getRandomDir() {
            return Math.floor(Math.random() * 2);
        }

        const attemptBuild = () => {
            this.pieces.forEach(boat => {
                let randNode = getRandomNode();
                let randDir = getRandomDir();
                let tries = 0

                while (tries < MAX_TRIES) {
                    let currNode = randNode;
                    let changeDir = false;
                    const tempQueue = [];
                    
                    for (let i=0; i < boat.length; i++) {
                        if (currNode.ship || (randDir === 0 ? !currNode.b : !currNode.r)) {
                            tries++
                            tempQueue.length = 0
                            if (!changeDir) {
                                changeDir = true;
                                randDir = getRandomDir();
                            } else {
                                randNode = getRandomNode();
                            }
                            break;
                        }

                        tempQueue.push(currNode);                            
                        currNode = randDir === 0 ? currNode.b : currNode.r;
                    }

                    if (tempQueue.length === boat.length) {
                        tempQueue.forEach(n => n.ship = boat);
                        break;
                    }
                }
                
                if (tries >= MAX_TRIES) {
                    allNodes.forEach(node => node.ship = null);
                    return attemptBuild();
                }; 
            });
        };

        attemptBuild();
    };


    receiveAttack(value) {
        const hitNode = this.getNode(value);
        const coor = `[${hitNode.coo}]`
        const ship = hitNode.ship
        
        if (ship) {
            if (!this.hits) {
                this.hits = new Set([coor]);
            } else {
                this.hits.add(coor);
            };

            const sunk = hitNode.hit();
            if (sunk && this.pieces.every(b => b.sunk)) return true;
        } else {
            if (!this.missed) {
                this.missed = new Set([coor]); 
            } else {
                this.missed.add(coor);
            };
        };
        
        return false;
    }

    print() {
        // (0,0 : x) - (1,0 : x)
        //     |           |
        // (1,0 : x) - (1,1 : x)
        let msg = [];
        let nodeX = this.root;
        while (nodeX) {
            let nodeY = nodeX;
            let newMsg = [];
            let breakMsg = [];
            while (nodeY) {
                newMsg.push(`(${nodeY.coo} : ${nodeY.ship ? '𐂃' : '_ '})${nodeY.r ? ' - ' : ''}`);
                if (nodeY.b) breakMsg.push(`    |${nodeY.r ? '        ' : ''}`);
                nodeY = nodeY.r
            };
            
            nodeX = nodeX.b;
            msg.push(newMsg, breakMsg);
        }
        
        return (msg.map(arr => arr.join(''))).join(' \n');
    }
}