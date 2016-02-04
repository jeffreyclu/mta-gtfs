# MTA

An NYC MTA API library

## Usage

#### MTA

For feed information, see http://datamine.mta.info/list-of-feeds.

In order to use the MTA real-time APIs, you will need an MTA API key from here: http://datamine.mta.info/user/register.

### Library
```
var Mta = require('./');
var mta = new Mta({
  key: 'MY-MTA-API-KEY-HERE', // only needed for mta.schedule() method
  feed_id: 1                  // optional, default = 1
});
```
* uses [node-fetch](https://github.com/bitinn/node-fetch) to make http requests
* returns Promise objects and makes use of native Promises (make sure you are using >= Node v0.12)

### Get subway stop info

Get ids, name, and lat/long for all subway stops.

```Javascript
mta.stop().then(function (result) {
  console.log(result);
}).catch(function (err) {
  console.log(err);
});
```

Get info for specific stop, given an id.

```Javascript
mta.stop(635).then(function (result) {
  console.log(result);
});
```
An array of ids may also be passed to this method.

The stop ids given here are used in `mta.schedule()`.

### Get MTA service status info

You can get ALL service types:

```Javascript
mta.status().then(function (result) {
  console.log(result);
});
```

Or, specify a specific service type (`subway`, `bus`, `BT`, `LIRR`, `MetroNorth`):

```Javascript
mta.status('subway').then(function (result) {
  console.log(result);
});
```

The API route this method hits is updated by the MTA every 60 seconds.

### Get real-time subway schedule data
Only available for the following routes: 1, 2, 3, 4, 5, 6, S, L, and Staten Island Railway (http://datamine.mta.info/list-of-feeds).

Given a single subway stop id (or an array of stop ids), it gives schedule data for both northbound and southbound trains.

```Javascript
mta.schedule(635).then(function (result) {
  console.log(result);
});
```

The API route this method hits is updated by the MTA every 30 seconds.

## Tests

See [test cases](https://github.com/aamaliaa/mta/blob/master/test/mta.js) for more examples.

Replace `'your-api-key'` in `test/config.js` with your own MTA API key then run:

```
npm test
```

## To do

* MTA Bus Time API (http://bustime.mta.info/wiki/Developers/Index)
* return static schedules for lines not included in real-time feeds
