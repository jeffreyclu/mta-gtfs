const _ = require('underscore');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const csvParse = require('csv-parse');
const parsers = require('./parsers');
const utils = require('./utils');

/**
 * Mta constructor
 * @param {Object} options
 */
const Mta = module.exports = function (options) {

  this.urls = {
    gtfs: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
    status: 'http://web.mta.info/status/serviceStatus.txt'
  };

  this.options = options || {};
};

/**
 * Returns an object of valid feedIds
 * @return {Object}
 */

Mta.prototype.feedIds = function () {
  return {
    '123456': undefined,
    'ACE': '-ace',
    'BDFM': '-bdfm',
    'G': '-g',
    'JZ': '-jz',
    'NQRW': '-nqrw',
    'L': '-l',
    '7': undefined,
    'SIR': '-si'
  };
};

/**
 * Gets MTA subway stop info
 * @param  {String} stopId
 * @return {Object}
 */
Mta.prototype.stop = function (stopId) {
  const file = fs.readFileSync(path.join(__dirname, '/data/gtfs/stops.txt'));

  return new Promise(function (resolve, reject) {
    csvParse(file, {
      columns: true,
      objname: 'stop_id'
    }, function (err, data) {
      if (err) {
        return reject(err);
      }

      if (_.isNumber(stopId) || _.isString(stopId)) {
        data = data[stopId];
      } else if (_.isArray(stopId)) {
        data = _.pick(data, stopId);
      } else if (!_.isEmpty(stopId)){
        return reject(new Error('Invalid stop id(s).'));
      }

      return resolve(data);
    });
  });

};

/**
 * Gets MTA service status
 * @param  {String}       service   optional ('subway', 'bus', 'BT', 'LIRR', 'MetroNorth')
 * @return {Array|Object} status
 */
Mta.prototype.status = function (service) {

  const url = this.urls.status;

  return fetch(url)
  .then(parsers.serviceXml)
  .then(function (res) {
    if (service) {
      return res[service];
    }
    return res;
  });

};

/**
 * Gets MTA schedule status
 * @param  {String|Array} stopId
 * @param {String} feedId
 * @return {Object}       schedule
 */
Mta.prototype.schedule = async function (stopId, feedId) {
  const schedule = {};
  let results = false;
  let stopIds, direction, obj, feedUrl;
  const options = _.pick(this.options, [ 'key' ]);

  if (feedId) {
    if (!Object.values(Mta.prototype.feedIds()).includes(feedId)) {
      throw new Error('invalid feedId:', feedId);
    }
    options.feed_id = feedId;
    feedUrl = this.urls.gtfs + `${options.feed_id}`;
  } else {
    feedUrl = this.urls.gtfs;
  };

  if (_.isArray(stopId)) {
    stopIds = stopId;
  } else if (_.isNumber(stopId) || _.isString(stopId)) {
    stopIds = [ stopId ];
  } else {
    throw new Error('invalid stop id(s)', JSON.stringify(stopId));
  }

  _.each(stopIds, function (stop) {
    schedule[stop] = { N: [], S: [] };
  });

  // get binary feed
  return fetch(feedUrl)
  .then(parsers.gtfs)
  .then(function (data) {
    if (!data.entity || !Array.isArray(data.entity)) {
      throw (err || new Error('malformed MTA response'));
    }

    data.entity.map(function (t) {
      if (_.isEmpty(t.trip_update)) {
        return;
      }
      
      t.trip_update.stop_time_update.map(function (s) {
        _.each(stopIds, function (stop) {
          if (s.stop_id.indexOf(stop) > -1) {
            direction = s.stop_id.replace(stop, '');
            obj = utils.parseObj(t.trip_update.trip, s);
            if (_.isNull(obj.arrival)) {
              return;
            }
            utils.binaryInsert('arrivalTime', obj, schedule[stop][direction]);
            results = true;
          }
        });
      });
    });

    return results ? {
        schedule: schedule,
        updatedOn: data.header.timestamp.low
      } : {};
  });

};
