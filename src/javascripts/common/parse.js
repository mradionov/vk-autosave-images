'use strict';

var parse = {
  // all information is embedded into "onclick" attribute
  // it looks like:
  //
  // onclick="return showPhoto('-47797984_350924715', 'wall43321996_488',
  //  {"temp": {
  //    "base":"http://cs624026.vk.me/v624026527/",
  //    "x_":["120a6/PwY0caqJSww",604,448],
  //    "y_":["120a7/r4k_-qxFWco",807,598],
  //    "z_":["120a8/DlPGMjaSI5Q",1240,919]
  //  },queue:1}, event)"
  //
  linkOnClick: function (link) {
    var onclick = link.getAttribute('onclick');

    var pattern = /{"base":.*?}/;
    // try parse "base" part
    if (!pattern.test(onclick)) {
      return null;
    }
    var options = pattern.exec(onclick);

    // try convert it to JSON because it is
    var json;
    try {
      json = JSON.parse(options[0]);
    } catch(e) {
      return null;
    }

    // compose url
    var url = json.base;

    // z_ has the best quality, then y_, then x_
    // always try to save the best, but z_ and y_ are not always present
    if (json.z_) {
      url += json.z_[0];
    } else if (json.y_) {
      url += json.y_[0];
    } else if (json.x_) {
      url += json.x_[0];
    }

    url += '.jpg';

    return url;
  }
};

module.exports = parse;