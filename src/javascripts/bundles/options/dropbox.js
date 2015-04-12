/* global Dropbox */
'use strict';

var secrets = require('../../config/secrets'),
    Tabs = require('../../helpers/Tabs'),
    handleError = require('../../helpers/handleError');

function DropboxView() {
  this.initialize();
}

DropboxView.prototype.initialize = function () {
  var tabs = new Tabs('[data-tab="dropbox"]');

  // create dropbox client
  var client = new Dropbox.Client({ key: secrets.dropboxAppKey });

  // https://github.com/dropbox/dropbox-js/blob/stable/guides/builtin_drivers.md#dropboxauthdriverchromeextension
  client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
    receiverPath: 'templates/oauth/dropbox.html'
  }));

  // try to authenticate using stored credentials
  client.authenticate({ interactive: false }, function (error, client) {
    if (error) { return handleError(error); }
    if (client.isAuthenticated()) {
      tabs.show('linked');
    } else {
      tabs.show('unlinked');
    }
  });

  var $link = document.querySelector('.link'),
      $unlink = document.querySelector('.unlink');

  // authenticate if signed out
  $link.addEventListener('click', function () {
    tabs.show('loading');
    client.authenticate(function (error) {
      if (error) { return handleError(error); }
      tabs.show('linked');
    });
  });

  // sign out if authenticated
  $unlink.addEventListener('click', function () {
    tabs.show('loading');
    client.signOut(function (error) {
      if (error) { return handleError(error); }
      tabs.show('unlinked');
    });
  });
};

module.exports = DropboxView;