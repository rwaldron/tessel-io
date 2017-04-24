// process.env.IS_TEST_MODE = true;
"use strict";

const Tessel = require("../lib/");
const board = new Tessel();

board.on("ready", () => {
  console.log("Ready");

  board.pinMode("a7", board.MODES.ANALOG);
  board.pinMode("b7", board.MODES.PWM);

  board.analogRead("a7", data => {
    board.pwmWrite("b7", data >> 2);
  });
});
