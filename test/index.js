"use strict";

process.env.IS_TEST_MODE = true;

const Board = require("../");
const factory = require("../test/tessel-mock");
const os = require("os");
const util = require("util");
const events = require("events");
const stream = require("stream");
const sinon = require("sinon");
const Port = {};

const { EventEmitter: Emitter } = events;
const { Duplex } = stream;

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


const functions = [{
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

const objects = [{
  name: "MODES"
}];

const numbers = [{
  name: "HIGH"
}, {
  name: "LOW"
}];

const instance = [{
  name: "pins"
}, {
  name: "analogPins"
}];


const {
  ToPinIndex,
  ToPortIdentity,
  ToPortI2CBus,
  ToI2CBusPort,
  Pin,
  tessel,
} = Board;

const T2 = factory.Tessel;

exports["Board.PORTS.*"] = {
  setUp(done) {
    done();
  },
  tearDown(done) {
    done();
  },
  ports(test) {
    test.expect(2);
    test.equal(Board.PORTS.A, tessel.port.A);
    test.equal(Board.PORTS.B, tessel.port.B);
    test.done();
  },
};

exports["Board.wifi"] = {
  setUp(done) {
    done();
  },
  tearDown(done) {
    done();
  },
  ports(test) {
    test.expect(1);
    test.equal(typeof Board.wifi, "object");
    test.done();
  },
};

exports["Board.ap"] = {
  setUp(done) {
    done();
  },
  tearDown(done) {
    done();
  },
  ports(test) {
    test.expect(1);
    test.equal(typeof Board.ap, "object");
    test.done();
  },
};

exports["Board Constructor"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.hostname = this.sandbox.stub(os, "hostname").callsFake(_ => "NOT A REAL TESSEL");
    this.set = this.sandbox.spy(WeakMap.prototype, "set");
    this.output = this.sandbox.stub(T2.Pin.prototype, "output");
    this.board = new Board();
    done();
  },
  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  tesselName(test) {
    test.expect(1);
    test.equal(this.board.name, "Tessel 2 (NOT A REAL TESSEL)");
    test.done();
  },


  // shape(test) {
  //   test.expect(
  //     functions.length +
  //     objects.length +
  //     numbers.length +
  //     instance.length
  //   );

  //   functions.forEach(function(method) {
  //     test.equal(typeof this.board[method.name], "function", method.name);
  //   }, this);

  //   objects.forEach(function(method) {
  //     test.equal(typeof this.board[method.name], "object", method.name);
  //   }, this);

  //   numbers.forEach(function(method) {
  //     test.equal(typeof this.board[method.name], "number", method.name);
  //   }, this);

  //   instance.forEach(function(property) {
  //     test.notEqual(typeof this.board[property.name], "undefined", property.name);
  //   }, this);

  //   test.done();
  // },

  state(test) {
    test.expect(1);

    test.deepEqual(this.set.firstCall.args[1], {
      pwm: {
        frequency: null
      },
      i2c: {
        bus: 4,
        devices: {}
      },
      interrupts: {
        A: null,
        B: null
      },
      uart: {}
    });

    test.done();
  },

  pins(test) {
    test.expect(2);
    test.equal(this.board.pins.length, 20);
    test.equal(this.board.analogPins.length, 10);
    test.done();
  },

  initialMode(test) {
    test.expect(20);

    test.equal(this.board.pins[0].mode, undefined);
    test.equal(this.board.pins[1].mode, undefined);
    test.equal(this.board.pins[2].mode, undefined);
    test.equal(this.board.pins[3].mode, undefined);
    test.equal(this.board.pins[4].mode, undefined);
    test.equal(this.board.pins[5].mode, undefined);
    test.equal(this.board.pins[6].mode, undefined);
    test.equal(this.board.pins[7].mode, undefined);
    test.equal(this.board.pins[8].mode, undefined);
    test.equal(this.board.pins[9].mode, undefined);
    test.equal(this.board.pins[10].mode, undefined);
    test.equal(this.board.pins[11].mode, undefined);
    test.equal(this.board.pins[12].mode, undefined);
    test.equal(this.board.pins[13].mode, undefined);
    test.equal(this.board.pins[14].mode, undefined);
    test.equal(this.board.pins[15].mode, undefined);
    test.equal(this.board.pins[16].mode, undefined);
    test.equal(this.board.pins[17].mode, undefined);
    test.equal(this.board.pins[18].mode, undefined);
    test.equal(this.board.pins[19].mode, undefined);

    test.done();
  },

  initialValue(test) {
    test.expect(20);

    test.equal(this.board.pins[0].value, 0);
    test.equal(this.board.pins[1].value, 0);
    test.equal(this.board.pins[2].value, 0);
    test.equal(this.board.pins[3].value, 0);
    test.equal(this.board.pins[4].value, 0);
    test.equal(this.board.pins[5].value, 0);
    test.equal(this.board.pins[6].value, 0);
    test.equal(this.board.pins[7].value, 0);
    test.equal(this.board.pins[8].value, 0);
    test.equal(this.board.pins[9].value, 0);
    test.equal(this.board.pins[10].value, 0);
    test.equal(this.board.pins[11].value, 0);
    test.equal(this.board.pins[12].value, 0);
    test.equal(this.board.pins[13].value, 0);
    test.equal(this.board.pins[14].value, 0);
    test.equal(this.board.pins[15].value, 0);
    test.equal(this.board.pins[16].value, undefined);
    test.equal(this.board.pins[17].value, undefined);
    test.equal(this.board.pins[18].value, undefined);
    test.equal(this.board.pins[19].value, undefined);

    test.done();
  },

};

exports["Board.prototype"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.hostname = this.sandbox.stub(os, "hostname").callsFake(_ => "NOT A REAL TESSEL");
    this.set = this.sandbox.spy(WeakMap.prototype, "set");
    this.output = this.sandbox.stub(T2.Pin.prototype, "output");
    this.board = new Board();
    done();
  },
  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  modes(test) {
    test.expect(1);
    test.deepEqual(Board.prototype.MODES, {
      INPUT:  0x00,
      OUTPUT: 0x01,
      ANALOG: 0x02,
      PWM:    0x03,
      SERVO:  0x04,
      I2C:    0x06,
      SERIAL: 0x0A,
    });
    test.done();
  },
  i2cBus(test) {
    test.expect(1);

    test.doesNotThrow(() => {
      new Board({
        i2c: {
          bus: 1
        }
      });
    });
    test.done();
  },
  high(test) {
    test.expect(1);
    test.equal(Board.prototype.HIGH, 1);
    test.done();
  },
  low(test) {
    test.expect(1);
    test.equal(Board.prototype.LOW, 0);
    test.done();
  },
  resolution(test) {
    test.expect(1);
    test.equal(Board.prototype.RESOLUTION.ADC, 1024);
    test.done();
  },
};

exports["Automatic REPL disabling"] = {
  setUp(done) {
    this.dirName = Board.dirName();
    done();
  },
  tearDown(done) {
    Board.purge();
    Board.dirName(this.dirName);
    done();
  },

  checkT2Run(test) {
    test.expect(1);

    Board.dirName("/tmp/remote-script");
    const tessel = new Board();

    test.equal(tessel.repl, undefined);

    test.done();
  },

  checkT2Push(test) {
    test.expect(1);

    Board.dirName("/app/remote-script");
    const tessel = new Board();

    test.equal(tessel.repl, false);

    test.done();
  }
};


