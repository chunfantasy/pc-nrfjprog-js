'use strict';
// const Buffer = require('safe-buffer').Buffer;
const Transform = require('stream').Transform;

const ETX = 0x03;
const ESC = 0x1F;

/**
 * A transform stream that parses the PPK Line Input Protocol. Similar to SLIP,
 * but for the PPK. Thus, PPKLIP.
 *
 * Inspired by the `Delimiter` parser from `node-serialport`.
 */
class PPKLIP extends Transform {
    constructor(options) {
        options = options || {};
        super(options);

        this.buffer = Buffer.alloc(0);
        this.escaping = false;
    }

    _transform(chunk, encoding, callback) {
        const data = Buffer.concat([this.buffer, Buffer.allocUnsafe(chunk.length)]);
        let unescapedLength = this.buffer.length;
        let startPosition = 0;

        for (let i=0, l=chunk.length; i<l; i++) {
            const byte = chunk[i];
            if (this.escaping) {
                data[unescapedLength++] = byte ^ 0x20;
                this.escaping = false;
            } else {
                if (byte === ESC) {
                    this.escaping = true;
                } else if (byte === ETX){
                    this.push(data.slice(startPosition, unescapedLength));
                    startPosition = unescapedLength;
                } else {
                    data[unescapedLength++] = byte;
                }
            }
        }

        this.buffer = data.slice(startPosition, unescapedLength);
        callback();
    }

    _flush(callback) {
        this.push(this.buffer);
        this.buffer = Buffer.alloc(0);
        callback();
    }
};

module.exports = PPKLIP;

