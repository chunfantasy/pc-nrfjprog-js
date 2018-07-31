import path from "path";
import bindings from "bindings";
import * as temp from "temp";
import sander from "sander";

import {
    RttReadableStream,
    RttWritableStream,
    RttDuplexStream,
} from "./rtt-streams";

// Automatically track and cleanup temp files at exit
temp.track();

// Aux function to look for a channel index inside a channelInfo data
// structure, and assert its direction.
// Creates a closure over the desired channel index and direction, as to
// make it shorter to call in the Promise chains of the get*RttStream methods.
function assertChannelIndex(channelIndex, direction) {
    return function(channelInfo) {
        for (const i in channelInfo) {
            if (
                channelIndex === channelInfo[i].channelIndex &&
                channelInfo[i].direction === direction
            ) {
                return channelIndex;
            }
        }
        throw new Error(
            `Channel index ${channelIndex} for direction ${direction} does not exist`
        );
    };
}

/**
 * Represents a debug probe.
 *
 * @example
 * let nrfjprogjs = require('pc-nrfjprog-js');
 *
 * var myProbe = new nrfjprogjs.Probe(12345678);
 */
class Probe {
    /**
     * @param {integer} serialnumber Serial number of the probe
     */
    constructor(serialnumber) {
        this._sn = serialnumber;

        // Copy the library files (.dll / .so / .dylib) into a tmp
        // directory, resolve this._ready when done.
        this._ready = new Promise((res, rej) => {
            temp.mkdir({}, (err, temppath) => {
                if (err) {
                    return rej(err);
                }

                console.log("Should copy libraries into ", temppath);

                sander
                    .copydir(__dirname, "..", "nrfjprog", "lib")
                    .to(temppath)
                    .then(() => {
                        const nRFjprog = bindings("pc-nrfjprog-js");
                        nRFjprog.setLibrarySearchPath(temppath);
                        this._jprog = new nRFjprog.nRFjprog();
                        this._rtt = new nRFjprog.RTT();
                        this._rttUpDirection = nRFjprog.UP_DIRECTION;
                        this._rttDownDirection = nRFjprog.DOWN_DIRECTION;

                        /// TODO: Request serial numbers of connected probes and
                        /// make a sanity check here.

                        /// TODO: Keep the connection open. Maybe add a constructor
                        /// parameter for this??

                        res(true);
                    });
            });
        });
    }

    _promisify(fnName) {
        // Not using util.promisify here because of a scope hell regarding `this` :-(
        const this$1 = this;
        return function() {
            const args = Array.from(arguments);
            // console.log(args);
            return this$1._ready.then(() => {
                return new Promise((res, rej) => {
                    this$1._jprog[fnName](this$1._sn, ...args, (err, data) => {
                        if (err) {
                            rej(err);
                        } else {
                            res(data);
                        }
                    });
                });
            });
        };
    }

    /**
     * Axync method to get information of the probe.
     * @return {Promise<ProbeInformation>}
     */
    getProbeInfo() {
        return this._promisify("getProbeInfo")();
    }

    /**
     * Axync method to get information of the device connected to the probe.
     * @return {Promise<DeviceInformation>}
     */
    getDeviceInfo() {
        return this._promisify("getDeviceInfo")();
    }

    /**
     * Axync method to get information about the low-level library used by the
     * probe.
     * @return {Promise<LibraryInformation>}
     */
    getLibraryInfo() {
        return this._promisify("getLibraryInfo")();
    }

    /**
     * Async method to read a chunk of memory.
     * <br/>
     *
     * The read operation happens without verifying that the addresses are accessible or
     * even exist. Note that if the target address is in unpowered RAM, the operation will fail.
     * <br/>
     *
     * Returns an array of integers, each of them representing a single byte
     * (with values from 0 to 255). Please note that the data is an array of
     * (numbers - it is NOT a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array|UInt8Array},
     * and it is NOT a {@link https://nodejs.org/api/buffer.html|Buffer}.
     * <br/>
     *
     * This is the same functionality as running "<tt>nrfjprog --memrd</tt>" in the command-line tools.
     *
     * @example
     * myProbe.read(0, 16).then(function(data) {
     *      console.log('The first 16 bytes of memory look like: ' + data.join(','));
     * } );
     *
     * @param {integer} address The start address of the block of memory to be read
     * @param {integer} length The amount of bytes to be read
     *
     * @return {Array<integer>}
     */
    read(addr, length) {
        return this._promisify("read")(addr, length);
    }

