'use strict';

var dom = {
  loading: document.querySelector('#loading'),
  linked: document.querySelector('.linked'),
  unlinked: document.querySelector('.unlinked'),
  link: document.querySelector('.link'),
  unlink: document.querySelector('.unlink')
};

var messages = document.querySelector('#messages');

// draw notification message
function addMessage(type, text) {
  var message = document.createElement('div');
  message.appendChild(document.createTextNode(text));
  message.classList.add(type);
  messages.appendChild(message);
  // hide message in 1 second
  setTimeout(function () {
    messages.removeChild(message);
  }, 1000);
}

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

// try to authenticate using stored credentials
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

function asArray(arraylike) {
  return Array.prototype.slice.call(arraylike);
}

function removeClass(els, className) {
  asArray(els).forEach(function (el) {
    el.classList.remove(className);
  });
}

var tabs = document.querySelectorAll('.tab');
var menu = document.querySelector('#menu ul');
var items = menu.children;

menu.addEventListener('click', function (e) {
  if (!e.target.classList.contains('menu-item') ||
      e.target.classList.contains('active')
  ) {
    return true;
  }
  var index = asArray(items).indexOf(e.target);
  if (index === -1) {
    return true;
  }

  removeClass(tabs, 'active');
  removeClass(items, 'active');

  tabs[index].classList.add('active');
  items[index].classList.add('active');
});

document.addEventListener('DOMContentLoaded', restoreOptions);
var optionDatePrefix = document.querySelector('#option-date-prefix'),
    optionGroupByAuthor = document.querySelector('#option-group-by-author');

function restoreOptions() {
  chrome.storage.sync.get({
    datePrefix: false,
    groupByAuthor: false
  }, function (options) {
    optionDatePrefix.checked = options.datePrefix;
    optionGroupByAuthor.checked = options.groupByAuthor;
  });
}

optionDatePrefix.addEventListener('change', function (e) {
  chrome.storage.sync.set({ datePrefix: this.checked }, function () {
    addMessage('success', '✓ Настройки сохранены');
  });
});

optionGroupByAuthor.addEventListener('change', function (e) {
  chrome.storage.sync.set({ groupByAuthor: this.checked }, function () {
    addMessage('success', '✓ Настройки сохранены');
  });
});
