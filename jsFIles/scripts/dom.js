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
                

                if (node.hit) return alert("Node has already been hit, try again.");
                if (Number(currPlayer) === Number(game.turn.id)) return alert("This is not your board to interact with."); 

                updatePlacement(coo, player.board, player.id, "des");

                let winner = player.board.receiveAttack(coo);
                
                if (winner) {
                    game.gameover(player);
                } else {
                    game.nextTurn();
                };
                
            });

            const cellP = document.createElement('p');

            if (yNode.ship) {
                cellP.textContent = yNode.ship.name[0]
            } else {
                cellP.textContent = "~"
            };

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
    const cellP = cell.querySelector('p'); // was cell.firstChild, which can be a text node
    cell.classList.add('visible');

    if (type === "set") {
        if (!node.ship) return;
        cellP.textContent = node.ship.name[0];
    }; 
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

export function updateVisuals(game) {
    if (!game.p1 || !game.p2) return;

    const container = document.querySelector(".legend_container");
    container.style.display = "block"

    const [p1Div, p2Div] = container.children;

    const p1Name = p1Div.querySelector("h3");
    const p2Name = p2Div.querySelector("h3");
    const p1Leg  = p1Div.querySelector("p");
    const p2Leg  = p2Div.querySelector("p");
    const p1Ships = p1Div.querySelector("#p1_ships");
    const p2Ships = p2Div.querySelector("#p2_ships");

    p1Ships.innerHTML = '';
    p2Ships.innerHTML = '';

    p1Name.textContent = "Player: " + game.p1.name;
    p2Name.textContent = "Computer: " + game.p2.name;
    p1Leg.textContent = game.turn === game.p1 ? "Your Turn" : "Awaiting "+game.p2.name+"'s turn";
    p2Leg.textContent = game.turn === game.p2 ? "Your Turn" : "Awaiting "+game.p1.name+"'s turn";
    game.p1.board.pieces.forEach(ship => {
        const newItem = document.createElement("p");
        newItem.textContent = ship.name + ": " + (ship.sunk ? "Ship Destroyed" : "Ship Alive & Well");
        p1Ships.appendChild(newItem);
    });
    game.p2.board.pieces.forEach(ship => {
        const newItem = document.createElement("p");
        newItem.textContent = ship.name + ": " + (ship.sunk ? "Ship Destroyed" : "Ship Alive & Well");
        p2Ships.appendChild(newItem);
    });
}

export function reset() {
    document.getElementById("board_container").innerHTML = '';
    document.querySelector(".legend_container").style.display = "none";
    document.getElementById("selection_container").style.display = "block";
    document.getElementById("placement_overlay")?.remove();
    document.getElementById("p1_inp").value = ''
    document.getElementById("p2_inp").value = ''
}