"use strict";

process.env.IS_TEST_ENV = true;

var Tessel = require("../lib/tessel");
var factory = require("../test/tessel-mock");
var os = require("os");
var util = require("util");
var Emitter = require("events").EventEmitter;
var sinon = require("sinon");


var Port = {};

// From t2-firmware/node/tessel.js
Port.CMD = {
  GPIO_IN: 0x03,
  ENABLE_I2C: 0x0C,
  DISABLE_I2C: 0x0D,
  TX: 0x10,
  RX: 0x11,
  TXRX: 0x12,
  START: 0x13,
  STOP: 0x14,
  ANALOG_READ: 0x18,
  ANALOG_WRITE: 0x19,
 };

Port.REPLY = {
  ACK:  0x80,
  NACK: 0x81,
  HIGH: 0x82,
  LOW:  0x83,
  DATA: 0x84,

  MIN_ASYNC: 0xA0,
  // c0 to c8 is all async pin assignments
  ASYNC_PIN_CHANGE_N: 0xC0,
  ASYNC_UART_RX: 0xD0
};


var functions = [{
  name: "analogRead"
}, {
  name: "analogWrite"
}, {
  name: "digitalRead"
}, {
  name: "digitalWrite"
}, {
  name: "pwmWrite"
}, {
  name: "analogWrite"
}, {
  name: "servoWrite"
}, {
  name: "i2cConfig"
}, {
  name: "i2cWrite"
}, {
  name: "i2cRead"
}, {
  name: "i2cReadOnce"
}, {
  name: "i2cWrite"
}, {
  name: "serialConfig"
}, {
  name: "serialWrite"
}, {
  name: "serialRead"
}, {
  name: "serialStop"
}, {
  name: "serialClose"
}, {
  name: "serialFlush"
}, {
  name: "serialListen"
}];

var objects = [{
  name: "MODES"
}];

var numbers = [{
  name: "HIGH"
}, {
  name: "LOW"
}];

var instance = [{
  name: "pins"
}, {
  name: "analogPins"
}];



var ToPinIndex = Tessel.ToPinIndex;
var ToPortIdentity = Tessel.ToPortIdentity;
var ToPortI2CBus = Tessel.ToPortI2CBus;
var ToI2CBusPort = Tessel.ToI2CBusPort;
var Pin = Tessel.Pin;
var tessel = Tessel.tessel;
var T2 = factory.Tessel;

exports["Tessel.PORTS.*"] = {
  setUp: function(done) {
    done();
  },
  tearDown: function(done) {
    done();
  },
  ports: function(test) {
    test.expect(2);

    test.equal(Tessel.PORTS.A, tessel.port.A);
    test.equal(Tessel.PORTS.B, tessel.port.B);
    test.done();
  },
};

exports["Tessel Constructor"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.hostname = this.sandbox.stub(os, "hostname", _ => "NOT A REAL TESSEL");
    this.output = this.sandbox.stub(T2.Pin.prototype, "output");
    this.tessel = new Tessel();
    done();
  },
  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  tesselName: function(test) {
    test.expect(1);
    test.equal(this.tessel.name, "Tessel 2 (NOT A REAL TESSEL)");
    test.done();
  },


  // shape: function(test) {
  //   test.expect(
  //     functions.length +
  //     objects.length +
  //     numbers.length +
  //     instance.length
  //   );

  //   functions.forEach(function(method) {
  //     test.equal(typeof this.tessel[method.name], "function", method.name);
  //   }, this);

  //   objects.forEach(function(method) {
  //     test.equal(typeof this.tessel[method.name], "object", method.name);
  //   }, this);

  //   numbers.forEach(function(method) {
  //     test.equal(typeof this.tessel[method.name], "number", method.name);
  //   }, this);

  //   instance.forEach(function(property) {
  //     test.notEqual(typeof this.tessel[property.name], "undefined", property.name);
  //   }, this);

  //   test.done();
  // },

  pins: function(test) {
    test.expect(2);
    test.equal(this.tessel.pins.length, 20);
    test.equal(this.tessel.analogPins.length, 10);
    test.done();
  },

  initialMode: function(test) {
    test.expect(20);

    test.equal(this.tessel.pins[0].mode, undefined);
    test.equal(this.tessel.pins[1].mode, undefined);
    test.equal(this.tessel.pins[2].mode, undefined);
    test.equal(this.tessel.pins[3].mode, undefined);
    test.equal(this.tessel.pins[4].mode, undefined);
    test.equal(this.tessel.pins[5].mode, undefined);
    test.equal(this.tessel.pins[6].mode, undefined);
    test.equal(this.tessel.pins[7].mode, undefined);
    test.equal(this.tessel.pins[8].mode, undefined);
    test.equal(this.tessel.pins[9].mode, undefined);
    test.equal(this.tessel.pins[10].mode, undefined);
    test.equal(this.tessel.pins[11].mode, undefined);
    test.equal(this.tessel.pins[12].mode, undefined);
    test.equal(this.tessel.pins[13].mode, undefined);
    test.equal(this.tessel.pins[14].mode, undefined);
    test.equal(this.tessel.pins[15].mode, undefined);
    test.equal(this.tessel.pins[16].mode, undefined);
    test.equal(this.tessel.pins[17].mode, undefined);
    test.equal(this.tessel.pins[18].mode, undefined);
    test.equal(this.tessel.pins[19].mode, undefined);

    test.done();
  },

  initialValue: function(test) {
    test.expect(20);

    test.equal(this.tessel.pins[0].value, 0);
    test.equal(this.tessel.pins[1].value, 0);
    test.equal(this.tessel.pins[2].value, 0);
    test.equal(this.tessel.pins[3].value, 0);
    test.equal(this.tessel.pins[4].value, 0);
    test.equal(this.tessel.pins[5].value, 0);
    test.equal(this.tessel.pins[6].value, 0);
    test.equal(this.tessel.pins[7].value, 0);
    test.equal(this.tessel.pins[8].value, 0);
    test.equal(this.tessel.pins[9].value, 0);
    test.equal(this.tessel.pins[10].value, 0);
    test.equal(this.tessel.pins[11].value, 0);
    test.equal(this.tessel.pins[12].value, 0);
    test.equal(this.tessel.pins[13].value, 0);
    test.equal(this.tessel.pins[14].value, 0);
    test.equal(this.tessel.pins[15].value, 0);
    test.equal(this.tessel.pins[16].value, undefined);
    test.equal(this.tessel.pins[17].value, undefined);
    test.equal(this.tessel.pins[18].value, undefined);
    test.equal(this.tessel.pins[19].value, undefined);

    test.done();
  },

};

