window.onload = function() {

  var addSiteButton = document.getElementById('not-now-add-this-site-button');
  addSiteButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var activeTab = tabs[0];
      var activeTabId = activeTab.id;
      console.log(activeTab);
      var currentSiteDomain = extractHostname(activeTab.url);
      document.getElementsByClassName('add-this-site-label')[0].innerHTML = currentSiteDomain;
      document.getElementsByClassName('not-now-popup')[0].className += ' adding';
  });

  });


  var settingsButton = document.getElementById('not-now-settings-button');
  settingsButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({ type: 'settings' });
  });

};
