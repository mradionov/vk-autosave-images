'use strict';

var dom = require('../../helpers/dom'),
    handleError = require('../../helpers/handleError');

var parse = require('../../common/parse');

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
  if (!icon) { return handleError('.post_like_icon not found'); }
  if (icon.classList.contains('my_like')) {
    // means that post is unliked
    // we are checking the opposite because of mousedown event
    // vk changes class on click, mousedown is faster here
    return false;
  }

  // try to find post container
  var info = dom.closest(el, '.post_info');
  if (!info) { return handleError('.post_info not found'); }

  // get post author url slug
  var authorSlug = '';
  var authorLink = info.querySelector('.wall_text_name .author');
  if (authorLink) {
    // also remove leading /
    authorSlug = authorLink.href.split('/').pop();
  }

  var imageSources = this.parseImages(info);
  var documentSources = this.parseDocuments(info);

  var sources = imageSources.concat(documentSources);

  if (!sources.length) {
    return false;
  }

  this.saveCallback(sources, {
    authorSlug: authorSlug
  });
};

FeedView.prototype.parseImages = function (node) {
  // try to find images container
  // there are two of them, one is for another resolution or mobile version
  // just take the first
  var thumbs = node.querySelector('.page_post_sized_thumbs');
  if (!thumbs) { return []; }

  // if there is a thumbs container, try to grab image links from it
  var links = thumbs.querySelectorAll('a.page_post_thumb_wrap');
  if (!links.length) { return []; }

  var sources = parse.imageLinks(links);

  return sources;
};

FeedView.prototype.parseDocuments = function (node) {
  // check if post has any documents
  var media = node.querySelector('.post_media');
  if (!media) { return []; }

  // find any "image"-like links
  var links = media.querySelectorAll('.photo.page_doc_photo_href');
  if (!links) { return []; }

  var sources = parse.documentLinks(links);

  return sources;
};

module.exports = FeedView;