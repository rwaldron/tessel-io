// global.IS_TEST_ENV = true;
var Tessel = require("../lib/tessel");
var board = new Tessel();

board.on("ready", function() {
  console.log("Ready");

  this.pinMode("b0", this.MODES.OUTPUT);
  this.digitalWrite("b0", this.HIGH);

  setTimeout(function() {
    this.digitalWrite("b0", this.LOW);
    process.exit(0);
  }.bind(this), 1000);
});
