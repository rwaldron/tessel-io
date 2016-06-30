require("../lib/array-includes-shim");

var os = require("os");
var util = require("util");
var Emitter = require("events").EventEmitter;
var tessel;
var factory;

/**
 * dirName gets or sets the current value of `__dirname`
 *
 * Normally, we would never want to set the value of `__dirname`. The only
 * reason that we're including this functionality is to expose it for testing
 * purposes.
 *
 * A later check against the current directory is used to enforce REPL
 * disabling, and so we expose this function on `Tessel` when in a testing
 * environment, in order to allow the test to mock the value of `__dirname` for
 * the Tessel's execution environments.
 *
 * @returns {String} The current value of __dirname
 */
function dirName(newPath) {
  if (typeof newPath !== "undefined") {
    /*jshint -W020 */
    __dirname = newPath;
    /*jshint +W020 */
  }

  return __dirname;
}

if (process.env.IS_TEST_MODE) {
  factory = require("../test/tessel-mock");
  tessel = factory();
  Tessel.dirName = dirName;
} else {
  tessel = require("tessel");
}

var priv = new Map();
var tessels = [];

var modes = Object.freeze({
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4,
  I2C: 6,
  SERIAL: 10,
});

var validModes = Object.keys(modes).map(key => modes[key]);

var SERIAL_MODES = Object.freeze({
  READ_CONTINUOUS: 0x00,
  STOP_READING: 0x01
});

// map to the pin resolution value in the capability query response
var SERIAL_PIN_TYPES = {
  RES_RX0: 0x00,
  RES_TX0: 0x01,
  RES_RX1: 0x02,
  RES_TX1: 0x03,
  RES_RX2: 0x04,
  RES_TX2: 0x05,
  RES_RX3: 0x06,
  RES_TX3: 0x07
};

var pinModes = [
  // Port A
  { modes: [0, 1, 6] },
  { modes: [0, 1, 6] },
  { modes: [0, 1 ] },
  { modes: [0, 1 ] },
  { modes: [0, 1, 2 ], analogChannel: 0 },
  { modes: [0, 1, 3, 4, 10 ] },
  { modes: [0, 1, 3, 4, 10 ] },
  { modes: [0, 1, 2 ], analogChannel: 1 },
  // Port B
  { modes: [0, 1, 2 , 6], analogChannel: 2 },
  { modes: [0, 1, 2 , 6], analogChannel: 3 },
  { modes: [0, 1, 2 ], analogChannel: 4 },
  { modes: [0, 1, 2 ], analogChannel: 5 },
  { modes: [0, 1, 2 ], analogChannel: 6 },
  { modes: [0, 1, 2, 3, 4, 10 ], analogChannel: 7 },
  { modes: [0, 1, 2, 3, 4, 10 ], analogChannel: 8 },
  { modes: [0, 1, 2, 3 ], analogChannel: 9 },
  // LEDs
  { modes: [1] },
  { modes: [1] },
  { modes: [1] },
  { modes: [1] },
];

var A = "A";
var B = "B";
var L = "L";


var ports = {
  A: { label: A, offset: 0 },
  B: { label: B, offset: 8 },
  L: { label: L, offset: 16 }
};

Object.assign(ports, {
  byPortName: {
    A: ports.A,
    B: ports.B,
    L: ports.L,
  },
  byPortNumber: {
    0: ports.A,
    1: ports.B,
    2: ports.L,
  },
  byOffset: {
    0: ports.A,
    8: ports.B,
    16: ports.L,
  },
});

var analogPins = [
  4, 7, 8, 9, 10, 11, 12, 13, 14, 15
];

/**
 * ToPinIndex Return the board-wide index of a Pin for a given Pin name, Number, or Index
 * @param {number|string} value Could be a string or
 */
function ToPinIndex(value) {
  var index = +value;

  if (value == null || value === false) {
    return -1;
  }

  if (!Number.isNaN(index)) {
    if (index >= 0 && index < pinModes.length) {
      return index;
    } else {
      return -1;
    }
  }

  value = value.replace(/_|-/, "");

  var portName = value[0].toUpperCase();
  var pin = +value[1];

  if (portName !== A && portName !== B && portName !== L) {
    return -1;
  }

  var offset = ports.byPortName[portName].offset;
  var pinIndex = pin + offset;

  // Out of range, no pin object exists here.
  if (pinModes[pinIndex] === undefined) {
    return -1;
  }

  return pin + offset;
}

