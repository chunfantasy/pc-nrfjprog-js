
import { Readable, Writable, Duplex } from 'stream';



export class RttReadableStream extends Readable {
    constructor(rttBindings, serialNumber, upChannelIndex, options = {}) {
        super(options);

        this._rttBindings = rttBindings;
        this._rttIsStarted = false;
        this._rttCouldNotStart = false;
        this._upChannel = upChannelIndex;

        rttBindings.start(serialNumber, options, (err)=>{
            if (err) {
                this.emit('error', err);
                this._rttCouldNotStart = true;
            } else {
                this._rttIsStarted = true;
            }
        });
    }

    _read(size) {
        if (this._rttIsStarted) {
            this._rttBindings.read(this._upChannel, size, (err, chars, readLength)=>{
                if (err) {
                    this.emit(err);
                } else {
                    this.push(chars);
                }
            });
        } else if (this._rttCouldNotStart) {
            this.emit('error', 'RTT could not start, reading is not possible.');
            // Not calling this.push() here, therefore this Stream will hang up.
            // This is the expected behaviour when RTT failed to start.
        } else {
            // If RTT is not yet started, wait a bit and retry.
            setTimeout(this._read.bind(this), 50);
        }
    }

    _destroy(err, callback) {
        this._rttBindings.stop(callback);
    }


//     push(){}
}

export class RttWritableStream extends Writable {
    constructor(rttBindings, serialNumber, downChannelIndex) {

    }
}

export class RttDuplexStream extends Duplex {
    constructor(rttBindings, serialNumber, upChannelIndex, downChannelIndex) {

    }
}









// Given an instance of the RTT bindings, returns a factory method
// for instantiating a Readable Stream with the given serial number
// and channel index.
// Basically a closure over the RTT bindings.
export function getRttReadStream(rttBindings) {
    return function getRttReadStream(serialNumber, upChannelIndex, options) {
        return new RttReadableStream(rttBindings, serialNumber, upChannelIndex, options);
    }
}



// Like getRttReadStream, but for Writable streams.
export function getRttWriteStream(rttBindings) {
    console.error('FIXME!!');
}




// Like getRttReadStream, but for Duplex streams given two channel indices.
export function getRttDuplexStream(rttBindings) {
    console.error('FIXME!!');
}

