// global.IS_TEST_ENV = true;
var Tessel = require("../lib/tessel");
var board = new Tessel();

board.on("ready", function() {
  console.log("Ready");

  this.pinMode("a0", this.MODES.INPUT);
  this.digitalRead("a0", function(data) {
    // Connect a button or some similar digital signal control
    console.log(data);
  });
});