/**
 * ToPortIdentity Return the port and port index of a given index.
 * @param {Number} index The pin index of a given pin
 *                       for a given board (NOT PORT)
 */
function ToPortIdentity(index) {
  index = +index;
  var port = ports.byPortNumber[index >> 3];

  if ((index < 0 || index >= pinModes.length) ||
      port === undefined || pinModes[index] === undefined) {
    return {
      port: null,
      index: -1
    };
  }

  return {
    port: port.label,
    index: index - port.offset,
  };
}

/**
 * ToPortI2CBus Return the I2C Bus for given Port or I2C Bus
 * @param {number|string} value Either a Port name or I2C Bus
 */
function ToPortI2CBus(value) {
  if (typeof value === "string") {
    value = value.toUpperCase();
  }

  if (value === A || value === 4) {
    return 4;
  }

  if (value === B || value === 2) {
    return 2;
  }

  return -1;
}
/**
 * ToI2CBusPort Return the Port for a given I2C Bus or I2C Port
 * @param {number|string} value Either a Port name or I2C Bus
 */
function ToI2CBusPort(value) {
  if (typeof value === "string") {
    value = value.toUpperCase();
  }

  if (value === A || value === 4) {
    return A;
  }

  if (value === B || value === 2) {
    return B;
  }

  return undefined;
}

var samplingInterval = 100;

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
  Emitter.call(this);
  // options.port
  // options.index

  var pin = options.port === L ?
    tessel.led[options.index] : tessel.port[options.port].pin[options.index];
  var state = {
    board: options.board,
    isAnalogInput: false,
    isInverted: options.index === 0 || options.index === 1,
    isPwm: false,
    isServo: false,
    index: ports.byPortName[options.port].offset + options.index,
    mode: undefined,
    pin: pin,
    value: options.port === L ? undefined : 0,
  };

  Object.assign(this, options.capabilities);

  priv.set(this, state);

  Object.defineProperties(this, {
    id: {
      get: () => {
        return options.index;
      }
    },
    isInterrupt: {
      get: () => {
        return pin.interruptSupported;
      }
    },
    supportedModes: {
      value: options.modes
    },
    value: {
      get: () => {
        return state.value;
      },
      set: (value) => {
        state.value = value;
        // pin.write(value);
      }
    },
    mode: {
      get: () => {
        return state.mode;
      },
      set: (mode) => {
        if (mode === 0 || mode === 2) {
          // TODO: Make sure this doesn't
          // interfere with analogRead.
          pin.input();
        }

        if (mode === 1 || mode === 3 || mode === 4) {
          // TODO: Make sure this doesn't
          // interfere with pwmWrite
          if (options.port !== L) {
            pin.output();
          }
        }

        state.isAnalogInput = mode === 2;
        state.isPwm = mode === 3 || mode === 4;
        state.isServo = mode === 4;
        state.mode = mode;
      }
    }
  });

  // Don't mess with the error or warning leds...
  if (options.port !== L) {
    this.mode = undefined;
    this.write(0);
  }

  this.on("newListener", (event, handler) => {
    if (event === "change") {
      pin.on(event, handler);
    }
  });
}

util.inherits(Pin, Emitter);

Pin.PULL_MODES = [
  "pulldown",
  "pullup",
];

Pin.prototype.write = function(value) {
  var state = priv.get(this);

  if (state.isPwm || state.isServo) {
    if (state.index === 15) {
      state.pin._port.sock.write(new Buffer([Port.CMD.ANALOG_WRITE, value >> 8, value & 0xff]));
    } else {
      state.pin.pwmDutyCycle(value);
    }
  } else {
    // Johnny-Five was originally designed for the
    // Firmata protocol before there was INPUT_PULLUP.
    // Originally, the operation to set an internal
    // pullup was:
    //
    // 1. Set to INPUT
    // 2. Digital write HIGH
    //
    // Since INPUT_PULLUP is relatively new, none of
    // the existing IO Plugins (not even Firmata.js)
    // yet support it. This means that Johnny-Five
    // still contains code that will look ~ like:
    //
    // this.io.pinMode(x, INPUT);
    // this.io.digitalWrite(x, HIGH);
    //
    // Since this is the only time such a
    // combination will exist in the Johnny-Five
    // code base, we can infer the meaning by checking
    // the following:
    //
    // 1. We're in a write operation? YES
    // 2. Is this pin set to INPUT? YES
    //
    //
    // When both are true, then it's safe to assume
    // Johnny-Five is still using the old way of
    // setting an internal pullup.
    //
    //
    if (this.mode === modes.INPUT) {
      // Error on pins 0 & 1
      if (this.id < 2) {
        throw new Error("Pins 0 & 1 do not support configurable PULLUP or PULLDOWN");
      }
      state.pin.pull(Pin.PULL_MODES[value]);
    }

    state.pin.write(value);
  }

  state.value = value;
};

