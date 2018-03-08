

const jprog = require('.');

jprog.getConnectedDevices((err, devs)=>{console.log(devs);});


const probe1 = new jprog.Probe(682735238);

const probe2 = new jprog.Probe(681724569);

// const probe3 = new jprog.Probe(683881373);

//681356765




// probe1.getProbeInfo().then((info)=>{console.log('probe 2: ', info)});
// probe2.getProbeInfo().then((info)=>{console.log('probe 2: ', info)});
//
// // probe1.readU32(0x3004).then((info)=>{console.log('probe 1 0x3000: ', info.toString(16))});
// // probe2.readU32(0x3004).then((info)=>{console.log('probe 2 0x3000: ', info.toString(16))});
//
// probe1.getLibraryInfo().then((info)=>{console.log('probe 1 lib: ', info)});
// probe2.getLibraryInfo().then((info)=>{console.log('probe 2 lib: ', info)});


// Promise.all([
//     probe1.getProbeInfo(),
//     probe2.getProbeInfo(),
//     probe3.getProbeInfo(),
// ]).then((infos)=>{
//     console.log('probe 1: ', infos[0])
//     console.log('probe 2: ', infos[1])
//     console.log('probe 3: ', infos[2])
// }).then(()=>{
//     return Promise.all([
//         probe1.getLibraryInfo(),
//         probe2.getLibraryInfo(),
//         probe3.getLibraryInfo()
//     ]);
// }).then((infos)=>{
//     console.log('probe 1 lib: ', infos[0])
//     console.log('probe 2 lib: ', infos[1])
//     console.log('probe 3 lib: ', infos[2])
// }).then(()=>{
//
//     return probe1.getRttChannels()
//     .then((channels)=>{console.log('channels 1:', channels)})
//     .catch(err=>{console.error('rtt1 error: ', err.errmsg)});
//
// }).then(()=>{
//
//     return probe2.getRttChannels()
//     .then((channels)=>{console.log('channels 2:', channels)})
//     .catch(err=>{console.error('rtt2 error: ', err.errmsg)});
//
// }).then(()=>{
//
//     return probe3.getRttChannels()
//     .then((channels)=>{console.log('channels 3:', channels)})
//     .catch(err=>{console.error('rtt3 error: ', err.errmsg)});
//
// });
//