exports["Automatic REPL disabling"] = {
  setUp: function(done) {
    this.dirName = Tessel.dirName();
    done();
  },
  tearDown: function(done) {
    Tessel.purge();
    Tessel.dirName(this.dirName);
    done();
  },

  checkT2Run: function(test) {
    test.expect(1);

    Tessel.dirName("/tmp/remote-script");
    var tessel = new Tessel();

    test.equal(tessel.repl, undefined);

    test.done();
  },

  checkT2Push: function(test) {
    test.expect(1);

    Tessel.dirName("/app/remote-script");
    var tessel = new Tessel();

    test.equal(tessel.repl, false);

    test.done();
  }
};


exports["ToPinIndex"] = {
  valid: function(test) {
    test.expect(80);

    var offsetB = 8;
    var offsetL = 16;

    for (var i = 0; i < 8; i++) {
      test.equal(ToPinIndex("A" + i), i);
      test.equal(ToPinIndex("B" + i), i + offsetB);

      test.equal(ToPinIndex("a" + i), i);
      test.equal(ToPinIndex("b" + i), i + offsetB);

      test.equal(ToPinIndex("A_" + i), i);
      test.equal(ToPinIndex("B_" + i), i + offsetB);

      test.equal(ToPinIndex("a_" + i), i);
      test.equal(ToPinIndex("b_" + i), i + offsetB);

      if (i < 4) {
        test.equal(ToPinIndex("L" + i), i + offsetL);
        test.equal(ToPinIndex("l" + i), i + offsetL);
        test.equal(ToPinIndex("L_" + i), i + offsetL);
        test.equal(ToPinIndex("l_" + i), i + offsetL);
      }
    }

    test.done();
  },

  validIndex: function(test) {
    test.expect(20);
    for (var j = 0; j < 20; j++) {
      test.equal(ToPinIndex(j), j);
    }
    test.done();
  },

  invalidIndex: function(test) {
    test.expect(41);
    for (var j = 1; j < 20; j++) {
      test.equal(ToPinIndex(-j), -1);
      test.equal(ToPinIndex(j + 20), -1);
    }

    test.equal(ToPinIndex(null), -1);
    test.equal(ToPinIndex(undefined), -1);
    test.equal(ToPinIndex(false), -1);
    test.done();
  },

  valueMatchesPortButOutOfRange: function(test) {
    test.expect(1);
    test.equal(ToPinIndex(20), -1);
    test.done();
  },

  invalidNonCoercible: function(test) {
    test.expect(1);
    test.equal(ToPinIndex("c1"), -1);
    test.done();
  },
};

exports["ToPortIdentity"] = {
  valid: function(test) {
    test.expect(20);

    var offset = 0;
    var port = "A";

    for (var i = 0; i < 20; i++) {
      if (i > 7) {
        port = "B";
        offset = 8;
      }

      if (i > 15) {
        port = "L";
        offset = 16;
      }

      test.deepEqual(ToPortIdentity(i), { port: port, index: i - offset });
    }
    test.done();
  },
  invalid: function(test) {
    test.expect(2);
    test.deepEqual(ToPortIdentity(-1), { port: null, index: -1 });
    test.deepEqual(ToPortIdentity(20), { port: null, index: -1 });
    test.done();
  },

  valueMatchesPortBusOutOfRange: function(test) {
    test.expect(1);
    test.deepEqual(ToPortIdentity(20), { port: null, index: -1 });
    test.done();
  },

};

exports["ToPortI2CBus"] = {
  valid: function(test) {
    test.expect(6);
    test.equal(ToPortI2CBus("A"), 4);
    test.equal(ToPortI2CBus("B"), 2);
    test.equal(ToPortI2CBus("a"), 4);
    test.equal(ToPortI2CBus("b"), 2);
    test.equal(ToPortI2CBus(4), 4);
    test.equal(ToPortI2CBus(2), 2);
    test.done();
  },
  validPortButNoBus: function(test) {
    test.expect(1);
    test.equal(ToPortI2CBus("L"), -1);
    test.done();
  },
  invalid: function(test) {
    test.expect(2);
    test.equal(ToPortI2CBus("C"), -1);
    test.equal(ToPortI2CBus(0), -1);
    test.done();
  },
  invalidPort: function(test) {
    test.expect(1);
    test.equal(ToPortI2CBus("C"), -1);
    test.done();
  },
  invalidBus: function(test) {
    test.expect(1);
    test.equal(ToPortI2CBus(0), -1);
    test.done();
  },
};

exports["ToI2CBusPort"] = {
  valid: function(test) {
    test.expect(6);
    test.equal(ToI2CBusPort("A"), "A");
    test.equal(ToI2CBusPort("B"), "B");
    test.equal(ToI2CBusPort("a"), "A");
    test.equal(ToI2CBusPort("b"), "B");
    test.equal(ToI2CBusPort(4), "A");
    test.equal(ToI2CBusPort(2), "B");
    test.done();
  },
  validPortButNoBus: function(test) {
    test.expect(1);
    test.equal(ToI2CBusPort("L"), undefined);
    test.done();
  },
  invalid: function(test) {
    test.expect(2);
    test.equal(ToI2CBusPort("C"), undefined);
    test.equal(ToI2CBusPort(0), undefined);
    test.done();
  },
};

