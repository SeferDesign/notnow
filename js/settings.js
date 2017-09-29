var blockItemsG = null;

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get('blockItems', function(result) {
    if (result.blockItems) {
      console.log(result);
      var blockItems = result.blockItems;
      blockItemsG = result.blockItems;
      var blockItemsWrap = document.getElementById('not-now-block-items');
      for (var i = 0; i < blockItems.length; i++) {
        var content = document.createElement('div');
        content.className += 'not-now-block-item';
        content.setAttribute('data-item-id', blockItems[i].id);
        var blockItemContent = '';
        blockItemContent += '<div class="not-now-block-item-buttons"><div class="not-now-button not-now-button-edit">Edit</div><div class="not-now-button alt not-now-button-delete">&times;</div></div>';
        blockItemContent += '<div class="not-now-block-item-domain">' + blockItems[i].domain + '</div>';
        blockItemContent += '<div class="not-now-block-item-type">' + blockItems[i].blockType + '</div>';
        content.innerHTML = blockItemContent;
        blockItemsWrap.appendChild(content);
        var editButton = content.getElementsByClassName('not-now-button-edit')[0];
        editButton.addEventListener('click', function() {
          // edit
        });
        var deleteButton = content.getElementsByClassName('not-now-button-delete')[0];
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
