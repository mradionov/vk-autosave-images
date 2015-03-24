// listen to content script, it will send a message when it is not able to
// connect to dropbox, show notification then
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  switch(request.action) {
  case 'showNotification':
    chrome.pageAction.show(sender.tab.id);
    break;
  }
});

var optionsUrl = chrome.extension.getURL('templates/options.html');

// open options page in a new tab or open already existing options tab
function openOptionsPage() {
  chrome.tabs.query({ url: optionsUrl }, function (tabs) {
    if (tabs.length) {
      chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      chrome.tabs.create({ url: optionsUrl });
    }
  });
}

// open options page on click on page action icon
chrome.pageAction.onClicked.addListener(function () {
  openOptionsPage();
});

// open options page when extension is installed
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    openOptionsPage();
  }
});