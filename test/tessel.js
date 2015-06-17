"use strict";

global.IS_TEST_ENV = true;

var Tessel = require("../lib/tessel");
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



var ToPinIndex = Tessel.ToPinIndex;
var ToPortIdentity = Tessel.ToPortIdentity;
var ToPortI2CBus = Tessel.ToPortI2CBus;
var Pin = Tessel.Pin;
var tessel = Tessel.tessel;

exports["Tessel Constructor"] = {
  setUp: function(done) {
    this.tessel = new Tessel();


    done();
  },
  tearDown: function(done) {
    Tessel.reset();
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
    test.expect(1);
    test.equal(ToPortI2CBus("C"), -1);
    test.done();
  },
};

exports["Tessel.prototype.normalize"] = {
  setUp: function(done) {
    this.tessel = new Tessel();
    done();
  },
  tearDown: function(done) {
    Tessel.reset();
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

exports["Tessel.prototype.pinMode"] = {
  setUp: function(done) {

    this.output = sinon.spy(tessel.port.A.pin[0], "output");
    this.input = sinon.spy(tessel.port.A.pin[0], "input");

    this.tessel = new Tessel();
    done();
  },
  tearDown: function(done) {
    Tessel.reset();
    restore(this);
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


exports["Tessel.prototype.digitalWrite"] = {
  setUp: function(done) {

    this.output_a = sinon.spy(tessel.port.A.pin[0], "output");
    this.input_a = sinon.spy(tessel.port.A.pin[0], "input");
    this.write_a = sinon.spy(tessel.port.A.pin[0], "write");

    this.output_b = sinon.spy(tessel.port.B.pin[0], "output");
    this.input_b = sinon.spy(tessel.port.B.pin[0], "input");
    this.write_b = sinon.spy(tessel.port.B.pin[0], "write");

    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.reset();
    restore(this);
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

exports["Tessel.prototype.digitalRead"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    this.on = sinon.spy(Tessel.prototype, "on");

    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.reset();
    restore(this);
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

exports["Tessel.prototype.analogRead"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    this.on = sinon.spy(Tessel.prototype, "on");

    this.tessel = new Tessel();

    done();
  },

  tearDown: function(done) {
    Tessel.reset();
    restore(this);
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

    var spy = sinon.spy();

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

    var spy = sinon.spy();

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

