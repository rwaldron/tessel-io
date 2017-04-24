"use strict";

const Tessel = require("../lib/");
const board = new Tessel();

board.on("ready", () => {
  console.log(`Started At: ${Date.now()}`);
  const pins = ["A4","A7","B2","B3","B4","B5","B6","B7"];
  const values = pins.reduce((accum, pin) => (accum[pin] = 0, accum), {});

  pins.forEach(p => {
    board.pinMode(p, board.MODES.ANALOG);
    board.analogRead(p, value => values[p] = value);
  });

  const leds = ["L0", "L1", "L2", "L3"];
  let state = 1;

  leds.forEach(led => board.digitalWrite(led, state));

  // 50Hz
  setInterval(() => {
    process.stdout.write(`\r ${Date.now()}: ${pins.map(p => padStart(values[p], 4, 0)).join("")}`);
    state ^= 1;
    leds.forEach(led => board.digitalWrite(led, state));
  }, 1000 / 50);
});

function padStart(v, l, c) {
  v = String(v);
  return Array(l - v.length + 1).join(c || " ") + v;
}
