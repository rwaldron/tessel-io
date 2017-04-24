// process.env.IS_TEST_MODE = true;
"use strict";

const Tessel = require("../lib/");
const board = new Tessel();

const BlinkM = {
  ADDRESS: 0x09,
  FADE_TO_RGB: 0x63,
  FADE_TO_RANDOM_RGB: 0x43,
  SCRIPT_PLAY: 0x70,
  SCRIPT_STOP: 0x6f,
  SET_RGB: 0x6e,
  GET_RGB: 0x67,
};

const rgb = {
  red:    [0xff, 0x00, 0x00],
  orange: [0xff, 0x7f, 0x00],
  yellow: [0xff, 0xff, 0x00],
  green:  [0x00, 0xff, 0x00],
  blue:   [0x00, 0x00, 0xff],
  indigo: [0x31, 0x00, 0x62],
  violet: [0x4b, 0x00, 0x82],
  white:  [0xff, 0xff, 0xff],
};

const rainbow = Object.keys(rgb).reduce((colors, color) => {
  // While testing, I found that the BlinkM produced
  // more vibrant colors when provided a 7 bit value.
  return (colors[color] = rgb[color].map(v => v >> 1), colors);
}, {});

const colors = Object.keys(rainbow);
let index = 0;

board.on("ready", () => {
  console.log("READY");

  board.i2cConfig({
    address: BlinkM.ADDRESS,
    bus: "A"
  });

  // http://thingm.com/fileadmin/thingm/downloads/BlinkM_datasheet.pdf
  board.i2cWrite(BlinkM.ADDRESS, BlinkM.SCRIPT_STOP);
  board.i2cWrite(BlinkM.ADDRESS, BlinkM.SET_RGB, [0, 0, 0]);

  const cycle = () => {
    if (index === colors.length) {
      index = 0;
    }

    const color = colors[index++];

    board.i2cWrite(BlinkM.ADDRESS, BlinkM.FADE_TO_RGB, rainbow[color]);
    board.i2cReadOnce(BlinkM.ADDRESS, BlinkM.GET_RGB, 3, (data) => {
      console.log(`(${Date.now()}) RGB: [${data}]`, Date.now());

      setTimeout(() => cycle, 1000);
    });
  };

  cycle();
});

