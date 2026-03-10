import {updatePlacement} from "./dom.js" 

const mode = {"hunt":0,"check":1,"run":2}
const direction = ['L', 'R', 'T', 'B']

const state = {
    mode: 0,
    direction: null,
    beginningNode: null,
    endNode: null,
    currentNode: null
}

function getRandomNode(nodeArr) {
    if (nodeArr.length === 0) return null;
    const ranNum = Math.floor(Math.random() * nodeArr.length);
    return nodeArr[ranNum];
}

export default function play(game) {
    let hitNode;
    const hitNodes = game.p1.board.allNodes.filter(n => n.hit)
    const unhitNodes = game.p1.board.allNodes.filter(n => !n.hit);
    if (unhitNodes.length === 0) return new Error("All Nodes Hit");
    
    function revertDirectionState() {
        const opposites = { R: 'L', L: 'R', T: 'B', B: 'T' };
        state.direction = opposites[state.direction];

        const dirMap = { R: 'r', L: 'l', T: 't', B: 'b' };
        const neighborKey = dirMap[state.direction];
        const neighbor = state.beginningNode[neighborKey];

        let node = neighbor;
        while (node && node.hit) {
            node = node[neighborKey];
        }
        state.currentNode = node ?? null;
    }

    if (state.mode === 0) {
        hitNode = getRandomNode(unhitNodes);
        if (hitNode.ship) {
            state.mode = 1;
            state.direction = direction[Math.floor(Math.random() * 4)];
            state.beginningNode = hitNode;
            state.currentNode = hitNode;
        };
    } else if (state.mode === 1) {
        let currNode = state.currentNode;

        if ([currNode.l, currNode.r, currNode.t, currNode.b].filter(Boolean).every(el => hitNodes.includes(el))) {
            state.direction = null;
            state.beginningNode = null;
            state.currentNode = null;
            state.mode = 0;
            return hitNode = currNode;
        }

        let counter = 0;

        while (counter < 4) {
            if (state.direction === 'R') {
                if (currNode.r && !currNode.r.hit) {
                currNode = currNode.r;
                break;
                }
                state.direction = 'L';
            } else if (state.direction === 'L') {
                if (currNode.l && !currNode.l.hit) {
                currNode = currNode.l;
                break;
                }
                state.direction = 'T';
            } else if (state.direction === 'T') {
                if (currNode.t && !currNode.t.hit) {
                currNode = currNode.t;
                break;
                }
                state.direction = 'B';
            } else { 
                if (currNode.b && !currNode.b.hit) {
                currNode = currNode.b;
                break;
                }
                state.direction = 'R';
            }

            counter++;
        }

        if (counter === 4) {
            state.direction = null;
            state.beginningNode = null;
            state.currentNode = null;
            state.mode = 0;
            return play(game)
        }

        hitNode = currNode;

        if (hitNode.ship) { 
            state.mode = 2
            state.currentNode = hitNode;
        };
    } else {
        while (state.currentNode && state.currentNode.hit) {
            if (state.direction === 'R') {
                state.currentNode = state.currentNode.r;
            } else if (state.direction === 'L') {
                state.currentNode = state.currentNode.l;
            } else if (state.direction === 'T') {
                state.currentNode = state.currentNode.t;
            } else {
                state.currentNode = state.currentNode.b;
            }
        }

        if (!state.currentNode) {
            if (state.endNode) {
                state.direction = null;
                state.beginningNode = null;
                state.currentNode = null;
                state.mode = 0;
            } else {
                state.endNode = true;

                revertDirectionState();
            }

            if (!state.currentNode) return play(game);
        }

        hitNode = state.currentNode;

        if (!state.currentNode.ship) {
            if (state.endNode) {
                state.direction = null;
                state.beginningNode = null;
                state.currentNode = null;
                state.endNode = null; 
                state.mode = 0;
            } else {
                state.endNode = hitNode;
                revertDirectionState();

                if (!state.currentNode) {
                    state.direction = null;
                    state.beginningNode = null;
                    state.endNode = null;
                    state.mode = 0;
                }
            }
        }
    }

    let winner = game.p1.board.receiveAttack(hitNode.coo);
    updatePlacement(hitNode.coo, game.p1.board, game.p1.id, 'des');

    console.log("Winner: ", winner);
    
    if (winner) {
        game.gameover(game.turn);
    } else {
        game.nextTurn();
    };
}