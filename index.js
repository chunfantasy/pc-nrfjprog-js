/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const nRFjprogBindings = require('bindings')('pc-nrfjprog-js');
const nRFjprog = new nRFjprogBindings.nRFjprog();

// console.log(nRFjprog);

// Returns a Promise for an array of instances of JprogDevice
function getConnectedDevices() {
    return new Promise( function(resolve, reject) {
        nRFjprog.getConnectedDevices( function(err, devicesInfo) {
            if (err) {
                reject(err);
            } else {
                let devices = [];
                for (let i=0, l=devicesInfo.length; i<l; i++) {
                    devices.push(new JprogDevice( devicesInfo[i].serialNumber ));
                }
                resolve(devices);
            }
        });
    });
}



// Returns a Promise for a plain object with the version number
// e.g. nrfjprog.getDllVersion().then( function(version) { console.log(version); } );
function getDllVersion() {
    return new Promise( function(resolve, reject) {
        nRFjprog.getDllVersion( function(err, version) {
            if (err) {
                reject(err);
            } else {
                resolve(version);
            }
        });
    });
}


class JprogDevice {
    constructor(serialNumber) {
        this._serialNumber = serialNumber;
        this._isOpen = false;
        this._closeTimeout = null;

        this._timeout = 500; // In millisec. TODO: should be user-configurable?
    }

    get serialNumber() {
        return this._serialNumber;
    }

    _open() {
        if (this._closeTimeout) clearTimeout(this._closeTimeout);
        this._closeTimeout = null;

        if (!this._isOpen) {
            /// TODO: Call the underlying open() functionality
            // nRFjprog.open(this._serialNumber);

            this._isOpen = true;
        }
    }

    _close() {
        this._closeTimeout = setTimeout((function() {
            /// TODO: Call the underlying close() functionality
            // nRFjprog.close(this._serialNumber);

            this._isOpen = false;
        }).bind(this), this._timeout);
    }



    // All methods return promises instead of expecting a callback. Should
    // simplify flow and error handling in the JS side of things, in the long run.
    // TODO: refactor?.

    erase(eraseOptions) {
        this._open();
        return new Promise((resolve, reject)=>{
            nRFjprog.erase(this._serialNumber, (err)=>{
                this._close();
                if (err) { reject(err); } else { resolve(); }
            });
        });
    }

    getDeviceInfo() {
        this._open();
        return new Promise((resolve, reject)=>{
            nRFjprog.getDeviceInfo(this._serialNumber, (err, info)=>{
                this._close();
                if (err) { reject(err); } else { resolve(info); }
            });
        });
    }

    program(filename, programOptions) {
        this._open();
        return new Promise((resolve, reject)=>{
            nRFjprog.program(this._serialNumber, filename, programOptions, (err)=>{
                this._close();
                if (err) { reject(err); } else { resolve(); }
            });
        });
    }

    read(addr, length) {
        this._open();
        return new Promise((resolve, reject)=>{
            nRFjprog.read(this._serialNumber, addr, length, (err, data)=>{
                this._close();
                if (err) { reject(err); } else { resolve(data); }
            });
        });
    }

    readU32(addr) {
        this._open();
        return new Promise((resolve, reject)=>{
            nRFjprog.readU32(this._serialNumber, addr, (err, data)=>{
                this._close();
                if (err) { reject(err); } else { resolve(data); }
            });
        });
    }

    recover(recoverOptions) {
        this._open();
        return new Promise((resolve, reject)=>{
            nRFjprog.recover(this._serialNumber, recoverOptions, (err)=>{
                this._close();
                if (err) { reject(err); } else { resolve(); }
            });
        });
    }

    verify(filename, verifyOptions) {
        this._open();
        return new Promise((resolve, reject)=>{
            nRFjprog.verify(this._serialNumber, filename, verifyOptions, (err)=>{
                this._close();
                if (err) { reject(err); } else { resolve(); }
            });
        });
    }

    write(addr, data) {
        this._open();
        return new Promise((resolve, reject)=>{
            nRFjprog.write(this._serialNumber, addr, data, (err)=>{
                this._close();
                if (err) { reject(err); } else { resolve(); }
            });
        });
    }

    writeU32(addr, data) {
        this._open();
        return new Promise((resolve, reject)=>{
            nRFjprog.writeU32(this._serialNumber, addr, data, (err)=>{
                this._close();
                if (err) { reject(err); } else { resolve(); }
            });
        });
    }

}


module.exports = {
    getConnectedDevices: getConnectedDevices,
    getDllVersion: getDllVersion,
    JprogDevice: JprogDevice,

// TODO: Export constants from the bindings too
// NRF51xxx_xxAA_REV1: 1,
// NRF51xxx_xxAA_REV2: 2,
// NRF51xxx_xxAA_REV3: 3,
// NRF51xxx_xxAB_REV3: 4,
// NRF51xxx_xxAC_REV3: 5,
// NRF51802_xxAA_REV3: 6,
// NRF51801_xxAB_REV3: 17,
// NRF51_XLR1: 1,
// NRF51_XLR2: 2,
// NRF51_XLR3: 3,
// NRF51_L3: 4,
// NRF51_XLR3P: 5,
// NRF51_XLR3LC: 6,
// NRF52832_xxAA_ENGA: 7,
// NRF52832_xxAA_ENGB: 8,
// NRF52832_xxAA_REV1: 9,
// NRF52832_xxAB_REV1: 15,
// NRF52832_xxAA_FUTURE: 11,
// NRF52832_xxAB_FUTURE: 16,
// NRF52840_xxAA_ENGA: 10,
// NRF52840_xxAA_FUTURE: 12,
// NRF52810_xxAA_REV1: 13,
// NRF52810_xxAA_FUTURE: 14,
// NRF52_FP1_ENGA: 7,
// NRF52_FP1_ENGB: 8,
// NRF52_FP1: 9,
// NRF52_FP1_FUTURE: 11,
// NRF52_FP2_ENGA: 10,
// NRF51_FAMILY: 0,
// NRF52_FAMILY: 1,
// UNKNOWN_FAMILY: 99,
// ERASE_NONE: 0,
// ERASE_ALL: 1,
// ERASE_PAGES: 2,
// ERASE_PAGES_INCLUDING_UICR: 3,
// JsSuccess: 0,
// CouldNotFindJlinkDLL: 1,
// CouldNotFindJprogDLL: 2,
// CouldNotLoadDLL: 3,
// CouldNotOpenDevice: 4,
// CouldNotOpenDLL: 7,
// CouldNotConnectToDevice: 8,
// CouldNotCallFunction: 9,
// CouldNotErase: 10,
// CouldNotProgram: 11,
// CouldNotRead: 12,
// CouldNotOpenHexFile: 13,
// RESET_NONE: 0,
// RESET_SYSTEM: 1,
// RESET_DEBUG: 2,
// RESET_PIN: 3,
// VERIFY_NONE: 0,
// VERIFY_READ: 1,
// INPUT_FORMAT_HEX_FILE: 0,
// INPUT_FORMAT_HEX_STRING: 1,
}


//  const instance = new nRFjprog.nRFjprog();
//  Object.keys(nRFjprog).map(key => {
//      if (key !== 'nRFjprog') {
//          instance[key] = nRFjprog[key];
//      }
//  });
//
//  module.exports = instance;
