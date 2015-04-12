'use strict';

var dom = require('./dom');

function Tabs(containerSelector, menuSelector) {
  this.$container = document.querySelector(containerSelector);

  this.tabs = this.extract(this.$container, 'tab');

  if (menuSelector) {
    this.$menu = document.querySelector(menuSelector);
    this.items = this.extract(this.$menu, 'target');
    this.bindMenuListener();
  }
}

Tabs.prototype.extract = function (parent, attr) {
  var children = parent.children;
  var map = {};

  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    var value = child.dataset[attr];

    if (value) {
      map[value] = child;
    }
  }
  return map;
};

Tabs.prototype.bindMenuListener = function () {
  this.$menu.addEventListener('click', function (e) {
    var target = e.target.dataset.target;
    if (!target) { return true; }
    this.show(target);
  }.bind(this));
};

Tabs.prototype.show = function (target) {
  this.hideAll();
  dom.addClass(this.tabs[target], 'active');
  if (this.$menu) {
   dom.addClass(this.items[target], 'active');
  }
};

Tabs.prototype.all = function (name) {
  var obj = this[name];
  return Object.keys(obj).map(function (key) {
    return obj[key];
  });
};

Tabs.prototype.hideAll = function () {
  dom.removeClass(this.all('tabs'), 'active');
  if (this.$menu) {
    dom.removeClass(this.all('items'), 'active');
  }
};

module.exports = Tabs;