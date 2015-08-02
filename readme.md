# Tessel-IO

[![Build Status](https://travis-ci.org/rwaldron/tessel-io.png?branch=master)](https://travis-ci.org/rwaldron/tessel-io)

## Tessel-IO is compatible with Tessel 2

Tessel-IO is an IO Plugin that enables writing JavaScript Robotics programs with Johnny-Five, that run on a Tessel 2. This project was built at [Bocoup](http://bocoup.com)


![Tessel 2](https://raw.githubusercontent.com/rwaldron/tessel-io/master/fritzing/tessel.png)



## Install & Setup

```js
npm install t2-cli tessel-io johnny-five
```


## Boilerplate Program

```js
var five = require("johnny-five");
var Tessel = require("tessel-io");
var board = new five.Board({
  io: new Tessel()
});

board.on("ready", function() {
  // Write your program locally and push to the Tessel 2 when ready!  
});
```

## Pin Naming Guide

| Port | Number | Johnny-Five Compatible Name |
|------|--------|-----------------------------|
|A|0|`"a0"` or `"A0"`|
|A|1|`"a1"` or `"A1"`|
|A|2|`"a2"` or `"A2"`|
|A|3|`"a3"` or `"A3"`|
|A|4|`"a4"` or `"A4"`|
|A|5|`"a5"` or `"A5"`|
|A|6|`"a6"` or `"A6"`|
|A|7|`"a7"` or `"A7"`|
|B|0|`"b0"` or `"B0"`|
|B|1|`"b1"` or `"B1"`|
|B|2|`"b2"` or `"B2"`|
|B|3|`"b3"` or `"B3"`|
|B|4|`"b4"` or `"B4"`|
|B|5|`"b5"` or `"B5"`|
|B|6|`"b6"` or `"B6"`|
|B|7|`"b7"` or `"B7"`|

See [examples](https://github.com/rwaldron/tessel-io/tree/master/eg) for basic, non-Johnny-Five examples.


## Pin Capabilities Guide

[Originally written for Tessel 2's Firmware Docs](https://github.com/tessel/t2-firmware/#pin-mapping)



| Port | Pin | Digital I/O | SCL | SDA | SCK | MISO | MOSI | TX | RX | Analog In | Analog Out |
|------|-----|-------------|-----|-----|-----|------|------|----|----|-----------|------------|
|A     | 0   | ✓           | ✓   |     |     |      |      |    |    |           |            |
|A     | 1   | ✓           |     | ✓   |     |      |      |    |    |           |            |
|A     | 2   | ✓           |     |     | ✓   |      |      |    |    |           |            |
|A     | 3   | ✓           |     |     |     | ✓    |      |    |    |           |            |
|A     | 4   | ✓           |     |     |     |      | ✓    |    |    | ✓         |            |
|A     | 5   | ✓           |     |     |     |      |      | ✓  |    |           |            |
|A     | 6   | ✓           |     |     |     |      |      |    | ✓  |           |            |
|A     | 7   | ✓           |     |     |     |      |      |    |    | ✓         |            |
|B     | 0   | ✓           | ✓   |     |     |      |      |    |    | ✓         |            |
|B     | 1   | ✓           |     | ✓   |     |      |      |    |    | ✓         |            |
|B     | 2   | ✓           |     |     | ✓   |      |      |    |    | ✓         |            |
|B     | 3   | ✓           |     |     |     | ✓    |      |    |    | ✓         |            |
|B     | 4   | ✓           |     |     |     |      | ✓    |    |    | ✓         |            |
|B     | 5   | ✓           |     |     |     |      |      | ✓  |    | ✓         |            |
|B     | 6   | ✓           |     |     |     |      |      |    | ✓  | ✓         |            |
|B     | 7   | ✓           |     |     |     |      |      |    |    | ✓         | ✓          |



### This is an early "platform preview" and is not yet guaranteed to function correctly. [Please report any bugs or issues that you encounter!](https://github.com/rwaldron/tessel-io/issues)
