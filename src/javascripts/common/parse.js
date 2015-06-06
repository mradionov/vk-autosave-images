'use strict';

var parse = {
  imageLinks: parseImageLinks,
  documentLinks: parseDocumentLinks
};

module.exports = parse;

////////

function parseImageLinks(links) {
  return parseSources(links, parseOneImageLink);
}

function parseDocumentLinks(links) {
  return parseSources(links, parseOneDocumentLink);
}

function parseSources(links, parseOneFn) {
  links = links || [];

  var sources = [];

  for (var i = 0, l = links.length; i < l; i++) {
    var link = links[i];

    var source = parseOneFn(link);
    if (!source) { continue; }

    sources.push(source);
  }

  return sources;
}


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
function parseOneImageLink(link) {
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

  // all images processed by vk are in jpg
  url += '.jpg';

  // it will be an actual vk filename
  var name = url.split('/').pop();

  // for regular image: url = name
  var source = {
    url: url,
    name: name
  };

  return source;
}


function parseOneDocumentLink(link) {
  // wnd=1 allows to open document directly
  var url = link.href + '&wnd=1';

  var name;
  // if document original name is too long, vk will truncate it and
  // include ellipsis. DOM does not have original name, so we'll just
  // stay with ellipsis
  var hint = link.querySelector('.page_doc_photo_hint');
  if (hint) {
    var title = hint.querySelector('span');
    if (title) {
      name = title.textContent;
    } else {
      name = hint.textContent;
    }

  // if failed to find document name, then use doc name
  // it should not really happen, but anyway
  } else {
    name = url.split('?').shift().split('/').pop();
  }

  var source = {
    url: url,
    name: name
  };

  return source;
}