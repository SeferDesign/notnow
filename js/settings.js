var blockItemsG = null;

document.addEventListener('DOMContentLoaded', function() {
  var params = getParameters();
  if (params && params.newBlock == 'true' && params.domain && params.domain.length > 0) {
    displayNewBlockItemForm(params.domain);
  }
  document.getElementById('not-now-add-new-button').addEventListener('click', function() {
    displayNewBlockItemForm('');
  });
  chrome.storage.sync.get('blockItems', function(result) {
    var blockItemsWrap = document.getElementById('not-now-block-items');
    if (result.blockItems && result.blockItems.length > 0) {
      var blockItems = result.blockItems;
      var blockItemsG = result.blockItems;
      for (var i = 0; i < blockItems.length; i++) {
        let form = document.createElement('form');
        form.className += 'not-now-block-item';
        form.setAttribute('data-item-id', blockItems[i].id);
        var blockItemContent = '';
        blockItemContent += '<div class="not-now-block-item-buttons">';
        blockItemContent += '<button type="submit" class="not-now-button not-now-button-save" title="Save">Save</button><button class="not-now-button not-now-button-edit" title="Edit">Edit</button>';
        blockItemContent += '<button class="not-now-button alt not-now-button-delete" title="Delete">&times;</button></div>';
        blockItemContent += '<input type="text" class="not-now-block-item-domain" value="' + blockItems[i].domain + '" disabled="true" required="required" placeholder="site.com">';
        blockItemContent += '<div class="not-now-block-item-type">';
        if (blockItems[i].blockType == 'always') {
          blockItemContent += 'Always blocked';
        } else if (blockItems[i].blockType == 'single') {
          blockItemContent += 'Blocked until ' + formatAMPM(new Date(blockItems[i].blockEndTime));
        } else if (blockItems[i].blockType == 'regular') {
          if (blockItems[i].blockTimeCriteria && blockItems[i].blockTimeCriteria.length > 0) {
            blockItemContent += 'Blocked';
            for (var b = 0; b < blockItems[i].blockTimeCriteria.length; b++) {
              if (b > 0) {
                blockItemContent += ', ';
              }
              if (blockItems[i].blockTimeCriteria[b].blockStartHour === 0 && blockItems[i].blockTimeCriteria[b].blockStartHour === 0 && blockItems[i].blockTimeCriteria[b].blockEndHour == 23 && blockItems[i].blockTimeCriteria[b].blockEndMinute) {
                blockItemContent += 'all day ' + weekdayNames[blockItems[i].blockTimeCriteria[b].dayOfWeek];
              } else {
                blockItemContent += weekdayNames[blockItems[i].blockTimeCriteria[b].dayOfWeek] + ' ';
                blockItemContent += hourMinuteToLabel(blockItems[i].blockTimeCriteria[b].blockStartHour, blockItems[i].blockTimeCriteria[b].blockStartMinute) + ' to ' + hourMinuteToLabel(blockItems[i].blockTimeCriteria[b].blockEndHour, blockItems[i].blockTimeCriteria[b].blockEndMinute);
              }
            }
          } else {
            blockItemContent += 'Not currently blocked.';
          }
        }
        blockItemContent += '</div>';
        var existingCriteria = null;
        if (blockItems[i].blockTimeCriteria) {
          existingCriteria = blockItems[i].blockTimeCriteria;
        }
        blockItemContent += blockItemFormMarkup(blockItems[i].blockType, existingCriteria);
        form.innerHTML = blockItemContent;
        if (blockItems[i].blockType == 'regular') {
          form.className += ' schedule-active';
        }
        var allDayChecks = form.getElementsByClassName('all-day-check');
        for (var c = 0; c < allDayChecks.length; c++) {
          allDayChecks[c].addEventListener('click', function() {
            var selects = this.parentElement.parentElement.getElementsByClassName('time');
            var newStatus = false;
            if (this.checked) {
              newStatus = true;
            }
            for (var s = 0; s < selects.length; s++) {
              selects[s].disabled = newStatus;
            }
          });
        }
        blockItemsWrap.appendChild(form);
        setTypeSelect(form);
        setShortcutButtons(form);
        form.getElementsByClassName('not-now-button-edit')[0].addEventListener('click', function(e) {
          e.preventDefault();
          document.getElementsByClassName('new-block-item-form-wrap')[0].innerHTML = '';
          var activeID = form.dataset.itemId;
          form.className += ' editing';
          form.getElementsByClassName('not-now-block-item-domain')[0].disabled = false;
        });
        setSaveButton(form, form.getElementsByClassName('not-now-button-save')[0]);
        form.getElementsByClassName('not-now-button-delete')[0].addEventListener('click', function() {
          var deleteID = parseInt(this.parentElement.parentElement.dataset.itemId);
          blockItemsNew = blockItemsG.filter(function(el) {
            return el.id !== deleteID;
          });
          chrome.storage.sync.set({ blockItems: blockItemsNew }, function() {});
          location.reload();
        });
      }
    } else {
      blockItemsWrap.innerHTML = '<p>No sites currently blocked.</p>';
    }
  });
});

