chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.type == 'settings') {
    chrome.tabs.create({ url: '../pages/settings.html' });
	}
});
