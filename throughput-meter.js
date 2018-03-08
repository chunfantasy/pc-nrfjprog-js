'use strict';
const Transform = require('stream').Transform;
/**
 * A transform stream that emits statistics about how much data is being received.
 *
 * It accepts a `interval` option, the number of milliseconds between outputting
 * measurements (default 1000 milliseconds = 1 second)
 *
 * @extends Transform
 * @example
const SerialPort = require('serialport');
const Delimiter = SerialPort.parsers.ThroughputMeter;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(new ThroughputMeter({ interval: 2000 }));
parser.on('data', console.log);
 */

class ThroughputMeter extends Transform {
    constructor(options = {}) {
        super(options)

        const interval = options.interval || 1000;

        this._timer = setInterval(this._onTick.bind(this), interval);
        this._interval = interval / 1000; // Convert into seconds

        this._bytesReceived = 0;
    }

    destroy() {
        clearInterval(this._timer);
    }

    _onTick(options) {
        if (this._bytesReceived > 0) {
            this.push((this._bytesReceived / this._interval) + ' bytes/sec\n');
            this._bytesReceived = 0;
        }
    }

    _transform(chunk, encoding, callback) {
        this._bytesReceived += chunk.length;
        callback();
    }
}

module.exports = ThroughputMeter;
