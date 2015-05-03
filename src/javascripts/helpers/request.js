'use strict';

var request = {

  // xhr grab image by url
  image: function (url, callback) {

    var req = new XMLHttpRequest();
    req.open('GET', url, true);

    // use arraybuffer, dropbox api accepts it
    req.responseType = 'arraybuffer';

    req.addEventListener('load', function() {
      if (req.status < 400) {
        callback(null, req.response);
      } else {
        callback(new Error('Request failed: ' + req.statusText));
      }
    });

    req.addEventListener('error', function() {
      callback(new Error('Network error'));
    });

    req.send();
  }

};

module.exports = request;