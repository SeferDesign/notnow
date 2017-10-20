var weekdayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

var weekdayAbbreviations = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

var blockImages = {
  'kanye': 'kanye.webp',
  'bernie': 'bernie.webp',
  'oprah': 'oprah.webp',
  'hill': 'hill.webp',
  'tswift': 'tswift.webp'
};

var pauseTimes = [
  {
    time: 1 * 60 * 1000,
    label: '1 minute'
  },
  {
    time: 5 * 60 * 1000,
    label: '5 minutes'
  },
  {
    time: 15 * 60 * 1000,
    label: '15 minutes'
  },
  {
    time: 60 * 60 * 1000,
    label: '1 hour'
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

function formatAMPM(date, removeSpace) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes;
  if (!removeSpace) {
    strTime += ' ';
  }
  strTime += ampm;
  return strTime;
}

function hourMinuteFromTime(time) {
  var segments = time.match(/(\d+)(?::(\d\d))?\s*(p?)/);
  var hour = segments[1];
  if (segments[3].length < 1 || segments[3] == 'a') {
    if (hour == '12') {
      hour = 0;
    }
  } else if (segments[3] == 'p') {
    hour = parseInt(hour) + 12;
  }
  return {
    hour: parseInt(hour),
    minute: parseInt(segments[2])
  };
}

function hourMinuteToLabel(hour, minute) {
  var amPM = 'am';
  if (hour > 12) {
    hour = hour - 12;
    amPM = 'pm';
  }
  if (hour === 0) {
    hour = 12;
  }
  if (minute === 0) {
    minute = '00';
  }
  return hour + ':' + minute + amPM;
}

function addNewBlockItem(options, existingID) {
  chrome.storage.sync.get('blockItems', function(result) {
    if (result.blockItems) {
      var now = new Date();
      var blockItemsG = result.blockItems;
      var blockItemsNew = result.blockItems;
      var newID = '';
      if (existingID) {
        blockItemsNew = blockItemsG.filter(function(el) {
          return el.id !== existingID;
        });
        newID = existingID;
      } else {
        newID = now.getTime();
      }

      var newBlockItem = {
        id: newID,
        domain: options.domain
      };

      var newTypeRaw = options.blockTypeRaw;
      var newType = '';
      var singleTime = '';
      if (newTypeRaw == '30' || newTypeRaw == '60' || newTypeRaw == 'day') {
        newBlockItem.blockType = 'single';
        if (newTypeRaw == '30') {
          singleTime = now.getTime() + (0.5 * 3600 * 1000);
        } else if (newTypeRaw == '60') {
          singleTime = now.getTime() + (1.0 * 3600 * 1000);
        } else if (newTypeRaw == 'day') {
          var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
          singleTime = tomorrow.getTime();
        }
        newBlockItem.blockEndTime = singleTime;
      } else if (newTypeRaw == 'always') {
        newBlockItem.blockType = 'always';
      } else if (newTypeRaw == 'regular') {
        newBlockItem.blockTimeCriteria = options.blockTimeCriteria;
        newBlockItem.blockType = 'regular';
      }
      blockItemsNew.push(newBlockItem);
      chrome.storage.sync.set({ blockItems: blockItemsNew }, function() {});
    }
  });

}

function getParameters() {
  var prmstr = window.location.search.substr(1);
  return prmstr !== null && prmstr !== '' ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray(prmstr) {
  var params = {};
  var prmarr = prmstr.split('&');
  for (var i = 0; i < prmarr.length; i++) {
    var tmparr = prmarr[i].split('=');
    params[tmparr[0]] = tmparr[1];
  }
  return params;
}

var defaultSettings = {
  blockImage: 'random',
  pauseTime: 5 * 60 * 1000, // 5 minutes
};

function checkSettings(given) {
  var newSettings = given;
  if (!newSettings) {
    newSettings = defaultSettings;
  } else {
    if (!given.pauseTime) {
      newSettings.pauseTime = defaultSettings.pauseTime;
    }
    if (!given.blockImage) {
      newSettings.blockImage = defaultSettings.blockImage;
    }
  }
  return newSettings;
}
