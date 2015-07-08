"use strict";

process.env.IS_TEST_ENV = true;

var TesselIO = require("../lib/tessel");
var factory = require("../test/tessel-mock");
var Emitter = require("events").EventEmitter;
var sinon = require("sinon");

function restore(target) {
  for (var prop in target) {
    if (target[prop] != null && typeof target[prop].restore === "function") {
      target[prop].restore();
    }
    if (typeof target[prop] === "object") {
      restore(target[prop]);
    }
  }
}

var functions = [{
  name: "analogRead"
}, {
  name: "analogWrite"
}, {
  name: "digitalRead"
}, {
  name: "digitalWrite"
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



var ToPinIndex = TesselIO.ToPinIndex;
var ToPortIdentity = TesselIO.ToPortIdentity;
var ToPortI2CBus = TesselIO.ToPortI2CBus;
var ToI2CBusPort = TesselIO.ToI2CBusPort;
var Pin = TesselIO.Pin;
var tessel = TesselIO.tessel;
var Tessel = factory.Tessel;

exports["TesselIO Constructor"] = {
  setUp: function(done) {
    this.tessel = new TesselIO();
    done();
  },
  tearDown: function(done) {
    TesselIO.reset();
    done();
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
    // test.expect();

    test.equal(this.tessel.pins.length, 16);
    test.equal(this.tessel.analogPins.length, 10);
    test.done();
  },
};


exports["ToPinIndex"] = {
  valid: function(test) {
    test.expect(16);

    var offset = 8;

    for (var i = 0; i < 8; i++) {
      test.equal(ToPinIndex("A" + i), i);
      test.equal(ToPinIndex("B" + i), i + offset);
    }
    test.done();
  },

  validIndex: function(test) {
    test.expect(2);
    test.equal(ToPinIndex(1), 1);
    test.equal(ToPinIndex(15), 15);
    test.done();
  },

  invalidIndex: function(test) {
    test.expect(2);
    test.equal(ToPinIndex(-1), -1);
    test.equal(ToPinIndex(16), -1);
    test.done();
  },

  invalidCoercible: function(test) {
    test.expect(2);
    test.equal(ToPinIndex("a1"), 1);
    test.equal(ToPinIndex("b1"), 9);
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
    test.expect(16);

    var offset = 0;
    var port = "A";

    for (var i = 0; i < 16; i++) {
      if (i > 7) {
        port = "B";
        offset = 8;
      }
      test.deepEqual(ToPortIdentity(i), { port: port, index: i - offset });
    }
    test.done();
  },
  invalid: function(test) {
    test.expect(2);
    test.deepEqual(ToPortIdentity(-1), { port: null, index: -1 });
    test.deepEqual(ToPortIdentity(16), { port: null, index: -1 });
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
  invalid: function(test) {
    test.expect(2);
    test.equal(ToPortI2CBus("C"), -1);
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
  invalid: function(test) {
    test.expect(2);
    test.equal(ToI2CBusPort("C"), undefined);
    test.equal(ToI2CBusPort(0), undefined);
    test.done();
  },
};

exports["TesselIO.prototype.normalize"] = {
  setUp: function(done) {
    this.tessel = new TesselIO();
    done();
  },
  tearDown: function(done) {
    TesselIO.reset();
    done();
  },

  stringNames: function(test) {
    test.expect(32);

    var offset = 8;

    for (var i = 0; i < 8; i++) {

      test.equal(this.tessel.normalize("A" + i), i);
      test.equal(this.tessel.normalize("A-" + i), i);

      test.equal(this.tessel.normalize("B" + i), i + offset);
      test.equal(this.tessel.normalize("B-" + i), i + offset);
    }

    test.done();
  },

  index: function(test) {
    test.expect(16);

    for (var i = 0; i < 16; i++) {
      test.equal(this.tessel.normalize(i), i);
    }

    test.done();
  },
};

exports["TesselIO.prototype.pinMode"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.output = this.sandbox.spy(tessel.port.A.pin[0], "output");
    this.input = this.sandbox.spy(tessel.port.A.pin[0], "input");

    this.tessel = new TesselIO();
    done();
  },
  tearDown: function(done) {
    TesselIO.reset();
    this.sandbox.restore();
    done();
  },

  returns: function(test) {
    test.expect(2);
    test.equal(this.tessel.pinMode("A0", this.tessel.MODES.INPUT), this.tessel);
    test.equal(this.tessel.pinMode("B0", this.tessel.MODES.INPUT), this.tessel);
    test.done();
  },

  input: function(test) {
    test.expect(10);

    var offset = 8;

    this.output.reset();
    this.input.reset();

    for (var i = 0; i < 8; i++) {
      this.tessel.pinMode("A" + i, this.tessel.MODES.INPUT);
      this.tessel.pinMode("B" + i, this.tessel.MODES.INPUT);
      test.equal(this.tessel.pins[i].mode, this.tessel.MODES.INPUT);
    }

    test.equal(this.output.callCount, 0);
    test.equal(this.input.callCount, 1);

    test.done();
  },

  output: function(test) {
    test.expect(26);

    var offset = 8;

    this.output.reset();
    this.input.reset();

    for (var i = 0; i < 8; i++) {
      test.equal(this.tessel.pinMode("A" + i, this.tessel.MODES.OUTPUT), this.tessel);
      test.equal(this.tessel.pinMode("B" + i, this.tessel.MODES.OUTPUT), this.tessel);
      test.equal(this.tessel.pins[i].mode, this.tessel.MODES.OUTPUT);
    }

    test.equal(this.output.callCount, 1);
    test.equal(this.input.callCount, 0);

    test.done();
  },

  analog: function(test) {
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
  }
};


exports["TesselIO.prototype.digitalWrite"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.output_a = this.sandbox.spy(tessel.port.A.pin[0], "output");
    this.input_a = this.sandbox.spy(tessel.port.A.pin[0], "input");
    this.write_a = this.sandbox.spy(tessel.port.A.pin[0], "write");

    this.output_b = this.sandbox.spy(tessel.port.B.pin[0], "output");
    this.input_b = this.sandbox.spy(tessel.port.B.pin[0], "input");
    this.write_b = this.sandbox.spy(tessel.port.B.pin[0], "write");

    this.tessel = new TesselIO();

    done();
  },

  tearDown: function(done) {
    TesselIO.reset();
    this.sandbox.restore();
    done();
  },

  returns: function(test) {
    test.expect(2);
    test.equal(this.tessel.digitalWrite("A0", 1), this.tessel);
    test.equal(this.tessel.digitalWrite("B0", 1), this.tessel);
    test.done();
  },

  high: function(test) {
    test.expect(2);

    this.write_a.reset();
    this.write_b.reset();

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

    test.equal(this.write_a.callCount, 6);
    test.equal(this.write_b.callCount, 6);
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

exports["TesselIO.prototype.digitalRead"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();

    this.on = this.sandbox.spy(TesselIO.prototype, "on");

    this.tessel = new TesselIO();

    done();
  },

  tearDown: function(done) {
    TesselIO.reset();
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

    var spy = sinon.spy();

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
};

exports["TesselIO.prototype.analogRead"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();

    this.on = this.sandbox.spy(TesselIO.prototype, "on");

    this.tessel = new TesselIO();

    done();
  },

  tearDown: function(done) {
    TesselIO.reset();
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
};

exports["TesselIO.prototype.pwmWrite"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.write = this.sandbox.spy(tessel.port.B.pin[7]._port.sock, "write");

    this.tessel = new TesselIO();

    done();
  },

  tearDown: function(done) {
    TesselIO.reset();
    this.sandbox.restore();
    done();
  },

  returns: function(test) {
    test.expect(1);
    test.equal(this.tessel.pwmWrite("b7", 255), this.tessel);
    test.done();
  },

  upper: function(test) {
    test.expect(1);

    this.tessel.pinMode("b7", this.tessel.MODES.PWM);

    this.write.reset();

    this.tessel.pwmWrite("b7", 1);
    this.tessel.pwmWrite("b7", 255);
    this.tessel.pwmWrite("b7", true);

    this.tessel.pwmWrite(15, 1);
    this.tessel.pwmWrite(15, 255);
    this.tessel.pwmWrite(15, true);

    test.equal(this.write.callCount, 6);
    test.done();
  },

  lower: function(test) {
    test.expect(1);

    this.tessel.pinMode("b7", this.tessel.MODES.PWM);

    this.write.reset();

    this.tessel.pwmWrite("b7", 0);
    this.tessel.pwmWrite("b7", -1);
    this.tessel.pwmWrite("b7", false);

    this.tessel.pwmWrite(15, 0);
    this.tessel.pwmWrite(15, -1);
    this.tessel.pwmWrite(15, false);

    test.equal(this.write.callCount, 6);
    test.done();
  },

  scales: function(test) {
    test.expect(2);

    this.tessel.pinMode("b7", this.tessel.MODES.PWM);

    this.write.reset();

    this.tessel.pwmWrite("b7", 0);
    this.tessel.pwmWrite("b7", 255);

    test.equal(this.write.firstCall.args[0].readUInt16BE(1), 0);
    test.equal(this.write.lastCall.args[0].readUInt16BE(1), 1023);

    test.done();
  },
};

exports["TesselIO.prototype.i2cConfig"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(TesselIO.prototype, "on");
    this.a = this.sandbox.stub(tessel.port.A, "I2C");
    this.b = this.sandbox.stub(tessel.port.B, "I2C");

    this.tessel = new TesselIO();

    done();
  },

  tearDown: function(done) {
    TesselIO.reset();
    this.sandbox.restore();
    done();
  },

  expectOptions: function(test) {
    test.expect(1);

    test.throws(function() {
      this.tessel.i2cConfig();
    }.bind(this));

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
};

exports["TesselIO.prototype.i2cWrite"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(TesselIO.prototype, "on");
    this.send = this.sandbox.stub(Tessel.I2C.prototype, "send");

    this.tessel = new TesselIO();

    done();
  },

  tearDown: function(done) {
    TesselIO.reset();
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


exports["TesselIO.prototype.i2cWriteReg"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(TesselIO.prototype, "on");
    this.send = this.sandbox.stub(Tessel.I2C.prototype, "send");

    this.tessel = new TesselIO();

    done();
  },

  tearDown: function(done) {
    TesselIO.reset();
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

exports["TesselIO.prototype.i2cReadOnce"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.on = this.sandbox.spy(TesselIO.prototype, "on");
    this.transfer = this.sandbox.stub(Tessel.I2C.prototype, "transfer");
    this.tessel = new TesselIO();

    done();
  },

  tearDown: function(done) {
    TesselIO.reset();
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

exports["TesselIO.prototype.i2cRead"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.i2cReadOnce = this.sandbox.stub(TesselIO.prototype, "i2cReadOnce", function(address, register, bytesToRead, callback) {

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
          Array.from({ length: bytesToRead }, function(_, index) {
            return index;
          })
        );

        callback(buffer);
      });
    });
    this.tessel = new TesselIO();

    done();
  },

  tearDown: function(done) {
    TesselIO.reset();
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
  },
};
