module.exports = {
  
  binaryInsert: function (sortBy, obj, array, start, end) {
    const length = array.length;
    start = typeof start === 'undefined' ? 0 : start;
    end = typeof end === 'undefined' ? length - 1 : end;
    const m = start + Math.floor((end - start) / 2);
    const val = obj[sortBy];
    
    if (length === 0) {
      array.push(obj);
      return;
    }
    
    if (val > array[end][sortBy]) {
      array.splice(end + 1, 0, obj);
      return;
    }
    
    if (val < array[start][sortBy]) {
      array.splice(start, 0, obj);
      return;
    }
    
    if (start >= end) {
      return;
    }
    
    if (val < array[m][sortBy]) {
      this.binaryInsert(sortBy, obj, array, start, m - 1);
      return;
    }
    
    if (val > array[m][sortBy]) {
      this.binaryInsert(sortBy, obj, array, m + 1, end);
      return;
    }
    
    // no dupes
  },
  
  parseObj: function (t, s) {
    return {
      tripId: t.trip_id,
      routeId: t.route_id,
      delay: (!s.arrival) ? null : s.arrival.delay,
      arrivalTime: (!s.arrival) ? null : s.arrival.time.low,
      departureTime: (!s.departure) ? null : s.departure.time.low
    };
  }

};
