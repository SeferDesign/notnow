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
        }
        blockItemContent += '</div>';
        blockItemContent += blockItemFormMarkup(blockItems[i].blockType);
        form.innerHTML = blockItemContent;
        blockItemsWrap.appendChild(form);
        form.getElementsByClassName('not-now-button-edit')[0].addEventListener('click', function(e) {
          e.preventDefault();
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

function setSaveButton(form, button) {
  button.addEventListener('click', function(e) {
    e.preventDefault();
    var newHost = extractHostname(form.getElementsByClassName('not-now-block-item-domain')[0].value);
    var typeSelection = form.getElementsByClassName('block-type-select')[0];
    if (newHost.length > 0) {
      addNewBlockItem({
        domain: newHost,
        blockTypeRaw: typeSelection.options[typeSelection.selectedIndex].value
      }, parseInt(form.dataset.itemId));
      window.location = window.location.pathname;
    } else {
      form.getElementsByClassName('not-now-block-item-domain')[0].className += ' missing';
    }
  });
}

function displayNewBlockItemForm(domain) {
  var newFormWrap = document.getElementById('new-block-item-form-wrap');
  var content = '<form class="not-now-block-item editing">';
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
  setSaveButton(newFormWrap.getElementsByClassName('not-now-block-item')[0], newFormWrap.getElementsByClassName('not-now-button-save')[0]);
}

function blockItemFormMarkup(existingBlockType) {
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
  content += '</div>';
  return content;
}
