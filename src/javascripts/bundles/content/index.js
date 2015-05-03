/* global Dropbox */
'use strict';

var secrets = require('../../config/secrets'),
    request = require('../../helpers/request'),
    date = require('../../helpers/date'),
    handleError = require('../../helpers/handleError');

var views = [
  require('./feed'),
  require('./photo'),
  require('./post')
];

// create dropbox client
var client = new Dropbox.Client({ key: secrets.dropboxAppKey });

// try to authenticate using stored credentials
client.authenticate({ interactive: false }, function (error, client) {
  if (error) { return handleError(error); }
  if (!client.isAuthenticated()) {
    // if user is not authenticated ask background page to show
    // a page action icon
    chrome.extension.sendMessage({ action: 'showNotification' });
    return handleError('Not authenticated');
  }
  initialize();
});

function initialize() {
  views.forEach(function (View) {
    // pass onSave to every view, so they would call it on like
    new View(onSave);
  });
}

function onSave(urls, extras) {
  // extras would have some extra data coming from views
  extras = extras || {};
  if (typeof urls === 'string') {
    urls = [urls];
  }

  // grab user options
  chrome.storage.sync.get({
    // provide defaults
    datePrefix: false,
    groupByAuthor: false
  }, function (options) {

    // get current datetime as a date prefix for filename
    var datetime = date.asStr();

    // iterate all saved urls
    urls.forEach(function (url, index) {

      // create filename for dropbox, it will be an actual vk filename
      var filename = url.split('/').pop();

      if (options.datePrefix) {
        // along with date also add index of the file for the right ordering
        filename = [datetime, index + 1, filename].join('-');
      }

      if (options.groupByAuthor && extras.authorSlug) {
        // write to subdirectory with author's name
        filename = [extras.authorSlug, filename].join('/');
      }

      // try grab an image
      request.image(url, function (error, arrayBuffer) {
        if (error) { return handleError(url, error); }

        // try save an image
        client.writeFile(filename, arrayBuffer, function(error) {
          if (error) { return handleError(url, error); }
        });

      });

    });

  });
}