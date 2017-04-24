"use strict";

const Tessel = require("../lib/");
const five = require("johnny-five");

const board = new five.Board({
  io: new Tessel()
});

board.on("ready", () => {
  const rgb = new five.Led.RGB(["a5", "a6", "b5"]);
  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue"
  ];

  rgb.on();

  let index = 0;
  board.loop(1000, (done) => {
    if (index >= colors.length) {
      rgb.off();
      done();
    } else {
      rgb.color(colors[index]);
      index++;
    }
  });
});
