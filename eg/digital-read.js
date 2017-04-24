// process.env.IS_TEST_MODE = true
"use strict";

const Tessel = require("../lib/");
const board = new Tessel();

board.on("ready", () => {
  console.log("Ready");

  board.pinMode("b2", board.MODES.INPUT);
  board.digitalRead("b2", data => {
    // Connect a button or some similar digital signal control
    console.log(data);
  });
});
