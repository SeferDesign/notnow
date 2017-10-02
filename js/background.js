chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.type == 'settings') {
    chrome.runtime.openOptionsPage();
	} else if (request.type == 'reloadActive') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.reload(tabs[0].id);
    });
  }
});

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == 'install') {
    chrome.runtime.sendMessage({ type: 'settings' });
	}
});
