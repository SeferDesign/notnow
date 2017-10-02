chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.type == 'settings') {
    //chrome.runtime.openOptionsPage();
    var params = '';
    if (request.params && request.params.length > 0) {
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
    chrome.storage.sync.get('blockItems', function(result) {
      if (!result || result.length < 1) {
        chrome.storage.sync.set({ blockItems: [] }, function() {});
      }
    });
    chrome.runtime.sendMessage({ type: 'settings' });
	}
});

chrome.runtime.onStartup.addListener(function() {
  chrome.storage.sync.get('blockItems', function(result) {
    if (!result || result.length < 1) {
      chrome.storage.sync.set({ blockItems: [] }, function() {});
    }
  });
});
