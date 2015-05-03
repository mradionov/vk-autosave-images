'use strict';

var dom = require('../../helpers/dom'),
    handleError = require('../../helpers/handleError');

var parse = require('../../common/parse');

function PostView(saveCallback) {
  this.saveCallback = saveCallback;
  this.initialize();
}

PostView.prototype.initialize = function () {
  // imitate click using mousedown and mouseup
  // becase vk cancels bubbling for like buttons
  // btw, trying to attach listeners directly is also pretty difficult
  // because of vk url changes and lazy loading
  dom.onKindaClick(document, this.onLike.bind(this));
};

PostView.prototype.onLike = function (e) {
  // because click handler is attached to a document
  // check element class, detect if it is a post like button
  // because, there might be a lot of ".flat_button"'s
  // check if it has a correct parent
  var buttonPattern = /\bflat_button.*?\b/;
  if (buttonPattern.test(e.target.className) &&
      e.target.parentNode.classList.contains('wl_post_like_wrap')
  ) {
    this.like(e.target.parentNode);
    return true;
  }

  // if click was not on a "flat" button, try to check for it's content
  // also, validate parent
  var contentPattern = /\bwl_post_like_.*?\b/;
  if (contentPattern.test(e.target.className) &&
      e.target.parentNode.parentNode.classList.contains('wl_post_like_wrap')
  ) {
    this.like(e.target.parentNode.parentNode);
    return true;
  }
};

PostView.prototype.like = function (el) {

  var icon = el.querySelector('.wl_post_like_icon');
  if (!icon) { return handleError('.wl_post_like_icon not found'); }
  if (icon.classList.contains('my_like')) {
    // means that post is unliked
    // we are checking the opposite because of mousedown event
    // vk changes class on click, mousedown is faster here
    return false;
  }

  // try to find post container
  var post = dom.closest(el, '#wl_post');
  if (!post) { return handleError('#wl_post not found'); }

  // ret to find image links by unique selector
  var linkSelector = '.page_post_sized_thumbs.page_post_sized_full_thumb ' +
    'a.page_post_thumb_wrap';

  // if there are thumbs, try grab links for them
  var links = post.querySelectorAll(linkSelector);
  if (!links) { return handleError(linkSelector + ' 0 length'); }

  // get post author url slug
  var authorSlug = '';
  var authorLink = post.querySelector('#wl_head_wrap a.wl_owner_head_name');
  if (authorLink) {
    // also remove leading /
    authorSlug = authorLink.href.split('/').pop();
  }

  // retrieve urls from image link
  var urls = [];
  for (var i = 0, l = links.length; i < l; i++) {
    var link = links[i];

    var url = parse.linkOnClick(link);
    if (!url) { continue; }

    urls.push(url);
  }

  if (!urls.length) {
    return false;
  }

  this.saveCallback(urls, {
    authorSlug: authorSlug
  });
};

module.exports = PostView;