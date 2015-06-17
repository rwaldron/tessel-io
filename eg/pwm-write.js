// global.IS_TEST_ENV = true;
var Tessel = require("../lib/tessel");
var board = new Tessel();

board.on("ready", function() {
  console.log("Ready");

  this.pinMode("a7", this.MODES.ANALOG);
  this.pinMode("b7", this.MODES.PWM);

  this.analogRead("a7", function(data) {
    this.pwmWrite("b7", data >> 2);
  });
});
