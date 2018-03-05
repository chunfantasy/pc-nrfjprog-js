
import path from 'path';
import bindings from 'bindings';
import * as temp from 'temp';
import sander from 'sander';

import {RttReadableStream, RttWritableStream, RttDuplexStream} from './rtt-streams';


// Automatically track and cleanup temp files at exit
temp.track();


// Aux function to look for a channel index inside a channelInfo data
// structure, and assert its direction.
// Creates a closure over the desired channel index and direction, as to
// make it shorter to call in the Promise chains of the get*RttStream methods.
function assertChannelIndex(channelIndex, direction) {
    return function(channelInfo) {
        for (const i in channelInfo) {
            if (channelIndex === channelInfo[i].channelIndex){
    //             if (channelInfo[i].direction !== direction) {
    //                 throw new Error(`Channel index ${channelIndex} is not an up channel`);
    //             } else {
                return channelIndex;
    //             }
            }
        }
        throw new Error(`Channel index ${channelIndex} does not exist`);
    }
}



export default class Probe{

    constructor(serialnumber) {
        this._sn = serialnumber;

        // Copy the library files (.dll / .so / .dylib) into a tmp
        // directory, resolve this._ready when done.
        this._ready = new Promise((res, rej)=>{

            temp.mkdir({}, (err, temppath)=>{
                if (err) { return rej(err); }

                console.log('Should copy libraries into ', temppath);

                sander
                .copydir(__dirname, '..', 'nrfjprog', 'lib')
                .to(temppath)
                .then(()=>{
                    const nRFjprog = bindings('pc-nrfjprog-js');
                    nRFjprog.setLibrarySearchPath(temppath);
                    this._jprog = new nRFjprog.nRFjprog();
                    this._rtt = new nRFjprog.RTT();
                    this._rttUpDirection = nRFjprog.UP_DIRECTION;
                    this._rttDownDirection = nRFjprog.DOWN_DIRECTION;

                    /// TODO: Request serial numbers of connected probes and
                    /// make a sanity check here.

                    res(true);
                });
            });
        });
    }

    _promisify(fnName) {
        // Not using util.promisify here because of a scope hell regarding `this` :-(
        const this$1 = this;
        return function(){
            const args = Array.from(arguments);
//             console.log(args);
            return this$1._ready.then(()=>{
                return new Promise((res,rej)=>{
                    this$1._jprog[fnName](this$1._sn, ...args, (err, data)=>{
                        if (err) {rej(err);}
                        else {res(data);}
                    });
                });
            });
        }
    }

    getProbeInfo() {
        return this._promisify('getProbeInfo')();
    }

    getDeviceInfo() {
        return this._promisify('getDeviceInfo')();
    }

    getLibraryInfo() {
        return this._promisify('getLibraryInfo')();
    }

    read(addr, length) {
        return this._promisify('read')(addr, length);
    }

    readU32(addr) {
        return this._promisify('readU32')(addr);
    }

    program(filename, options, progressCallback) {
        return this._promisify('program')(filename, options, progressCallback);
    }

    readToFile(filename, options, progressCallback) {
        return this._promisify('readToFile')(filename, options, progressCallback);
    }

    verify(filename, options, progressCallback) {
        return this._promisify('verify')(filename, options, progressCallback);
    }

    erase(options, progressCallback) {
        return this._promisify('erase')(options, progressCallback);
    }

    recover(progressCallback) {
        return this._promisify('recover')(progressCallback);
    }

    write(address, data) {
        return this._promisify('recover')(address, data);
    }

    writeU32(address, data) {
        return this._promisify('writeU32')(address, data);
    }



    getRttChannels(options = {}){
        return this._ready.then(()=>{
            return new Promise((res, rej)=>{
                this._rtt.start(this._sn, options, (err, channelInfo)=>{
                    if (err) { rej(err); }
                    else { res(channelInfo); }
                })
            });
        }).then((channelInfo)=>{
            return new Promise((res, rej)=>{
                this._rtt.stop(err=>{
                    if (err) {rej(err);}
                    else {
                        res(channelInfo);
                    }
                });
            })
        });
    }

    _startRtt() {
        /// TODO: implement RTT options for the start of the RTT block???
        return this._ready.then(()=>{
            return new Promise((res, rej)=>{
                this._rtt.start(this._sn, {}, (err, channelInfo)=>{
                    if (err) { rej(err); }
                    else { res(channelInfo); }
                })
            });
        });
    }

    getReadableRttStream(channelIndex, streamOptions = {}) {
        return this._startRtt()
        .then(assertChannelIndex(channelIndex, this._rttUpDirection))
        .then((validChannelIndex)=>{
            return new RttReadableStream(this._rtt, this._sn, validChannelIndex, streamOptions);
        }).catch(err=>{
            return new Promise((res, rej)=>{
                this._rtt.stop(()=>{
                    if (err) {rej(err); }
                });
            });
        });
    }

    getWritableRttStream(channelIndex, streamOptions = {}) {
        return this._startRtt()
        .then(assertChannelIndex(channelIndex, this._rttDownDirection))
        .then((validChannelIndex)=>{
            return new RttWritableStream(this._rtt, this._sn, validChannelIndex, streamOptions);
        }).catch(err=>{
            return new Promise((res, rej)=>{
                this._rtt.stop(()=>{
                    if (err) {rej(err); }
                });
            });
        });
    }

    getDuplexRttStream(upChannelIndex, downChannelIndex, streamOptions = {}) {
        return this._startRtt()
        .then((channelInfo)=>Promise.all([
            assertChannelIndex(upChannelIndex, this._rttUpDirection)(channelInfo),
            assertChannelIndex(downChannelIndex, this._rttDownDirection)(channelInfo)
        ])).then(([validUpChannelIndex, validDownChannelIndex])=>{
            return new RttDuplexStream(
                this._rtt,
                this._sn,
                validUpChannelIndex,
                validDownChannelIndex,
                streamOptions);
        }).catch(err=>{
            return new Promise((res, rej)=>{
                this._rtt.stop(()=>{
                    if (err) {rej(err); }
                });
            });
        });
    }
}


