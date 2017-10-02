window.onload = function() {

  var addSiteButton = document.getElementById('not-now-add-this-site-button');
  addSiteButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var currentSiteDomain = extractHostname(tabs[0].url);
      document.getElementsByClassName('add-this-site-label')[0].innerHTML = currentSiteDomain;
      if (currentSiteDomain.length > 18) {
        document.getElementsByClassName('add-this-site-label')[0].className += ' long-domain';
      }
      document.getElementsByClassName('not-now-popup')[0].className += ' adding';

      if (currentSiteDomain.length > 0) {
        document.getElementById('not-now-button-add-30').addEventListener('click', function() {
          addNewBlockItem({
            domain: currentSiteDomain,
            blockTypeRaw: '30'
          });
          chrome.runtime.sendMessage({ type: 'reloadActive' });
          window.close();
        });
        document.getElementById('not-now-button-add-60').addEventListener('click', function() {
          addNewBlockItem({
            domain: currentSiteDomain,
            blockTypeRaw: '60'
          });
          chrome.runtime.sendMessage({ type: 'reloadActive' });
          window.close();
        });
        document.getElementById('not-now-button-add-day').addEventListener('click', function() {
          addNewBlockItem({
            domain: currentSiteDomain,
            blockTypeRaw: 'day'
          });
          chrome.runtime.sendMessage({ type: 'reloadActive' });
          window.close();
        });
        document.getElementById('not-now-button-add-always').addEventListener('click', function() {
          addNewBlockItem({
            domain: currentSiteDomain,
            blockTypeRaw: 'always'
          });
          chrome.runtime.sendMessage({ type: 'reloadActive' });
          window.close();
        });
        document.getElementById('not-now-button-add-regular').addEventListener('click', function() {
          chrome.runtime.sendMessage({ type: 'settings', params: '?newBlock=true&domain=' + currentSiteDomain });
          window.close();
        });
      }
    });
  });

  var settingsButton = document.getElementById('not-now-settings-button');
  settingsButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({ type: 'settings' });
  });

};