exports["ToPinIndex"] = {
  valid(test) {
    test.expect(80);

    const offsetB = 8;
    const offsetL = 16;

    for (let i = 0; i < 8; i++) {
      test.equal(ToPinIndex(`A${i}`), i);
      test.equal(ToPinIndex(`B${i}`), i + offsetB);

      test.equal(ToPinIndex(`a${i}`), i);
      test.equal(ToPinIndex(`b${i}`), i + offsetB);

      test.equal(ToPinIndex(`A_${i}`), i);
      test.equal(ToPinIndex(`B_${i}`), i + offsetB);

      test.equal(ToPinIndex(`a_${i}`), i);
      test.equal(ToPinIndex(`b_${i}`), i + offsetB);

      if (i < 4) {
        test.equal(ToPinIndex(`L${i}`), i + offsetL);
        test.equal(ToPinIndex(`l${i}`), i + offsetL);
        test.equal(ToPinIndex(`L_${i}`), i + offsetL);
        test.equal(ToPinIndex(`l_${i}`), i + offsetL);
      }
    }

    test.done();
  },

  validIndex(test) {
    test.expect(20);
    for (let j = 0; j < 20; j++) {
      test.equal(ToPinIndex(j), j);
    }
    test.done();
  },

  invalidIndex(test) {
    test.expect(41);
    for (let j = 1; j < 20; j++) {
      test.equal(ToPinIndex(-j), -1);
      test.equal(ToPinIndex(j + 20), -1);
    }

    test.equal(ToPinIndex(null), -1);
    test.equal(ToPinIndex(undefined), -1);
    test.equal(ToPinIndex(false), -1);
    test.done();
  },

  valueMatchesPortButOutOfRange(test) {
    test.expect(1);
    test.equal(ToPinIndex(20), -1);
    test.done();
  },

  invalidNonCoercible(test) {
    test.expect(1);
    test.equal(ToPinIndex("c1"), -1);
    test.done();
  },
};

