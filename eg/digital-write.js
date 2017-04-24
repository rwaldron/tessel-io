// process.env.IS_TEST_MODE = true;
"use strict";

const Tessel = require("../lib/");
const board = new Tessel();

board.on("ready", () => {
  console.log("Ready");

  board.pinMode("b0", board.MODES.OUTPUT);
  board.digitalWrite("b0", board.HIGH);

  setTimeout(() => {
    board.digitalWrite("b0", board.LOW);
    process.exit(0);
  }, 1000);
});
