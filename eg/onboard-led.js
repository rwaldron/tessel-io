// process.env.IS_TEST_MODE = true;
"use strict";

const Tessel = require("../lib/");
const board = new Tessel();

board.on("ready", () => {
  console.log("Ready");

  const leds = ["L0", "L1", "L2", "L3"];
  let state = 1;


  leds.forEach(led => board.digitalWrite(led, state));

  setInterval(() => {
    state ^= 1;
    leds.forEach(led => board.digitalWrite(led, state));
  }, 1000);
});
