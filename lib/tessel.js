require("../lib/array-includes-shim");

var os = require("os");
var Emitter = require("events").EventEmitter;
var tessel;
var factory;

if (process.env.IS_TEST_ENV) {
  factory = require("../test/tessel-mock");
  tessel = factory();
} else {
  tessel = require("tessel");
}

var priv = new Map();
var boards = [];
var reporting = [];

var modes = Object.freeze({
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4,
  I2C: 6,
});

var validModes = Object.keys(modes).map(key => modes[key]);


var pinModes = [
  // Port A
  { modes: [0, 1, 6] },
  { modes: [0, 1, 6] },
  { modes: [0, 1 ] },
  { modes: [0, 1 ] },
  { modes: [0, 1, 2 ], analogChannel: 0 },
  { modes: [0, 1, 3, 4, ] },
  { modes: [0, 1, 3, 4, ] },
  { modes: [0, 1, 2 ], analogChannel: 1 },
  // Port B
  { modes: [0, 1, 2 , 6], analogChannel: 2 },
  { modes: [0, 1, 2 , 6], analogChannel: 3 },
  { modes: [0, 1, 2 ], analogChannel: 4 },
  { modes: [0, 1, 2 ], analogChannel: 5 },
  { modes: [0, 1, 2 ], analogChannel: 6 },
  { modes: [0, 1, 2, 3, 4, ], analogChannel: 7 },
  { modes: [0, 1, 2, 3, 4, ], analogChannel: 8 },
  { modes: [0, 1, 2, 3 ], analogChannel: 9 },
  // LEDs
  { modes: [1] },
  { modes: [1] },
  { modes: [1] },
  { modes: [1] },
];

var portOffsets = {
    A: 0,
    B: 8,
    L: 16
};

var analogPins = [
  4, 7, 8, 9, 10, 11, 12, 13, 14, 15
];

function ToPinIndex(value) {
  var index = +value;

  if (!Number.isNaN(index)) {
    if (index >= 0 && index < pinModes.length) {
      return index;
    } else {
      return -1;
    }
  }

  value = value.replace("_", "");

  var port = value[0].toUpperCase();
  var pin = +value[1];
  var offset = portOffsets[port];

  if (port !== "A" && port !== "B" && port !== "L") {
    return -1;
  }

  return pin + offset;
}

function ToPortIdentity(pinIndex) {
  pinIndex = +pinIndex;

  if (pinIndex < 0 || pinIndex >= pinModes.length) {
    return {
      port: null,
      index: -1
    };
  }

  var isPortB = pinIndex > 7;
  var isLED = pinIndex > 15;
  var port = isLED ? "L" : isPortB ? "B" : "A"; 
  var offset = portOffsets[port];
  return {
    port: port,
    index: pinIndex - offset,
  };
}

function ToPortI2CBus(value) {
  if (typeof value === "string") {
    value = value.toUpperCase();
    return value === "B" ? 2 : (value === "A" ? 4 : -1);
  } else {
    return value === 2 ? 2 : (value === 4 ? 4 : -1);
  }
  return -1;
}

function ToI2CBusPort(value) {
  if (typeof value === "string") {
    value = value.toUpperCase();
    return value === "B" ? value : (value === "A" ? value : undefined);
  } else {
    return value === 2 ? "B" : (value === 4 ? "A" : undefined);
  }
  return undefined;
}

var samplingInterval = 5;

function read() {
  if (read.interval) {
    return;
  }

  read.interval = global.setInterval(function() {
    var board;

    if (boards.length && reporting.length) {
      board = boards[0];

      reporting.forEach(function(report, gpio) {
        board.pins[report.index].read(function(value) {
          processRead(board, report, value);
        });
      });
    }
  }, samplingInterval);
}

function processRead(board, report, value) {
  value = +value;

  if (Number.isNaN(value)) {
    value = 0;
  }

  if (report.scale) {
    value = report.scale(value);
  }

  board.pins[report.index].value = value;
  board.emit(report.event, value);
}

function Port() {}

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