exports["ToPortIdentity"] = {
  valid(test) {
    test.expect(20);

    let offset = 0;
    let port = "A";

    for (let i = 0; i < 20; i++) {
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
  invalid(test) {
    test.expect(2);
    test.deepEqual(ToPortIdentity(-1), { port: null, index: -1 });
    test.deepEqual(ToPortIdentity(20), { port: null, index: -1 });
    test.done();
  },

  valueMatchesPortBusOutOfRange(test) {
    test.expect(1);
    test.deepEqual(ToPortIdentity(20), { port: null, index: -1 });
    test.done();
  },

};

exports["ToPortI2CBus"] = {
  valid(test) {
    test.expect(6);
    test.equal(ToPortI2CBus("A"), 4);
    test.equal(ToPortI2CBus("B"), 2);
    test.equal(ToPortI2CBus("a"), 4);
    test.equal(ToPortI2CBus("b"), 2);
    test.equal(ToPortI2CBus(4), 4);
    test.equal(ToPortI2CBus(2), 2);
    test.done();
  },
  validPortButNoBus(test) {
    test.expect(1);
    test.equal(ToPortI2CBus("L"), -1);
    test.done();
  },
  invalid(test) {
    test.expect(2);
    test.equal(ToPortI2CBus("C"), -1);
    test.equal(ToPortI2CBus(0), -1);
    test.done();
  },
  invalidPort(test) {
    test.expect(1);
    test.equal(ToPortI2CBus("C"), -1);
    test.done();
  },
  invalidBus(test) {
    test.expect(1);
    test.equal(ToPortI2CBus(0), -1);
    test.done();
  },
};

exports["ToI2CBusPort"] = {
  valid(test) {
    test.expect(6);
    test.equal(ToI2CBusPort("A"), "A");
    test.equal(ToI2CBusPort("B"), "B");
    test.equal(ToI2CBusPort("a"), "A");
    test.equal(ToI2CBusPort("b"), "B");
    test.equal(ToI2CBusPort(4), "A");
    test.equal(ToI2CBusPort(2), "B");
    test.done();
  },
  validPortButNoBus(test) {
    test.expect(1);
    test.equal(ToI2CBusPort("L"), undefined);
    test.done();
  },
  invalid(test) {
    test.expect(2);
    test.equal(ToI2CBusPort("C"), undefined);
    test.equal(ToI2CBusPort(0), undefined);
    test.done();
  },
};

exports["Board.prototype.normalize"] = {
  setUp(done) {
    this.board = new Board();
    done();
  },
  tearDown(done) {
    Board.purge();
    done();
  },

  invalid(test) {
    test.expect(3);
    test.equal(this.board.normalize(null), -1);
    test.equal(this.board.normalize(undefined), -1);
    test.equal(this.board.normalize(false), -1);
    test.done();
  },

  stringNames(test) {
    test.expect(40);

    let offsetB = 8;
    let offsetL = 16;

    for (let i = 0; i < 8; i++) {

      test.equal(this.board.normalize(`A${i}`), i);
      test.equal(this.board.normalize(`A-${i}`), i);

      test.equal(this.board.normalize(`B${i}`), i + offsetB);
      test.equal(this.board.normalize(`B-${i}`), i + offsetB);

      if (i < 4) {
        test.equal(this.board.normalize(`L${i}`), i + offsetL);
        test.equal(this.board.normalize(`L-${i}`), i + offsetL);
      }
    }

    test.done();
  },

  index(test) {
    test.expect(20);

    for (let i = 0; i < 20; i++) {
      test.equal(this.board.normalize(i), i);
    }

    test.done();
  },
};

exports["Board.prototype.pinMode"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.output = this.sandbox.spy(tessel.port.A.pin[0], "output");
    this.input = this.sandbox.spy(tessel.port.A.pin[0], "input");
    this.pwmFrequency = this.sandbox.spy(tessel, "pwmFrequency");
    this.pwmDutyCycle = this.sandbox.spy(T2.Pin.prototype, "pwmDutyCycle");
    this.pull = this.sandbox.spy(T2.Pin.prototype, "pull");
    this.write = this.sandbox.spy(T2.Pin.prototype, "write");

    this.board = new Board();
    done();
  },
  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  returns(test) {
    test.expect(3);
    test.equal(this.board.pinMode("A0", this.board.MODES.INPUT), this.board);
    test.equal(this.board.pinMode("B0", this.board.MODES.INPUT), this.board);
    test.equal(this.board.pinMode("L0", this.board.MODES.OUTPUT), this.board);
    test.done();
  },

  input(test) {
    test.expect(18);

    let offset = 8;

    this.output.reset();
    this.input.reset();

    for (let i = 0; i < 8; i++) {
      this.board.pinMode(`A${i}`, this.board.MODES.INPUT);
      this.board.pinMode(`B${i}`, this.board.MODES.INPUT);
      test.equal(this.board.pins[i].mode, this.board.MODES.INPUT);
      test.equal(this.board.pins[i + 8].mode, this.board.MODES.INPUT);
    }

    test.equal(this.output.callCount, 0);
    test.equal(this.input.callCount, 1);

    test.done();
  },

  output(test) {
    test.expect(38);

    let offset = 8;

    this.output.reset();
    this.input.reset();

    for (let i = 0; i < 8; i++) {
      test.equal(this.board.pinMode(`A${i}`, this.board.MODES.OUTPUT), this.board);
      test.equal(this.board.pinMode(`B${i}`, this.board.MODES.OUTPUT), this.board);
      test.equal(this.board.pins[i].mode, this.board.MODES.OUTPUT);
      test.equal(this.board.pins[i + 8].mode, this.board.MODES.OUTPUT);

      if (i < 4) {
        this.board.pinMode("L" + i, this.board.MODES.OUTPUT);
        test.equal(this.board.pins[i + 16].mode, this.board.MODES.OUTPUT);
      }
    }

    test.equal(this.output.callCount, 1);
    test.equal(this.input.callCount, 0);

    test.done();
  },

  analogInput(test) {
    test.expect(26);

    let offset = 8;

    this.output.reset();
    this.input.reset();

    for (let i = 0; i < 8; i++) {
      test.equal(this.board.pinMode(`A${i}`, this.board.MODES.ANALOG), this.board);
      test.equal(this.board.pinMode(`B${i}`, this.board.MODES.ANALOG), this.board);
      test.equal(this.board.pins[i].mode, this.board.MODES.ANALOG);
    }

    test.equal(this.output.callCount, 0);
    test.equal(this.input.callCount, 1);

    test.done();
  },

  i2c(test) {
    test.expect(26);

    let offset = 8;

    this.output.reset();
    this.input.reset();

    for (let i = 0; i < 8; i++) {
      test.equal(this.board.pinMode(`A${i}`, this.board.MODES.I2C), this.board);
      test.equal(this.board.pinMode(`B${i}`, this.board.MODES.I2C), this.board);
      test.equal(this.board.pins[i].mode, this.board.MODES.I2C);
    }

    // Neither is called for I2C
    test.equal(this.output.callCount, 0);
    test.equal(this.input.callCount, 0);

    test.done();
  },

  pwm(test) {
    test.expect(8);

    test.equal(this.board.pinMode("A5", this.board.MODES.PWM), this.board);
    test.equal(this.board.pinMode("A6", this.board.MODES.PWM), this.board);
    test.equal(this.board.pinMode("B5", this.board.MODES.PWM), this.board);
    test.equal(this.board.pinMode("B6", this.board.MODES.PWM), this.board);

    test.equal(this.board.pins[5].mode, this.board.MODES.PWM);
    test.equal(this.board.pins[6].mode, this.board.MODES.PWM);

    test.equal(this.board.pins[13].mode, this.board.MODES.PWM);
    test.equal(this.board.pins[14].mode, this.board.MODES.PWM);

    test.done();
  },

  servo(test) {
    test.expect(8);

    test.equal(this.board.pinMode("A5", this.board.MODES.SERVO), this.board);
    test.equal(this.board.pinMode("A6", this.board.MODES.SERVO), this.board);
    test.equal(this.board.pinMode("B5", this.board.MODES.SERVO), this.board);
    test.equal(this.board.pinMode("B6", this.board.MODES.SERVO), this.board);

    test.equal(this.board.pins[5].mode, this.board.MODES.SERVO);
    test.equal(this.board.pins[6].mode, this.board.MODES.SERVO);

    test.equal(this.board.pins[13].mode, this.board.MODES.SERVO);
    test.equal(this.board.pins[14].mode, this.board.MODES.SERVO);

    test.done();
  },

  oldFashionedPullups(test) {
    test.expect(18);

    this.write.reset();

    test.throws(() => {
      this.board.pinMode("A0", this.board.MODES.INPUT);
      this.board.digitalWrite("A0", this.board.HIGH);
    });
    test.throws(() => {
      this.board.pinMode("A1", this.board.MODES.INPUT);
      this.board.digitalWrite("A1", this.board.HIGH);
    });
    test.throws(() => {
      this.board.pinMode("B0", this.board.MODES.INPUT);
      this.board.digitalWrite("B0", this.board.HIGH);
    });
    test.throws(() => {
      this.board.pinMode("B1", this.board.MODES.INPUT);
      this.board.digitalWrite("B1", this.board.HIGH);
    });


    for (let i = 2; i < 8; i++) {
      this.board.pinMode(`A${i}`, this.board.MODES.INPUT);
      this.board.digitalWrite(`A${i}`, this.board.HIGH);
      this.board.pinMode(`B${i}`, this.board.MODES.INPUT);
      this.board.digitalWrite(`B${i}`, this.board.HIGH);
    }

    // 6 per port
    test.equal(this.pull.callCount, 12);
    test.equal(this.write.callCount, 12);


    for (let j = 0; j < this.pull.callCount; j++) {
      test.equal(this.pull.getCall(j).args[0], "pullup");
    }


    test.done();

  },
};


exports["Board.prototype.digitalWrite"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();

    this.output_a = this.sandbox.spy(tessel.port.A.pin[0], "output");
    this.input_a = this.sandbox.spy(tessel.port.A.pin[0], "input");
    this.write_a = this.sandbox.spy(tessel.port.A.pin[0], "write");

    this.output_b = this.sandbox.spy(tessel.port.B.pin[0], "output");
    this.input_b = this.sandbox.spy(tessel.port.B.pin[0], "input");
    this.write_b = this.sandbox.spy(tessel.port.B.pin[0], "write");

    this.write_l = this.sandbox.spy(tessel.leds[2], "write");

    this.board = new Board();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  returns(test) {
    test.expect(3);
    test.equal(this.board.digitalWrite("A0", 1), this.board);
    test.equal(this.board.digitalWrite("B0", 1), this.board);
    test.equal(this.board.digitalWrite("L2", 1), this.board);
    test.done();
  },

  high(test) {
    test.expect(3);

    this.write_a.reset();
    this.write_b.reset();
    this.write_l.reset();

    this.board.digitalWrite("A0", 1);
    this.board.digitalWrite("A0", 255);
    this.board.digitalWrite("A0", true);

    this.board.digitalWrite(0, 1);
    this.board.digitalWrite(0, 255);
    this.board.digitalWrite(0, true);

    this.board.digitalWrite("B0", 1);
    this.board.digitalWrite("B0", 255);
    this.board.digitalWrite("B0", true);

    this.board.digitalWrite(8, 1);
    this.board.digitalWrite(8, 255);
    this.board.digitalWrite(8, true);

    this.board.digitalWrite("L2", 1);
    this.board.digitalWrite("L2", 255);
    this.board.digitalWrite("L2", true);

    this.board.digitalWrite(18, 1);
    this.board.digitalWrite(18, 255);
    this.board.digitalWrite(18, true);

    test.equal(this.write_a.callCount, 6);
    test.equal(this.write_b.callCount, 6);
    test.equal(this.write_l.callCount, 6);
    test.done();
  },

  low(test) {
    test.expect(2);

    this.write_a.reset();
    this.write_b.reset();

    this.board.digitalWrite("A0", 0);
    this.board.digitalWrite("A0", -1);
    this.board.digitalWrite("A0", false);

    this.board.digitalWrite(0, 0);
    this.board.digitalWrite(0, -1);
    this.board.digitalWrite(0, false);

    this.board.digitalWrite("B0", 0);
    this.board.digitalWrite("B0", -1);
    this.board.digitalWrite("B0", false);

    this.board.digitalWrite(8, 0);
    this.board.digitalWrite(8, -1);
    this.board.digitalWrite(8, false);

    test.equal(this.write_a.callCount, 6);
    test.equal(this.write_b.callCount, 6);
    test.done();
  },
};

exports["Board.prototype.digitalRead"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Board.prototype, "on");

    this.board = new Board();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  returns(test) {
    test.expect(2);
    test.equal(this.board.digitalRead("A0", function() {}), this.board);
    test.equal(this.board.digitalRead("B0", function() {}), this.board);
    test.done();
  },

  isDigitalReadChangeFilter(test) {
    test.expect(8);

    this.tpinOn = this.sandbox.spy(Board.Pin.prototype, "on");
    this.tpinRead = this.sandbox.spy(Board.Pin.prototype, "read");
    this.spy = this.sandbox.spy();

    this.board.digitalRead("b0", this.spy);
    this.board.digitalRead("b1", this.spy);
    this.board.digitalRead("b2", this.spy);
    this.board.digitalRead("b3", this.spy);
    this.board.digitalRead("b4", this.spy);
    this.board.digitalRead("b5", this.spy);
    this.board.digitalRead("b6", this.spy);
    this.board.digitalRead("b7", this.spy);

    test.equal(this.tpinRead.getCall(0).args[0].isDigitalReadChangeFilter, true);
    test.equal(this.tpinRead.getCall(1).args[0].isDigitalReadChangeFilter, true);
    test.equal(this.tpinRead.getCall(2).args[0].isDigitalReadChangeFilter, true);
    test.equal(this.tpinRead.getCall(3).args[0].isDigitalReadChangeFilter, true);
    test.equal(this.tpinRead.getCall(4).args[0].isDigitalReadChangeFilter, true);
    test.equal(this.tpinRead.getCall(5).args[0].isDigitalReadChangeFilter, true);
    test.equal(this.tpinRead.getCall(6).args[0].isDigitalReadChangeFilter, true);
    test.equal(this.tpinRead.getCall(7).args[0].isDigitalReadChangeFilter, true);

    test.done();
  },

  emitterCallBackIsNotTheChangeFilter(test) {
    test.expect(16);

    this.tpinOn = this.sandbox.spy(Board.Pin.prototype, "on");
    this.tpinRead = this.sandbox.spy(Board.Pin.prototype, "read");
    this.spy = this.sandbox.spy();

    this.board.digitalRead("b0", this.spy);
    this.board.digitalRead("b1", this.spy);
    this.board.digitalRead("b2", this.spy);
    this.board.digitalRead("b3", this.spy);
    this.board.digitalRead("b4", this.spy);
    this.board.digitalRead("b5", this.spy);
    this.board.digitalRead("b6", this.spy);
    this.board.digitalRead("b7", this.spy);

    test.notEqual(this.tpinRead.getCall(0).args[0], this.spy);
    test.notEqual(this.tpinRead.getCall(1).args[0], this.spy);
    test.notEqual(this.tpinRead.getCall(2).args[0], this.spy);
    test.notEqual(this.tpinRead.getCall(3).args[0], this.spy);
    test.notEqual(this.tpinRead.getCall(4).args[0], this.spy);
    test.notEqual(this.tpinRead.getCall(5).args[0], this.spy);
    test.notEqual(this.tpinRead.getCall(6).args[0], this.spy);
    test.notEqual(this.tpinRead.getCall(7).args[0], this.spy);

    test.equal(this.on.getCall(0).args[1], this.spy);
    test.equal(this.on.getCall(1).args[1], this.spy);
    test.equal(this.on.getCall(2).args[1], this.spy);
    test.equal(this.on.getCall(3).args[1], this.spy);
    test.equal(this.on.getCall(4).args[1], this.spy);
    test.equal(this.on.getCall(5).args[1], this.spy);
    test.equal(this.on.getCall(6).args[1], this.spy);
    test.equal(this.on.getCall(7).args[1], this.spy);

    test.done();
  },

  handlersForNonInterruptPins(test) {
    test.expect(6);

    let spy = sinon.spy();

    this.board.digitalRead("a0", spy);

    let a0 = this.on.lastCall.args[1];

    a0(1);
    a0(0);

    test.deepEqual(spy.firstCall.args, [1]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    spy.reset();

    this.board.digitalRead("b0", spy);

    let b0 = this.on.lastCall.args[1];

    b0(1);
    b0(0);

    test.deepEqual(spy.firstCall.args, [1]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    test.done();
  },

  handlersForInterruptPins(test) {
    test.expect(8);


    test.equal(this.board.pins[2].isInterrupt, true);
    test.equal(this.board.pins[5].isInterrupt, true);


    let spy = sinon.spy();

    this.board.digitalRead("a2", spy);

    let a2 = this.on.lastCall.args[1];

    a2(1);
    a2(0);

    test.deepEqual(spy.firstCall.args, [1]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    spy.reset();

    this.board.digitalRead("a5", spy);

    let a5 = this.on.lastCall.args[1];

    a5(1);
    a5(0);

    test.deepEqual(spy.firstCall.args, [1]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    test.done();
  },

  newListener(test) {
    test.expect(3);

    let spy = this.sandbox.spy();
    this.on = this.sandbox.stub(T2.instance.ports.A.pin[0], "on");

    this.board.pins[0].on("change", spy);
    this.board.pins[0].on("something-else", spy);

    test.equal(this.on.callCount, 1);
    test.equal(this.on.lastCall.args[0], "change");
    test.equal(this.on.lastCall.args[1], spy);
    test.done();
  },

  event(test) {
    test.expect(6);

    let spy = this.sandbox.spy();

    this.board.digitalRead("a0", spy);

    this.board.emit("digital-read-0", 1);
    this.board.emit("digital-read-0", 0);

    test.deepEqual(spy.firstCall.args, [1]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    spy.reset();

    this.board.digitalRead("b0", spy);

    this.board.emit("digital-read-8", 1);
    this.board.emit("digital-read-8", 0);

    test.deepEqual(spy.firstCall.args, [1]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);
    test.done();
  },

  poll(test) {
    test.expect(23);

    let sockWriteCommand = new Buffer([Port.CMD.GPIO_IN, 7]);

    this.board.pinMode("b7", this.board.MODES.INPUT);

    this.read = this.sandbox.spy(Board.Pin.prototype, "read");
    this.portSockWrite = this.sandbox.spy(tessel.port.B.pin[7].port.sock, "write");
    this.portCork = this.sandbox.spy(tessel.port.B.pin[7].port, "cork");
    this.portUncork = this.sandbox.spy(tessel.port.B.pin[7].port, "uncork");
    this.portEnqueue = this.sandbox.spy(tessel.port.B.pin[7].port, "enqueue");

    this.spy = this.sandbox.spy();

    this.board.digitalRead("b7", this.spy);

    test.equal(this.read.callCount, 1);
    test.equal(this.portSockWrite.callCount, 1);
    test.equal(this.portSockWrite.lastCall.args[0].equals(sockWriteCommand), true);

    // Capture command buffer to compare to the next two
    let capturedCommand = this.portSockWrite.lastCall.args[0];

    test.equal(this.portCork.callCount, 1);
    test.equal(this.portUncork.callCount, 1);
    test.equal(this.portEnqueue.callCount, 1);
    test.equal(this.portEnqueue.lastCall.args[0].size, 0);


    let first = this.portEnqueue.lastCall.args[0].callback;
    first(null, Port.REPLY.HIGH);

    test.equal(this.spy.callCount, 1);
    test.equal(this.spy.lastCall.args[0], 1);

    this.clock.tick(this.board.getSamplingInterval() + 1);

    test.equal(this.portSockWrite.callCount, 2);
    test.equal(this.portSockWrite.lastCall.args[0].equals(sockWriteCommand), true);
    // Ensure that the cached command is used
    test.equal(this.portSockWrite.lastCall.args[0].equals(capturedCommand), true);
    test.equal(this.portCork.callCount, 2);
    test.equal(this.portUncork.callCount, 2);
    test.equal(this.portEnqueue.callCount, 2);


    let second = this.portEnqueue.lastCall.args[0].callback;
    second(null, Port.REPLY.LOW);

    test.equal(this.spy.callCount, 2);
    test.equal(this.spy.lastCall.args[0], 0);

    this.clock.tick(this.board.getSamplingInterval() + 1);

    test.equal(this.portSockWrite.callCount, 3);
    test.equal(this.portSockWrite.lastCall.args[0].equals(sockWriteCommand), true);
    // Ensure that the cached command is used
    test.equal(this.portSockWrite.lastCall.args[0].equals(capturedCommand), true);
    test.equal(this.portCork.callCount, 3);
    test.equal(this.portUncork.callCount, 3);
    test.equal(this.portEnqueue.callCount, 3);

    test.done();
  }
};

exports["Board.prototype.analogRead"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Board.prototype, "on");

    this.board = new Board();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  returns(test) {
    test.expect(2);
    test.equal(this.board.analogRead("A7", function() {}), this.board);
    test.equal(this.board.analogRead("B0", function() {}), this.board);
    test.done();
  },

  invalidPins(test) {
    test.expect(6);

    let spy = this.sandbox.spy();

    test.throws(_ => {
      this.board.analogRead("a0", spy);
    });
    test.throws(_ => {
      this.board.analogRead("a1", spy);
    });
    test.throws(_ => {
      this.board.analogRead("a2", spy);
    });
    test.throws(_ => {
      this.board.analogRead("a3", spy);
    });
    test.throws(_ => {
      this.board.analogRead("a5", spy);
    });
    test.throws(_ => {
      this.board.analogRead("a6", spy);
    });

    test.done();
  },
  validPins(test) {
    test.expect(10);

    let spy = this.sandbox.spy();

    test.doesNotThrow(_ => {
      this.board.analogRead("a4", spy);
    });
    test.doesNotThrow(_ => {
      this.board.analogRead("a7", spy);
    });
    test.doesNotThrow(_ => {
      this.board.analogRead("b0", spy);
    });
    test.doesNotThrow(_ => {
      this.board.analogRead("b1", spy);
    });
    test.doesNotThrow(_ => {
      this.board.analogRead("b2", spy);
    });
    test.doesNotThrow(_ => {
      this.board.analogRead("b3", spy);
    });
    test.doesNotThrow(_ => {
      this.board.analogRead("b4", spy);
    });
    test.doesNotThrow(_ => {
      this.board.analogRead("b5", spy);
    });
    test.doesNotThrow(_ => {
      this.board.analogRead("b6", spy);
    });
    test.doesNotThrow(_ => {
      this.board.analogRead("b7", spy);
    });

    test.done();
  },

  callback(test) {
    test.expect(6);

    let spy = this.sandbox.spy();

    this.board.analogRead("a7", spy);

    let a7 = this.on.lastCall.args[1];

    a7(1023);
    a7(0);

    test.deepEqual(spy.firstCall.args, [1023]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    spy.reset();

    this.board.analogRead("b0", spy);

    let b0 = this.on.lastCall.args[1];

    b0(1023);
    b0(0);

    test.deepEqual(spy.firstCall.args, [1023]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    test.done();
  },

  event(test) {
    test.expect(6);

    let spy = this.sandbox.spy();

    this.board.analogRead("a7", spy);

    this.board.emit("analog-read-7", 1023);
    this.board.emit("analog-read-7", 0);

    test.deepEqual(spy.firstCall.args, [1023]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);

    spy.reset();

    this.board.analogRead("b0", spy);

    this.board.emit("analog-read-8", 1023);
    this.board.emit("analog-read-8", 0);

    test.deepEqual(spy.firstCall.args, [1023]);
    test.deepEqual(spy.lastCall.args, [0]);
    test.equal(spy.callCount, 2);
    test.done();
  },

  poll(test) {
    test.expect(23);

    let sockWriteCommand = new Buffer([Port.CMD.ANALOG_READ, 7]);

    this.board.pinMode("b7", this.board.MODES.ANALOG);

    this.read = this.sandbox.spy(Board.Pin.prototype, "read");
    this.portSockWrite = this.sandbox.spy(tessel.port.B.pin[7].port.sock, "write");
    this.portCork = this.sandbox.spy(tessel.port.B.pin[7].port, "cork");
    this.portUncork = this.sandbox.spy(tessel.port.B.pin[7].port, "uncork");
    this.portEnqueue = this.sandbox.spy(tessel.port.B.pin[7].port, "enqueue");

    this.spy = this.sandbox.spy();

    this.board.analogRead("b7", this.spy);

    test.equal(this.read.callCount, 1);
    test.equal(this.portSockWrite.callCount, 1);
    test.equal(this.portSockWrite.lastCall.args[0].equals(sockWriteCommand), true);

    // Capture command buffer to compare to the next two
    let capturedCommand = this.portSockWrite.lastCall.args[0];

    test.equal(this.portCork.callCount, 0);
    test.equal(this.portUncork.callCount, 0);
    test.equal(this.portEnqueue.callCount, 1);
    test.equal(this.portEnqueue.lastCall.args[0].size, 2);

    let first = this.portEnqueue.lastCall.args[0].callback;


    // callback(null, Port.REPLY.HIGH);
    first(null, new Buffer([0x01, 0x02]));

    test.equal(this.spy.callCount, 1);
    test.equal(this.spy.lastCall.args[0], 128);

    this.clock.tick(this.board.getSamplingInterval() + 1);

    test.equal(this.portSockWrite.callCount, 2);
    test.equal(this.portSockWrite.lastCall.args[0].equals(sockWriteCommand), true);
    // Ensure that the cached command is used
    test.equal(this.portSockWrite.lastCall.args[0].equals(capturedCommand), true);
    test.equal(this.portCork.callCount, 0);
    test.equal(this.portUncork.callCount, 0);
    test.equal(this.portEnqueue.callCount, 2);


    let second = this.portEnqueue.lastCall.args[0].callback;
    second(null, new Buffer([0x03, 0x01]));

    test.equal(this.spy.callCount, 2);
    test.equal(this.spy.lastCall.args[0], 64);

    this.clock.tick(this.board.getSamplingInterval() + 1);

    test.equal(this.portSockWrite.callCount, 3);
    test.equal(this.portSockWrite.lastCall.args[0].equals(sockWriteCommand), true);
    // Ensure that the cached command is used
    test.equal(this.portSockWrite.lastCall.args[0].equals(capturedCommand), true);
    test.equal(this.portCork.callCount, 0);
    test.equal(this.portUncork.callCount, 0);
    test.equal(this.portEnqueue.callCount, 3);

    test.done();
  }
};

exports["Board.prototype.pwmWrite"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.write = this.sandbox.spy(tessel.port.B.pin[7].port.sock, "write");
    this.pwmFrequency = this.sandbox.spy(tessel, "pwmFrequency");
    this.pwmDutyCycle = this.sandbox.spy(T2.Pin.prototype, "pwmDutyCycle");

    this.board = new Board();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  returns(test) {
    test.expect(1);
    test.equal(this.board.pwmWrite("b7", 255), this.board);
    test.done();
  },

  dacUpper(test) {
    test.expect(2);

    this.board.pinMode("b7", this.board.MODES.PWM);

    this.write.reset();

    this.board.pwmWrite("b7", 1);
    this.board.pwmWrite("b7", 255);
    this.board.pwmWrite("b7", true);

    this.board.pwmWrite(15, 1);
    this.board.pwmWrite(15, 255);
    this.board.pwmWrite(15, true);

    test.equal(this.write.callCount, 6);
    test.equal(this.pwmFrequency.callCount, 0);

    test.done();
  },

  dacLower(test) {
    test.expect(2);

    this.board.pinMode("b7", this.board.MODES.PWM);

    this.write.reset();

    this.board.pwmWrite("b7", 0);
    this.board.pwmWrite("b7", -1);
    this.board.pwmWrite("b7", false);

    this.board.pwmWrite(15, 0);
    this.board.pwmWrite(15, -1);
    this.board.pwmWrite(15, false);

    test.equal(this.write.callCount, 6);
    test.equal(this.pwmFrequency.callCount, 0);
    test.done();
  },

  dacScales(test) {
    test.expect(3);

    this.board.pinMode("b7", this.board.MODES.PWM);

    this.write.reset();

    this.board.pwmWrite("b7", 0);
    this.board.pwmWrite("b7", 255);

    test.equal(this.write.firstCall.args[0].readUInt16BE(1), 0);
    test.equal(this.write.lastCall.args[0].readUInt16BE(1), 1023);
    test.equal(this.pwmFrequency.callCount, 0);
    test.done();
  },

  pwmUpper(test) {
    test.expect(3);

    this.board.pinMode("a5", this.board.MODES.PWM);

    this.write.reset();

    this.board.pwmWrite("a5", 1);
    this.board.pwmWrite("a5", 255);
    this.board.pwmWrite("a5", true);

    this.board.pwmWrite(5, 1);
    this.board.pwmWrite(5, 255);
    this.board.pwmWrite(5, true);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmDutyCycle.callCount, 6);
    test.done();
  },

  pwmLower(test) {
    test.expect(3);

    this.board.pinMode("a5", this.board.MODES.PWM);

    this.write.reset();

    this.board.pwmWrite("a5", 0);
    this.board.pwmWrite("a5", -1);
    this.board.pwmWrite("a5", false);

    this.board.pwmWrite(5, 0);
    this.board.pwmWrite(5, -1);
    this.board.pwmWrite(5, false);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmDutyCycle.callCount, 6);
    test.done();
  },

  pwmScales(test) {
    test.expect(3);

    this.board.pinMode("a5", this.board.MODES.PWM);

    this.write.reset();

    this.board.pwmWrite("a5", 0);
    this.board.pwmWrite("a5", 255);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmDutyCycle.callCount, 2);

    test.done();
  },
};


exports["Board.prototype.servoWrite"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.write = this.sandbox.spy(tessel.port.B.pin[7].port.sock, "write");
    this.pwmFrequency = this.sandbox.spy(tessel, "pwmFrequency");
    this.pwmDutyCycle = this.sandbox.spy(T2.Pin.prototype, "pwmDutyCycle");

    this.board = new Board();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  upper(test) {
    test.expect(12);

    this.board.pinMode("a5", this.board.MODES.SERVO);

    this.write.reset();

    this.board.servoWrite("a5", 180);
    this.board.servoWrite("a5", 255);
    this.board.servoWrite("a5", 2400);
    this.board.servoWrite("a5", true);

    this.board.servoWrite(5, 180);
    this.board.servoWrite(5, 255);
    this.board.servoWrite(5, 2400);
    this.board.servoWrite(5, true);


    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmFrequency.lastCall.args[0], 50);
    test.equal(this.pwmDutyCycle.callCount, 8);
    test.equal(this.pwmDutyCycle.getCall(0).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(1).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(2).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(3).args[0], 0.0305);
    test.equal(this.pwmDutyCycle.getCall(4).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(5).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(6).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(7).args[0], 0.0305);
    test.done();
  },

  lower(test) {
    test.expect(12);

    this.board.pinMode("a5", this.board.MODES.SERVO);

    this.write.reset();

    this.board.servoWrite("a5", 0);
    this.board.servoWrite("a5", -1);
    this.board.servoWrite("a5", 600);
    this.board.servoWrite("a5", false);

    this.board.servoWrite(5, 0);
    this.board.servoWrite(5, -1);
    this.board.servoWrite(5, 600);
    this.board.servoWrite(5, false);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmFrequency.lastCall.args[0], 50);
    test.equal(this.pwmDutyCycle.callCount, 8);
    test.equal(this.pwmDutyCycle.getCall(0).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(1).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(2).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(3).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(4).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(5).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(6).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(7).args[0], 0.03);
    test.done();
  },

  scales(test) {
    test.expect(8);

    this.board.pinMode("a5", this.board.MODES.SERVO);

    this.write.reset();

    this.board.servoWrite("a5", 0);
    this.board.servoWrite("a5", 180);
    this.board.servoWrite("a5", 600);
    this.board.servoWrite("a5", 2400);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmFrequency.lastCall.args[0], 50);
    test.equal(this.pwmDutyCycle.callCount, 4);
    test.equal(this.pwmDutyCycle.getCall(0).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(1).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(2).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(3).args[0], 0.12);
    test.done();
  },
};

