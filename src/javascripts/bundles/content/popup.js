'use strict';

var dom = require('../../helpers/dom'),
    handleError = require('../../helpers/handleError');

// VK photoview like button is implemented in not the best way,
// when one likes a photo, no any new class or attribute is changed, so
// there is no easy way to detect if a photo is liked by a user.
// The only way is to track down opacity of the "heart", but it is also
// being affected by mouseover. The idea - find the "heart"
// on the page load (or photoview load), which is possible with DOM observers

var Observer = window.MutationObserver || window.WebKitMutationObserver;

function PopupView(saveCallback) {
  this.saveCallback = saveCallback;
  this.initialize();

  // store state for current photoview
  this.liked = false;
}

PopupView.prototype.initialize = function () {
  // click on like button
  document.addEventListener('click', this.onLike.bind(this));

  this.observeLayer();
};

// start observing one of the top containers
// to detect if photoview was opened
PopupView.prototype.observeLayer = function () {
  var layer = document.querySelector('#layer_wrap');
  if (!layer) { return handleError('#layer_wrap not found'); }

  // attach observer, it will track changes of element classlist
  // and do things when something changes
  var layerObserver = new Observer(this.onLayerMutation.bind(this));
  layerObserver.observe(layer, {
    attributes: true
  });

  // also, handle the situation when page already has photoview opened
  if (!layer.classList.contains('pv_dark') &&
      !layer.classList.contains('pv_light')
  ) {
    return true;
  }

  var wide = layer.querySelector('#pv_wide');
  if (!wide) { return handleError('#pv_wide not found'); }

  var icon = wide.querySelector('#pv_like_wrap i#pv_like_icon');
  // VK fetches likes count independently, so give it some tries
  if (!icon) {
    var attempts = 5;

    var retryIcon = function() {
      icon = wide.querySelector('#pv_like_wrap i#pv_like_icon');

      attempts -= 1;

      // try again
      if (!icon && attempts > 0) {
        setTimeout(retryIcon, 500);

      // failed
      } else if (attempts === 0) {
        return handleError('No attempts left');

      // got it
      } else if (icon) {
        this.liked = (icon.style.opacity == 1);
      }
    };

    retryIcon();

  } else {
    // icon was already on the page
    this.liked = (icon.style.opacity == 1);
  }
};

PopupView.prototype.onLayerMutation = function (mutations) {
  if (mutations.length < 0) {
    return true;
  }
  var target = mutations[0].target;

  // check if photoview is open
  if (!target.classList.contains('pv_dark') &&
      !target.classList.contains('pv_light')
  ) {
    return true;
  }

  var wide = target.querySelector('#pv_wide');
  if (!wide) { return handleError('#pv_wide not found'); }

  // listen to block with like button, because it is also served
  // asynchronously, when going over images with arrows
  // listen to changes in childlist
  var wideObserver = new Observer(this.onWideMutation.bind(this));
  wideObserver.observe(wide, {
    childList: true
  });
};

PopupView.prototype.onWideMutation = function (mutations) {
  if (mutations.length < 0) { return handleError('No any mutations'); }

  var target = mutations[0].target;
  var icon = target.querySelector('#pv_like_wrap i#pv_like_icon');
  if (!icon) { return handleError('#pv_like_icon not found'); }

  this.liked = (icon.style.opacity == 1);
};

PopupView.prototype.onLike = function (e) {
  // because click handler is attached to document
  // check element id, detect if it was a photo like button
  var pattern = /\bpv_like.*?\b/;
  if (!pattern.test(e.target.id)) {
    return true;
  }

  // extract actual id of the lement
  // it may be a #pv_like_wrap itself (what we need)
  // or it may be one of it's children: icon, counter, etc
  // they also have ids starting with "pv_like"
  var id = pattern.exec(e.target.id)[0];

  // get desired #pv_like_wrap element
  var el;
  if (id === 'pv_like_wrap') {
    el = e.target;
  } else {
    el = e.target.parentNode;
  }

  this.like(el);
};

PopupView.prototype.like = function (el) {
  // hope that value for "liked" was already retrieved by observers
  // here we should revert this value, when user likes something
  // and if it was liked before click - return, because we do not
  // need to download thing on "unlike"
  this.liked = !this.liked;
  if (!this.liked) {
    return false;
  }

  // try to find comments block
  var comments = dom.closest(el, '#pv_comments_data');
  if (!comments) { return handleError('#pv_comments_data not found'); }

  // try to find a link to original image
  var link = comments.querySelector('#pv_open_original');
  if (!link) { return handleError('#pv_open_original not found'); }

  // extract image uploader url slug
  var authorSlug = '';
  var authorLink = comments.querySelector('#pv_author_name a');
  if (authorLink) {
    authorSlug = authorLink.href.split('/').pop();
  }

  var url = link.href;

  this.saveCallback(url, {
    authorSlug: authorSlug
  });
};

module.exports = PopupView;