exports["Tessel.prototype.normalize"] = {
  setUp: function(done) {
    this.tessel = new Tessel();
    done();
  },
  tearDown: function(done) {
    Tessel.purge();
    done();
  },

  invalid: function(test) {
    test.expect(3);
    test.equal(this.tessel.normalize(null), -1);
    test.equal(this.tessel.normalize(undefined), -1);
    test.equal(this.tessel.normalize(false), -1);
    test.done();
  },

  stringNames: function(test) {
    test.expect(40);

    var offsetB = 8;
    var offsetL = 16;

    for (var i = 0; i < 8; i++) {

      test.equal(this.tessel.normalize("A" + i), i);
      test.equal(this.tessel.normalize("A-" + i), i);

      test.equal(this.tessel.normalize("B" + i), i + offsetB);
      test.equal(this.tessel.normalize("B-" + i), i + offsetB);

      if (i < 4) {
        test.equal(this.tessel.normalize("L" + i), i + offsetL);
        test.equal(this.tessel.normalize("L-" + i), i + offsetL);
      }
    }

    test.done();
  },

  index: function(test) {
    test.expect(20);

    for (var i = 0; i < 20; i++) {
      test.equal(this.tessel.normalize(i), i);
    }

    test.done();
  },
};

exports["Tessel.prototype.pinMode"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.output = this.sandbox.spy(tessel.port.A.pin[0], "output");
    this.input = this.sandbox.spy(tessel.port.A.pin[0], "input");
    this.pwmFrequency = this.sandbox.spy(tessel, "pwmFrequency");
    this.pwmDutyCycle = this.sandbox.spy(T2.Pin.prototype, "pwmDutyCycle");

    this.tessel = new Tessel();
    done();
  },
  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  returns: function(test) {
    test.expect(3);
    test.equal(this.tessel.pinMode("A0", this.tessel.MODES.INPUT), this.tessel);
    test.equal(this.tessel.pinMode("B0", this.tessel.MODES.INPUT), this.tessel);
    test.equal(this.tessel.pinMode("L0", this.tessel.MODES.OUTPUT), this.tessel);
    test.done();
  },

  input: function(test) {
    test.expect(18);

    var offset = 8;

    this.output.reset();
    this.input.reset();

    for (var i = 0; i < 8; i++) {
      this.tessel.pinMode("A" + i, this.tessel.MODES.INPUT);
      this.tessel.pinMode("B" + i, this.tessel.MODES.INPUT);
      test.equal(this.tessel.pins[i].mode, this.tessel.MODES.INPUT);
      test.equal(this.tessel.pins[i + 8].mode, this.tessel.MODES.INPUT);
    }

    test.equal(this.output.callCount, 0);
    test.equal(this.input.callCount, 1);

    test.done();
  },

  output: function(test) {
    test.expect(38);

    var offset = 8;

    this.output.reset();
    this.input.reset();

    for (var i = 0; i < 8; i++) {
      test.equal(this.tessel.pinMode("A" + i, this.tessel.MODES.OUTPUT), this.tessel);
      test.equal(this.tessel.pinMode("B" + i, this.tessel.MODES.OUTPUT), this.tessel);
      test.equal(this.tessel.pins[i].mode, this.tessel.MODES.OUTPUT);
      test.equal(this.tessel.pins[i + 8].mode, this.tessel.MODES.OUTPUT);

      if (i < 4) {
        this.tessel.pinMode("L" + i, this.tessel.MODES.OUTPUT);
        test.equal(this.tessel.pins[i + 16].mode, this.tessel.MODES.OUTPUT);
      }
    }

    test.equal(this.output.callCount, 1);
    test.equal(this.input.callCount, 0);

    test.done();
  },

  analogInput: function(test) {
    test.expect(26);

    var offset = 8;

    this.output.reset();
    this.input.reset();

    for (var i = 0; i < 8; i++) {
      test.equal(this.tessel.pinMode("A" + i, this.tessel.MODES.ANALOG), this.tessel);
      test.equal(this.tessel.pinMode("B" + i, this.tessel.MODES.ANALOG), this.tessel);
      test.equal(this.tessel.pins[i].mode, this.tessel.MODES.ANALOG);
    }

    test.equal(this.output.callCount, 0);
    test.equal(this.input.callCount, 1);

    test.done();
  },

  i2c: function(test) {
    test.expect(26);

    var offset = 8;

    this.output.reset();
    this.input.reset();

    for (var i = 0; i < 8; i++) {
      test.equal(this.tessel.pinMode("A" + i, this.tessel.MODES.I2C), this.tessel);
      test.equal(this.tessel.pinMode("B" + i, this.tessel.MODES.I2C), this.tessel);
      test.equal(this.tessel.pins[i].mode, this.tessel.MODES.I2C);
    }

    // Neither is called for I2C
    test.equal(this.output.callCount, 0);
    test.equal(this.input.callCount, 0);

    test.done();
  },

  pwm: function(test) {
    test.expect(8);

    test.equal(this.tessel.pinMode("A5", this.tessel.MODES.PWM), this.tessel);
    test.equal(this.tessel.pinMode("A6", this.tessel.MODES.PWM), this.tessel);
    test.equal(this.tessel.pinMode("B5", this.tessel.MODES.PWM), this.tessel);
    test.equal(this.tessel.pinMode("B6", this.tessel.MODES.PWM), this.tessel);

    test.equal(this.tessel.pins[5].mode, this.tessel.MODES.PWM);
    test.equal(this.tessel.pins[6].mode, this.tessel.MODES.PWM);

    test.equal(this.tessel.pins[13].mode, this.tessel.MODES.PWM);
    test.equal(this.tessel.pins[14].mode, this.tessel.MODES.PWM);

    test.done();
  },

  servo: function(test) {
    test.expect(8);

    test.equal(this.tessel.pinMode("A5", this.tessel.MODES.SERVO), this.tessel);
    test.equal(this.tessel.pinMode("A6", this.tessel.MODES.SERVO), this.tessel);
    test.equal(this.tessel.pinMode("B5", this.tessel.MODES.SERVO), this.tessel);
    test.equal(this.tessel.pinMode("B6", this.tessel.MODES.SERVO), this.tessel);

    test.equal(this.tessel.pins[5].mode, this.tessel.MODES.SERVO);
    test.equal(this.tessel.pins[6].mode, this.tessel.MODES.SERVO);

    test.equal(this.tessel.pins[13].mode, this.tessel.MODES.SERVO);
    test.equal(this.tessel.pins[14].mode, this.tessel.MODES.SERVO);

    test.done();
  },

};


