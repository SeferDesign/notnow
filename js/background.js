chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.type == 'settings') {
    //chrome.runtime.openOptionsPage();
    var params = '';
    if (request.params) {
      params = request.params;
    }
    window.open(chrome.runtime.getURL('pages/settings.html') + params);
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
