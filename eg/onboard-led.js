// global.IS_TEST_ENV = true;
var Tessel = require("../lib/tessel.js");
var board = new Tessel();

board.on("ready", function() {
  console.log("Ready");

  var leds = ["L0", "L1", "L2", "L3"];

  leds.forEach(function(pin) {
      this.digitalWrite(pin, this.HIGH);
  }.bind(this));
  
  setTimeout(function() {
    leds.forEach(function(pin) {
        this.digitalWrite(pin, this.LOW);
    }.bind(this));
  }.bind(this), 1000);
});
