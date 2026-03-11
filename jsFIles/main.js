import GameController from "./scripts/gameController.js"
import Player from "./scripts/player.js"
import GameBoard from "./scripts/gameboard.js"
import buildBoard, {makeVisible} from "./scripts/dom.js"


const game = new GameController();
const form = document.querySelector("form");
const formButtons = document.querySelectorAll("button");
const boardContainer = document.getElementById("board_container");
const boardEl = document.createElement("div");
boardContainer.appendChild(boardEl);

formButtons.forEach(btn => {
    btn.addEventListener("click", (btn) => {
        btn.preventDefault();
        boardContainer.innerHTML = ''

        game.p1 = new Player((form.p1_inp.value ? form.p1_inp.value : "Player 1"), 1,new GameBoard(),1);

        let comp = btn.target.id === "btn_comp";
        game.p2 = new Player((form.p2_inp.value ? form.p2_inp.value : "Player 2"), (comp ? 0 : 1),new GameBoard(),2);
        
        boardContainer.append(buildBoard(game.p1, game),buildBoard(game.p2, game));

        console.log("Player 1");
        game.p1.board.randomPlace(game.p1.id);

        console.log("Player 2");
        game.p2.board.randomPlace(game.p2.id);

        game.turn = game.p1;

        makeVisible(game)
        console.log(game)
    });
});