Pin.prototype.read = function(callback) {
  var state = priv.get(this);
  var index = state.pin.pin;
  var cmd = state.isAnalogInput ? Port.CMD.ANALOG_READ : Port.CMD.GPIO_IN;
  var size = state.isAnalogInput ? 2 : 0;
  var start = Date.now();

  var poll = _ => {
    state.pin._port.cork();
    state.pin._port.sock.write(new Buffer([cmd, index]));
    state.pin._port.enqueue({
      size: size,
      callback: (error, data) => {
        var value;

        if (error) {
          throw new Error(error);
        }

        if (state.isAnalogInput) {
          if (Buffer.isBuffer(data)) {
            value = data.readUInt16LE(0) >> 2;
          }
        } else {
          value = data === Port.REPLY.HIGH ? 1 : 0;
        }

        callback(value);

        var now = Date.now();
        var diff = timeout(start, now);

        setTimeout(poll, diff);
        start = now;
      },
    });
    state.pin._port.uncork();
  };

  poll();
};

function timeout(a, b) {
  var diff = samplingInterval - (b - a);
  return constrain(diff, 0, samplingInterval);
}

function Tessel(options) {
  Emitter.call(this);

  if (!(this instanceof Tessel)) {
    return new Tessel(options);
  }

  options = options || {};

  // Initialize and store private state
  var state = {
    pwm: {
      // MHz
      frequency: null,
    },
    i2c: {
      // Defaults to Port A I2C bus
      bus: ToPortI2CBus(options.i2c !== undefined ? options.i2c.bus : 4),
      devices: {

      },
    },
    uart: {}
  };

  priv.set(this, state);

  // Used by Johnny-Five when displaying the
  // board connection status in the terminal (debug=true)
  this.name = `Tessel 2 (${os.hostname()})`;

  // Used by Johnny-Five for analog sensor components
  // with explicit analog voltage sensitive algorithms
  this.aref = 3.3;

  // Used by Johnny-Five to coordinate board
  // interaction and component readiness
  this.isReady = false;

  // Stores a list of the analog pin indices
  // corresponding to entries in pins that
  // are marked with `analogChannel: n`
  this.analogPins = analogPins;

  // List of all pin objects
  this.pins = pinModes.map((config, index) => {
    return new Pin(Object.assign({}, config, ToPortIdentity(index)));
  });

  // If we detect that we're running on-board the Tessel, disable the repl
  if (dirName().startsWith("/app/remote-script")) {
    this.repl = false;
  }

  // Necessary for coordinating mult-board support.
  tessels.push(this);

  // There is actually nothing to wait for here, but we MUST
  // emit this asynchronously to avoid "releasing zalgo"
  setImmediate(_ => this.emit("connect"));

  // The "ready event" is needed to signal to Johnny-Five that
  // communication with the pinouts is ready.
  setImmediate(_ => {
    this.isReady = true;
    this.emit("ready");
  });
}

util.inherits(Tessel, Emitter);

