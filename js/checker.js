function testIfBlockIsActive(url) {
  chrome.storage.sync.get(null, function(result) {
    var now = new Date();
    if (!result.pauseTime || result.pauseTime.length < 1 || result.pauseTime < now.getTime()) {
      if (result.blockItems) {
        var blockItems = result.blockItems;
        for (var i = 0; i < blockItems.length; i++) {
          var isCurrentlyBlockedReturn = isCurrentlyBlocked(blockItems[i]);
          if (isActiveDomain(blockItems[i], url) && isCurrentlyBlockedReturn) {
            displayModal(isCurrentlyBlockedReturn);
            break;
          }
        }
      } else {
        chrome.storage.sync.set({ blockItems: [], pauseTime: '' }, function() {});
      }
    }
  });
}

function isCurrentlyBlocked(item) {
  if (item.blockType == 'always') {
    return {
      blocked: true,
      blockType: 'always',
      domain: item.domain
    };
  } else if (item.blockType == 'single') {
    if (Math.floor(Date.now()) <= item.blockEndTime) {
      return {
        blocked: true,
        blockType: 'single',
        blockEndTime: item.blockEndTime,
        domain: item.domain
      };
    }
  } else { // 'regular'
    for (var i = 0; i < item.blockTimeCriteria.length; i++) {
      var c = item.blockTimeCriteria[i];
      var now = new Date();
      if (c.dayOfWeek == now.getDay()) {
        var dateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), c.blockStartHour, c.blockStartMinute, 0, 0);
        var dateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), c.blockEndHour, c.blockEndMinute, 0, 0);
        if (dateStart <= now && dateEnd > now) {
          return {
            blocked: true,
            blockType: 'regular',
            domain: item.domain,
            criteria: c
          };
        }
      }
    }
  }
  return false;
}

function isActiveDomain(blockItem, url) {
  if (blockItem.domain == extractHostname(url)) {
    return true;
  } else {
    return false;
  }
}

function displayModal(criteria) {
  var div = document.createElement('div');
  var xhttp = new XMLHttpRequest();
  xhttp.open('GET', chrome.extension.getURL('../pages/blocked.html'), true);
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == XMLHttpRequest.DONE && xhttp.status == 200) {
      var style = document.createElement('link');
      style.rel = 'stylesheet';
      style.type = 'text/css';
      style.href = chrome.extension.getURL('../css/style.css');
      document.documentElement.appendChild(style);

      div.innerHTML = xhttp.responseText;
      document.documentElement.appendChild(div);
      var img = document.getElementsByClassName('not-now-image');
      img[0].src = chrome.extension.getURL('../img/sanders-no.gif');

      document.head.innerHTML = '';
      document.head.innerHTML = '<title>Blocked</title>';
      document.body.className = '';
      document.body.innerHTML = '';

      var blockedCriteriaEl = document.getElementById('not-now-blocked-criteria-message');

      var criteriaMessage = criteria.domain + ' is blocked';
      var now = new Date();
      if (criteria.blockType == 'regular') {
        if (criteria.criteria.blockStartHour === 0 && criteria.criteria.blockStartMinute === 0 && criteria.criteria.blockEndHour == 23 && criteria.criteria.blockEndMinute == 59) {
          criteriaMessage += ' all day every ' + weekdayNames[now.getDay()] + '.';
        } else {
          var timeStart = hourMinuteToLabel(criteria.criteria.blockStartHour, criteria.criteria.blockStartMinute);
          var timeEnd = hourMinuteToLabel(criteria.criteria.blockEndHour, criteria.criteria.blockEndMinute);
          criteriaMessage += ' every ' + weekdayNames[now.getDay()] + ' from ' + timeStart + ' to ' + timeEnd + '.';
        }
      } else if (criteria.blockType == 'single') {
        criteriaMessage += ' until ' + formatAMPM(new Date(criteria.blockEndTime)) + '.';
      } else if (criteria.blockType == 'always') {
        criteriaMessage += ' at all times.';
      }
      blockedCriteriaEl.innerHTML = criteriaMessage;

      var pauseButton = document.getElementById('not-now-pause-button');
      pauseButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({ type: 'pause' });
        location.reload();
      });

      var settingsButton = document.getElementById('not-now-settings-button');
      settingsButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({ type: 'settings' });
      });
    }
  };
  xhttp.send();
}

window.onload = function() {
  testIfBlockIsActive(window.location.href);
};
