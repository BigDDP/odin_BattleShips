import GameController from "scripts/gameController.js"
import Player from "scripts/player.js"
import GameBoard from "scripts/gameboard.js"
import ComPlay from "scripts/computer.js"
import {buildBoard} from "scripts/dom.js"
import gameBoard from "./scripts/gameboard"

const game = new GameController();
const form = document.querySelector("form");
const formButtons = document.querySelector("button");
const boardContainer = document.getElementById("board_container");
const boardEl = document.createElement("div");
boardContainer.appendChild(boardEl);

formButtons.forEach(btn => {
    btn.addEventListener("onclick", (e) => {
        game.p1 = new Player(1,new GameBoard());

        let comp = e.target.id === "btn_comp";
        game.p2 = new Player(comp ? 0 : 1,new GameBoard());
    });
});

(() => {
    game.p1.board.randomPlace();
});