exports["Board.prototype.servoConfig"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.write = this.sandbox.spy(tessel.port.B.pin[7].port.sock, "write");
    this.pwmFrequency = this.sandbox.spy(tessel, "pwmFrequency");
    this.pwmDutyCycle = this.sandbox.spy(T2.Pin.prototype, "pwmDutyCycle");

    this.board = new Board();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  upper(test) {
    test.expect(12);

    this.board.pinMode("a5", this.board.MODES.SERVO);
    this.board.pinMode("a6", this.board.MODES.SERVO);

    this.write.reset();

    this.board.servoConfig("a5", 1000, 2000);

    this.board.servoWrite("a5", 180);
    this.board.servoWrite("a5", 255);
    this.board.servoWrite("a5", 2400);

    this.board.servoWrite(5, 180);
    this.board.servoWrite(5, 255);
    this.board.servoWrite(5, 2400);

    // Pin A4 should still use default servo range
    this.board.servoWrite("a6", 180);
    this.board.servoWrite(6, 180);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmFrequency.lastCall.args[0], 50);
    test.equal(this.pwmDutyCycle.callCount, 8);
    test.equal(this.pwmDutyCycle.getCall(0).args[0], 0.1);
    test.equal(this.pwmDutyCycle.getCall(1).args[0], 0.1);
    test.equal(this.pwmDutyCycle.getCall(2).args[0], 0.1);
    test.equal(this.pwmDutyCycle.getCall(3).args[0], 0.1);
    test.equal(this.pwmDutyCycle.getCall(4).args[0], 0.1);
    test.equal(this.pwmDutyCycle.getCall(5).args[0], 0.1);
    test.equal(this.pwmDutyCycle.getCall(6).args[0], 0.12);
    test.equal(this.pwmDutyCycle.getCall(7).args[0], 0.12);
    test.done();
  },

  lower(test) {
    test.expect(14);

    this.board.pinMode("a5", this.board.MODES.SERVO);
    this.board.pinMode("a6", this.board.MODES.SERVO);

    this.write.reset();

    this.board.servoConfig("a5", 1000, 2000);

    this.board.servoWrite("a5", 0);
    this.board.servoWrite("a5", -1);
    this.board.servoWrite("a5", 600);
    this.board.servoWrite("a5", false);

    this.board.servoWrite(5, 0);
    this.board.servoWrite(5, -1);
    this.board.servoWrite(5, 600);
    this.board.servoWrite(5, false);

    this.board.servoWrite("a6", 0);
    this.board.servoWrite(6, 0);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmFrequency.lastCall.args[0], 50);
    test.equal(this.pwmDutyCycle.callCount, 10);
    test.equal(this.pwmDutyCycle.getCall(0).args[0], 0.05);
    test.equal(this.pwmDutyCycle.getCall(1).args[0], 0.05);
    test.equal(this.pwmDutyCycle.getCall(2).args[0], 0.05);
    test.equal(this.pwmDutyCycle.getCall(3).args[0], 0.05);
    test.equal(this.pwmDutyCycle.getCall(4).args[0], 0.05);
    test.equal(this.pwmDutyCycle.getCall(5).args[0], 0.05);
    test.equal(this.pwmDutyCycle.getCall(6).args[0], 0.05);
    test.equal(this.pwmDutyCycle.getCall(7).args[0], 0.05);
    test.equal(this.pwmDutyCycle.getCall(8).args[0], 0.03);
    test.equal(this.pwmDutyCycle.getCall(9).args[0], 0.03);
    test.done();
  },

  scales(test) {
    test.expect(8);

    this.board.pinMode("a5", this.board.MODES.SERVO);

    this.write.reset();

    this.board.servoConfig("a5", 1000, 2000);

    this.board.servoWrite("a5", 0);
    this.board.servoWrite("a5", 180);
    this.board.servoWrite("a5", 600);
    this.board.servoWrite("a5", 2400);

    test.equal(this.write.callCount, 0);
    test.equal(this.pwmFrequency.callCount, 1);
    test.equal(this.pwmFrequency.lastCall.args[0], 50);
    test.equal(this.pwmDutyCycle.callCount, 4);
    test.equal(this.pwmDutyCycle.getCall(0).args[0], 0.05);
    test.equal(this.pwmDutyCycle.getCall(1).args[0], 0.1);
    test.equal(this.pwmDutyCycle.getCall(2).args[0], 0.05);
    test.equal(this.pwmDutyCycle.getCall(3).args[0], 0.1);
    test.done();
  },

  expectOptions(test) {
    test.expect(5);

    this.board.pinMode("a5", this.board.MODES.SERVO);

    test.throws(_ => {
      this.board.servoConfig();
    }, "servoConfig: pin must be specified");

    test.throws(_ => {
      this.board.servoConfig("a5");
    }, "servoConfig: min must be specified");

    test.throws(_ => {
      this.board.servoConfig("a5", 1000);
    }, "servoConfig: max must be specified");

    this.board.servoConfig({ pin: "a5", min: 1000,max: 2000});
    this.board.servoWrite("a5", 0);
    this.board.servoWrite("a5", 180);

    test.equal(this.pwmDutyCycle.getCall(0).args[0], 0.05);
    test.equal(this.pwmDutyCycle.getCall(1).args[0], 0.1);
    test.done();
  }
};

