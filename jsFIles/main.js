import GameController from "./scripts/gameController.js"
import Player from "./scripts/player.js"
import GameBoard from "./scripts/gameboard.js"
import ComPlay from "./scripts/computer.js"
import {buildBoard} from "./scripts/dom.js"
import gameBoard from "./scripts/gameboard.js"

const game = new GameController();
const form = document.querySelector("form");
const formButtons = document.querySelectorAll("button");
const boardContainer = document.getElementById("board_container");
const boardEl = document.createElement("div");
boardContainer.appendChild(boardEl);

formButtons.forEach(btn => {
    btn.addEventListener("click", (btn) => {
        btn.preventDefault();
        game.p1 = new Player((form.p1_inp.value ? form.p1_inp.value : "Player 1"), 1,new GameBoard());

        let comp = btn.target.id === "btn_comp";
        game.p2 = new Player((form.p2_inp.value ? form.p2_inp.value : "Player 2"), (comp ? 0 : 1),new GameBoard());

        console.log("Player 1");
        game.p1.board.randomPlace();

        console.log("Player 2");
        game.p2.board.randomPlace();
    });
});
