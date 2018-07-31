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

'use strict';

const nRFjprog = require('../');

let device;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

describe('Single device - non-destructive', () => {
    beforeAll(done => {
        const callback = (connectedDevices) => {
            expect(connectedDevices.length).toBeGreaterThanOrEqual(1);
            device = connectedDevices[0];

            done();
        };

        nRFjprog.getConnectedDevices().then(callback);
    });

    it('finds correct device info', done => {
        const callback = (deviceInfo) => {
            expect(deviceInfo).toMatchObject(device.deviceInfo);
            done();
        };

        let probe = new nRFjprog.Probe(device.serialNumber);
        probe.getDeviceInfo().then(callback);
    });

    it('finds correct probe info', done => {
        const callback = (probeInfo) => {
            expect(probeInfo).toMatchObject(device.probeInfo);
            expect(probeInfo).toHaveProperty('serialNumber');
            expect(probeInfo).toHaveProperty('clockSpeedkHz');
            expect(probeInfo).toHaveProperty('firmwareString');
            done();
        };

        let probe = new nRFjprog.Probe(device.serialNumber);
        probe.getProbeInfo().then(callback);
    });

    it('finds correct library info', done => {
        const callback = (libraryInfo) => {
            expect(libraryInfo).toMatchObject(device.libraryInfo);
            expect(libraryInfo).toHaveProperty('version');
            expect(libraryInfo.version).toHaveProperty('major');
            expect(libraryInfo.version).toHaveProperty('minor');
            expect(libraryInfo.version).toHaveProperty('revision');
            expect(libraryInfo).toHaveProperty('path');
            done();
        };

        let probe = new nRFjprog.Probe(device.serialNumber);
        probe.getLibraryInfo().then(callback);
    });

    it('throws an error when device do not exist', done => {
        const callback = (err) => {
            expect(err).toMatchSnapshot();
            done();
        };

        let probe = new nRFjprog.Probe(1);
        probe.getDeviceInfo().catch(callback);
    });

    it('reads from specified address', done => {
        const callback = (contents) => {
            expect(contents).toBeDefined();
            done();
        };

        let probe = new nRFjprog.Probe(device.serialNumber);
        probe.read(0x0, 1).then(callback);
    });

    it('reads 5 bytes from specified address', done => {
        const readLength = 5;

        const callback = (contents) => {
            expect(contents).toBeDefined();
            expect(contents.length).toBe(readLength);
            done();
        };

        let probe = new nRFjprog.Probe(device.serialNumber);
        probe.read(0x0, readLength).then(callback);
    });

    it('reads unsigned 32 from specified address', done => {
        const callback = (contents) => {
            expect(contents).toBeDefined();
            done();
        };

        let probe = new nRFjprog.Probe(device.serialNumber);
        probe.readU32(0x0).then(callback);
    });

    it('reads more than 0x10000 bytes', done => {
        const readLength = 0x10004;

        const callback = (contents) => {
            expect(contents).toBeDefined();
            expect(contents.length).toBe(readLength);
            done();
        };

        let probe = new nRFjprog.Probe(device.serialNumber);
        probe.read(0x0, readLength).then(callback);
    });
});
