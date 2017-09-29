var weekdayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
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

function hourMinuteToLabel(hour, minute) {
  var amPM = 'am';
  if (hour > 12) {
    hour = hour - 12;
    amPM = 'pm';
  }
  if (hour === 0) {
    hour = 12;
  }
  return hour + ':' + minute + amPM;
}
