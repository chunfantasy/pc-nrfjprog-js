
const Debug = require('debug');

// Debug.enable('*');
Debug.enable('main');
const debug = Debug('main');


const jprog = require('.');


// See https://node-serialport.github.io/node-serialport/ReadLineParser.html
// const Readline = require('serialport').parsers.Readline;

const ThroughputMeter = require('./throughput-meter');


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

Promise.resolve().then(()=>{
    return probe.getRttChannels()
    .then((channels)=>{console.log('channels:', channels)})
    .catch(err=>{console.error('rtt error: ', err.errmsg)});

}).then(()=>{

    return probe.getReadableRttStream(0)
    .then((stream)=>{console.log('readable stream:', stream); return stream;})
    .catch(err=>{console.error('rtt error: ', err.errmsg)});

}).then((stream)=>{

    stream.on('data', (data)=>{
        console.log(data.toString());
        console.log(data);
    });

//     const parser = stream.pipe(new ThroughputMeter());
//
//     parser.on('data', (line)=>{
//         debug(line.toString().trim());
//     });


    setTimeout(()=>{
        debug('One minute passed, exiting');
        stream.destroy();
        parser.destroy();
    }, 60000);

});






