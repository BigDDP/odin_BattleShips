import Ship from "./ship.js"
import {updatePlacement}  from "./dom.js"

class Node {
    constructor(coo) {
        this.ship = null;
        this.coo = coo;
        this.hit = false;
        this.t = null;
        this.b = null;
        this.l = null;
        this.r = null;
    }
}

export default class gameBoard {
    constructor() {
        this.root = null;
        this.allNodes = [];
        this.pieces = [];
        this.missed = null;
        this.hits = null;
        this.generateBoard();
    }

    populateAllNodes() {
        this.allNodes = [];
        let xNode = this.root;
        while (xNode) {
            let yNode = xNode;
            while (yNode) {
                this.allNodes.push(yNode);
                yNode = yNode.r;
            }
            xNode = xNode.b;
        }
    }

    generateBoard(queue = [], node = null, x = 0, maxX = 7, y = 0) {

        if (x === maxX) {
            [[2,'Patrol'], [3,'Submarine'], [3,'Destroyer'], [4,'Battleship'], [5,'Carrier']].forEach(boat => {
                this.pieces.push(new Ship(boat));
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

    randomPlace(player) {
        const MAX_TRIES = 100;
        let nodeX = this.root;
        this.populateAllNodes();         
        const allNodes = this.allNodes;

        function getRandomNode() {
            return allNodes[Math.floor(Math.random() * allNodes.length)];
        }

        function getRandomDir() {
            return Math.floor(Math.random() * 2);
        }

        const attemptBuild = () => {
            let TotalTries = 0
            while (TotalTries < MAX_TRIES) {
                if (this.pieces.every(p => p.placed === true)) return;
                for (let i = 0; i < this.pieces.length; i++) {
                    const boat = this.pieces[i];
                    if (boat.placed) continue;

                    let randNode = getRandomNode();
                    let randDir = getRandomDir();
                    let tries = 0

                    while (tries < MAX_TRIES) {
                        let currNode = randNode;
                        let changeDir = false;
                        const tempQueue = [];
                        
                        for (let j=0; j < boat.length; j++) {
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
                            boat.placed = true;
                            tempQueue.forEach(n => n.ship = boat );
                            break;
                        }
                    }
                    
                    if (tries >= MAX_TRIES) {
                        allNodes.forEach(node => node.ship = null);
                        this.pieces.forEach(b => b.placed = false);
                        i -= 1
                        TotalTries++
                    }; 
                };
                if (TotalTries >= MAX_TRIES) {
                    this.pieces.forEach(b => b.placed = false);
                    return console.log(new Error("Maximum Tries to randomise board have been reach, try again."));
                }; 
            }
        };

        attemptBuild();
        this.pieces.forEach(i => {
            allNodes.filter(n => n.ship).forEach(item => updatePlacement(item.coo, this, player, "set"))
            console.log(`${i.name}: has been placed: ${i.placed}`)
        })
    };

    receiveAttack(value) {
        const hitNode = this.getNode(value);
        hitNode.hit = true;
        const coor = `[${hitNode.coo}]`
        const ship = hitNode.ship
        
        if (ship) {
            if (!this.hits) {
                this.hits = new Set([coor]);
            } else {
                this.hits.add(coor);
            };

            const sunk = ship.hit();
            if (sunk) console.log(ship.name+" has been sunk.")
            if (sunk && this.pieces.every(b => b.sunk)) {
                console.log("Workflow Running")
                return true
            };
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
        let msg = [];
        let nodeX = this.root;
        while (nodeX) {
            let nodeY = nodeX;
            let newMsg = [];
            while (nodeY) {
                newMsg.push(`(${nodeY.coo}) : ${nodeY.ship ? (nodeY.ship.sunk ? 'X' : `${nodeY.ship.name[0]} |`) : '  |'}`);
                nodeY = nodeY.r
            };
            
            nodeX = nodeX.b;
            msg.push(newMsg);
        }
        
        return (msg.map(arr => arr.join(''))).join(' \n');
    }
}