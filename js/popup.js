window.onload = function() {
  var settingsButton = document.getElementById('not-now-settings-button');
  settingsButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({ type: 'settings' });
  });
};
