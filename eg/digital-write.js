const Tessel = require("../lib/");
const board = new Tessel();
const {
  HIGH, LOW
} = board;

board.on("ready", () => {
  console.log("Ready");

  board.pinMode("b0", board.MODES.OUTPUT);
  board.digitalWrite("b0", HIGH);

  setTimeout(() => {
    board.digitalWrite("b0", LOW);
    process.exit(0);
  }, 1000);
});
