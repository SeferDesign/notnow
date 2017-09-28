var blockItems = [
  {
    domain: 'facebook.com',
    blockType: 'single',
    blockEndTime: 1506619621000 // past
  },
  {
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
        blockEndHour: 16,
        blockEndMinute: 40
      }
    ]
  }
];

function extractHostname(url) {
  var hostname;
  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }
  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];
  hostname = hostname.replace('www.', '');
  return hostname;
}

function testIfBlockIsActive(url) {
  chrome.storage.sync.get('blockItems', function(result) {
    if (result.blockItems) {
      var blockItems = result.blockItems;
      for (var i = 0; i < blockItems.length; i++) {
        if (isActiveDomain(blockItems[i], url) && isCurrentlyBlocked(blockItems[i])) {
          displayModal();
          break;
        }
      }
    }
  });
}

function isCurrentlyBlocked(item) {
  if (item.blockType == 'single') {
    if (Math.floor(Date.now()) <= item.blockEndTime) {
      return true;
    }
  } else { // 'regular'
    for (var i = 0; i < item.blockTimeCriteria.length; i++) {
      var c = item.blockTimeCriteria[i];
      var now = new Date();
      if (c.dayOfWeek == now.getDay()) {
        var dateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), c.blockStartHour, c.blockStartMinute, 0, 0);
        var dateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), c.blockEndHour, c.blockEndMinute, 0, 0);
        if (dateStart <= now && dateEnd > now) {
          return true;
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

function displayModal() {
  var div  = document.createElement('div');
  var xhttp = new XMLHttpRequest();
  xhttp.open('GET', chrome.extension.getURL('../html/blocked.html'), true);
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
    }
  };
  xhttp.send();
}

window.onload = function() {
  testIfBlockIsActive(window.location.href);
};
