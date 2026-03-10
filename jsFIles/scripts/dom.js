export default function buildBoard(player, game) {
    const bEl = document.createElement("div");
    bEl.classList.add("board")
    player.board.boardEl = bEl;

    let xNode = player.board.root;

    while (xNode) {
        let yNode = xNode;
        while (yNode) {
            const cell = document.createElement('div');
            cell.classList.add("cell");
            cell.id = player.id+"_"+yNode.coo;
            cell.addEventListener("click", (e)=>{
                const currPlayer = e.target.id.split("_")[0];
                const coo = (e.target.id.split("_").at(-1)).split(",").map(Number);
                const node = player.board.getNode(coo);
                

                if (node.hit) return console.log("Node has already been hit, try again.");
                if (Number(currPlayer) === Number(game.turn.id)) return console.log("This is not your board to interact with."); 

                updatePlacement(coo, player.board, player.id, "des");
                
                let winner = player.board.receiveAttack(coo);
                console.log("Winner: ", winner);
                if (winner) {
                    game.gameover(player);
                } else {
                    game.nextTurn();
                    if (game.p2.type === 0) return;
                    makeVisible(game);
                };
                
            });

            const cellP = document.createElement('p');
            cellP.textContent = "~";
            cell.appendChild(cellP);

            bEl.appendChild(cell);
            yNode = yNode.r
        }
        xNode = xNode.b;
    }

    return bEl;
}

export function updatePlacement(value, board, playerID, type) {
    const node = board.getNode(value);

    const cell = document.getElementById(playerID+"_"+node.coo);
    const cellP = cell.firstChild;
    cell.classList.add('visible');

    if (type === "set") cellP.textContent = node.ship.name[0]; 
    if (type === "des") {
        if (node.ship) {
            cellP.textContent = "𓊝"
        } else {
            cellP.textContent = "X"
        };
    }

}

export function makeVisible(game) {
    document.querySelectorAll(`[id^="${game.turn.id === 1 ? 2 : 1}_"]`).forEach(el => {
        if (el.textContent === 'X') return;
        el.classList.remove("visible");
    });
    document.querySelectorAll(`[id^="${game.turn.id}_"]`).forEach(el => {
        el.classList.add("visible");
    });
}