exports["Tessel.prototype.digitalWrite"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.output_a = this.sandbox.spy(tessel.port.A.pin[0], "output");
    this.input_a = this.sandbox.spy(tessel.port.A.pin[0], "input");
    this.write_a = this.sandbox.spy(tessel.port.A.pin[0], "write");

    this.output_b = this.sandbox.spy(tessel.port.B.pin[0], "output");
    this.input_b = this.sandbox.spy(tessel.port.B.pin[0], "input");
    this.write_b = this.sandbox.spy(tessel.port.B.pin[0], "write");

    this.write_l = this.sandbox.spy(tessel.leds[2], "write");

    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  returns: function(test) {
    test.expect(3);
    test.equal(this.tessel.digitalWrite("A0", 1), this.tessel);
    test.equal(this.tessel.digitalWrite("B0", 1), this.tessel);
    test.equal(this.tessel.digitalWrite("L2", 1), this.tessel);
    test.done();
  },

  high: function(test) {
    test.expect(3);

    this.write_a.reset();
    this.write_b.reset();
    this.write_l.reset();

    this.tessel.digitalWrite("A0", 1);
    this.tessel.digitalWrite("A0", 255);
    this.tessel.digitalWrite("A0", true);

    this.tessel.digitalWrite(0, 1);
    this.tessel.digitalWrite(0, 255);
    this.tessel.digitalWrite(0, true);

    this.tessel.digitalWrite("B0", 1);
    this.tessel.digitalWrite("B0", 255);
    this.tessel.digitalWrite("B0", true);

    this.tessel.digitalWrite(8, 1);
    this.tessel.digitalWrite(8, 255);
    this.tessel.digitalWrite(8, true);

    this.tessel.digitalWrite("L2", 1);
    this.tessel.digitalWrite("L2", 255);
    this.tessel.digitalWrite("L2", true);

    this.tessel.digitalWrite(18, 1);
    this.tessel.digitalWrite(18, 255);
    this.tessel.digitalWrite(18, true);

    test.equal(this.write_a.callCount, 6);
    test.equal(this.write_b.callCount, 6);
    test.equal(this.write_l.callCount, 6);
    test.done();
  },

  low: function(test) {
    test.expect(2);

    this.write_a.reset();
    this.write_b.reset();

    this.tessel.digitalWrite("A0", 0);
    this.tessel.digitalWrite("A0", -1);
    this.tessel.digitalWrite("A0", false);

    this.tessel.digitalWrite(0, 0);
    this.tessel.digitalWrite(0, -1);
    this.tessel.digitalWrite(0, false);

    this.tessel.digitalWrite("B0", 0);
    this.tessel.digitalWrite("B0", -1);
    this.tessel.digitalWrite("B0", false);

    this.tessel.digitalWrite(8, 0);
    this.tessel.digitalWrite(8, -1);
    this.tessel.digitalWrite(8, false);

    test.equal(this.write_a.callCount, 6);
    test.equal(this.write_b.callCount, 6);
    test.done();
  },
};

