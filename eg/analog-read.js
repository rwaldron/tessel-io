// global.IS_TEST_ENV = true;
var Tessel = require("../lib/tessel");
var board = new Tessel();

board.on("ready", function() {
  console.log("Ready");

  this.pinMode("a7", this.MODES.ANALOG);
  this.digitalRead("a7", function(data) {
    // Connect a potentiometer or some similar variable resistance sensor
    console.log(data);
  });
});
