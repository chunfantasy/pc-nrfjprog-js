/**
 * This class is used to provide programming functionality for the nRF5x-series of devices from Nordic Semiconductor
 */
class nRFjprog {


    /**
     * Gets the version of the nrf commandline tools.
     * @param {nRFjprog~GetVersionCallback} callback The version information
     */
    getDllVersion(callback) {}

    /**
     * Gets all connected nRF5x-series devices with a SEGGER.
     * @param {nRFjprog~GetConnectedDevicesCallback} callback List of connected devices
     */
    getConnectedDevices(callback) {}

    /**
     * Gets device details
     * @param {number} serialNumber The serialnumber of the device you want information about
     * @param {nRFjprog~GetDeviceInfoCallback} callback The device information  about the device
     */
    getDeviceInfo(serialNumber, callback) {}

    /**
     * Reads the specified number of bytes, starting with the address.
     * @param {number} serialNumber The serialnumber of the device you want to read from
     * @param {number} address The startaddress to read from
     * @param {number} length The number of bytes you want to read
     * @param {nRFjprog~ReadCallback} callback The data read
     */
    read(serialNumber, address, length, callback) {}

    /**
     * Reads one 32 bit value at the selected address.
     * @param {number} serialNumber The serialnumber of the device you want to read from
     * @param {number} address The startaddress to read from
     * @param {nRFjprog~ReadU32Callback} callback The data read
     */
    readU32(serialNumber, address, callback) {}

    /**
     * Programs the device in hexdata. Hexdata may be the path to a intel hex file or
     * a text string containing the contents of such a file.
     * @param {number} serialNumber The serialnumber of the device you want to program
     * @param {string} hexdata The data to program. May be either the path to a intel hexfile or the content of such a file. options.inputFormat allows you to choose between the formats
     * @param {object} options Options to programming
     * @param {bool} [options.verify=true] Verification should be performes as part of programming
     * @param {number} [options.chip_erase_mode=ERASE_ALL] How much of the flash memory should be erased
     * @param {number} [options.qspi_erase_mode=ERASE_NONE] How much of qspi memory should be erased
     * @param {bool} [options.reset=true] Should the device be reset after programming
     * @param {number} [options.inputFormat=INPUT_FORMAT_HEX_FILE] The type of content in hexdata
     * @param {nRFjprog~ProgressCallback} [progress=null] Callback indicating progress of the programming
     * @param {nRFjprog~StatusCallback} callback Status of the programming
     */
    program(serialNumber, hexdata, options, callback) {}

    /**
     * @param {number} serialNumber The serialnumber of the device you want to program
     * @param {string} filename The data to program. May be either the path to a intel hexfile or the content of such a file. options.inputFormat allows you to choose between the formats
     * @param {object} options Options to programming
     * @param {bool} [options.readram=false] Verification should be performes as part of programming
     * @param {bool} [options.readcode=false] How much of the flash memory should be erased
     * @param {bool} [options.readuicr=ERASE_NONE] How much of qspi memory should be erased
     * @param {bool} [options.readqspi=false] Should the device be reset after programming
     * @param {nRFjprog~ProgressCallback} [progress=null] Callback indicating progress of the reading
     * @param {nRFjprog~StatusCallback} callback Status of the programming
     */
    readToFile(serialNumber, filename, options, callback) {}

    /**
     * Verifies that the contents of the device is the data in hexdata.
     * @param {number} serialNumber The serialnumber of the device you want to verify
     * @param {string} hexdata The data to verify. This is the path to a file on the filesystem
     * @param {object} options Options to verification. There is no options at the moment, but these will be added later.
     * @param {nRFjprog~ProgressCallback} [progress=null] Callback indicating progress of the verification
     * @param {nRFjprog~StatusCallback} callback Status of the verification
     */
    verify(serialNumber, hexdata, options, callback) {}

    /**
     * Erases the whole chip. Will not erase a locked device. To erase a locked device, use [recover]{@link nRFjprog#recover}
     * @param {number} serialNumber The serialnumber of the device you want to erase
     * @param {object} options Options to erase.
     * @param {number} [options.erase_mode=ERASE_ALL] How much of the flash memory to erase
     * @param {number} [options.start_adress=0] Startaddress to erase. Only relevant when using erase_mode ERASE_PAGES or ERASE_PAGES_INCLUDING_UICR
     * @param {number} [options.end_address=0] Endaddress to erase. Only relevant when using erase_mode ERASE_PAGES or ERASE_PAGES_INCLUDING_UICR
     * @param {nRFjprog~ProgressCallback} [progress=null] Callback indicating progress of the erase
     * @param {nRFjprog~StatusCallback} callback Status of the erase
     */
    erase(serialNumber, options, callback) {}

    /**
     * Recover the whole chip by removing all user accessible content.
     * @param {number} serialNumber The serialnumber of the device you want to recover
     * @param {nRFjprog~ProgressCallback} [progress=null] Callback indicating progress of the recover
     * @param {nRFjprog~StatusCallback} callback Status of the recover
     */
    recover(serialNumber, callback) {}

