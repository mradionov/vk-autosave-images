'use strict';

var dom = {

  array: function(arraylike) {
    return Array.prototype.slice.call(arraylike);
  },

  // get closest by class name, id or tagname
  closest: function(node, selector) {
    do {
      if ((selector[0] === '.' && node.classList.contains(selector.slice(1))) ||
        (selector[0] === '#' && node.id === selector.slice(1)) ||
        (node.tagName === selector.toUpperCase())
      ) {
        return node;
      }
      node = node.parentNode;
    } while (node);
    return null;
  },

  addClass: function (nodes, className) {
    this.callClassList('add', nodes, className);
  },

  removeClass: function(nodes, className) {
    this.callClassList('remove', nodes, className);
  },

  callClassList: function(method, nodes, className) {
    if (!Array.isArray(nodes)) {
      nodes = [nodes];
    }
    for (var i = 0, l = nodes.length; i < l; i++) {
      nodes[i].classList[method](className);
    }
  },

  onKindaClick: function(delegate, clickCallback) {
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