function Pin(options) {
  // options.port
  // options.index
  
  var pin = options.port === "L" ? tessel.led[options.index] : tessel.port[options.port].pin[options.index];
  var state = {
    isAnalog: false,
    pin: pin,
    index: portOffsets[options.port] + options.index,
    mode: 0
  };

  Object.assign(this, options.capabilities);

  priv.set(this, state);

  Object.defineProperties(this, {
    supportedModes: {
      value: options.modes
    },
    value: {
      get: function() {
        return state.value;
      },
      set: function(value) {
        state.value = value;
        // pin.write(value);
      }
    },
    mode: {
      get: function() {
        return state.mode;
      },
      set: function(value) {
        if (value === 0 || value === 2) {
          // TODO: Make sure this doesn't
          // interfere with analogRead.
          pin.input();
        }

        if (value === 1 || value === 3 || value === 4) {
          // TODO: Make sure this doesn't
          // interfere with pwmWrite
          if (options.port !== "L") {
            pin.output();
          }
        }

        state.isAnalog = value === 2;
        state.isPwm = value === 3 || value === 4;
        state.isServo = value === 4;
        state.mode = value;
      }
    }
  });

  // Set all pins to OUTPUT and LOW
  this.mode = 1;
  this.value = 0;
}

Pin.prototype.write = function(value) {
  var state = priv.get(this);

  if (state.isPwm || state.isServo) {
    if (state.index === 15) {
      state.pin._port.sock.write(new Buffer([Port.CMD.ANALOG_WRITE, value >> 8, value & 0xff]));
    } else {
      state.pin.pwmDutyCycle(value);
    }
  } else {
    state.pin.write(value);
  }

  state.value = value;
};

Pin.prototype.read = function(callback) {
  var state = priv.get(this);
  var index = state.pin.pin;
  var handler = function(error, data) {
    var value;

    if (error) {
      throw new Error(error);
    }

    if (state.isAnalog) {
      value = data.readUInt16LE(0) >> 2;
    } else {
      value = data === Port.REPLY.HIGH ? 1 : 0;
    }

    callback(value);
  };

  if (state.isAnalog) {
    state.pin._port.sock.write(new Buffer([Port.CMD.ANALOG_READ, index]));
    // TODO: Change to enqeue api
    state.pin._port.enqueue({
      size: 2,
      callback: handler,
    });
  } else {
    state.pin._port.cork();
    state.pin._port.sock.write(new Buffer([Port.CMD.GPIO_IN, index]));
    state.pin._port.enqueue({
      size: 0,
      callback: handler,
    });
    state.pin._port.uncork();
  }
};

function Tessel(options) {
  Emitter.call(this);

  if (!(this instanceof Tessel)) {
    return new Tessel(options);
  }

  options = options || {};

  var state = {
    pwm: {
      // MHz
      frequency: null,
    },
    i2c: {
      // Defaults to Port A I2C bus
      bus: ToPortI2CBus(options.i2c !== undefined ? options.i2c.bus : 4),
      devices: {

      }
    }
  };

  priv.set(this, state);

  this.name = `Tessel 2 (${os.hostname()})`;
  this.isReady = false;

  this.pins = pinModes.map((config, index) => {
    return new Pin(Object.assign({}, config, ToPortIdentity(index)));
  });

  this.analogPins = analogPins;

  boards.push(this);

  // Connected to the device implicitly, so nothing to wait for
  setImmediate(_ => this.emit("connect"));

  // The "ready event" is needed to signal to Johnny-Five that
  // communication with the pinouts is ready.
  setImmediate(_ => {
    this.isReady = true;
    this.emit("ready");
  });
}

Tessel.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Tessel
  },
  MODES: {
    value: modes
  },
  HIGH: {
    value: 1
  },
  LOW: {
    value: 0
  }
});

Tessel.prototype.setSamplingInterval = function(ms) {
  samplingInterval = Math.min(Math.max(ms, 5), 65535);
  global.clearInterval(read.interval);
  read();
};

Tessel.prototype.getSamplingInterval = function() {
  return samplingInterval;
};