exports["Board.prototype.i2cConfig"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Board.prototype, "on");
    this.a = this.sandbox.stub(tessel.port.A, "I2C");
    this.b = this.sandbox.stub(tessel.port.B, "I2C");

    this.board = new Board();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  expectOptions(test) {
    test.expect(1);

    test.throws(_ => {
      this.board.i2cConfig();
    }, "i2cConfig expected `options` object");

    test.done();
  },

  expectNumber(test) {
    test.expect(1);

    test.doesNotThrow(_ => {
      this.board.i2cConfig(1000);
    }, "i2cConfig accepts a delay number");

    test.done();
  },

  defaultToA(test) {
    test.expect(2);
    this.board.i2cConfig({ address: 0x04 });
    test.equal(this.a.callCount, 1);
    test.equal(this.a.lastCall.args[0], 0x04);
    test.done();
  },

  explicitBus(test) {
    test.expect(2);
    this.board.i2cConfig({ address: 0x04, bus: "B" });
    test.equal(this.b.callCount, 1);
    test.equal(this.b.lastCall.args[0], 0x04);
    test.done();
  },

  maybeTheyCalledItPort(test) {
    test.expect(2);
    this.board.i2cConfig({ address: 0x04, port: "B" });
    test.equal(this.b.callCount, 1);
    test.equal(this.b.lastCall.args[0], 0x04);
    test.done();
  },

  calledWithArrayOfAddresses(test) {
    test.expect(3);
    this.board.i2cConfig({ addresses: [0x04, 0x05], port: "B" });
    // One call for each address
    test.equal(this.b.callCount, 2);
    test.equal(this.b.firstCall.args[0], 0x04);
    test.equal(this.b.lastCall.args[0], 0x05);
    test.done();
  },

  calledWithObjectOfAddresses(test) {
    test.expect(3);
    this.board.i2cConfig({ address: { lcd: 0x04, rgb: 0x05 }, port: "B" });
    // One call for each address
    test.equal(this.b.callCount, 2);
    test.equal(this.b.firstCall.args[0], 0x04);
    test.equal(this.b.lastCall.args[0], 0x05);
    test.done();
  }

};

