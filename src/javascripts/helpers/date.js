'use strict';

var date = {

  asStr: function () {

    var date = new Date();

    // add leading zero if number is <10
    function zero(n) {
      if (n < 10) { return '0' + n; }
      return n;
    }

    var str = [
      date.getFullYear(),
      zero(date.getMonth() + 1),
      zero(date.getDate()),
      zero(date.getHours()),
      zero(date.getMinutes()),
      zero(date.getSeconds()),
      zero(Math.round(date.getMilliseconds() / 10, 2))
    ].join('');

    return str;
  }

};

module.exports = date;