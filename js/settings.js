document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get('blockItems', function(result) {
    if (result.blockItems) {
      var blockItems = result.blockItems;
      var blockItemsWrap = document.getElementById('not-now-block-items');
      for (var i = 0; i < blockItems.length; i++) {
        var content = document.createElement('div');
        content.className += 'not-now-block-item';
        content.appendChild(document.createTextNode(blockItems[i].domain));
        content.appendChild(document.createTextNode(blockItems[i].blockType));
        blockItemsWrap.appendChild(content);
      }
    }
  });
});
