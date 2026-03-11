// shipPlacement.js
export default function buildPlacementUI(game, onComplete) {
    const overlay = document.createElement("div");
    overlay.id = "placement_overlay";

    const title = document.createElement("h2");
    title.textContent = "Place Your Ships";
    overlay.appendChild(title);

    const controls = document.createElement("div");
    controls.id = "placement_controls";

    const rotateBtn = document.createElement("button");
    rotateBtn.textContent = "Rotate (Horizontal)";
    rotateBtn.id = "rotate_btn";
    controls.appendChild(rotateBtn);
    overlay.appendChild(controls);

    // Ship tray
    const tray = document.createElement("div");
    tray.id = "ship_tray";

    const shipDefs = [
        [2, 'Patrol'],
        [3, 'Submarine'],
        [3, 'Destroyer'],
        [4, 'Battleship'],
        [5, 'Carrier']
    ];

    shipDefs.forEach(([length, name]) => {
        const shipEl = document.createElement("div");
        shipEl.classList.add("tray_ship");
        shipEl.dataset.name = name;
        shipEl.dataset.length = length;
        shipEl.draggable = true;
        shipEl.title = `${name} (${length})`;

        for (let i = 0; i < length; i++) {
            const seg = document.createElement("div");
            seg.classList.add("ship_seg");
            shipEl.appendChild(seg);
        }

        const label = document.createElement("span");
        label.textContent = name;
        shipEl.appendChild(label);

        tray.appendChild(shipEl);
    });

    overlay.appendChild(tray);

    // Placement grid
    const gridWrapper = document.createElement("div");
    gridWrapper.id = "placement_grid_wrapper";
    const grid = document.createElement("div");
    grid.id = "placement_grid";
    gridWrapper.appendChild(grid);
    overlay.appendChild(gridWrapper);

    const confirmBtn = document.createElement("button");
    confirmBtn.id = "confirm_placement";
    confirmBtn.textContent = "Confirm Placement";
    confirmBtn.disabled = true;
    overlay.appendChild(confirmBtn);

    document.body.appendChild(overlay);

    // State
    let direction = "H"; // H = horizontal, V = vertical
    let draggedShip = null;
    let dragSegIndex = 0; // which segment of the ship was grabbed
    
    // placement map: cellKey -> shipName
    const placedMap = {}; // cellKey "[x,y]" -> shipName
    const placedShips = new Set();

    rotateBtn.addEventListener("click", () => {
        direction = direction === "H" ? "V" : "H";
        rotateBtn.textContent = `Rotate (${direction === "H" ? "Horizontal" : "Vertical"})`;
    });

    // Build grid cells from board nodes
    let xNode = game.p1.board.root;
    while (xNode) {
        let yNode = xNode;
        while (yNode) {
            const cell = document.createElement("div");
            cell.classList.add("placement_cell");
            cell.dataset.coo = yNode.coo;
            grid.appendChild(cell);
            yNode = yNode.r;
        }
        xNode = xNode.b;
    }

    function getCellsForPlacement(startCoo, length, dir) {
        // Returns array of cell elements or null if invalid
        const cells = [];
        let node = game.p1.board.getNode(startCoo);
        for (let i = 0; i < length; i++) {
            if (!node) return null;
            const el = grid.querySelector(`[data-coo="${node.coo}"]`);
            if (!el) return null;
            cells.push({ el, node });
            node = dir === "H" ? node.r : node.b;
        }
        return cells;
    }

    function clearHighlights() {
        grid.querySelectorAll(".placement_cell").forEach(c => {
            c.classList.remove("highlight_valid", "highlight_invalid");
        });
    }

    function getOccupied(excludeName = null) {
        const occupied = new Set();
        for (const [key, name] of Object.entries(placedMap)) {
            if (name !== excludeName) occupied.add(key);
        }
        return occupied;
    }

    // Drag events on tray ships
    tray.addEventListener("dragstart", (e) => {
        const shipEl = e.target.closest(".tray_ship");
        if (!shipEl) return;
        draggedShip = { name: shipEl.dataset.name, length: parseInt(shipEl.dataset.length), fromTray: true };
        dragSegIndex = 0;
        e.dataTransfer.effectAllowed = "move";
    });

    // Drag events on already-placed ships in grid
    grid.addEventListener("dragstart", (e) => {
        const cell = e.target.closest(".placement_cell");
        if (!cell || !cell.dataset.ship) return;
        const name = cell.dataset.ship;
        const shipDef = shipDefs.find(([, n]) => n === name);
        draggedShip = { name, length: shipDef[0], fromTray: false };

        // Figure out which segment was grabbed
        const allCells = [...grid.querySelectorAll(`[data-ship="${name}"]`)];
        dragSegIndex = allCells.indexOf(cell);

        e.dataTransfer.effectAllowed = "move";
    });

    grid.addEventListener("dragover", (e) => {
        e.preventDefault();
        clearHighlights();
        if (!draggedShip) return;

        const cell = e.target.closest(".placement_cell");
        if (!cell) return;

        const startCoo = cell.dataset.coo.split(",").map(Number);

        // Offset start by dragSegIndex
        let offsetNode = game.p1.board.getNode(startCoo);
        for (let i = 0; i < dragSegIndex; i++) {
            if (!offsetNode) break;
            offsetNode = direction === "H" ? offsetNode.l : offsetNode.t;
        }
        if (!offsetNode) return;

        const cells = getCellsForPlacement(offsetNode.coo, draggedShip.length, direction);
        if (!cells) return;

        const occupied = getOccupied(draggedShip.fromTray ? null : draggedShip.name);
        const valid = cells.every(({ node }) => !occupied.has(`${node.coo}`));

        cells.forEach(({ el }) => {
            el.classList.add(valid ? "highlight_valid" : "highlight_invalid");
        });
    });

    grid.addEventListener("dragleave", (e) => {
        if (!e.relatedTarget || !grid.contains(e.relatedTarget)) {
            clearHighlights();
        }
    });

    grid.addEventListener("drop", (e) => {
        e.preventDefault();
        clearHighlights();
        if (!draggedShip) return;

        const cell = e.target.closest(".placement_cell");
        if (!cell) return;

        const startCoo = cell.dataset.coo.split(",").map(Number);

        let offsetNode = game.p1.board.getNode(startCoo);
        for (let i = 0; i < dragSegIndex; i++) {
            if (!offsetNode) break;
            offsetNode = direction === "H" ? offsetNode.l : offsetNode.t;
        }
        if (!offsetNode) return;

        const cells = getCellsForPlacement(offsetNode.coo, draggedShip.length, direction);
        if (!cells) return;

        const occupied = getOccupied(draggedShip.fromTray ? null : draggedShip.name);
        const valid = cells.every(({ node }) => !occupied.has(`${node.coo}`));
        if (!valid) return;

        // Remove old placement if re-placing
        if (!draggedShip.fromTray) {
            for (const [key, name] of Object.entries(placedMap)) {
                if (name === draggedShip.name) delete placedMap[key];
            }
            grid.querySelectorAll(`[data-ship="${draggedShip.name}"]`).forEach(c => {
                c.dataset.ship = "";
                c.draggable = false;
                c.classList.remove("placed");
                c.textContent = "";
            });
        }

        // Place ship
        cells.forEach(({ el, node }) => {
            placedMap[`${node.coo}`] = draggedShip.name;
            el.dataset.ship = draggedShip.name;
            el.draggable = true;
            el.classList.add("placed");
        });

        placedShips.add(draggedShip.name);

        // Hide from tray
        const trayEl = tray.querySelector(`[data-name="${draggedShip.name}"]`);
        if (trayEl) trayEl.classList.add("placed_in_tray");

        draggedShip = null;
        dragSegIndex = 0;

        confirmBtn.disabled = placedShips.size < shipDefs.length;
    });

    confirmBtn.addEventListener("click", () => {
        // Write placements to board nodes
        for (const [cooStr, shipName] of Object.entries(placedMap)) {
            const coo = cooStr.split(",").map(Number);
            const node = game.p1.board.getNode(coo);
            const ship = game.p1.board.pieces.find(p => p.name === shipName);
            node.ship = ship;
            ship.placed = true;
        }

        overlay.remove();
        onComplete();
    });
}