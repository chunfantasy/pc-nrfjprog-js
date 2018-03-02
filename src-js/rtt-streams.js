
import { Readable, Writable, Duplex } from 'stream';

import debug from 'debug';

const debugRead = debug('rttReadable');
const debugWrite = debug('rttWritable');
const debugDuplex = debug('rttDuplex');


export class RttReadableStream extends Readable {
    constructor(rttBindings, serialNumber, upChannelIndex, options = {}) {
        // The constructor expects that the RTT bindings have already called start(),
        // with the same serial number given here.
        super(options);

        debugRead(`Instantiating RttReadableStream to ${serialNumber}/${upChannelIndex}`);
        this._debug = debugRead;

        this._rttBindings = rttBindings;
//         this._rttIsStarted = false;
//         this._rttCouldNotStart = false;
        this._upChannel = upChannelIndex;

//         rttBindings.start(serialNumber, options, (err)=>{
//             if (err) {
//                 this.emit('error', err);
//                 this._rttCouldNotStart = true;
//             } else {
//                 this._rttIsStarted = true;
//             }
//         });
//         this._rttIsStarted = true;
        this._readTimeout = undefined;
    }

    _read(size) {
//         this._debug('called _read');
//         if (this._rttIsStarted) {
            this._rttBindings.read(this._upChannel, size, (err, chars, bytes, i)=>{
                if (err) {
                    this._debug('rtt.read returned error', err);
                    this.emit(err);
                    this._readTimeout = undefined;
                } else if (chars.length) {
                    const unchoked = this.push(chars);
                    this._debug(`rtt.read returned ${chars.length} characters: ${chars.toString()}, unchoked: ${unchoked} integer 0x${i.toString(16).padStart(8,'0')}`);
                    this._readTimeout = undefined;
                } else {
//                     this._debug(`rtt.read returned 0 characters`);
                    if (this._readTimeout) {
                        clearTimeout(this._timeout);
                    }
                    this._readTimeout = setTimeout(()=>{this._read(size)}, 5);
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

//     push(){}
}

export class RttWritableStream extends Writable {
    constructor(rttBindings, serialNumber, downChannelIndex, options = {}) {
        super(options);

        debugWrite(`Instantiating RttWritableStream to ${serialNumber}/${downChannelIndex}`);
        this._debug = debugWrite;

        this._rttBindings = rttBindings;
        this._downChannel = downChannelIndex;

    }

    _write(chunk, encoding, callback) {
        this._rttBindings.write(this._downChannel, chunk, callback);
    }
}

export class RttDuplexStream extends Duplex {
    constructor(rttBindings, serialNumber, upChannelIndex, downChannelIndex, options = {}) {
        debugDuplex(`Instantiating RttDuplexStream to ${serialNumber}/${upChannelIndex}/${downChannelIndex}`);

        this._debug = debugDuplex;

        this._rttBindings = rttBindings;
        this._upChannel = upChannelIndex;
        this._downChannel = downChannelIndex;
        this._readTimeout = undefined;
    }
}

RttDuplexStream.prototype._read = RttReadableStream.prototype._read;
RttDuplexStream.prototype._destroy = RttReadableStream.prototype._destroy;
RttDuplexStream.prototype._write = RttWritableStream.prototype._write;





// Given an instance of the RTT bindings, returns a factory method
// for instantiating a Readable Stream with the given serial number
// and channel index.
// Basically a closure over the RTT bindings.
// export function getRttReadStream(rttBindings) {
//     return function getRttReadStream(serialNumber, upChannelIndex, options) {
//         return new RttReadableStream(rttBindings, serialNumber, upChannelIndex, options);
//     }
// }
//
//
//
// // Like getRttReadStream, but for Writable streams.
// export function getRttWriteStream(rttBindings) {
//     console.error('FIXME!!');
// }
//
//
//
//
// // Like getRttReadStream, but for Duplex streams given two channel indices.
// export function getRttDuplexStream(rttBindings) {
//     console.error('FIXME!!');
// }

