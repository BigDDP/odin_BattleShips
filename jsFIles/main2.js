import GameController from "./scripts/gameController.js"
import Player from "./scripts/player.js"
import GameBoard from "./scripts/gameboard.js"
import buildBoard, { makeVisible } from "./scripts/dom.js"
import buildPlacementUI from "./scripts/shipPlacement.js"

const game = new GameController();
const form = document.querySelector("form");
form.addEventListener("submit", (e) => e.preventDefault());
const formButtons = document.querySelectorAll("button");
const boardContainer = document.getElementById("board_container");

formButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        boardContainer.innerHTML = '';

        game.p1 = new Player((form.p1_inp.value || "Player 1"), 1, new GameBoard(), 1);

        const comp = e.target.id === "btn_comp";
        game.p2 = new Player((form.p2_inp.value || "Player 2"), (comp ? 0 : 1), new GameBoard(), 2);

        game.p1.board.populateAllNodes();

        buildPlacementUI(game, () => {
            console.log("Placement confirmed");
            boardContainer.append(buildBoard(game.p1, game),buildBoard(game.p2, game));
            game.p2.board.randomPlace(game.p2.id);
            game.turn = game.p1;
            makeVisible(game);
            
            console.log(game)
            console.log(game.p1.board.print());
            console.log(game.p2.board.print());
        });
    });
});