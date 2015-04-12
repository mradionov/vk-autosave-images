'use strict';

var dom = require('../../helpers/dom'),
    handleError = require('../../helpers/handleError');

function FeedView(saveCallback) {
  this.saveCallback = saveCallback;
  this.initialize();
}

FeedView.prototype.initialize = function () {
  var body = document.querySelector('#page_body');
  if (!body) { return handleError('#page_body not found'); }

  // imitate click using mousedown and mouseup
  // becase vk cancels bubbling for like buttons
  // btw, trying to attach listeners directly is also pretty difficult
  // because of vk url changes and lazy loading
  dom.onKindaClick(body, this.onLike.bind(this));
};

FeedView.prototype.onLike = function (e) {
  // because click handler is attached to document
  // check element class, detect if it is a post like button
  var pattern = /\bpost_like.*?\b/;
  if (!pattern.test(e.target.className)) {
    return true;
  }
  // extract actual class name of the element
  // it may be a ".post_like" button itself (what we need)
  // or it may be one of it's children: icon, counter, etc
  // they also have classes starting with "post_like"
  var className = pattern.exec(e.target.className)[0];

  // get desired ".post_like" element
  var el;
  if (className === 'post_like') {
    el = e.target;
  } else {
    el = e.target.parentNode;
  }

  this.like(el);
};

FeedView.prototype.like = function (el) {

  var icon = el.querySelector('.post_like_icon');
  if (icon.classList.contains('my_like')) {
    // means that post is unliked
    // we are checking the opposite because of mousedown event
    // vk changes class on click, mousedown is faster here
    return false;
  }

  // try to find post container
  var info = dom.closest(el, '.post_info');
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

  this.saveCallback(urls, {
    authorSlug: authorSlug
  });
};

module.exports = FeedView;