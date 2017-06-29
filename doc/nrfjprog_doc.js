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
     * Programs the
     */
    program(serialNumber, hexdata, options, callback) {}
}

/**
 * Callback called the getVersion is done. On success, version contains
 * the version information of the nrf commandline tools used.
 * @callback nRFjprog~GetVersionCallback
 * @param {object|undefined} err Error object if there is an error
 * @param {object|undefined} version Version of the nrf commandline tools
 * @param {number} version.major Major part of version number
 * @param {number} version.minor Minor part of version number
 * @param {number} version.patch Patch part of version number
 */

/**
* Callback called when getConnectDevices is done. On success, devices
* contains an array of devices and information about the individual device.
* @callback nRFjprog~GetConnectedDevicesCallback
* @param {object|undefined} err Error object if there is an error
* @param {object[]|undefined} devices Array of connected devices
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
 * @param {object|undefined} err Error object if there is an error
 * @param {object|undefined} deviceInfo Details about the device
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
 * @param {object|undefined} err Error object if there is an error
 * @param {number[]|undefined} data The data read
 */

/**
 * Callback called when readU32 is done. On success, data contains the data read.
 * @callback nRFjprog~ReadCallback
 * @param {object|undefined} err Error object if there is an error
 * @param {number|undefined} data The data read
 */
