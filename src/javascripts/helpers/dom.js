'use strict';

var dom = {

  array: function (arraylike) {
    return Array.prototype.slice.call(arraylike);
  },

  // "itself" - if true, will start from the element itself
  //            and return it if it matches
  closest: function (node, selector, itself) {
    if (!itself || false) {
      node = node.parentNode;
    }
    while(node) {
      if (this.is(node, selector)) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  },

  is: function (node, selector) {
    if ((selector[0] === '.' && node.classList.contains(selector.slice(1))) ||
      (selector[0] === '#' && node.id === selector.slice(1)) ||
      (node.tagName === selector.toUpperCase())
    ) {
      return true;
    }
    return false;
  },

  addClass: function (nodes, className) {
    this.callClassList('add', nodes, className);
  },

  removeClass: function (nodes, className) {
    this.callClassList('remove', nodes, className);
  },

  callClassList: function (method, nodes, className) {
    if (!Array.isArray(nodes)) {
      nodes = [nodes];
    }
    for (var i = 0, l = nodes.length; i < l; i++) {
      nodes[i].classList[method](className);
    }
  },

  delegate: function (node, eventName, selector, cb) {
    var handler = function (e) {
      if (!this.is(e.target, selector)) {
        return true;
      }
      cb.bind(e.currentTarget)(e);
    };
    node.addEventListener(eventName, handler.bind(this));
  },

  onKindaClick: function (delegate, clickCallback) {
    // store mousedown'ed element
    var element = null;

    function mousedown(e) {
      element = e.target;
    }

    function mouseup(e) {
      // check if mouseup occured on the same element as mousedown
      if (element === e.target) {
        clickCallback(e);
      }
      element = null;
    }

    // imitate click using mousedown and mouseup
    delegate.addEventListener('mousedown', mousedown);
    delegate.addEventListener('mouseup', mouseup);
  }

};

module.exports = dom;