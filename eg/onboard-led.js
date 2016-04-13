// global.IS_TEST_ENV = true;
var Tessel = require("../lib/tessel.js");
var board = new Tessel();

board.on("ready", function() {
  console.log("Ready");

  var leds = ["L0", "L1", "L2", "L3"];

  leds.forEach(led => this.digitalWrite(led, this.HIGH));

  setTimeout(() => {
    leds.forEach(led => this.digitalWrite(led, this.LOW));
  }, 1000);
});
