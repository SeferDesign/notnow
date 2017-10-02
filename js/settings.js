var blockItemsG = null;

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get('blockItems', function(result) {
    if (result.blockItems) {
      console.log(result.blockItems);
      var blockItems = result.blockItems;
      var blockItemsG = result.blockItems;
      var blockItemsWrap = document.getElementById('not-now-block-items');
      for (var i = 0; i < blockItems.length; i++) {
        let form = document.createElement('form');
        form.className += 'not-now-block-item';
        form.setAttribute('data-item-id', blockItems[i].id);
        var blockItemContent = '';
        blockItemContent += '<div class="not-now-block-item-buttons">';
        blockItemContent += '<button type="submit" class="not-now-button not-now-button-save" title="Save">Save</button><button class="not-now-button not-now-button-edit" title="Edit">Edit</button>';
        blockItemContent += '<button class="not-now-button alt not-now-button-delete" title="Delete">&times;</button></div>';
        blockItemContent += '<input type="text" class="not-now-block-item-domain" value="' + blockItems[i].domain + '" disabled="true" required="required" placeholder="site.com">';
        blockItemContent += '<div class="not-now-block-item-type">' + blockItems[i].blockType + '</div>';
        if (blockItems[i].blockType == 'single') {
          blockItemContent += '<div>until ' + formatAMPM(new Date(blockItems[i].blockEndTime)) + '</div>';
        }
        blockItemContent += '<div class="form-wrap">';
        /*if (existing) {
          blockItemContent += '<input type="hidden" id="block-item-id" name="block-item-id" value="" />';
        }*/
        blockItemContent += '<label for="block-type-select"><div class="block-type-label-inner">Block this site:</div>';
        blockItemContent += '<select id="block-type" class="block-type-select" name="block-type-select">';
          blockItemContent += '<optgroup label="Temporarily">';
            blockItemContent += '<option name="single-30" value="30">for the next half hour</option>';
            blockItemContent += '<option name="single-60" value="60">for the next hour</option>';
            blockItemContent += '<option name="single-day" value="day">for the rest of today</option>';
          blockItemContent += '</optgroup>';
          blockItemContent += '<optgroup label="Regularly">';
          blockItemContent += '<option name="regular" value="regular"';
            if (blockItems[i].blockType == 'regular') { blockItemContent += ' selected'; }
          blockItemContent += '>on a schedule</option>';
            blockItemContent += '<option name="always" value="always"';
              if (blockItems[i].blockType == 'always') { blockItemContent += ' selected'; }
            blockItemContent += '>always</option>';
          blockItemContent += '</optgroup>';
        blockItemContent += '</select>';
        blockItemContent += '</label>';
        blockItemContent += '</div>';
        form.innerHTML = blockItemContent;
        blockItemsWrap.appendChild(form);
        form.getElementsByClassName('not-now-button-edit')[0].addEventListener('click', function(e) {
          e.preventDefault();
          var activeID = form.dataset.itemId;
          form.className += ' editing';
          form.getElementsByClassName('not-now-block-item-domain')[0].disabled = false;
        });
        form.getElementsByClassName('not-now-button-save')[0].addEventListener('click', function(e) {
          e.preventDefault();
          var newHost = extractHostname(form.getElementsByClassName('not-now-block-item-domain')[0].value);
          var typeSelection = form.getElementsByClassName('block-type-select')[0];
          if (newHost.length > 0) {
            addNewBlockItem({
              domain: newHost,
              blockTypeRaw: typeSelection.options[typeSelection.selectedIndex].value
            }, parseInt(form.dataset.itemId));
            location.reload();
          } else {
            form.getElementsByClassName('not-now-block-item-domain')[0].className += ' missing';
          }
        });
        form.getElementsByClassName('not-now-button-delete')[0].addEventListener('click', function() {
          var deleteID = parseInt(this.parentElement.parentElement.dataset.itemId);
          blockItemsNew = blockItemsG.filter(function(el) {
            return el.id !== deleteID;
          });
          chrome.storage.sync.set({ blockItems: blockItemsNew }, function() {});
          location.reload();
        });
      }
    }
  });
});
