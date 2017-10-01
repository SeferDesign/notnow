var blockItems = [
  {
    id: 1,
    domain: 'facebook.com',
    blockType: 'single',
    blockEndTime: 1506619621000 // past
  },
  {
    id: 2,
    domain: 'espn.com',
    blockType: 'always'
  },
  {
    id: 3,
    domain: 'rsefer.com',
    blockType: 'regular',
    blockTimeCriteria: [
      {
        dayOfWeek: 0, // sunday
        blockStartHour: 0,
        blockStartMinute: 0,
        blockEndHour: 10,
        blockEndMinute: 0
      },
      {
        dayOfWeek: 4, // thursday
        blockStartHour: 11,
        blockStartMinute: 30,
        blockEndHour: 22,
        blockEndMinute: 40
      }
    ]
  }
];

function testIfBlockIsActive(url) {
  chrome.storage.sync.get('blockItems', function(result) {
    if (result.blockItems) {
      var blockItems = result.blockItems;
      for (var i = 0; i < blockItems.length; i++) {
        var isCurrentlyBlockedReturn = isCurrentlyBlocked(blockItems[i]);
        if (isActiveDomain(blockItems[i], url) && isCurrentlyBlockedReturn) {
          displayModal(isCurrentlyBlockedReturn);
          break;
        }
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
      document.body.className = '';
      document.body.innerHTML = '';

      var blockedCriteriaEl = document.getElementById('not-now-blocked-criteria-message');

      var criteriaMessage = criteria.domain + ' is blocked';
      var now = new Date();
      if (criteria.blockType == 'regular') {
        var timeStart = hourMinuteToLabel(criteria.criteria.blockStartHour, criteria.criteria.blockStartMinute);
        var timeEnd = hourMinuteToLabel(criteria.criteria.blockEndHour, criteria.criteria.blockEndMinute);
        criteriaMessage += ' every ' + weekdayNames[now.getDay()] + ' from ' + timeStart + ' to ' + timeEnd + '.';
      } else if (criteria.blockType == 'single') {
        criteriaMessage += ' until ' + formatAMPM(new Date(criteria.blockEndTime)) + '.';
      } else if (criteria.blockType == 'always') {
        criteriaMessage += ' at all times.';
      }
      blockedCriteriaEl.innerHTML = criteriaMessage;
      console.log(criteria);

      var settingsButton = document.getElementById('not-now-settings-button');
      settingsButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({ type: 'settings' });
      });
    }
  };
  xhttp.send();
}

window.onload = function() {

  //chrome.storage.sync.set({ blockItems: blockItems }, function(result) {});

  testIfBlockIsActive(window.location.href);
};
