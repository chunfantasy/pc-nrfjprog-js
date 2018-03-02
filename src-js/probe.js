
import path from 'path';
import bindings from 'bindings';
import * as temp from 'temp';
import sander from 'sander';

import {RttReadableStream} from './rtt-streams';


// Automatically track and cleanup temp files at exit
temp.track();


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
                    res(true);
                });
            });
        });
    }

    _promisify(fnName) {
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

    getReadableRttStream(channelIndex, streamOptions = {}) {
        return this._ready.then(()=>{
            return new Promise((res, rej)=>{
                this._rtt.start(this._sn, streamOptions, (err, channelInfo)=>{
                    if (err) { rej(err); }
                    else { res(channelInfo); }
                })
            });
        }).then((channelInfo)=>{
            // Sanity checks: channel index must exist, and must be
            // an "up" (probe to host) channel
            for (const i in channelInfo) {
                if (channelIndex === channelInfo[i].channelIndex){
//                     if (channelInfo[i].direction !== this._rttUpDirection) {
//                         throw new Error(`Channel index ${channelIndex} is not an up channel`);
//                     } else {
                        return channelIndex;
//                     }
                }
            }
            throw new Error(`Channel index ${channelIndex} does not exist`);
        }).then((validChannelIndex)=>{
            return new RttReadableStream(this._rtt, this._sn, validChannelIndex, streamOptions);
        }).catch(err=>{
            return new Promise((res, rej)=>{
                this._rtt.stop(()=>{
                    if (err) {rej(err); }
                });
            });
        });
    }


}