exports["Board.prototype.i2cWrite"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Board.prototype, "on");
    this.send = this.sandbox.stub(T2.I2C.prototype, "send");

    this.board = new Board();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  data(test) {
    test.expect(5);

    this.board.i2cConfig({ address: 0x04, bus: "A" });
    this.board.i2cWrite(0x04, [0, 1, 2, 3]);

    test.equal(this.send.callCount, 1);
    test.equal(this.send.lastCall.args[0][0], 0);
    test.equal(this.send.lastCall.args[0][1], 1);
    test.equal(this.send.lastCall.args[0][2], 2);
    test.equal(this.send.lastCall.args[0][3], 3);
    test.done();
  },

  regAndData(test) {
    test.expect(6);

    this.board.i2cConfig({ address: 0x04, bus: "A" });
    this.board.i2cWrite(0x04, 0xff, [1, 2, 3, 4]);

    test.equal(this.send.callCount, 1);
    test.equal(this.send.lastCall.args[0][0], 255);
    test.equal(this.send.lastCall.args[0][1], 1);
    test.equal(this.send.lastCall.args[0][2], 2);
    test.equal(this.send.lastCall.args[0][3], 3);
    test.equal(this.send.lastCall.args[0][4], 4);
    test.done();
  },

  regAndByte(test) {
    test.expect(3);

    this.board.i2cConfig({ address: 0x04, bus: "A" });
    this.board.i2cWrite(0x04, 0xff, 0x00);

    test.equal(this.send.callCount, 1);
    test.equal(this.send.lastCall.args[0][0], 255);
    test.equal(this.send.lastCall.args[0][1], 0);
    test.done();
  },

  regCommandByte(test) {
    test.expect(3);

    this.board.i2cConfig({ address: 0x04, bus: "A" });
    this.board.i2cWrite(0x04, 0xff);

    test.equal(this.send.callCount, 1);
    test.equal(this.send.lastCall.args[0][0], 255);
    test.equal(this.send.lastCall.args[0].length, 1);
    test.done();
  },
};


