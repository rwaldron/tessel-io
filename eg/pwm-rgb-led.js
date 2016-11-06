var Tessel = require('../lib/');
var five = require('johnny-five');

var board = new five.Board({
	io: new Tessel()
});

board.on("ready", function(){
  var led = new five.Led.RGB(["a5","a6","b5"]);

  // use led.<function> in repl
	// after color step-through is over
	this.repl.inject({
	  led: led
	});
	var colors = [
		'red',
		'orange',
		'yellow',
		'green',
		'blue'
	];
	
	led.on();

	var index = 0;
	this.loop(1000, function(done){

		if (index >= colors.length){
			led.off();
			done();
		} else {
			led.color(colors[index]);
			index++;	
		}
	});

});

