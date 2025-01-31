chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.type == 'settings') {
    //chrome.runtime.openOptionsPage();
    var params = '';
    if (request.params && request.params.length > 0) {
      params = request.params;
    }
    window.open(chrome.runtime.getURL('pages/settings.html') + params);
  } else if (request.type == 'resetSettings') {
    resetSettings();
	} else if (request.type == 'reloadActive') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.reload(tabs[0].id);
    });
  } else if (request.type == 'pause') {
    chrome.storage.sync.get('settings', function(result) {
      var settings = result.settings;
      var now = new Date();
      chrome.storage.sync.set({ pauseTime: now.getTime() + settings.pauseTime }, function() {});
    });

  }
});

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == 'install') {
    resetStorage();
    testStorage();
    chrome.runtime.sendMessage({ type: 'settings' });
	} else if (details.reason == 'update') {
    testStorage();
  }
});

chrome.runtime.onStartup.addListener(function() {
  testStorage();
});

var cleanerAlarm = 'cleanerAlarm';

chrome.alarms.create(cleanerAlarm, {
  delayInMinutes: 1,
  periodInMinutes: 5
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === cleanerAlarm) {
    chrome.storage.sync.get('blockItems', function(result) {
      if (result.blockItems && result.blockItems.length > 0) {
        var blockItems = result.blockItems;
        var blockItemsNew = result.blockItems;
        for (var b = 0; b < result.blockItems.length; b++) {
          var now = new Date();
          if (result.blockItems[b].blockType == 'single' && result.blockItems[b].blockEndTime <= now.getTime()) {
            blockItemsNew = result.blockItems.filter(function(el) {
              return el.id !== result.blockItems[b].id;
            });
          }
        }
        chrome.storage.sync.set({ blockItems: blockItemsNew }, function() {});
      }
    });
  }
});

function testStorage() {
  chrome.storage.sync.get('blockItems', function(result) {
    if (result === null || typeof result == 'undefined' || !result || result.length < 1) {
      resetBlockItems();
    }
  });
  chrome.storage.sync.get('pauseTime', function(result) {
    if (result === null || typeof result == 'undefined' || !result || result.length < 1) {
      resetPauseTime();
    }
  });
  chrome.storage.sync.get('settings', function(result) {
    if (result === null || typeof result == 'undefined' || !result || result.length < 1) {
      resetSettings();
    }
  });
}

function resetStorage() {
  resetBlockItems();
  resetSettings();
  resetPauseTime();
}

function resetBlockItems() {
  chrome.storage.sync.set({ blockItems: [] }, function() {});
}

function resetSettings() {
  chrome.storage.sync.set({ settings: defaultSettings }, function() {});
}

function resetPauseTime() {
  chrome.storage.sync.set({ pauseTime: '' }, function() {});
}