function setTypeSelect(form) {
  form.getElementsByClassName('block-type-select')[0].addEventListener('change', function() {
    if (this.value != 'regular') {
      form.classList.remove('schedule-active');
    } else {
      form.className += ' schedule-active';
    }
  });
}

function setShortcutButtons(form) {
  form.getElementsByClassName('shortcut-weekdays-9-5')[0].addEventListener('click', function(e) {
    e.preventDefault();
    var days = form.getElementsByClassName('schedule-day');
    for (var d = 0; d < days.length; d++) {
      var day = form.getElementsByClassName('schedule-day')[d];
      day.getElementsByClassName('all-day-check')[0].checked = false;
      var selects = day.getElementsByClassName('time');
      for (var s = 0; s < selects.length; s++) {
        selects[s].disabled = false;
        selects[s].value = '';
      }
      if (d >= 1 && d <= 5) {
        selects[0].value = '9:00am';
        selects[1].value = '5:00pm';
      }
    }
  });
  form.getElementsByClassName('shortcut-weekdays')[0].addEventListener('click', function(e) {
    e.preventDefault();
    var days = form.getElementsByClassName('schedule-day');
    for (var d = 0; d < days.length; d++) {
      var day = form.getElementsByClassName('schedule-day')[d];
      day.getElementsByClassName('all-day-check')[0].checked = false;
      var selects = day.getElementsByClassName('time');
      for (var s = 0; s < selects.length; s++) {
        selects[s].disabled = false;
        selects[s].value = '';
      }
      if (d >= 1 && d <= 5) {
        day.getElementsByClassName('all-day-check')[0].checked = true;
        selects[0].value = '';
        selects[0].disabled = true;
        selects[1].value = '';
        selects[1].disabled = true;
      }
    }
  });
  form.getElementsByClassName('shortcut-weekends')[0].addEventListener('click', function(e) {
    e.preventDefault();
    var days = form.getElementsByClassName('schedule-day');
    for (var d = 0; d < days.length; d++) {
      var day = form.getElementsByClassName('schedule-day')[d];
      day.getElementsByClassName('all-day-check')[0].checked = false;
      var selects = day.getElementsByClassName('time');
      for (var s = 0; s < selects.length; s++) {
        selects[s].disabled = false;
        selects[s].value = '';
      }
      if (d === 0 || d == 6) {
        day.getElementsByClassName('all-day-check')[0].checked = true;
        selects[0].value = '';
        selects[0].disabled = true;
        selects[1].value = '';
        selects[1].disabled = true;
      }
    }
  });
}

