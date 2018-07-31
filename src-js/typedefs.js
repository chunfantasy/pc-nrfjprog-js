// Dummy file containing JSDoc definitions for some return types

/**
 * Possible error.<br/>
 * If an operation completed sucessfully, the error passed to the callback
 * function will be <tt>undefined</tt> (and thus, falsy).<br/>
 * This will be an instance of the built-in {@link https://nodejs.org/dist/latest/docs/api/errors.html#errors_class_error|Error} class, with some extra properties:
 * @typedef {Error} Error
 * @property {integer} errno
 *    The error number. Value will be one of the following predefined constants:<br/>
 *    <tt>nrfjprogjs.constants.CouldNotFindJlinkDLL</tt><br/>
 *    <tt>nrfjprogjs.constants.CouldNotFindJProgDLL</tt><br/>
 *    <tt>nrfjprogjs.constants.CouldNotOpenDevice</tt><br/>
 *    <tt>nrfjprogjs.constants.CouldNotOpenDLL</tt><br/>
 *    <tt>nrfjprogjs.constants.CouldNotConnectToDevice</tt><br/>
 *    <tt>nrfjprogjs.constants.CouldNotCallFunction</tt><br/>
 *    <tt>nrfjprogjs.constants.CouldNotErase</tt><br/>
 *    <tt>nrfjprogjs.constants.CouldNotProgram</tt><br/>
 *    <tt>nrfjprogjs.constants.CouldNotRead</tt><br/>
 *    <tt>nrfjprogjs.constants.CouldNotOpenHexFile</tt><br/>
 *
 * @property {String} errcode A human-readable version of the error code.
 * @property {String} erroroperation The internal function that caused the error.
 * @property {String} errmsg Error string. The value will be equal to that of the built-in <tt>message</tt> property.
 * @property {integer} lowlevelErrorNo The low-level error code, if applicable.
 * @property {String} lowlevelError A human-readable version of the low-level error code.
 * @property {String} log The complete log from the internal functions.
 *
 * @example
 * nrfprogjs.getLibraryVersion().catch(function(err) {
 *     throw err;
 * });
 *
 * @example
 * var myProbe = new nrfprogjs.Probe(12345678);
 * myProbe.program(file, programmingOptions).catch(function(err) {
 *     if (err.errno === nrfprogjs.constants.CouldNotOpenHexFile) {
 *          console.error('.hex file not found');
 *     }
 * });
 */

/**
 * Progress information.<br />
 * Long running operations can indicate progress. If the optional progress callback is used, this object will be sent when progress is made.
 * @typedef Progress
 * @property {string} process An indication of what subprocess is performed.
 */

/**
 * Represents a semver-like version number, e.g. 9.6.0 as an object of the form
 *    <tt>{ major: 9, minor: 6, revision: 0 }</tt>
 * @typedef Version
 * @property {integer} major The major version number
 * @property {integer} minor The minor version number
 * @property {integer} revision The revision number
 */

/**
 * Represents information of an individual device.
 *
 * The fields in this data structure about non-volatile memory, RAM, UICR and QSPI can also
 * be found in the product specifications available
 * at http://infocenter.nordicsemi.com, under the "Memory" section of each product model.
 *
 * @typedef DeviceInformation
 *
 * @property {integer} family
 *    Device family. Value will be equal to one of the following predefined constants:<br/>
 *    <tt>nrfjprogjs.constants.NRF51_FAMILY</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF52_FAMILY</tt><br/>
 *    <tt>nrfjprogjs.constants.UNKNOWN_FAMILY</tt><br/>
 *
 * @property {integer} deviceType
 *    Type of device. Value will be equal to one of the following predefined constants:<br/>
 *    <tt>nrfjprogjs.constants.NRF51xxx_xxAA_REV1</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF51xxx_xxAA_REV2</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF51xxx_xxAA_REV3</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF51xxx_xxAB_REV3</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF51xxx_xxAC_REV3</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF51802_xxAA_REV3</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF52832_xxAA_ENGA</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF52832_xxAA_ENGB</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF52832_xxAA_REV1</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF52840_xxAA_ENGA</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF52832_xxAA_FUTURE</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF52840_xxAA_FUTURE</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF52810_xxAA_REV1</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF52810_xxAA_FUTURE</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF52832_xxAB_REV1</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF52832_xxAB_FUTURE</tt><br/>
 *    <tt>nrfjprogjs.constants.NRF51801_xxAB_REV3</tt><br/>
 *
 * @property {integer} codeAddress  Memory address for the start of the non-volatile (flash) memory block.
 *   Typically <tt>0x0000 0000</tt>.
 * @property {integer} codePageSize Size of each page of non-volatile (flash) memory.
 * @property {integer} codeSize     Total size of the non-volatile (flash) memory
 *
 * @property {integer} uicrAddress  Memory address for the start of the UICR
 *   (User Information Configuration Registers). Typically <tt>0x1000 1000</tt>.
 * @property {integer} infoPageSize Size of the FICR/UICR. Typically 4KiB.
 *
 * @property {integer} dataRamAddress Memory address for the start of the volatile RAM.
 *   Typically <tt>0x2000 0000</tt>, in the SRAM memory region.
 * @property {integer} ramSize        Size of the volatile RAM, in bytes.
 * @property {boolean} codeRamPresent Whether the volatile RAM is also mapped to a executable memory region or not.
 * @property {integer} codeRamAddress Memory address for the volatile RAM, in the code memory region.
 *   When <tt>codeRamPresent</tt> is true, both <tt>codeRamAddress</tt> and
 *   <tt>dataRamAddress</tt> point to the same volatile RAM, but the hardware
 *   uses a different data bus in each case.
 *
 * @property {boolean} qspiPresent  Whether QSPI (Quad Serial Peripheral Interface) is present or not.
 * @property {integer} xipAddress   When <tt>qspiPresent</tt> is true, the memory address for the
 *   XIP (eXecute In Place) feature. This memory address maps to the external flash
 *   memory connected through QSPI.
 * @property {integer} xipSize      Size of the XIP memory region.
 *
 * @property {integer} pinResetPin  Which pin acts as the reset pin. e.g. a value of <tt>21</tt>
 *   means that the pin marked as "P0.21" acts as the reset pin.
 */

