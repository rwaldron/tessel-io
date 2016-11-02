// process.env.IS_TEST_MODE = true;
var Tessel = require("../lib/index");
var board = new Tessel();

board.on("ready", function() {
  console.log("Ready");
  this.pinMode("a7", this.MODES.ANALOG);
  this.analogRead("a7", function(data) {
    process.stdout.write("\r \033[36mA\033[m " + padLeft(data, 4, 0));
  });
});

function padLeft(value, l, c) {
  value = String(value);
  return Array(l - value.length + 1).join(c || " ") + value;
}