exports["Tessel.prototype.digitalRead"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Tessel.prototype, "on");

    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  returns: function(test) {
    test.expect(2);
    test.equal(this.tessel.digitalRead("A0", function() {}), this.tessel);
    test.equal(this.tessel.digitalRead("B0", function() {}), this.tessel);
    test.done();
  },

  callback: function(test) {
    test.expect(6);

    var spy = sinon.spy();

    this.tessel.digitalRead("a0", spy);

    var a0 = this.on.lastCall.args[1];

    a0(1);
    a0(0);

    test.deepEqual(spy.firstCall.args, [1]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    spy.reset();

    this.tessel.digitalRead("b0", spy);

    var b0 = this.on.lastCall.args[1];

    b0(1);
    b0(0);

    test.deepEqual(spy.firstCall.args, [1]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    test.done();
  },

  event: function(test) {
    test.expect(6);

    var spy = this.sandbox.spy();

    this.tessel.digitalRead("a0", spy);

    this.tessel.emit("digital-read-0", 1);
    this.tessel.emit("digital-read-0", 0);

    test.deepEqual(spy.firstCall.args, [1]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    spy.reset();

    this.tessel.digitalRead("b0", spy);

    this.tessel.emit("digital-read-8", 1);
    this.tessel.emit("digital-read-8", 0);

    test.deepEqual(spy.firstCall.args, [1]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);
    test.done();
  },

  poll: function(test) {
    test.expect(18);

    this.tessel.pinMode("b7", this.tessel.MODES.INPUT);

    this.read = this.sandbox.spy(Tessel.Pin.prototype, "read");
    this.portSockWrite = this.sandbox.spy(tessel.port.B.pin[7]._port.sock, "write");
    this.portCork = this.sandbox.spy(tessel.port.B.pin[7]._port, "cork");
    this.portUncork = this.sandbox.spy(tessel.port.B.pin[7]._port, "uncork");
    this.portEnqueue = this.sandbox.spy(tessel.port.B.pin[7]._port, "enqueue");

    this.spy = this.sandbox.spy();

    this.tessel.digitalRead("b7", this.spy);

    test.equal(this.read.callCount, 1);
    test.equal(this.portSockWrite.callCount, 1);
    test.equal(this.portCork.callCount, 1);
    test.equal(this.portUncork.callCount, 1);
    test.equal(this.portEnqueue.callCount, 1);
    test.equal(this.portEnqueue.lastCall.args[0].size, 0);


    var first = this.portEnqueue.lastCall.args[0].callback;
    first(null, Port.REPLY.HIGH);

    test.equal(this.spy.callCount, 1);
    test.equal(this.spy.lastCall.args[0], 1);

    this.clock.tick(this.tessel.getSamplingInterval() + 1);

    test.equal(this.portSockWrite.callCount, 2);
    test.equal(this.portCork.callCount, 2);
    test.equal(this.portUncork.callCount, 2);
    test.equal(this.portEnqueue.callCount, 2);


    var second = this.portEnqueue.lastCall.args[0].callback;
    second(null, Port.REPLY.LOW);

    test.equal(this.spy.callCount, 2);
    test.equal(this.spy.lastCall.args[0], 0);

    this.clock.tick(this.tessel.getSamplingInterval() + 1);

    test.equal(this.portSockWrite.callCount, 3);
    test.equal(this.portCork.callCount, 3);
    test.equal(this.portUncork.callCount, 3);
    test.equal(this.portEnqueue.callCount, 3);


    test.done();
  }
};

exports["Tessel.prototype.analogRead"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Tessel.prototype, "on");

    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  returns: function(test) {
    test.expect(2);
    test.equal(this.tessel.analogRead("A7", function() {}), this.tessel);
    test.equal(this.tessel.analogRead("B0", function() {}), this.tessel);
    test.done();
  },

  callback: function(test) {
    test.expect(6);

    var spy = this.sandbox.spy();

    this.tessel.analogRead("a7", spy);

    var a7 = this.on.lastCall.args[1];

    a7(1023);
    a7(0);

    test.deepEqual(spy.firstCall.args, [1023]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    spy.reset();

    this.tessel.analogRead("b0", spy);

    var b0 = this.on.lastCall.args[1];

    b0(1023);
    b0(0);

    test.deepEqual(spy.firstCall.args, [1023]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    test.done();
  },

  event: function(test) {
    test.expect(6);

    var spy = this.sandbox.spy();

    this.tessel.analogRead("a7", spy);

    this.tessel.emit("analog-read-7", 1023);
    this.tessel.emit("analog-read-7", 0);

    test.deepEqual(spy.firstCall.args, [1023]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    spy.reset();

    this.tessel.analogRead("b0", spy);

    this.tessel.emit("analog-read-8", 1023);
    this.tessel.emit("analog-read-8", 0);

    test.deepEqual(spy.firstCall.args, [1023]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);
    test.done();
  },

  poll: function(test) {

    this.tessel.pinMode("b7", this.tessel.MODES.ANALOG);

    this.read = this.sandbox.spy(Tessel.Pin.prototype, "read");
    this.portSockWrite = this.sandbox.spy(tessel.port.B.pin[7]._port.sock, "write");
    this.portCork = this.sandbox.spy(tessel.port.B.pin[7]._port, "cork");
    this.portUncork = this.sandbox.spy(tessel.port.B.pin[7]._port, "uncork");
    this.portEnqueue = this.sandbox.spy(tessel.port.B.pin[7]._port, "enqueue");

    this.spy = this.sandbox.spy();

    this.tessel.analogRead("b7", this.spy);

    test.equal(this.read.callCount, 1);
    test.equal(this.portSockWrite.callCount, 1);
    test.equal(this.portCork.callCount, 1);
    test.equal(this.portUncork.callCount, 1);
    test.equal(this.portEnqueue.callCount, 1);
    test.equal(this.portEnqueue.lastCall.args[0].size, 2);

    var first = this.portEnqueue.lastCall.args[0].callback;


    // callback(null, Port.REPLY.HIGH);
    first(null, new Buffer([0x01, 0x02]));

    test.equal(this.spy.callCount, 1);
    test.equal(this.spy.lastCall.args[0], 128);

    this.clock.tick(this.tessel.getSamplingInterval() + 1);

    test.equal(this.portSockWrite.callCount, 2);
    test.equal(this.portCork.callCount, 2);
    test.equal(this.portUncork.callCount, 2);
    test.equal(this.portEnqueue.callCount, 2);


    var second = this.portEnqueue.lastCall.args[0].callback;
    second(null, new Buffer([0x03, 0x01]));

    test.equal(this.spy.callCount, 2);
    test.equal(this.spy.lastCall.args[0], 64);

    this.clock.tick(this.tessel.getSamplingInterval() + 1);

    test.equal(this.portSockWrite.callCount, 3);
    test.equal(this.portCork.callCount, 3);
    test.equal(this.portUncork.callCount, 3);
    test.equal(this.portEnqueue.callCount, 3);

    test.done();
  }
};

exports["Tessel.prototype.pwmWrite"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.write = this.sandbox.spy(tessel.port.B.pin[7]._port.sock, "write");
    this.pwmFrequency = this.sandbox.spy(tessel, "pwmFrequency");
    this.pwmDutyCycle = this.sandbox.spy(T2.Pin.prototype, "pwmDutyCycle");

    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  returns: function(test) {
    test.expect(1);
    test.equal(this.tessel.pwmWrite("b7", 255), this.tessel);
    test.done();
  },

  dacUpper: function(test) {
    test.expect(2);

    this.tessel.pinMode("b7", this.tessel.MODES.PWM);

    this.write.reset();

    this.tessel.pwmWrite("b7", 1);
    this.tessel.pwmWrite("b7", 255);
    this.tessel.pwmWrite("b7", true);

    this.tessel.pwmWrite(15, 1);
    this.tessel.pwmWrite(15, 255);
    this.tessel.pwmWrite(15, true);

    test.equal(this.write.callCount, 6);
    test.equal(this.pwmFrequency.callCount, 0);

    test.done();
  },

  dacLower: function(test) {
    test.expect(2);

    this.tessel.pinMode("b7", this.tessel.MODES.PWM);

    this.write.reset();

    this.tessel.pwmWrite("b7", 0);
    this.tessel.pwmWrite("b7", -1);
    this.tessel.pwmWrite("b7", false);

    this.tessel.pwmWrite(15, 0);
    this.tessel.pwmWrite(15, -1);
    this.tessel.pwmWrite(15, false);

    test.equal(this.write.callCount, 6);
    test.equal(this.pwmFrequency.callCount, 0);
    test.done();
  },

  dacScales: function(test) {
    test.expect(3);

    this.tessel.pinMode("b7", this.tessel.MODES.PWM);

    this.write.reset();

    this.tessel.pwmWrite("b7", 0);
    this.tessel.pwmWrite("b7", 255);

    test.equal(this.write.firstCall.args[0].readUInt16BE(1), 0);
    test.equal(this.write.lastCall.args[0].readUInt16BE(1), 1023);
    test.equal(this.pwmFrequency.callCount, 0);
    test.done();
  },

  pwmUpper: function(test) {
    test.expect(3);

    this.tessel.pinMode("a5", this.tessel.MODES.PWM);

    this.write.reset();

    this.tessel.pwmWrite("a5", 1);
    this.tessel.pwmWrite("a5", 255);
    this.tessel.pwmWrite("a5", true);

    this.tessel.pwmWrite(5, 1);
    this.tessel.pwmWrite(5, 255);
    this.tessel.pwmWrite(5, true);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmDutyCycle.callCount, 6);
    test.done();
  },

  pwmLower: function(test) {
    test.expect(3);

    this.tessel.pinMode("a5", this.tessel.MODES.PWM);

    this.write.reset();

    this.tessel.pwmWrite("a5", 0);
    this.tessel.pwmWrite("a5", -1);
    this.tessel.pwmWrite("a5", false);

    this.tessel.pwmWrite(5, 0);
    this.tessel.pwmWrite(5, -1);
    this.tessel.pwmWrite(5, false);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmDutyCycle.callCount, 6);
    test.done();
  },

  pwmScales: function(test) {
    test.expect(3);

    this.tessel.pinMode("a5", this.tessel.MODES.PWM);

    this.write.reset();

    this.tessel.pwmWrite("a5", 0);
    this.tessel.pwmWrite("a5", 255);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmDutyCycle.callCount, 2);

    test.done();
  },
};


exports["Tessel.prototype.servoWrite"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.write = this.sandbox.spy(tessel.port.B.pin[7]._port.sock, "write");
    this.pwmFrequency = this.sandbox.spy(tessel, "pwmFrequency");
    this.pwmDutyCycle = this.sandbox.spy(T2.Pin.prototype, "pwmDutyCycle");

    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  upper: function(test) {
    test.expect(10  );

    this.tessel.pinMode("a5", this.tessel.MODES.SERVO);

    this.write.reset();

    this.tessel.servoWrite("a5", 180);
    this.tessel.servoWrite("a5", 255);
    this.tessel.servoWrite("a5", true);

    this.tessel.servoWrite(5, 180);
    this.tessel.servoWrite(5, 255);
    this.tessel.servoWrite(5, true);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmFrequency.lastCall.args[0], 50);
    test.equal(this.pwmDutyCycle.callCount, 6);
    test.equal(this.pwmDutyCycle.getCall(0).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(1).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(2).args[0], 0.0305);
    test.equal(this.pwmDutyCycle.getCall(3).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(4).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(5).args[0], 0.0305);
    test.done();
  },

  lower: function(test) {
    test.expect(10);

    this.tessel.pinMode("a5", this.tessel.MODES.SERVO);

    this.write.reset();

    this.tessel.servoWrite("a5", 0);
    this.tessel.servoWrite("a5", -1);
    this.tessel.servoWrite("a5", false);

    this.tessel.servoWrite(5, 0);
    this.tessel.servoWrite(5, -1);
    this.tessel.servoWrite(5, false);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmFrequency.lastCall.args[0], 50);
    test.equal(this.pwmDutyCycle.callCount, 6);
    test.equal(this.pwmDutyCycle.getCall(0).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(1).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(2).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(3).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(4).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(5).args[0], 0.03);
    test.done();
  },

  scales: function(test) {
    test.expect(6);

    this.tessel.pinMode("a5", this.tessel.MODES.SERVO);

    this.write.reset();

    this.tessel.servoWrite("a5", 0);
    this.tessel.servoWrite("a5", 180);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmFrequency.lastCall.args[0], 50);
    test.equal(this.pwmDutyCycle.callCount, 2);
    test.equal(this.pwmDutyCycle.firstCall.args[0], 0.03);
    test.equal(this.pwmDutyCycle.lastCall.args[0], 0.12);
    test.done();
  },
};

