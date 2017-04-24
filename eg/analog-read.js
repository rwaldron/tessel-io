// process.env.IS_TEST_MODE = true;
"use strict";

const Tessel = require("../lib/");
const board = new Tessel();
board.on("ready", () => {
  console.log("Ready");
  board.pinMode("a7", board.MODES.ANALOG);
  board.analogRead("a7", (data) => {
    process.stdout.write(`\r \u001b[36mA\u001b[39m ${padStart(data, 4, 0)}`);
  });
});

function padStart(v, l, c) {
  v = String(v);
  return Array(l - v.length + 1).join(c || " ") + v;
}
