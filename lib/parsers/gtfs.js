const GtfsRealtimeBindings = require('mta-gtfs-realtime-bindings');

module.exports = function (res) {
  let data = [];

  return new Promise((resolve, reject) => {
    res.body.on('data', chunk => {
      data.push(chunk);
    });
    res.body.on('error', err => {
      reject(err);
    });
    res.body.on('end', () => {
      let decodedData;
      data = Buffer.concat(data);
      if (data.length < 1) {
        return reject(new Error('Empty Response'));
      }
      try {
        decodedData = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(data);
      } catch (err) {
        console.log(err);
        reject(err);
      }
      resolve(decodedData);
    });
  });
};