exports["Tessel.prototype.i2cConfig"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Tessel.prototype, "on");
    this.a = this.sandbox.stub(tessel.port.A, "I2C");
    this.b = this.sandbox.stub(tessel.port.B, "I2C");

    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  expectOptions: function(test) {
    test.expect(1);

    test.throws(function() {
      this.tessel.i2cConfig();
    }.bind(this), "i2cConfig expected `options` object");

    test.done();
  },

  defaultToA: function(test) {
    test.expect(2);
    this.tessel.i2cConfig({ address: 0x04 });
    test.equal(this.a.callCount, 1);
    test.equal(this.a.lastCall.args[0], 0x04);
    test.done();
  },

  explicitBus: function(test) {
    test.expect(2);
    this.tessel.i2cConfig({ address: 0x04, bus: "B" });
    test.equal(this.b.callCount, 1);
    test.equal(this.b.lastCall.args[0], 0x04);
    test.done();
  },

  maybeTheyCalledItPort: function(test) {
    test.expect(2);
    this.tessel.i2cConfig({ address: 0x04, port: "B" });
    test.equal(this.b.callCount, 1);
    test.equal(this.b.lastCall.args[0], 0x04);
    test.done();
  },

  calledWithArrayOfAddresses: function(test) {
    test.expect(3);
    this.tessel.i2cConfig({ addresses: [0x04, 0x05], port: "B" });
    // One call for each address
    test.equal(this.b.callCount, 2);
    test.equal(this.b.firstCall.args[0], 0x04);
    test.equal(this.b.lastCall.args[0], 0x05);
    test.done();
  },

  calledWithObjectOfAddresses: function(test) {
    test.expect(3);
    this.tessel.i2cConfig({ address: { lcd: 0x04, rgb: 0x05 }, port: "B" });
    // One call for each address
    test.equal(this.b.callCount, 2);
    test.equal(this.b.firstCall.args[0], 0x04);
    test.equal(this.b.lastCall.args[0], 0x05);
    test.done();
  }

};