    /**
     * Writes the data in data beginning at address.
     * @param {number} serialNumber The serialnumber of the device you want to write to
     * @param {number} address The address to start writing to
     * @param {number[]} data An array containing the bytes to write
     * @param {nRFjprog~StatusCallback} callback Status of the recover
     */
    write(serialNumber, address, data, callback) {}

    /**
     * Writes the data in data at address. Only writes one 32-bit value
     * @param {number} serialNumber The serialnumber of the device you want to write to
     * @param {number} address The address to start writing to
     * @param {number} data The data to write
     * @param {nRFjprog~StatusCallback} callback Status of the recover
     */
    write(serialNumber, address, data, callback) {}
}

/**
 * Callback called the getVersion is done. On success, version contains
 * the version information of the nrf commandline tools used.
 * @callback nRFjprog~GetVersionCallback
 * @param {?nRFjprog~err} err Error object if there is an error
 * @param {?object} version Version of the nrf commandline tools
 * @param {number} version.major Major part of version number
 * @param {number} version.minor Minor part of version number
 * @param {number} version.patch Patch part of version number
 */

/**
* Callback called when getConnectDevices is done. On success, devices
* contains an array of devices and information about the individual device.
* @callback nRFjprog~GetConnectedDevicesCallback
* @param {?nRFjprog~err} err Error object if there is an error
* @param {?object[]} devices Array of connected devices
* @param {number} devices[].serialNumber Serialnumber of the device
* @param {object} devices[].deviceInfo Details about the device
* @param {number} devices[].deviceInfo.family The family of the device
* @param {number} devices[].deviceInfo.deviceType
* @param {number} devices[].deviceInfo.codeAddress
* @param {number} devices[].deviceInfo.codePageSize
* @param {number} devices[].deviceInfo.codeSize
* @param {number} devices[].deviceInfo.uicrAddress
* @param {number} devices[].deviceInfo.infoPageSize
* @param {number} devices[].deviceInfo.codeRamPresent
* @param {number} devices[].deviceInfo.codeRamAddress
* @param {number} devices[].deviceInfo.dataRamAddress
* @param {number} devices[].deviceInfo.ramSize
* @param {number} devices[].deviceInfo.qspiPresent
* @param {number} devices[].deviceInfo.xipAddress
* @param {number} devices[].deviceInfo.xipSize
* @param {number} devices[].deviceInfo.pinResetPin
*/

/**
 * Callback called when getDeviceInfo is done. On success, deviceInfo contains
 * the details about the device.
 * @callback nRFjprog~GetDeviceInfoCallback
 * @param {?nRFjprog~err} err Error object if there is an error
 * @param {?object} deviceInfo Details about the device
 * @param {number} deviceInfo.family The family of the device
 * @param {number} deviceInfo.deviceType
 * @param {number} deviceInfo.codeAddress
 * @param {number} deviceInfo.codePageSize
 * @param {number} deviceInfo.codeSize
 * @param {number} deviceInfo.uicrAddress
 * @param {number} deviceInfo.infoPageSize
 * @param {number} deviceInfo.codeRamPresent
 * @param {number} deviceInfo.codeRamAddress
 * @param {number} deviceInfo.dataRamAddress
 * @param {number} deviceInfo.ramSize
 * @param {number} deviceInfo.qspiPresent
 * @param {number} deviceInfo.xipAddress
 * @param {number} deviceInfo.xipSize
 * @param {number} deviceInfo.pinResetPin
 */

/**
 * Callback called when read is done. On success, data contains the data read.
 * @callback nRFjprog~ReadCallback
 * @param {?nRFjprog~err} err Error object if there is an error
 * @param {?number[]} data The data read
 */

/**
 * Callback called when readU32 is done. On success, data contains the data read.
 * @callback nRFjprog~ReadCallback
 * @param {?nRFjprog~err} err Error object if there is an error
 * @param {?number} data The data read
 */

/**
 * Generic callback for function that do not return any data. Only contains
 * a err parameter. If err is undefined, the call was performed as expected.
 * @callback nRFjprog~StatusCallback
 * @param {?nRFjprog~err} err Error object if there is an error
 */

/**
 * Callback indicating progress of the function. It will give a textual
 * description of what progress the currently called function is in.
 * @callback nRFjprog~ProgressCallback
 * @param {object} progress Progress object
 * @param {string} progress.process The part of the currently called function
 */

/**
 * This is the error object returned by all callbacks. It is a string which also
 * contain further details as properties.
 * @typedef {string} nRFjprog~err
 * @property {number} errno The errornumber as a number
 * @property {string} errcode A textual version of the errno
 * @property {string} erroroperation The function that caused the error
 * @property {string} errmsg The same string as the base err string
 * @property {number} lowlevelErrorNo The lowlevel errorcode, if any
 * @property {string} lowlevelError A textual version of the lowlevelErrorNo
 * @property {string} log The complete log from the libraries nRFjprog is based on
 */