function setSaveButton(form, button) {
  button.addEventListener('click', function(e) {
    e.preventDefault();
    var newHost = extractHostname(form.getElementsByClassName('not-now-block-item-domain')[0].value);
    var typeSelection = form.getElementsByClassName('block-type-select')[0];
    if (newHost.length > 0) {
      var object = {
        domain: newHost,
        blockTypeRaw: typeSelection.options[typeSelection.selectedIndex].value
      };
      if (typeSelection.options[typeSelection.selectedIndex].value == 'regular') {
        object.blockTimeCriteria = [];
        var days = form.getElementsByClassName('schedule-day');
        for (var d = 0; d < days.length; d++) {
          var allDayStatus = false;
          if (days[d].getElementsByClassName('all-day-check')[0].checked) {
            object.blockTimeCriteria.push({
              dayOfWeek: parseInt(days[d].dataset.dayId),
              blockStartHour: 0,
              blockStartMinute: 0,
              blockEndHour: 23,
              blockEndMinute: 59
            });
          } else {
            var selects = days[d].getElementsByClassName('time');
            var startTime = selects[0].value;
            var endTime = selects[1].value;
            if (startTime == endTime) {
              // do nothing
            } else {
              var startSegments = hourMinuteFromTime(startTime);
              var endSegments = hourMinuteFromTime(endTime);
              object.blockTimeCriteria.push({
                dayOfWeek: parseInt(days[d].dataset.dayId),
                blockStartHour: startSegments.hour,
                blockStartMinute: startSegments.minute,
                blockEndHour: endSegments.hour,
                blockEndMinute: endSegments.minute
              });
            }
          }
        }
        addNewBlockItem(object, parseInt(form.dataset.itemId));
        window.location = window.location.pathname;
      } else {
        addNewBlockItem(object, parseInt(form.dataset.itemId));
        window.location = window.location.pathname;
      }
    } else {
      form.getElementsByClassName('not-now-block-item-domain')[0].className += ' missing';
    }
  });
}

function displayNewBlockItemForm(domain) {
  var newFormWrap = document.getElementById('new-block-item-form-wrap');
  var content = '<form class="not-now-block-item editing schedule-active">';
  content += '<h3>Block New Site</h3>';
  content += '<div class="not-now-block-item-buttons"><button type="submit" class="not-now-button not-now-button-save" title="Save">Save</button></div>';
  content += '<input type="text" class="not-now-block-item-domain" value="' + domain + '" required="required" placeholder="site.com"';
  if (domain.length < 1) {
    content += 'autofocus';
  }
  content += '>';
  content += blockItemFormMarkup('regular');
  content += '</form>';
  newFormWrap.innerHTML = content;
  var allDayChecks = newFormWrap.getElementsByClassName('all-day-check');
  for (var i = 0; i < allDayChecks.length; i++) {
    allDayChecks[i].addEventListener('click', function() {
      var selects = this.parentElement.parentElement.getElementsByClassName('time');
      var newStatus = false;
      if (this.checked) {
        newStatus = true;
      }
      for (var s = 0; s < selects.length; s++) {
        selects[s].disabled = newStatus;
      }
    });
  }
  var form = newFormWrap.getElementsByClassName('not-now-block-item')[0];
  setTypeSelect(form);
  setShortcutButtons(form);
  setSaveButton(form, newFormWrap.getElementsByClassName('not-now-button-save')[0]);
}