exports["Tessel.prototype.i2cWrite"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Tessel.prototype, "on");
    this.send = this.sandbox.stub(T2.I2C.prototype, "send");

    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  data: function(test) {
    test.expect(5);

    this.tessel.i2cConfig({ address: 0x04, bus: "A" });
    this.tessel.i2cWrite(0x04, [0, 1, 2, 3]);

    test.equal(this.send.callCount, 1);
    test.equal(this.send.lastCall.args[0][0], 0);
    test.equal(this.send.lastCall.args[0][1], 1);
    test.equal(this.send.lastCall.args[0][2], 2);
    test.equal(this.send.lastCall.args[0][3], 3);
    test.done();
  },

  regAndData: function(test) {
    test.expect(6);

    this.tessel.i2cConfig({ address: 0x04, bus: "A" });
    this.tessel.i2cWrite(0x04, 0xff, [1, 2, 3, 4]);

    test.equal(this.send.callCount, 1);
    test.equal(this.send.lastCall.args[0][0], 255);
    test.equal(this.send.lastCall.args[0][1], 1);
    test.equal(this.send.lastCall.args[0][2], 2);
    test.equal(this.send.lastCall.args[0][3], 3);
    test.equal(this.send.lastCall.args[0][4], 4);
    test.done();
  },

  regAndByte: function(test) {
    test.expect(3);

    this.tessel.i2cConfig({ address: 0x04, bus: "A" });
    this.tessel.i2cWrite(0x04, 0xff, 0x00);

    test.equal(this.send.callCount, 1);
    test.equal(this.send.lastCall.args[0][0], 255);
    test.equal(this.send.lastCall.args[0][1], 0);
    test.done();
  },

  regCommandByte: function(test) {
    test.expect(3);

    this.tessel.i2cConfig({ address: 0x04, bus: "A" });
    this.tessel.i2cWrite(0x04, 0xff);

    test.equal(this.send.callCount, 1);
    test.equal(this.send.lastCall.args[0][0], 255);
    test.equal(this.send.lastCall.args[0].length, 1);
    test.done();
  },
};


exports["Tessel.prototype.i2cWriteReg"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Tessel.prototype, "on");
    this.send = this.sandbox.stub(T2.I2C.prototype, "send");

    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  regAndByte: function(test) {
    test.expect(3);

    this.tessel.i2cConfig({ address: 0x04, bus: "A" });
    this.tessel.i2cWrite(0x04, 0xff, 0x00);

    test.equal(this.send.callCount, 1);
    test.equal(this.send.lastCall.args[0][0], 255);
    test.equal(this.send.lastCall.args[0][1], 0);
    test.done();
  },
};

exports["Tessel.prototype.i2cReadOnce"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Tessel.prototype, "on");
    this.transfer = this.sandbox.stub(T2.I2C.prototype, "transfer");
    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  bytesToRead: function(test) {
    test.expect(3);
    var handler = this.sandbox.spy();

    this.tessel.i2cConfig({ address: 0x04, bus: "A" });
    this.tessel.i2cReadOnce(0x04, 4, handler);


    test.equal(this.transfer.lastCall.args[0].length, 0);
    test.equal(this.transfer.lastCall.args[1], 4);

    var transfer = this.transfer.lastCall.args[2];

    transfer(null, new Buffer([1, 2, 3, 4]));

    test.deepEqual(handler.lastCall.args[0], [1, 2, 3, 4]);
    test.done();
  },

  regAndBytesToRead: function(test) {
    // test.expect(4);
    var handler = this.sandbox.spy();

    this.tessel.i2cConfig({ address: 0x04, bus: "A" });
    this.tessel.i2cReadOnce(0x04, 0xff, 4, handler);

    test.equal(this.transfer.lastCall.args[0].length, 1);
    test.deepEqual(this.transfer.lastCall.args[0], [0xff]);
    test.equal(this.transfer.lastCall.args[1], 4);

    var transfer = this.transfer.lastCall.args[2];

    transfer(null, new Buffer([1, 2, 3, 4]));

    test.deepEqual(handler.lastCall.args[0], [1, 2, 3, 4]);
    test.done();
  },
};

