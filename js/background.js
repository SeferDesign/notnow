chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.type == 'settings') {
    chrome.runtime.openOptionsPage();
	}
});

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == 'install') {
    chrome.runtime.sendMessage({ type: 'settings' });
	}
});