Tessel.prototype.normalize = function(value) {
  // Eg.
  //
  // A0 => 0
  // A_0 => 0
  // B0 => 8
  // B_0 => 8
  //
  return ToPinIndex(String(value).replace("-", ""));
};

Tessel.prototype.pinMode = function(pin, value) {
  if (validModes.includes(value)) {
    this.pins[ToPinIndex(pin)].mode = value;
  }
  return this;
};

Tessel.prototype.digitalRead = function(pin, handler) {
  var pinIndex = ToPinIndex(pin);
  var event = "digital-read-" + pinIndex;

  reporting.push({
    event: event,
    index: pinIndex,
    scale: null
  });

  this.on(event, handler);
  read();

  return this;
};

Tessel.prototype.digitalWrite = function(pin, value) {
  this.pins[ToPinIndex(pin)].write(constrain(value, 0, 1));
  return this;
};

Tessel.prototype.analogRead = function(pin, handler) {
  var pinIndex = ToPinIndex(pin);
  var event = "analog-read-" + pinIndex;

  reporting.push({
    event: event,
    index: pinIndex,
    scale: null
  });

  this.on(event, handler);
  read();

  return this;
};

var PWM_FREQUENCY = 490;
var PWM_MIN = 0;
var PWM_MAX = 1;

var SERVO_FREQUENCY = 50;
var SERVO_MIN = 0.03;
var SERVO_MAX = 0.12;

var pwms = [5, 6, 13, 14, 15];

Tessel.prototype.pwmWrite = function(pin, value) {
  var state = priv.get(this);
  var index = ToPinIndex(pin);
  var constrained = constrain(value, 0, 255);
  var output = 0;

  if (pwms.includes(index)) {
    // For B7/15, use the DAC
    if (index === 15) {
      output = scale(constrained, 0, 255, 0, 1023) | 0;
    } else {
      if (state.pwm.frequency !== PWM_FREQUENCY) {
        state.pwm.frequency = PWM_FREQUENCY;
        tessel.pwmFrequency(PWM_FREQUENCY);
      }
      output = scale(constrained, 0, 255, 0, 1);
    }

    this.pins[index].write(output);
  }
  return this;
};

Tessel.prototype.analogWrite = Tessel.prototype.pwmWrite;

Tessel.prototype.servoWrite = function(pin, value) {
  var state = priv.get(this);
  var index = ToPinIndex(pin);
  var constrained = constrain(value, 0, 180);

  if (pwms.slice(0, -1).includes(index)) {
    if (state.pwm.frequency !== SERVO_FREQUENCY) {
      state.pwm.frequency = SERVO_FREQUENCY;
      tessel.pwmFrequency(SERVO_FREQUENCY);
    }
    this.pins[index].write(scale(constrained, 0, 180, 0.03, 0.12));
  }
  return this;
};

// Note: Tessel-IO will default to Port A if no bus is specified.
Tessel.prototype.i2cConfig = function(options) {
  var state = priv.get(this);
  var delay;

  if (options === undefined) {
    throw new Error("i2cConfig expected `options` object");
  }

  // If this encounters an legacy calls to i2cConfig
  if (typeof options === "number") {
    delay = options;
    options = {
      delay: delay
    };
  }

  // Default to Port A's I2C bus (user facing name is "A")
  if (!options.bus) {
    // Maybe they called it "port"? Let's allow that.
    if (options.port) {
      options.bus = options.port;
    } else {
      options.bus = "A";
    }
  }

  if (options.addresses && Array.isArray(options.addresses)) {
    options.addresses.forEach(function(address) {
      if (address && !state.i2c[address]) {
        state.i2c[address] = new tessel.port[ToI2CBusPort(options.bus)].I2C(address);
      }
    });
  } else {
    if (options.address && !state.i2c[options.address]) {
      state.i2c[options.address] = new tessel.port[ToI2CBusPort(options.bus)].I2C(options.address);
    }
  }
};