exports["Tessel.prototype.i2cRead"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cReadOnce = this.sandbox.stub(Tessel.prototype, "i2cReadOnce", function(address, register, bytesToRead, callback) {

      // Fix arguments if called with Firmata.js API
      if (arguments.length === 3 &&
          typeof register === "number" &&
          typeof bytesToRead === "function") {
        callback = bytesToRead;
        bytesToRead = register;
        register = null;
      }

      callback = typeof callback === "function" ? callback : function() {};

      setImmediate(function() {
        var buffer = new Buffer(
          Array.from({ length: bytesToRead }, (_, index) => index)
        );

        callback(buffer);
      });
    });
    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.purge();
    this.sandbox.restore();
    done();
  },

  bytesToRead: function(test) {
    test.expect(6);

    var counter = 0;
    var handler = function(buffer) {
      test.equal(buffer.length, 4);
      if (++counter === 5) {
        test.ok(counter);
        test.done();
      }
    };

    this.tessel.i2cConfig({ address: 0x04, bus: "A" });
    this.tessel.i2cRead(0x04, 4, handler);
    this.clock.tick(this.tessel.getSamplingInterval());
    this.clock.tick(this.tessel.getSamplingInterval());
    this.clock.tick(this.tessel.getSamplingInterval());
    this.clock.tick(this.tessel.getSamplingInterval());
    this.clock.tick(this.tessel.getSamplingInterval());
    this.clock.tick(this.tessel.getSamplingInterval());
  },

  regAndBytesToRead: function(test) {
    test.expect(6);

    var counter = 0;
    var handler = function(buffer) {
      test.equal(buffer.length, 4);
      if (++counter === 5) {
        test.ok(counter);
        test.done();
      }
    };

    this.tessel.i2cConfig({ address: 0x04, bus: "A" });
    this.tessel.i2cRead(0x04, 0xff, 4, handler);
    this.clock.tick(this.tessel.getSamplingInterval());
    this.clock.tick(this.tessel.getSamplingInterval());
    this.clock.tick(this.tessel.getSamplingInterval());
    this.clock.tick(this.tessel.getSamplingInterval());
    this.clock.tick(this.tessel.getSamplingInterval());
  },
};

exports["Tessel.prototype.setSamplingInterval"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clearInterval = this.sandbox.spy(global, "clearInterval");
    this.tessel = new Tessel();
    done();
  },
  tearDown: function(done) {
    this.sandbox.restore();
    Tessel.purge();
    done();
  },
  samplingIntervalDefault: function(test) {
    test.expect(1);
    test.equal(this.tessel.getSamplingInterval(), Tessel.defaultSamplingInterval);
    test.done();
  },
  samplingIntervalCustom: function(test) {
    test.expect(1);
    this.tessel.setSamplingInterval(1000);
    test.equal(this.tessel.getSamplingInterval(), 1000);
    test.done();
  },
  samplingIntervalValid: function(test) {
    test.expect(2);
    this.tessel.setSamplingInterval(65536);
    test.equal(this.tessel.getSamplingInterval(), 65535);
    this.tessel.setSamplingInterval(-1);
    test.equal(this.tessel.getSamplingInterval(), 5);
    test.done();
  }
};


exports["Tessel.prototype.serialConfig"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.a = this.sandbox.stub(tessel.port.A, "UART");
    this.b = this.sandbox.stub(tessel.port.B, "UART");

    this.tessel = new Tessel();
    done();
  },
  tearDown: function(done) {
    this.sandbox.restore();
    Tessel.purge();
    done();
  },
  validWithDefaults: function(test) {
    test.expect(4);
    var configA = {
      portId: "A",
    };
    var configB = {
      portId: "B",
    };

    this.tessel.serialConfig(configA);
    this.tessel.serialConfig(configB);

    test.equal(this.a.callCount, 1);
    test.equal(this.b.callCount, 1);

    test.deepEqual(this.a.lastCall.args[0], {
      baudrate: 57600,
      dataBits: 8,
      parity: "none",
      stopBits: 1,
    });
    test.deepEqual(this.b.lastCall.args[0], {
      baudrate: 57600,
      dataBits: 8,
      parity: "none",
      stopBits: 1,
    });

    test.done();
  },

  validWithExplicit: function(test) {
    test.expect(4);

    var configA = {
      portId: "A",
      baud: 9600,
      dataBits: 8,
      parity: "none",
      stopBits: 1,
    };
    var configB = {
      portId: "B",
      baud: 9600,
      dataBits: 8,
      parity: "none",
      stopBits: 1,
    };

    this.tessel.serialConfig(configA);
    this.tessel.serialConfig(configB);

    test.equal(this.a.callCount, 1);
    test.equal(this.b.callCount, 1);

    test.deepEqual(this.a.lastCall.args[0], {
      baudrate: 9600,
      dataBits: 8,
      parity: "none",
      stopBits: 1,
    });

    test.deepEqual(this.b.lastCall.args[0], {
      baudrate: 9600,
      dataBits: 8,
      parity: "none",
      stopBits: 1,
    });

    test.done();
  },

  invalidMissingOptions: function(test) {
    test.expect(3);

    test.throws(() => {
      this.tessel.serialConfig();
    });
    test.equal(this.a.callCount, 0);
    test.equal(this.b.callCount, 0);

    test.done();
  },

  invalidMissingPortId: function(test) {
    test.expect(3);

    test.throws(() => {
      this.tessel.serialConfig({});
    });
    test.equal(this.a.callCount, 0);
    test.equal(this.b.callCount, 0);

    test.done();
  },

  invalidPortId: function(test) {
    test.expect(3);

    test.throws(() => {
      this.tessel.serialConfig({ portId: "jdfnkjdfnb" });
    });
    test.equal(this.a.callCount, 0);
    test.equal(this.b.callCount, 0);

    test.done();
  },

};
