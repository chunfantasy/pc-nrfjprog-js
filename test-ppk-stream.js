
const Debug = require('debug');

// Debug.enable('*');
Debug.enable('main');
const debug = Debug('main');


const jprog = require('.');
const asciichart = require('asciichart');

// See https://node-serialport.github.io/node-serialport/ReadLineParser.html
// const Readline = require('serialport').parsers.Readline;

const DelimiterParser = require('serialport').parsers.Delimiter;
const PPKLIP = require('./ppklip-transformer-stream');


// const probe1 = new jprog.Probe(682735238);
// const probe2 = new jprog.Probe(681724569);

// const probe = new jprog.Probe(683881373);
const probe = new jprog.Probe(681356765);



// probe1.getProbeInfo().then((info)=>{console.log('probe 2: ', info)});
// probe2.getProbeInfo().then((info)=>{console.log('probe 2: ', info)});

// probe1.readU32(0x3004).then((info)=>{console.log('probe 1 0x3000: ', info.toString(16))});
// probe2.readU32(0x3004).then((info)=>{console.log('probe 2 0x3000: ', info.toString(16))});

// probe1.getLibraryInfo().then((info)=>{console.log('probe 1 lib: ', info)});
// probe2.getLibraryInfo().then((info)=>{console.log('probe 2 lib: ', info)});


// probe.getProbeInfo()
// .then((info)=>{
//     console.log('probe info: ', info)
// }).then(()=>{
//     return probe.getLibraryInfo();
// }).then((info)=>{
//     console.log('probe lib: ', info)
// }).then(()=>{
//     return probe.getDeviceInfo();
// }).then((info)=>{
//     console.log('probe target info: ', info)
// }).then(()=>{

let count = 0;
let measurements = 0;

let rollingSize = 65536;

let rollingData = new Float32Array(65536 * 2);

const screenWidth = 180;
let measurementsPerSecond = new Array(screenWidth);
measurementsPerSecond.fill(0);

Promise.resolve().then(()=>{
    return probe.getRttChannels()
    .then((channels)=>{console.log('channels:', channels)})
    .catch(err=>{console.error('rtt error: ', err.errmsg)});

}).then(()=>{

    return probe.getDuplexRttStream(0, 0)
//     return probe.getDuplexRttStream(0, 1)
//     return probe.getReadableRttStream(0)
    .then((stream)=>{console.log('duplex stream:', stream); return stream;})
    .catch(err=>{console.error('rtt error: ', err.errmsg)});

}).then((stream)=>{

    let parser;

    // Upon connecting, the first message is the identification of the PPK,
    // and some human-readable info and settings.
    stream.once('data', (data)=>{
        debug(data.toString());
//         console.log(data);

//         const parser = stream.pipe(new DelimiterParser({ delimiter: '\x03' }));
        const parser = stream.pipe(new PPKLIP());
        parser.on('data', (line)=>{

            if (line.length === 4) {
                // This is a measurement for average data, decode as float32
//                 const floatValue = line.readFloatLE(0);
//                 debug(floatValue);
                rollingData[65536 + (measurements++)] = line.readFloatLE(0);
            } else {
//                 debug(line);
            }
        });

        debug('Sending "Average Start" command');
        // Send "Average Start" command
        // 0x02 = STX (start transmit)
        // 0x06 = Average Start command
        // 0x03 = ETX (end transmit)
        stream.write('\x02\x06\x03');


//         setTimeout(()=>{
//             debug('5 secs passed, sending "average stop" command');
//     //         stream.destroy();
//     //         parser.destroy();
//
//             debug('Average measurements received: ', measurements);
//             debug('Sending "Average Stop" command');
//             // Send "Average Stop" command
//             // 0x02 = STX (start transmit)
//             // 0x06 = Average Start command
//             // 0x03 = ETX (end transmit)
//             stream.write('\x02\x07\x03');
//
//         }, 5000);

        setInterval(()=>{
            // Roll the rolling data
            rollingData.copyWithin(0, measurements, 65536 + measurements);


// debug(rollingData)

            // Crush the data horizontally to fit the console
            const plotData = Array.from(screenWidth);
            const dataPointsPerCharacter = Math.floor(65536 / screenWidth);
            for (let i=0; i<screenWidth; i++) {
                const offset = i * dataPointsPerCharacter;
                let avg = 0;
                let max = 0;
                for (let j=0; j<dataPointsPerCharacter ; j++) {
//                     console.log(avg, offset + j, rollingData[offset + j]);
                    const dataPoint = rollingData[offset + j]
                    avg += dataPoint;
                    max = Math.max(max, dataPoint);
                }
                avg /= dataPointsPerCharacter;
//                 plotData[i] = avg;
                plotData[i] = max;
            }

//             console.log(plotData);
            console.log();
            console.log();
            console.log();
            console.log();
            if ( plotData.some(v=>v>0) ) {
                console.log(asciichart.plot(plotData, { height: 60 }));
            }

//             measurementsPerSecond.push(measurements);
//             if (measurementsPerSecond.length > screenWidth) {
//                 measurementsPerSecond.splice(0, measurementsPerSecond.length - screenWidth);
//             }
//
//             if ( measurementsPerSecond.some(v=>v>0) ) {
// //                 console.log(measurementsPerSecond);
//
//                 console.log(asciichart.plot(measurementsPerSecond, { height: 60 }));
//             }

            debug(measurements, ' measurements received during the last interval');

            measurements = 0;

        }, 100);

    });
/*

    setTimeout(()=>{
        debug('One minute passed, exiting');
        stream.destroy();
//         parser.destroy();
    }, 60000);*/

});