    // TODO: What is the endianness of this???
    /**
     * Async method to read a single 4-byte word from memory.
     * <br/>
     *
     * The read operation happens without verifying that the addresses are accessible or
     * even exist. The address parameter needs to be 32-bit aligned (must be a multiple of 4).
     * Note that if the target address is in unpowered RAM, the operation will fail.
     * <br/>
     *
     * Please note that the data is a number - it is NOT a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array|UInt32Array},
     * and it is NOT a {@link https://nodejs.org/api/buffer.html|Buffer}.
     * <br/>
     *
     * This is the same functionality as running "<tt>nrfjprog --memrd -w</tt>" in the command-line tools.
     *
     * @example
     * myProbe.read(0).then(function(data) {
     *      console.log('The first word of memory looks like: ' + data);
     * } );
     *
     * @param {integer} address The address of the word to be read
     * @return {integer}
     */
    readU32(addr) {
        return this._promisify("readU32")(addr);
    }

    /**
     * Async method to push a program to the device.
     * <br/>
     *
     * This is the same functionality as running "<tt>nrfjprog --program</tt>" in the command-line tools.<br />
     *
     * If the {@link ProgramOptions|ProgramOption} chip_erase_mode is ERASE_ALL, this function will recover the device if it initially is not allowed to program the device due to protection.
     *
     * @example
     * myProbe.program("/some/path/nrf52832_abcd.hex").then(function() {
     *      console.log("New program pushed to probe");
     * } );
     *
     * @param {string} filename Either the filename of the <tt>.hex</tt> file containing the program, or the contents of such a file.
     * @param {ProgramOptions} options A plain object containing options about how to push the program.
     * @param {Function} [progressCallback] Optional parameter for getting progress callbacks. It shall expect one parameter: ({@link Progress|Progress}).
     * @return {Promise}
     */
    program(filename, options, progressCallback) {
        return this._promisify("program")(filename, options, progressCallback);
    }

    /**
     * Async method to read memory from the device and write the results into a file.
     * <br />
     *
     * The read operation happens without verifying that the addresses are accessible or
     * even exist. Note that if the target address is in unpowered RAM, the operation will fail.
     * <br/>
     *
     * This is the same functionality as running "<tt>nrfjprog --readcode</tt>" in the command-line tools.
     * @example
     * myProbe.readToFile("/some/path/to/store/file.hex", {}).then(function(){
     *     console.log("Contents of memory dumped into file");
     * });
     *
     * @param {integer} serialNumber The serial number of the device to read
     * @param {string} filename The filename of the <tt>.hex</tt> file where the content of the device should be stored.
     * @param {ReadToFileOptions} options A plain object containing options about what to read.
     * @param {Function} [progressCallback] Optional parameter for getting progress callbacks. It shall expect one parameter: ({@link Progress|Progress}).
     * @param {Function} callback A callback function to handle the async response.
     *   It shall expect one parameter: ({@link Error|Error}).
     */
    readToFile(filename, options, progressCallback) {
        return this._promisify("readToFile")(filename, options, progressCallback);
    }

    /**
     * Async method to verify the program in the device
     * <br/>
     *
     * Compares the contents of the provided <tt>.hex</tt> file against the contents of
     * the memory of the device connected. The returned <tt>Promise</tt> will resolve if
     * the contents match, and will reject if they mismatch.<br/>
     *
     * This is the same functionality as running "<tt>nrfjprog --verify</tt>" in the command-line tools.
     *
     * @example
     * myProbe.verify("/some/path/nrf52832_abcd.hex").then(function(){
     *     console.log("Verification OK");
     * }).catch(function(){
     *     console.log("Verification failed");
     * });
     *
     * @param {string} filename The filename of the <tt>.hex</tt> file containing the program.
     * @param {Object} options={} Reserved for future use.
     * @param {Function} [progressCallback] Optional parameter for getting progress callbacks. It shall expect one parameter: ({@link Progress|Progress}).
     */
    verify(filename, options, progressCallback) {
        return this._promisify("verify")(filename, options, progressCallback);
    }

    /**
     * Async method to erase a chunk of memory.
     * <br/>
     *
     * This is the same functionality as running "<tt>nrfjprog --erasepage</tt>" in the command-line tools.<br/>
     *
     * Will not erase a locked device. To erase a locked device, use {@link Probe#recover}.
     *
     * @param {EraseOptions} options Options on how to erase the device memory
     * @param {Function} [progressCallback] Optional parameter for getting progress callbacks. It shall expect one parameter: ({@link Progress|Progress}).
     */
    erase(options, progressCallback) {
        return this._promisify("erase")(options, progressCallback);
    }

    /**
     * Async method to recover a device.
     * <br/>
     *
     * This operation attempts to recover the device and leave it as it was when it left Nordic factory. It will attempt to
     * connect, erase all user available flash, halt and eliminate any protection. Note that this operation may take up to 30 s
     * if the device was readback protected. Note as well that this method only affects internal flash and CPU, but does not
     * erase, reset or stop any peripheral, oscillator source nor extarnally QSPI-connected flash. The operation will therefore
     * leave the watchdog still operational if it was running.<br/>
     *
     * This is the same functionality as running "<tt>nrfjprog --recover</tt>" in the command-line tools.
     *
     * @param {Function} [progressCallback] Optional parameter for getting progress callbacks. It shall expect one parameter: ({@link Progress|Progress}).
     */
    recover(progressCallback) {
        return this._promisify("recover")(progressCallback);
    }

