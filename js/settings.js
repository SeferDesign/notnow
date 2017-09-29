var blockItemsG = null;

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get('blockItems', function(result) {
    if (result.blockItems) {
      var blockItems = result.blockItems;
      blockItemsG = result.blockItems;
      var blockItemsWrap = document.getElementById('not-now-block-items');
      for (var i = 0; i < blockItems.length; i++) {
        var form = document.createElement('form');
        form.className += 'not-now-block-item';
        form.setAttribute('data-item-id', blockItems[i].id);
        var blockItemContent = '';
        blockItemContent += '<div class="not-now-block-item-buttons">';
        if (blockItems[i].blockType != 'single') {
          blockItemContent += '<div class="not-now-button not-now-button-save" title="Save">Save</div><div class="not-now-button not-now-button-edit" title="Edit">Edit</div>';
        }
        blockItemContent += '<div class="not-now-button alt not-now-button-delete" title="Delete">&times;</div></div>';
        blockItemContent += '<div class="not-now-block-item-domain">' + blockItems[i].domain + '</div>';
        blockItemContent += '<div class="not-now-block-item-type">' + blockItems[i].blockType + '</div>';
        blockItemContent += '<div class="form-wrap">'
        /*if (existing) {
          blockItemContent += '<input type="hidden" id="block-item-id" name="block-item-id" value="" />';
        }*/
        blockItemContent += '<label for="block-type"><div class="block-type-label-inner">Block this site:</div>';
        blockItemContent += '<select id="block-type" name="block-type">';
          blockItemContent += '<optgroup label="Temporarily">';
            blockItemContent += '<option name="single-30">for the next half hour</option>';
            blockItemContent += '<option name="single-60">for the next hour</option>';
            blockItemContent += '<option name="single-day">for the rest of today</option>';
          blockItemContent += '</optgroup>';
          blockItemContent += '<optgroup label="Regularly">';
          blockItemContent += '<option name="regular"';
            if (blockItems[i].blockType == 'regular') { blockItemContent += ' selected'; }
          blockItemContent += '>on a schedule</option>';
            blockItemContent += '<option name="always"';
              if (blockItems[i].blockType == 'always') { blockItemContent += ' selected'; }
            blockItemContent += '>always</option>';
          blockItemContent += '</optgroup>';
        blockItemContent += '</select>';
        blockItemContent += '</label>';
        blockItemContent += '</div>';
        form.innerHTML = blockItemContent;
        blockItemsWrap.appendChild(form);
        if (blockItems[i].blockType != 'single') {
          var editButton = form.getElementsByClassName('not-now-button-edit')[0];
          editButton.addEventListener('click', function() {
            var blockItemActive = this.parentElement.parentElement;
            var activeID = blockItemActive.dataset.itemId;
            blockItemActive.className += ' editing';
          });
        }
        var deleteButton = form.getElementsByClassName('not-now-button-delete')[0];
        deleteButton.addEventListener('click', function() {
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
