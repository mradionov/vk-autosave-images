// grab config from config/secrets.js
var config = VKAUTOSAVEIMAGES;

// create dropbox client
var client = new Dropbox.Client({ key: config.dropboxAppKey });

// get closest by class name
function closest(el, className) {
  do {
    if (el.classList.contains(className)) {
      return el;
    }
  } while (el = el.parentNode);
  return null;
}

function handleError(error) {
  console.error(error);
  return false;
}

// grab image buy URL
function retrieveImage(url, callback) {

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

function datetimeAsStr() {
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

// parse a post for a passed button
function likePost(el) {

  var icon = el.querySelector('.post_like_icon');
  if (icon.classList.contains('my_like')) {
    // means that post is unliked
    // we are checking the opposite because of mousedown event
    // vk changes class on click, mousedown is faster here
    return false;
  }

  // try to find post container
  var info = closest(el, 'post_info');
  if (!info) { return handleError('.post_info not found'); }

  // try to find images container
  // there are two of them, one is for another resolution or mobile version
  // just take the first
  var thumbs = info.querySelector('.page_post_sized_thumbs');
  if (!thumbs) { return handleError('.page_post_sized_thumbs not found'); }

  // if there is a thumbs container, try to grab image links from it
  var links = thumbs.querySelectorAll('a.page_post_thumb_wrap');
  if (!links.length) { return handleError('a.page_post_thumb_wrap 0 length'); }

  // get post author url slug
  var authorSlug = '';
  var authorLink = info.querySelector('.wall_text_name .author');
  if (authorLink) {
    // also remove leading /
    authorSlug = authorLink.href.split('/').pop();
  }

  // retrieve urls from image link
  var urls = [];
  var pattern = /{"base":.*?}/;

  for (var i = 0, l = links.length; i < l; i++) {
    var link = links[i];

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
    var onclick = link.getAttribute('onclick');

    // try parse "base" part
    if (!pattern.test(onclick)) {
      continue;
    }
    var options = pattern.exec(onclick);

    // try convert it to JSON because it is
    var json;
    try {
      json = JSON.parse(options[0]);
    } catch(e) {
      continue;
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

    urls.push(url);
  }

  // grab user options
  chrome.storage.sync.get({
    // provide defaults
    datePrefix: false,
    groupByAuthor: false
  }, function (options) {

    // get current datetime as a date prefix for filename
    var datetime = datetimeAsStr();

    // iterate all saved urls
    urls.forEach(function (url, index) {

      // create filename for dropbox, it will be an actual vk filename
      var filename = url.split('/').pop();

      if (options.datePrefix) {
        // along with date also add index of the file for the right ordering
        filename = [datetime, index + 1, filename].join('-');
      }

      if (options.groupByAuthor) {
        // write to subdirectory with author's name
        filename = [authorSlug, filename].join('/');
      }

      // try grab an image
      retrieveImage(url, function (error, arrayBuffer) {
        if (error) { return handleError(error); }

        // try save an image
        client.writeFile(filename, arrayBuffer, function(error, stat) {
          if (error) { return handleError(error); }
        });

      });

    });

  });
}

// -----------------------------------------------------------------------------

// store mousedown'ed element
var element = null;

function mousedown(e) {
  element = e.target;
}

function mouseup(e) {
  // check if mouseup occured on the same element as mousedown
  if (element === e.target) {
    click(e);
  }
  element = null;
}

function click(e) {
  // check element class, detect if it is a post like button
  var pattern = /\bpost_like.*?\b/;
  if (!pattern.test(e.target.className)) {
    return true;
  }
  // extract actual class name of the element
  // it may be a ".post_like" button itself (what we need)
  // or it may be it's children: like icon, counter, etc
  // they also have classes starting with "post_like"
  var className = pattern.exec(e.target.className)[0];

  // get desired ".post_like" element
  var el;
  if (className === 'post_like') {
    el = e.target;
  } else {
    el = e.target.parentNode;
  }

  // invoke like for button
  likePost(el);
}

// imitate click using mousedown and mouseup
// becase vk cancels bubbling for like buttons
// btw, trying to attach listeners directly is also pretty difficult
// because of vk url changes and lazy loading
function bindPageListeners() {
  var body = document.getElementById('page_body');
  body.addEventListener('mousedown', mousedown);
  body.addEventListener('mouseup', mouseup);
}

// -----------------------------------------------------------------------------

// try to authenticate using stored credentials
client.authenticate({ interactive: false }, function (error, client) {
  if (error) { return handleError(error); }
  if (!client.isAuthenticated()) {
    // if user is not authenticated ask background page to show
    // a page action icon
    chrome.extension.sendMessage({ action: 'showNotification' });
    return handleError('Not authenticated');
  }
  bindPageListeners();
});

