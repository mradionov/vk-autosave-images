'use strict';

var dom = {
  loading: document.querySelector('.loading'),
  linked: document.querySelector('.linked'),
  unlinked: document.querySelector('.unlinked'),
  link: document.querySelector('.link'),
  unlink: document.querySelector('.unlink')
};

// show one of the elements, and hide others
function show(what) {
  var keys = ['loading', 'linked', 'unlinked'];
  keys.forEach(function (key) {
    if (key === what) {
      dom[key].classList.remove('hidden');
    } else {
      dom[key].classList.add('hidden');
    }
  });
}

function handleError(error) {
  return false;
}

// grab config from config/secrets.js
var config = VKAUTOSAVEIMAGES;
// create dropbox client
var client = new Dropbox.Client({ key: config.dropboxAppKey });
// https://github.com/dropbox/dropbox-js/blob/stable/guides/builtin_drivers.md#dropboxauthdriverchromeextension
client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
  receiverPath: 'templates/oauth/dropbox.html'
}));

// try to authenticated using stored credentials
client.authenticate({ interactive: false }, function (error, client) {
  if (error) { return handleError(error); }
  if (client.isAuthenticated()) {
    show('linked');
  } else {
    show('unlinked');
  }
});

// authenticate if signed out
dom.link.addEventListener('click', function () {
  show('loading');
  client.authenticate(function (error, clien) {
    if (error) { return handleError(error); }
    show('linked');
  });
});

// sign out if authenticated
dom.unlink.addEventListener('click', function () {
  show('loading');
  client.signOut(function (error) {
    if (error) { return handleError(error); }
    show('unlinked');
  });
});