/**
 * Represents the device information of the debug probe
 *
 * @typedef ProbeInformation
 *
 * @property {integer} serialNumber The serialnumber of the probe
 * @property {integer} clockSpeedkHz The clock speed of the probe interface
 * @property {string} firmwareString The version infomation about the J-Link firmware
 */

/**
 * Represents the information about the J-link ARM interface library
 *
 * @typedef LibraryInformation
 *
 * @property {object} version The version of the interface library
 * @property {integer} version.major The major version of the interface library
 * @property {integer} version.minor The minor version of the interface library
 * @property {string} version.revision The revision version of the interface library
 * @property {string} path The path to the interface library
 */

/**
 * Represents the serial number and information of an individual device
 * @typedef SerialNumberAndDeviceInformation
 *
 * @property {integer} serialNumber
 * @property {module:pc-nrfjprog-js~DeviceInformation} deviceInfo
 * @property {module:pc-nrfjprog-js~ProbeInformation} probeInfo
 * @property {module:pc-nrfjprog-js~LibraryInformation} libraryInfo
 */

/**
 * Option flags to be used when sending a program to the device.
 * @typedef ProgramOptions
 * @property {integer} inputFormat=nrfjprogjs.constants.INPUT_FORMAT_HEX_FILE
 *    How the <tt>filename</tt> string passed to <tt>program()</tt> shall be interpreted.
 *    Value must be one of:<br/>
 *    <tt>nrfjprogjs.constants.INPUT_FORMAT_HEX_FILE</tt>: The string represents a filename for a .hex file<br/>
 *    <tt>nrfjprogjs.constants.INPUT_FORMAT_HEX_STRING</tt>: The string represents the contents of a .hex file<br/>
 * @property {boolean} verify=true
 *    Whether verification should be performed as part of the programming.
 *    Akin to <tt>nrfjprog --program --verify</tt> in the command-line tools
 * @property {integer} chip_erase_mode=nrfjprogjs.constants.ERASE_ALL
 *    How much of the flash memory should be erased. Value must be one of:<br/>
 *    <tt>nrfjprogjs.constants.ERASE_NONE</tt><br/>
 *    <tt>nrfjprogjs.constants.ERASE_ALL</tt><br/>
 *    <tt>nrfjprogjs.constants.ERASE_PAGES</tt><br/>
 *    <tt>nrfjprogjs.constants.ERASE_PAGES_INCLUDING_UICR</tt><br/>
 * @property {integer} qspi_erase_mode=nrfjprogjs.constants.ERASE_NONE
 *    How much of the QSPI memory should be erased. Value must be one of:<br/>
 *    <tt>nrfjprogjs.constants.ERASE_NONE</tt><br/>
 *    <tt>nrfjprogjs.constants.ERASE_ALL</tt><br/>
 *    <tt>nrfjprogjs.constants.ERASE_PAGES</tt><br/>
 *    <tt>nrfjprogjs.constants.ERASE_PAGES_INCLUDING_UICR</tt><br/>
 * @property {boolean} reset=true Whether the device should be reset after programming.
 */

/**
 * Option flags to be used when reading the content of the device.
 * @typedef ReadToFileOptions
 * @property {boolean} readram=false Read the contents of the ram
 * @property {boolean} readcode=true Read the contents of the flash
 * @property {boolean} readuicr=false Read the contents of the uicr
 * @property {boolean} readqspi=false Read the contents of the qspi
 */

/**
 * Flags to be used when erasing a device.
 * @typedef EraseOptions
 * @property {integer} erase_mode=nrfjporgjs.ERASE_ALL
 *    How much of the memory should be erased. Value must be one of:<br/>
 *    <tt>nrfjprogjs.constants.ERASE_NONE</tt><br/>
 *    <tt>nrfjprogjs.constants.ERASE_ALL</tt><br/>
 *    <tt>nrfjprogjs.constants.ERASE_PAGES</tt><br/>
 *    <tt>nrfjprogjs.constants.ERASE_PAGES_INCLUDING_UICR</tt><br/>
 * @property {integer} start_address=0
 *    Start erasing from this address. Only relevant when using <tt>ERASE_PAGES</tt> or <tt>ERASE_PAGES_INCLUDING_UICR</tt> modes.
 * @property {integer} end_address=0
 *    Erasing up to this address. Only relevant when using <tt>ERASE_PAGES</tt> or <tt>ERASE_PAGES_INCLUDING_UICR</tt> modes.
 */

/**
 * Information about the different up and down channels available on the device. A down channel is
 * a channel from the computer to the device. An up channel is a channel from the device to the
 * computer.
 * @typedef ChannelInfo
 * @property {integer} channelIndex The index used to address this channel
 * @property {integer} direction The direction of the channel. Value will be one of <tt>nrfjprogjs.constants.UP_DIRECTION</tt> or <tt>nrfjprogjs.constants.DOWN_DIRECTION</tt>
 * @property {String} name The name of the channel
 * @property {integer} size The size of the channel
 */
