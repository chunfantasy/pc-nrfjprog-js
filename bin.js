#!/usr/bin/env node

const program = require('commander');
const inquirer = require('inquirer');
const jprog = require('./index.js');
const fs = require('fs');

function hexpad(n) {
    return `0x${n.toString(16).toUpperCase().padStart(8, '0')}`;
}

function panicIfError(err) {
    if (err) {
        panic(err.log);
    }
}

function panic(err) {
    console.error(err);
    process.exit(0);
}

jprog.getDllVersion((err, dllVersion)=>{
    panicIfError(err);

    program
        .version('nrfjprog-js version: ' + require('./package.json').version + '\n' +
                'nrfjprog DLL version: ' + dllVersion.major + '.' + dllVersion.minor + '.' + dllVersion.revision
        )

        // These are not options, but rather behave like commands instead.
        .option('--ids', 'Displays the serial numbers of all the debuggers connected to the computer.')
        .option('--recover', 'Erases all user flash memory and disables the readback protection mechanism if enabled.')
        .option('--eraseall', 'Erases all user available program flash memory and the UICR page.')
//         .option('--qspieraseall', 'Erases all flash of the external memory device with help of the QSPI peripheral. Note that depending on the external memory device\'s erase speed, the operation might take several minutes. Can be combined with the --eraseall operation.')
        .option('--eraseuicr', 'Erases the UICR page.')
        .option('--erasepage <start[-end]>', 'Erases the flash pages starting at the given start address and ending at the given end address (not included in the erase). If no end address is given, only one flash page will be erased.')
        .option('--program <hex_file>', 'Erases the flash pages starting at the given start address and ending at the given end address (not included in the erase). If no end address is given, only one flash page will be erased.')
        .option('--reset', 'Performs a soft reset by setting the SysResetReq bit of the AIRCR register of the core. The core will run after the operation. Can be combined with the --program operation. If combined with the --program operation, the reset will occur after the flashing has occurred to start execution.')


        // Options to be combined with a command (-like option)
        .option('-s, --snr', 'Selects the debugger with the given serial number among all debuggers connected to the computer for the operation. Must be combined with another command.')
        .option('--chiperase', 'When used in combination with --program, the whole contents of the chip are erased.')
        .option('--sectorerase', 'When used in combination with --program, only targeted non-volatile memory pages excluding UICR is erased.')
        .option('--sectoranduicrerase', 'When used in combination with --program, only targeted non-volatile memory pages including UICR is erased.')
        .option('--qspichiperase', 'When used in combination with --program, the whole contents of the QSPI peripheral are erased.')
        .option('--qspisectorerase', 'When used in combination with --program, only targeted memory pages of the QSPI peripheral are erased.')
        .parse(process.argv);


    let knownDevices = [];

    // Aux function. Returns a Promise to the s/n of the connected devkit,
    // or the s/n provided
    function getSerialNumber() {
        return new Promise((res,rej)=>{
            jprog.getConnectedDevices((err, devs)=>{
                panicIfError(err);

                for (const dev of devs) {
                    knownDevices[dev.serialNumber] = dev.deviceInfo;
                }

                if (devs.length === 0) {
                    panic('ERROR: There is no debugger connected to the PC.');
                }

                const serials = devs.map(dev=>dev.serialNumber.toString());

                if (program.snr) {
                    if (serials.indexOf(program.snr) === -1) {
                        panic('ERROR: There is no debugger connected to the PC with the given serial number');
                    } else {
                        return res(program.snr);
                    }
                }

                if (devs.length === 1) {
                    return res(devs[0].serialNumber);
                }

                return inquirer.prompt([{
                    type: 'list',
                    name: 'snr',
                    message: 'Perform that operation on which device?',
                    choices: serials
                }]).then((answers)=>{
                    return res(parseInt(answers.snr));
                }).catch(rej);
            })
        });
    }



    if (program.ids) {
        jprog.getConnectedDevices((err, devs)=>{
            panicIfError(err);
            console.log(devs.map((dev)=>dev.serialNumber).join('\n'));
            process.exit(0);
        });

    } else if (program.recover) {

        getSerialNumber().then((snr)=>{

            console.log('Recovering device '+ snr +'. This operation might take 30s.');

            jprog.recover(snr, (progress)=>{
                console.log(progress.process);
            },(err)=>{
                panicIfError(err);
                process.exit(0);
            });
        });

    } else if (program.eraseall) {

        getSerialNumber().then((snr)=>{

            jprog.erase(snr, {erase_mode: jprog.ERASE_ALL}, (progress)=>{
                console.log(progress.process);
            },(err)=>{
                panicIfError(err);
                process.exit(0);
            });
        });

    } else if (program.eraseuicr) {

        getSerialNumber().then((snr)=>{

            jprog.erase(snr, {
                erase_mode: jprog.ERASE_PAGES_INCLUDING_UICR,
                start_address: knownDevices[snr].uicrAddress,
                end_address: knownDevices[snr].uicrAddress + knownDevices[snr].infoPageSize
            }, (progress)=>{
                console.log(progress.process);
            },(err)=>{
                panicIfError(err);
                process.exit(0);
            });
        });

    } else if (program.erasepage) {

        // Hex digits     0x[0-9A-Fa-f]+
        // or                           |
        // Decimal digits                [0-9]+
        // Capture start (                     )
        // End digits                               (0x[0-9A-Fa-f]+|[0-9]+)
        // Optional end                         (  -                       )?
        // No capture dash                       ?:
        const regexp = /^(0x[0-9A-Fa-f]+|[0-9]+)(?:-(0x[0-9A-Fa-f]+|[0-9]+))?$/;

        const matches = program.erasepage.match(regexp);
        if (!matches) {
            panic('ERROR: Malformed address range (could not parse numbers).');
        }
        let startAddress = parseInt(matches[1]);    // First capture group
        let endAddress = matches[2] === undefined ? undefined : parseInt(matches[2]);

        getSerialNumber().then((snr)=>{

            const codeAddress = knownDevices[snr].codeAddress;
            const codePageSize = knownDevices[snr].codePageSize;
            const codeSize = knownDevices[snr].codeSize;
            const codeEnd = codeAddress + codeSize;

            if (startAddress % codePageSize) {
                console.warn('WARNING: Start address is not aligned to a page');
                startAddress -= startAddress % codePageSize;
            }
            if (endAddress === undefined) {
                endAddress = startAddress + codePageSize;
            }
            if (endAddress % codePageSize) {
                console.warn('WARNING: End address is not aligned to a page');
                endAddress -= endAddress % codePageSize;
                endAddress += codePageSize;
            }

            if (startAddress < codeAddress) {
                panic('ERROR: Malformed address range (start address too low).');
            }
            if (endAddress < startAddress) {
                panic('ERROR: Malformed address range (start higher than end).');
            }
            if (endAddress > codeEnd) {
                panic('ERROR: Malformed address range (end address too high).');
            }

            console.log('Erasing addresses ' + hexpad(startAddress) + ' to ' + hexpad(endAddress));

            jprog.erase(snr, {
                erase_mode: jprog.ERASE_PAGES,
                start_address: startAddress,
                end_address: endAddress
            }, (progress)=>{
                console.log(progress.process);
            },(err)=>{
                panicIfError(err);
                process.exit(0);
            });
            process.exit(0);
        });

    } else if (program.program) {

        let eraseMode = jprog.ERASE_NONE;
        let qspiEraseMode = jprog.ERASE_NONE;

        function checkOneEraseMode(mode){
            if (mode !== jprog.ERASE_NONE) { panic('ERROR: more than one erase mode specified'); }
        }

        if (program.chiperase) {
            eraseMode = jprog.ERASE_ALL;
        }
        if (program.sectorerase) {
            checkOneEraseMode(eraseMode);
            eraseMode = jprog.ERASE_PAGES;
        }
        if (program.sectoranduicrerase) {
            checkOneEraseMode(eraseMode);
            eraseMode = jprog.ERASE_PAGES_INCLUDING_UICR;
        }

        if (program.qspichiperase) {
            qspiEraseMode = jprog.ERASE_ALL;
        }
        if (program.qspisectorerase) {
            checkOneEraseMode(qspiEraseMode);
            qspiEraseMode = jprog.ERASE_PAGES;
        }

        getSerialNumber().then((snr)=>{
            jprog.program(snr, program.program, {
                inputFormat: jprog.INPUT_FORMAT_HEX_FILE,
                erase_mode: eraseMode,
                qspi_erase_mode: qspiEraseMode,
                reset: !!program.reset
            }, (progress)=>{
                console.log(progress.process);
            },(err)=>{
                panicIfError(err);
                process.exit(0);
            });

        });

    } else if (program.reset) {

        getSerialNumber().then((snr)=>{
            // Fake a reset by programming an empty .hex file, and asking a reset after the programming.
//             jprog.program(snr, ':020000000000FE\n:00000001FF\n', {
            jprog.program(snr, '', {
                inputFormat: jprog.INPUT_FORMAT_HEX_STRING,
                erase_mode: jprog.ERASE_NONE,
                qspi_erase_mode: jprog.ERASE_NONE,
                reset: true
            }, (progress)=>{
//                 console.log(progress.process);
            },(err)=>{
//                 panicIfError(err);
                process.exit(0);
            });
        });
    } else {
        program.help();
        process.exit(0);
    }

});







