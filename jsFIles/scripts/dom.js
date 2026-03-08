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
                const coo = (e.target.id.split("_").at(-1)).split(",").map(Number);
                updatePlacement(coo, player.board, player.id, "des");
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

    console.log(value, board, playerID, type)
    const cell = document.getElementById(playerID+"_"+node.coo);
    const cellP = cell.firstChild;

    if (type === "set") cellP.textContent = node.ship.name[0]; 
    if (type === "des") cellP.textContent = "X";
}

