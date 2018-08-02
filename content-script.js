var clickedEl;

document.addEventListener('mousedown', function(event){
  // Get the element tha was right clicked on.
  if (event.button == 2) {
      clickedEl = event.target;
  }
}, true);


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request == 'remove') {
      clickedEl.style.display = 'none';
    }
});