exports["Board.prototype.i2cWriteReg"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();

    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Board.prototype, "on");
    this.send = this.sandbox.stub(T2.I2C.prototype, "send");

    this.board = new Board();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  regAndByte(test) {
    test.expect(3);

    this.board.i2cConfig({ address: 0x04, bus: "A" });
    this.board.i2cWriteReg(0x04, 0xff, 0x00);

    test.equal(this.send.callCount, 1);
    test.equal(this.send.lastCall.args[0][0], 255);
    test.equal(this.send.lastCall.args[0][1], 0);
    test.done();
  },
};

exports["Board.prototype.i2cReadOnce"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.on = this.sandbox.spy(Board.prototype, "on");
    this.transfer = this.sandbox.stub(T2.I2C.prototype, "transfer");
    this.board = new Board();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  bytesToRead(test) {
    test.expect(3);
    let handler = this.sandbox.spy();

    this.board.i2cConfig({ address: 0x04, bus: "A" });
    this.board.i2cReadOnce(0x04, 4, handler);


    test.equal(this.transfer.lastCall.args[0].length, 0);
    test.equal(this.transfer.lastCall.args[1], 4);

    let transfer = this.transfer.lastCall.args[2];

    transfer(null, new Buffer([1, 2, 3, 4]));

    test.deepEqual(handler.lastCall.args[0], [1, 2, 3, 4]);
    test.done();
  },

  regAndBytesToRead(test) {
    test.expect(4);
    let handler = this.sandbox.spy();

    this.board.i2cConfig({ address: 0x04, bus: "A" });
    this.board.i2cReadOnce(0x04, 0xff, 4, handler);

    test.equal(this.transfer.lastCall.args[0].length, 1);
    test.deepEqual(this.transfer.lastCall.args[0], [0xff]);
    test.equal(this.transfer.lastCall.args[1], 4);

    let transfer = this.transfer.lastCall.args[2];

    transfer(null, new Buffer([1, 2, 3, 4]));

    test.deepEqual(handler.lastCall.args[0], [1, 2, 3, 4]);
    test.done();
  },

  readError(test) {
    test.expect(1);
    let handler = this.sandbox.spy();
    let expectError = new Error("An Error!");

    this.transfer.restore();
    this.transfer = this.sandbox.stub(T2.I2C.prototype, "transfer").callsFake((buffer, bytesToRead, handler) => {
      handler(expectError);
    });

    this.board.on("error", error => {
      test.equal(error, expectError);
      test.done();
    });
    this.board.i2cConfig({ address: 0x04, bus: "A" });
    this.board.i2cReadOnce(0x04, 0xff, 4, handler);
  },
};

exports["Board.prototype.i2cRead"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cReadOnce = this.sandbox.stub(Board.prototype, "i2cReadOnce").callsFake((address, register, bytesToRead, callback) => {

      // Fix arguments if called with Firmata.js API
      if (arguments.length === 3 &&
          typeof register === "number" &&
          typeof bytesToRead === "function") {
        callback = bytesToRead;
        bytesToRead = register;
        register = null;
      }

      callback = typeof callback === "function" ? callback : function() {};

      setImmediate(_ => {
        let buffer = new Buffer(
          Array.from({ length: bytesToRead }, (_, index) => index)
        );

        callback(buffer);
      });
    });
    this.board = new Board();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  bytesToRead(test) {
    test.expect(6);

    let counter = 0;
    let handler = buffer => {
      test.equal(buffer.length, 4);
      if (++counter === 5) {
        test.ok(counter);
        test.done();
      }
    };

    this.board.i2cConfig({ address: 0x04, bus: "A" });
    this.board.i2cRead(0x04, 4, handler);
    this.clock.tick(this.board.getSamplingInterval());
    this.clock.tick(this.board.getSamplingInterval());
    this.clock.tick(this.board.getSamplingInterval());
    this.clock.tick(this.board.getSamplingInterval());
    this.clock.tick(this.board.getSamplingInterval());
    this.clock.tick(this.board.getSamplingInterval());
  },

  regAndBytesToRead(test) {
    test.expect(6);

    let counter = 0;
    let handler = buffer => {
      test.equal(buffer.length, 4);
      if (++counter === 5) {
        test.ok(counter);
        test.done();
      }
    };

    this.board.i2cConfig({ address: 0x04, bus: "A" });
    this.board.i2cRead(0x04, 0xff, 4, handler);
    this.clock.tick(this.board.getSamplingInterval());
    this.clock.tick(this.board.getSamplingInterval());
    this.clock.tick(this.board.getSamplingInterval());
    this.clock.tick(this.board.getSamplingInterval());
    this.clock.tick(this.board.getSamplingInterval());
  },
};

