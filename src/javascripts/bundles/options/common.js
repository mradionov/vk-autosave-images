'use strict';

function CommonView() {
  this.initialize();
}

CommonView.prototype.initialize = function () {

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

  var $datePrefix = document.querySelector('#option-date-prefix'),
      $groupByAuthor = document.querySelector('#option-group-by-author');

  // retrive options from storage and update elements state
  chrome.storage.sync.get({
    datePrefix: false,
    groupByAuthor: false
  }, function (options) {
    $datePrefix.checked = options.datePrefix;
    $groupByAuthor.checked = options.groupByAuthor;
  });

  $datePrefix.addEventListener('change', function () {
    chrome.storage.sync.set({ datePrefix: this.checked }, function () {
      addMessage('success', '✓ Настройки сохранены');
    });
  });

  $groupByAuthor.addEventListener('change', function () {
    chrome.storage.sync.set({ groupByAuthor: this.checked }, function () {
      addMessage('success', '✓ Настройки сохранены');
    });
  });
};

module.exports = CommonView;