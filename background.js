/*
Open a new tab, and load "my-page.html" into it.
*/
function openMyPage() {
  console.log("injecting");
   browser.tabs.create({
     "url": "/my-zone.html"
   });
}


/*
Add openMyPage() as a listener to clicks on the browser action.
*/
browser.browserAction.onClicked.addListener(openMyPage);

// Add a context menu action on every image element in the page.
browser.contextMenus.create({
  id: 'collect-data',
  title: 'Add to your data collection',
  contexts: ['image', 'selection']
});

browser.contextMenus.onClicked.addListener(async (info) => {
  let data, type;
  if (info.srcUrl) {
    data = info.srcUrl;
    type = 'new-image';
  }
  else if (info.selectionText) {
    data = info.selectionText;
    type = 'new-text';
  }
  try {
    await browser.runtime.sendMessage({
      type: type,
      data: data
    });
  }
  catch (error) {
    if (error.message.includes("Could not establish connection. Receiving end does not exist.")) {
      openMyPage()
    }
  }
});