Object.defineProperties(Tessel.prototype, {
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
  return ToPinIndex(value);
};

Tessel.prototype.pinMode = function(pin, value) {
  if (validModes.includes(value)) {
    this.pins[ToPinIndex(pin)].mode = value;
  }
  return this;
};

Tessel.prototype.digitalRead = function(pin, callback) {
  var pinIndex = ToPinIndex(pin);
  var event = "digital-read-" + pinIndex;
  var handler = (value) => {
    if (this.pins[pinIndex].value !== value) {
      this.pins[pinIndex].value = value;
      this.emit(event, value);
    }
  };
  this.on(event, callback);

  /*
  // This was working well earlier, why is it now failing?
  if (this.pins[pinIndex].isInterrupt) {
    this.pins[pinIndex].on("change", handler);
  } else {
    this.pins[pinIndex].read(handler);
  }
  */

  this.pins[pinIndex].read(handler);

  return this;
};

Tessel.prototype.digitalWrite = function(pin, value) {
  this.pins[ToPinIndex(pin)].write(constrain(value, 0, 1));
  return this;
};

Tessel.prototype.analogRead = function(pin, callback) {
  var pinIndex = ToPinIndex(pin);
  var event = "analog-read-" + pinIndex;

  this.on(event, callback);

  this.pins[pinIndex].read(value => {
    this.pins[pinIndex].value = value;
    this.emit(event, value);
  });

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
  var addresses = [];
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
      options.bus = A;
    }
  }

  if (typeof options.address === "number") {
    addresses = [options.address];
  } else {
    if (typeof options.address === "object" && options.address !== null) {
      addresses = Object.keys(options.address).map(key => options.address[key]);
    }
  }

  if (options.addresses && Array.isArray(options.addresses)) {
    addresses = addresses.concat(options.addresses);
  }

  addresses.forEach(function(address) {
    if (address && !state.i2c[address]) {
      state.i2c[address] = new tessel.port[ToI2CBusPort(options.bus)].I2C(address);
    }
  });
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
  var poll = _ => {
    this.i2cReadOnce(address, register, bytesToRead, (bytes) => {
      callback(bytes);
      var now = Date.now();
      var diff = timeout(start, now);
      setTimeout(poll, diff);
      start = now;
    });
  };

  poll();

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

Tessel.prototype.serialConfig = function(options) {
  var state = priv.get(this);

  if (options === undefined) {
    throw new Error("serialConfig expected `options` object");
  }

  if (options.portId === undefined ||
      (options.portId !== A && options.portId !== B)) {
    throw new Error("serialConfig expected `options.portId` (A or B)");
  }

  var baud = options.baud || 57600;
  var dataBits = options.dataBits || 8;
  var parity = options.parity || "none";
  var stopBits = options.stopBits || 1;

  state.uart[options.portId] = new tessel.port[options.portId].UART({
    // "baud" is the property that was already defined by Firmata
    baudrate: baud,
    dataBits: dataBits,
    parity: parity,
    stopBits: stopBits
  });
};

Tessel.prototype.serialWrite = function(portId, inBytes) {
  var state = priv.get(this);

  if (!Array.isArray(inBytes)) {
    inBytes = [inBytes];
  }

  if (state.uart[portId]) {
    state.uart[portId].write(new Buffer(inBytes));
  }
};

Tessel.prototype.serialRead = function(portId, maxBytesToRead, callback) {
  var state = priv.get(this);
  if (state.uart[portId]) {
    state.uart[portId].on("data", callback);
  }
};

Tessel.prototype.serialStop = function(portId) {
  var state = priv.get(this);
  if (state.uart[portId]) {
    state.uart[portId].removeAllListeners("data");
  }
};

Tessel.prototype.serialClose = function(portId) {
  var state = priv.get(this);
  if (state.uart[portId]) {
    state.uart[portId].disable();
  }
};

Tessel.prototype.serialFlush = function(portId) {
  // Has no analog in Tessel Serial
};

Tessel.prototype.serialListen = function(portId) {
  // Has no analog in Tessel Serial
};

function constrain(value, low, high) {
  return Math.max(Math.min(value, high), low);
}

function scale(value, fromLow, fromHigh, toLow, toHigh) {
  return ((value - fromLow) * (toHigh - toLow) /
      (fromHigh - fromLow) + toLow);
}

if (process.env.IS_TEST_MODE) {
  Tessel.ToPinIndex = ToPinIndex;
  Tessel.ToPortIdentity = ToPortIdentity;
  Tessel.ToPortI2CBus = ToPortI2CBus;
  Tessel.ToI2CBusPort = ToI2CBusPort;
  Tessel.Pin = Pin;
  Tessel.defaultSamplingInterval = samplingInterval;
  Tessel.tessel = tessel;
  Tessel.purge = function() {
    tessels.length = 0;
  };
}

// These are exposed to allow direct access as needed.
Tessel.PORTS = {
  A: tessel.port.A,
  B: tessel.port.B,
};

module.exports = Tessel;
