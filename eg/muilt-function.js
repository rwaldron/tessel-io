"use strict";

const Tessel = require("../lib/");
const board = new Tessel();

board.on("ready", () => {
  console.log("Ready");

  // LED -> PORT A Pin 5
  board.pinMode("a5", board.MODES.OUTPUT);
  // Button -> PORT A Pin 6
  board.pinMode("a6", board.MODES.INPUT);
  board.digitalRead("a6", data => {
    if (board.pins[5].value === 0 && data === 1) {
      board.digitalWrite("a5", board.HIGH);
    } else {
      if (board.pins[5].value === 1 && data === 0) {
        board.digitalWrite("a5", board.LOW);
      }
    }
  });

  // LED -> PORT B Pin 7
  board.pinMode("b7", board.MODES.PWM);
  // Potentiometer -> PORT A Pin 7
  board.pinMode("a7", board.MODES.ANALOG);
  board.analogRead("a7", data => {
    board.pwmWrite("b7", data >> 2);
  });
});
