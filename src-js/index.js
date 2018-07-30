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

/**
 *
 * The <tt>pc-nrfjprog-js</tt> module exposes the functionality to the
 * nRF5x Command-line tools
 * to your nodeJS programs.
 *
 * @example
 * let nrfjprogjs = require('pc-nrfjprog-js');
 *
 * nrfjprogjs.getConnectedDevices().then(function(devices) {
 *     console.log('There are ' + devices.length + ' nRF devices connected.');
 * });
 *
 * @module pc-nrfjprog-js
 */

import path from "path";
import bindings from "bindings";

// import * as rttStreams from './rtt-streams';
import Probe from "./probe";

const nRFjprog = bindings("pc-nrfjprog-js");

const instance = new nRFjprog.nRFjprog();

// console.log('nRFjprog instance: ', instance);

Object.keys(nRFjprog).map((key) => {
    //     console.log('Iterating through: ', key);

    if (key === "setLibrarySearchPath") {
        nRFjprog.setLibrarySearchPath(path.join(__dirname, "..", "nrfjprog", "lib"));
    } else if (key !== "nRFjprog") {
        instance[key] = nRFjprog[key];
    }
});

// The loop above maps all function calls from the bindings to the "instance",
// which used to mean the exported module.
// However, these are deprecated - only three of them are used now, and their
// API has changed; as follows:

/**
 * Async function to get the version of the nrfjprog library in use.
 * Returns a `Promise` with the version information.
 *
 * @example
 * nrfjprogjs.getLibraryVersion().then( function(version) {
 *      // outputs e.g. "9.6.0"
 *      console.log( version.major + '.' + version.minor + '.' + version.revision );
 * } );
 *
 * @return {Promise<VersionInformation>}
 */
export function getLibraryVersion() {
    return new Promise((resolve, reject) => {
        instance.getLibraryVersion((err, version) => {
            if (err) {
                reject(err);
            } else {
                resolve(version);
            }
        });
    });
}

/**
 * Async function to get a list of all connected probes and information about
 * the device they're probing. Returns a `Promise`
 * with an `Array` of {@link module:pc-nrfjprog-js~SerialNumberAndDeviceInformation|SerialNumberAndDeviceInformation}).
 *
 * @example
 * nrfjprogjs.getConnectedDevices().then( function(devices) {
 *      for (let i = 0; i < devices.length; i++) {
 *          console.log(
 *              devices[i].serialNumber +
 *              ' has ' +
 *              devices[i].deviceInfo.ramSize +
 *              ' bytes of RAM'
 *          );
 *      }
 * } );
 *
 * @return {Promise<Array<ProbeInformation>>}
 */
export function getConnectedDevices() {
    return new Promise((resolve, reject) => {
        instance.getConnectedDevices((err, devs) => {
            if (err) {
                reject(err);
            } else {
                resolve(devs);
            }
        });
    });
}

/**
 * Async function to get the serial numbers of all connected probes. Returns
 * a `Promise` with an `Array` of {integer}.
 *
 * @example
 * nrfjprogjs.getSerialNumbers().then(function(serialNumbers) {
 *      for (let i = 0; i < serialNumbers.length; i++) {
 *          console.log(serialNumbers[i]);
 *      }
 * } );
 * @return {Promise<Array<integer>>}
 */
export function getSerialNumbers() {
    return new Promise((resolve, reject) => {
        instance.getSerialNumbers((err, serialnumbers) => {
            if (err) {
                reject(err);
            } else {
                resolve(serialnumbers);
            }
        });
    });
}

export { Probe };

// TODO: Add the previous API as deprecated exports here.

// console.log('nRFjprog instance: ', instance);
// export default instance;
