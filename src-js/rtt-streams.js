import { Readable, Writable, Duplex } from "stream";

import debug from "debug";

const debugRead = debug("rttReadable");
const debugWrite = debug("rttWritable");
const debugDuplex = debug("rttDuplex");

function readableMixIn(BaseClass) {
    return class extends BaseClass {
        _read(size) {
            //         this._debug('called _read');
            //         if (this._rttIsStarted) {
            this._rttBindings.read(this._upChannel, size, (err, chars, bytes, i) => {
                if (err) {
                    this._debug("rtt.read returned error", err);
                    this.emit(err);
                    this._readTimeout = undefined;
                } else if (chars.length) {
                    const typedBytes = Uint8Array.from(bytes);
                    const unchoked = this.push(typedBytes);
                    //                         this._debug(`rtt.read returned ${chars.length} characters: ${chars.toString()} ${typedBytes}, unchoked: ${unchoked} integer 0x${i.toString(16).padStart(8,'0')}`);
                    this._debug(`rtt.read returned ${chars.length} characters`);
                    this._readTimeout = undefined;
                } else {
                    //                     this._debug(`rtt.read returned 0 characters`);
                    if (this._readTimeout) {
                        clearTimeout(this._timeout);
                    }
                    this._readTimeout = setTimeout(() => {
                        this._read(size);
                    }, 5);
                }
            });
            //         } else if (this._rttCouldNotStart) {
            //             this.emit('error', 'RTT could not start, reading is not possible.');
            //             // Not calling this.push() here, therefore this Stream will hang up.
            //             // This is the expected behaviour when RTT failed to start.
            //         } else {
            //             // If RTT is not yet started, wait a bit and retry.
            //             setTimeout(this._read.bind(this), 50);
            //         }
        }

        _destroy(err, callback) {
            if (this._readTimeout) {
                clearTimeout(this._timeout);
            }
            this._rttBindings.stop(callback);
        }
    };
}

function writableMixIn(BaseClass) {
    return class extends BaseClass {
        _write(chunk, encoding, callback) {
            this._rttBindings.write(
                this._downChannel,
                Array.from(Uint8Array.from(chunk)),
                callback
            );
        }
    };
}

/**
 * A subclass of {@link https://nodejs.org/api/stream.html#stream_class_stream_readable|stream.Readable}.
 * It can only be instantiated through {@linkcode Probe#getReadableRttStream}.
 */
export class RttReadableStream extends readableMixIn(Readable) {
    constructor(rttBindings, serialNumber, upChannelIndex, options = {}) {
        // The constructor expects that the RTT bindings have already called start(),
        // with the same serial number given here.
        super(options);

        debugRead(
            `Instantiating RttReadableStream to ${serialNumber}/${upChannelIndex}`
        );
        this._debug = debugRead;

        this._rttBindings = rttBindings;
        this._upChannel = upChannelIndex;
        this._readTimeout = undefined;
    }
}

/**
 * A subclass of {@link https://nodejs.org/api/stream.html#stream_class_stream_writable|stream.Writable}.
 * It can only be instantiated through {@linkcode Probe#getWritableRttStream}.
 */
export class RttWritableStream extends writableMixIn(Writable) {
    constructor(rttBindings, serialNumber, downChannelIndex, options = {}) {
        super(options);

        debugWrite(
            `Instantiating RttWritableStream to ${serialNumber}/${downChannelIndex}`
        );
        this._debug = debugWrite;

        this._rttBindings = rttBindings;
        this._downChannel = downChannelIndex;
    }
}

/**
 * A subclass of {@link https://nodejs.org/api/stream.html#stream_class_stream_duplex|stream.Duplex}.
 * It can only be instantiated through {@linkcode Probe#getDuplexRttStream}.
 */
export class RttDuplexStream extends readableMixIn(writableMixIn(Duplex)) {
    constructor(
        rttBindings,
        serialNumber,
        upChannelIndex,
        downChannelIndex,
        options = {}
    ) {
        super(options);

        debugDuplex(
            `Instantiating RttDuplexStream to ${serialNumber}/${upChannelIndex}/${downChannelIndex}`
        );

        this._debug = debugDuplex;

        this._rttBindings = rttBindings;
        this._upChannel = upChannelIndex;
        this._downChannel = downChannelIndex;
        this._readTimeout = undefined;
    }
}