exports["Board.prototype.setSamplingInterval"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.clearInterval = this.sandbox.spy(global, "clearInterval");
    this.board = new Board();
    done();
  },
  tearDown(done) {
    this.sandbox.restore();
    Board.purge();
    done();
  },
  samplingIntervalDefault(test) {
    test.expect(1);
    test.equal(this.board.getSamplingInterval(), Board.defaultSamplingInterval);
    test.done();
  },
  samplingIntervalCustom(test) {
    test.expect(1);
    this.board.setSamplingInterval(1000);
    test.equal(this.board.getSamplingInterval(), 1000);
    test.done();
  },
  samplingIntervalValid(test) {
    test.expect(2);
    this.board.setSamplingInterval(65536);
    test.equal(this.board.getSamplingInterval(), 65535);
    this.board.setSamplingInterval(-1);
    test.equal(this.board.getSamplingInterval(), 5);
    test.done();
  }
};


class SDuplex extends stream.Duplex {
  constructor() {
    super();
  }
  _write() {}
}

exports["Board.prototype.serial*"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();

    this.a = this.sandbox.stub(tessel.port.A, "UART");
    this.b = this.sandbox.stub(tessel.port.B, "UART");

    this.configA = {
      portId: "A",
    };
    this.configB = {
      portId: "B",
    };

    this.privGet = this.sandbox.spy(WeakMap.prototype, "get");
    this.inBytes = [1, 2, 3, 4];

    this.write = this.sandbox.stub(SDuplex.prototype, "write");
    this.on = this.sandbox.stub(SDuplex.prototype, "on");

    this.fakeState = {
      uart: {
        A: new SDuplex(),
        B: new SDuplex(),
      }
    };

    this.fakeState.uart.A.disable = this.sandbox.spy();
    this.fakeState.uart.B.disable = this.sandbox.spy();

    this.board = new Board();
    done();
  },
  tearDown(done) {
    this.sandbox.restore();
    Board.purge();
    done();
  },

  serialConfig: {
    privateState(test) {
      test.expect(2);

      this.privGet.reset();

      this.board.serialConfig(this.configA);

      test.equal(this.privGet.callCount, 1);
      test.equal(this.privGet.lastCall.args[0], this.board);
      test.done();
    },

    validWithDefaults(test) {
      test.expect(4);
      this.board.serialConfig(this.configA);
      this.board.serialConfig(this.configB);

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

    validWithExplicit(test) {
      test.expect(4);

      const configA = Object.assign({}, {
        portId: "A",
        baud: 9600,
        dataBits: 8,
        parity: "none",
        stopBits: 1,
      });
      const configB = Object.assign({}, {
        portId: "B",
        baud: 9600,
        dataBits: 8,
        parity: "none",
        stopBits: 1,
      });

      this.board.serialConfig(configA);
      this.board.serialConfig(configB);

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

    invalidMissingOptions(test) {
      test.expect(3);

      test.throws(() => {
        this.board.serialConfig();
      });
      test.equal(this.a.callCount, 0);
      test.equal(this.b.callCount, 0);

      test.done();
    },

    invalidMissingPortId(test) {
      test.expect(3);

      test.throws(() => {
        this.board.serialConfig({});
      });
      test.equal(this.a.callCount, 0);
      test.equal(this.b.callCount, 0);

      test.done();
    },

    invalidPortId(test) {
      test.expect(3);

      test.throws(() => {
        this.board.serialConfig({ portId: "jdfnkjdfnb" });
      });
      test.equal(this.a.callCount, 0);
      test.equal(this.b.callCount, 0);

      test.done();
    },
  },

  serialWrite: {
    privateState(test) {
      test.expect(2);

      this.privGet.reset();

      this.board.serialWrite("A", this.inBytes);

      test.equal(this.privGet.callCount, 1);
      test.equal(this.privGet.lastCall.args[0], this.board);
      test.done();
    },

    writesInBytes(test) {
      test.expect(12);
      this.privGet.restore();
      this.privGet = this.sandbox.stub(WeakMap.prototype, "get").returns(this.fakeState);

      this.board.serialWrite("A", this.inBytes);
      this.board.serialWrite("B", this.inBytes);

      test.equal(this.privGet.callCount, 2);
      test.equal(this.privGet.firstCall.args[0], this.board);
      test.equal(this.privGet.secondCall.args[0], this.board);

      test.equal(this.write.callCount, 2);
      test.equal(this.write.firstCall.args[0][0], 1);
      test.equal(this.write.firstCall.args[0][1], 2);
      test.equal(this.write.firstCall.args[0][2], 3);
      test.equal(this.write.firstCall.args[0][3], 4);

      test.equal(this.write.secondCall.args[0][0], 1);
      test.equal(this.write.secondCall.args[0][1], 2);
      test.equal(this.write.secondCall.args[0][2], 3);
      test.equal(this.write.secondCall.args[0][3], 4);
      test.done();
    },

    writesInBytesNonArray(test) {
      test.expect(6);
      this.privGet.restore();
      this.privGet = this.sandbox.stub(WeakMap.prototype, "get").returns(this.fakeState);

      this.board.serialWrite("A", this.inBytes[0]);
      this.board.serialWrite("B", this.inBytes[0]);

      test.equal(this.privGet.callCount, 2);
      test.equal(this.privGet.firstCall.args[0], this.board);
      test.equal(this.privGet.secondCall.args[0], this.board);

      test.equal(this.write.callCount, 2);
      test.equal(this.write.firstCall.args[0][0], 1);
      test.equal(this.write.secondCall.args[0][0], 1);
      test.done();
    },

  },
  serialRead: {
    privateState(test) {
      test.expect(2);

      this.privGet.reset();

      this.board.serialRead("A", 1, () => {});

      test.equal(this.privGet.callCount, 1);
      test.equal(this.privGet.lastCall.args[0], this.board);
      test.done();
    },

    data(test) {
      test.expect(8);

      const spy = this.sandbox.spy();
      this.privGet.restore();
      this.privGet = this.sandbox.stub(WeakMap.prototype, "get").returns(this.fakeState);

      this.on.reset();

      this.board.serialRead("A", 1, spy);
      this.board.serialRead("B", 1, spy);

      test.equal(this.privGet.callCount, 2);
      test.equal(this.privGet.firstCall.args[0], this.board);
      test.equal(this.privGet.secondCall.args[0], this.board);

      test.equal(this.on.callCount, 2);
      test.equal(this.on.firstCall.args[0], "data");
      test.equal(this.on.firstCall.args[0], "data");
      test.equal(this.on.secondCall.args[1], spy);
      test.equal(this.on.secondCall.args[1], spy);

      test.done();
    },
  },
  serialStop: {
    privateState(test) {
      test.expect(2);

      this.privGet.reset();

      this.board.serialStop("A");

      test.equal(this.privGet.callCount, 1);
      test.equal(this.privGet.lastCall.args[0], this.board);
      test.done();
    },

    stop(test) {
      test.expect(6);

      this.removeAllListeners = this.sandbox.stub(SDuplex.prototype, "removeAllListeners");

      this.privGet.restore();
      this.privGet = this.sandbox.stub(WeakMap.prototype, "get").returns(this.fakeState);

      this.removeAllListeners.reset();

      this.board.serialStop("A");
      this.board.serialStop("B");

      test.equal(this.privGet.callCount, 2);
      test.equal(this.privGet.firstCall.args[0], this.board);
      test.equal(this.privGet.secondCall.args[0], this.board);

      test.equal(this.removeAllListeners.callCount, 2);
      test.equal(this.removeAllListeners.firstCall.args[0], "data");
      test.equal(this.removeAllListeners.firstCall.args[0], "data");

      test.done();
    },
  },
  serialClose: {
    privateState(test) {
      test.expect(2);

      this.privGet.reset();

      this.board.serialClose("A");

      test.equal(this.privGet.callCount, 1);
      test.equal(this.privGet.lastCall.args[0], this.board);
      test.done();
    },

    close(test) {
      test.expect(5);

      this.privGet.restore();
      this.privGet = this.sandbox.stub(WeakMap.prototype, "get").returns(this.fakeState);

      this.board.serialClose("A");
      this.board.serialClose("B");

      test.equal(this.privGet.callCount, 2);
      test.equal(this.privGet.firstCall.args[0], this.board);
      test.equal(this.privGet.secondCall.args[0], this.board);

      test.equal(this.fakeState.uart.A.disable.callCount, 1);
      test.equal(this.fakeState.uart.B.disable.callCount, 1);

      test.done();
    },
  },
};