// Map to Board.prototype.sendI2CWriteRequest
Tessel.prototype.i2cWrite = function(address, cmdRegOrData, dataBytes) {
  /**
   * cmdRegOrData:
   * [... arbitrary bytes]
   *
   * or
   *
   * cmdRegOrData, dataBytes:
   * command [, ...]
   *
   */
  var state = priv.get(this);
  var buffer, temp;

  // If i2cWrite was used for an i2cWriteReg call...
  if (arguments.length === 3 &&
      typeof cmdRegOrData === "number" &&
      typeof dataBytes === "number") {

    dataBytes = [dataBytes];
  }

  // Fix arguments if called with Firmata.js API
  if (arguments.length === 2) {
    if (Array.isArray(cmdRegOrData)) {
      dataBytes = cmdRegOrData.slice();
      cmdRegOrData = dataBytes.shift();
    } else {
      dataBytes = [];
    }
  }

  buffer = new Buffer([cmdRegOrData].concat(dataBytes));

  if (buffer.length) {
    state.i2c[address].send(buffer);
  }

  return this;
};

Tessel.prototype.i2cWriteReg = function(address, register, value) {
  return this.i2cWrite(address, [register, value]);
};

Tessel.prototype.i2cRead = function(address, register, bytesToRead, callback) {

  // Fix arguments if called with Firmata.js API
  if (arguments.length === 3 &&
      typeof register === "number" &&
      typeof bytesToRead === "function") {
    callback = bytesToRead;
    bytesToRead = register;
    register = null;
  }

  callback = typeof callback === "function" ? callback : function() {};

  var start = Date.now();
  var continuousRead = _ => {
    this.i2cReadOnce(address, register, bytesToRead, (bytes) => {
      callback(bytes);
      var now = Date.now();
      var diff = now - start;
      setTimeout(continuousRead, samplingInterval - diff);
      start = now;
    });
  };

  continuousRead();

  return this;
};

// Map to Board.prototype.sendI2CReadRequest
Tessel.prototype.i2cReadOnce = function(address, register, bytesToRead, callback) {
  var state = priv.get(this);
  var event = "I2C-reply-" + address + "-";
  var regBuffer = [];

  // Fix arguments if called with Firmata.js API
  if (arguments.length === 3 &&
      typeof register === "number" &&
      typeof bytesToRead === "function") {
    callback = bytesToRead;
    bytesToRead = register;
    register = null;
  }

  callback = typeof callback === "function" ? callback : function() {};

  if (typeof register === "number") {
    regBuffer.push(register);
    event += register;
  }

  this.once(event, callback);

  state.i2c[address].transfer(new Buffer(regBuffer), bytesToRead, (error, buffer) => {
    if (error) {
      this.emit("error", error);
      return;
    }

    var values = [];

    for (var i = 0; i < bytesToRead; i++) {
      values.push(buffer.readUInt8(i));
    }

    this.emit(event, values);
  });

  return this;
};

// Necessary for Firmata.js compatibility.
Tessel.prototype.sendI2CWriteRequest = Tessel.prototype.i2cWrite;
Tessel.prototype.sendI2CReadRequest = Tessel.prototype.i2cReadOnce;
Tessel.prototype.sendI2CConfig = Tessel.prototype.i2cConfig;


function constrain(value, low, high) {
  return Math.max(Math.min(value, high), low);
}

function scale(value, fromLow, fromHigh, toLow, toHigh) {
  return ((value - fromLow) * (toHigh - toLow) /
      (fromHigh - fromLow) + toLow);
}

if (process.env.IS_TEST_ENV) {
  Tessel.ToPinIndex = ToPinIndex;
  Tessel.ToPortIdentity = ToPortIdentity;
  Tessel.ToPortI2CBus = ToPortI2CBus;
  Tessel.ToI2CBusPort = ToI2CBusPort;
  Tessel.Pin = Pin;
  Tessel.read = read;
  Tessel.processRead = processRead;
  Tessel.tessel = tessel;
  Tessel.reset = function() {
    boards.length = 0;
  };
  // ...
}

// These are exposed to allow direct access as needed.
Tessel.PORTS = {
  A: tessel.port.A,
  B: tessel.port.B,
};

module.exports = Tessel;
