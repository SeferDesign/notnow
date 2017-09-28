document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get('blockItems', function(result) {
    if (result.blockItems) {
      console.log(result);
      var blockItems = result.blockItems;
      var blockItemsWrap = document.getElementById('not-now-block-items');
      for (var i = 0; i < blockItems.length; i++) {
        var content = document.createElement('div');
        content.className += 'not-now-block-item';
        var blockItemContent = '';
        blockItemContent += '<div class="not-now-block-item-domain">' + blockItems[i].domain + '</div>';
        blockItemContent += '<div class="not-now-block-item-type">' + blockItems[i].blockType + '</div>';
        content.innerHTML = blockItemContent;
        blockItemsWrap.appendChild(content);
      }
    }
  });
});
