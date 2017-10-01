var blockItemsG = null;

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get('blockItems', function(result) {
    if (result.blockItems) {
      console.log(result.blockItems);
      var blockItems = result.blockItems;
      blockItemsG = result.blockItems;
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
          var now = new Date();
          var editID = parseInt(form.dataset.itemId);
          blockItemsNew = blockItemsG.filter(function(el) {
            return el.id !== editID;
          });
          var newHost = extractHostname(form.getElementsByClassName('not-now-block-item-domain')[0].value);
          var updatedBlockItem = {
            id: editID,
            domain: newHost
          };
          var typeSelection = form.getElementsByClassName('block-type-select')[0];
          var newTypeRaw = typeSelection.options[typeSelection.selectedIndex].value;
          var newType = '';
          var singleTime = '';
          console.log(formatAMPM(now));
          if (newTypeRaw == '30' || newTypeRaw == '60' || newTypeRaw == 'day') {
            updatedBlockItem.blockType = 'single';
            if (newTypeRaw == '30') {
              singleTime = now.getTime() + (0.5 * 3600 * 1000);
            } else if (newTypeRaw == '60') {
              singleTime = now.getTime() + (1.0 * 3600 * 1000);
            } else if (newTypeRaw == 'day') {
              var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
              singleTime = tomorrow.getTime();
            }
            updatedBlockItem.blockEndTime = singleTime;
          } else if (newTypeRaw == 'always') {
            updatedBlockItem.blockType = 'always';
          }

          console.log(updatedBlockItem);

          //

          blockItemsNew.push(updatedBlockItem);
          if (newHost.length > 0) {
            chrome.storage.sync.set({ blockItems: blockItemsNew }, function() {});
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