function blockItemFormMarkup(existingBlockType, existingCriteria) {
  var content = '';
  content += '<div class="form-wrap">';
  content += '<label for="block-type-select"><div class="block-type-label-inner">Block this site:</div>';
  content += '<select id="block-type" class="block-type-select" name="block-type-select">';
    content += '<optgroup label="Temporarily">';
      content += '<option name="single-30" value="30">for the next half hour</option>';
      content += '<option name="single-60" value="60">for the next hour</option>';
      content += '<option name="single-day" value="day">for the rest of today</option>';
    content += '</optgroup>';
    content += '<optgroup label="Regularly">';
    content += '<option name="regular" value="regular"';
      if (existingBlockType == 'regular') { content += ' selected'; }
    content += '>on a schedule</option>';
      content += '<option name="always" value="always"';
        if (existingBlockType == 'always') { content += ' selected'; }
      content += '>always</option>';
    content += '</optgroup>';
  content += '</select>';
  content += '</label>';
  content += '<div class="schedule-wrap">';
    content += '<p class="schedule-shortcuts">Shortcuts: <a class="shortcut-weekdays" href="#">Weekdays</a> &bull; <a class="shortcut-weekdays-9-5" href="#">Weekdays 9-5</a> &bull; <a class="shortcut-weekends" href="#">Weekends</a></p>';
    content += '<div class="schedule">';
      content += '<div class="left-col"><div class="schedule-day-label">&nbsp;</div><div class="all-day">All Day</div><div class="start">Start</div><div class="end">End</div></div>';
      for (var s = 0; s < 7; s++) {
        var eSH, eSM, eEH, eEM;
        if (existingCriteria) {
          var found = existingCriteria.find(function(x) {
            return x.dayOfWeek === s;
          });
          if (found) {
            eSH = found.blockStartHour;
            eSM = found.blockStartMinute;
            eEH = found.blockEndHour;
            eEM = found.blockEndMinute;
            content += scheduleDay(s, eSH, eSM, eEH, eEM);
          } else {
            content += scheduleDay(s);
          }
        } else {
          content += scheduleDay(s);
        }

      }
    content += '</div>';
  content += '</div>';
  content += '</div>';
  return content;
}

function scheduleDay(dayNumber, existingStartHour, existingStartMinute, existingEndHour, existingEndMinute) {
  var content = '<div class="schedule-day" data-day-id="' + dayNumber + '">';
    content += '<div class="schedule-day-label">' + weekdayAbbreviations[dayNumber] + '</div>';
    var isAllDay = false;
    if (existingStartHour === 0 && existingStartMinute === 0 && existingEndHour == 23 && existingEndMinute == 59) {
      isAllDay = true;
    }
    content += '<div class="all-day"><input type="checkbox" name="all-day" class="all-day-check"';
    if (isAllDay) {
      content += ' checked';
    }
    content += '></div>';

    content += '<div class="start">';
    if (existingStartHour >= 0 && existingStartHour <= 23) {
      content += timeSelect(formatAMPM(new Date(0, 0, 0, existingStartHour, existingStartMinute), true), isAllDay);
    } else {
      content += timeSelect();
    }
    content += '</div>';
    content += '<div class="end">';
    if (existingEndHour >= 0 && existingEndHour <= 23) {
      content += timeSelect(formatAMPM(new Date(0, 0, 0, existingEndHour, existingEndMinute), true), isAllDay);
    } else {
      content += timeSelect();
    }
    content += '</div>';
  content += '</div>';
  return content;
}

function timeSelect(selected, isAllDay) {
  var content = '<select name="time" class="time"';
  if (isAllDay) {
    content += ' disabled="disabled"';
  }
  content += '>';
  content += '<option></option>';
  for (var ap = 0; ap < 2; ap++) {
    var ampm = 'am';
    if (ap == 1) {
      ampm = 'pm';
    }
    for (var h = 0; h < 12; h++) {
      var displayH = h;
      if (h === 0) {
        displayH = '12';
      }
      for (var m = 0; m < 4; m++) {
        var displayM;
        if (m === 0) {
          displayM = '00';
        } else if (m == 1) {
          displayM = '15';
        } else if (m == 2) {
          displayM = '30';
        } else if (m == 3) {
          displayM = '45';
        }
        var fullDisplay = displayH + ':' + displayM + ampm;
        content += '<option';
        if (!isAllDay && selected && fullDisplay == selected) {
          content += ' selected';
        }
        content += '>' + fullDisplay + '</option>';
      }
    }
  }
  content += '</select>';
  return content;
}
