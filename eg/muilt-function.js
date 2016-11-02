var Tessel = require("../lib/index");
var board = new Tessel();

board.on("ready", function() {
  console.log("Ready");

  // LED -> PORT A Pin 5
  this.pinMode("a5", this.MODES.OUTPUT);
  // Button -> PORT A Pin 6
  this.pinMode("a6", this.MODES.INPUT);
  this.digitalRead("a6", function(data) {
    if (this.pins[5].value === 0 && data === 1) {
      this.digitalWrite("a5", this.HIGH);
    } else {
      if (this.pins[5].value === 1 && data === 0) {
        this.digitalWrite("a5", this.LOW);
      }
    }
  });

  // LED -> PORT B Pin 7
  this.pinMode("b7", this.MODES.PWM);
  // Potentiometer -> PORT A Pin 7
  this.pinMode("a7", this.MODES.ANALOG);
  this.analogRead("a7", function(data) {
    this.pwmWrite("b7", data >> 2);
  });
});