    // TODO: Check that this equates to "--memwr" and not to "--ramwr"
    /**
     * Async method to write data to a device's memory, given an array of byte values.
     * <br/>
     *
     * Please use an array of numbers -  a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array|UInt8Array}
     * might work due to type casting, but a {@link https://nodejs.org/api/buffer.html|Buffer} will
     * most likely fail.
     * <br/>
     *
     * @param {integer} address The start address of the block of memory to be written
     * @param {Array<integer>} data Array of byte values to be written
     * @return {Promise}
     */
    write(address, data) {
        return this._promisify("recover")(address, data);
    }

    // TODO: Check that this equates to "--memwr" and not to "--ramwr"
    /**
     * Async method to write data to a device's memory, given the value for a single 4-byte word.
     * <br/>
     *
     * Please use a single number as the parameter - do NOT use a
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array|UInt32Array}
     * or a {@link https://nodejs.org/api/buffer.html|Buffer}.
     * <br/>
     *
     * @param {integer} address Address of the memory word to be written
     * @param {integer} data Value to be written
     */
    writeU32(address, data) {
        return this._promisify("writeU32")(address, data);
    }

    /**
     * Returns a Promise to the list of RTT channels currently available.
     * @return {Promise<Array<ChannelInfo>>}
     */
    getRttChannels(options = {}) {
        return this._startRtt().then((channelInfo) => {
            return new Promise((res, rej) => {
                this._rtt.stop((err) => {
                    if (err) {
                        rej(err);
                    } else {
                        res(channelInfo);
                    }
                });
            });
        });
    }

    _startRtt() {
        /// TODO: implement RTT options for the start of the RTT block???
        return this._ready.then(() => {
            return new Promise((res, rej) => {
                this._rtt.start(
                    this._sn,
                    {},
                    (err, downChannelInfo, upChannelInfo) => {
                        if (err) {
                            rej(err);
                        } else {
                            res(downChannelInfo.concat(upChannelInfo));
                        }
                    }
                );
            });
        });
    }

    /**
     * Returns a Promise to a readable RTT stream, given the numberic index for
     * an "up" RTT channel.
     * @see Probe#getRttChannels.
     * @return {Promise<RttReadableStream>}
     */
    getReadableRttStream(channelIndex, streamOptions = {}) {
        return this._startRtt()
            .then(assertChannelIndex(channelIndex, this._rttUpDirection))
            .then((validChannelIndex) => {
                return new RttReadableStream(
                    this._rtt,
                    this._sn,
                    validChannelIndex,
                    streamOptions
                );
            })
            .catch((err) => {
                return new Promise((res, rej) => {
                    this._rtt.stop(() => {
                        if (err) {
                            rej(err);
                        }
                    });
                });
            });
    }

    /**
     * Returns a Promise to a writable RTT stream, given the numberic index for
     * a "down" RTT channel.
     * @see Probe#getRttChannels.
     * @return {Promise<RttWritableStream>}
     */
    getWritableRttStream(channelIndex, streamOptions = {}) {
        return this._startRtt()
            .then(assertChannelIndex(channelIndex, this._rttDownDirection))
            .then((validChannelIndex) => {
                return new RttWritableStream(
                    this._rtt,
                    this._sn,
                    validChannelIndex,
                    streamOptions
                );
            })
            .catch((err) => {
                return new Promise((res, rej) => {
                    this._rtt.stop(() => {
                        if (err) {
                            rej(err);
                        }
                    });
                });
            });
    }

    /**
     * Returns a Promise to a duplex (read/write) RTT stream, given the numberic
     * indices for an "up" and a "down" RTT channels.
     * @see Probe#getRttChannels.
     * @return {Promise<RttDuplexStream>}
     */
    getDuplexRttStream(upChannelIndex, downChannelIndex, streamOptions = {}) {
        return this._startRtt()
            .then((channelInfo) =>
                Promise.all([
                    assertChannelIndex(upChannelIndex, this._rttUpDirection)(
                        channelInfo
                    ),
                    assertChannelIndex(downChannelIndex, this._rttDownDirection)(
                        channelInfo
                    ),
                ])
            )
            .then(([validUpChannelIndex, validDownChannelIndex]) => {
                return new RttDuplexStream(
                    this._rtt,
                    this._sn,
                    validUpChannelIndex,
                    validDownChannelIndex,
                    streamOptions
                );
            })
            .catch((err) => {
                return new Promise((res, rej) => {
                    this._rtt.stop(() => {
                        if (err) {
                            rej(err);
                        }
                    });
                });
            });
    }
}

export default Probe;
