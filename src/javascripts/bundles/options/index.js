'use strict';

var Tabs = require('../../helpers/Tabs');

var views = [
  require('./common'),
  require('./dropbox')
];

function initialize() {

  // global tabs
  var tabs = new Tabs('#content', '#menu ul');

  // initialize view for each global tab
  views.forEach(function (View) {
    new View();
  });

  tabs.show('dropbox');
}

document.addEventListener('DOMContentLoaded', initialize);
