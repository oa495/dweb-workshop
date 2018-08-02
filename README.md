There are already some files in here!

Assets -> images, fonts, etc
.md -> file format (like .txt)

Everything for the browser extension is in the `src` folder.

`Manifest.json`

All browser extensions require a manifest.json file. This file includes information about the extension (like name and description), sets its permissions (what things it has access to, e.g website, new tab), and references all the JavaScript, CSS, and other files associated with the extension.

```
"manifest_version": 2,
  "name" : "Data Zone",
  "description" : "Creates a zone for our data.",
  "version" : "1.0.0"
```
 - Manifest version: This key specifies the version of manifest.json used by this extension. Currently should always be `2` (this is dictated by the browser)
- Name is the name of your extension and description is what it does.
- No need to worry about version right now this we aren't releasing this.
- Background scripts are for the logic of the extension.

```
"background": {
  "scripts": ["background.js"]
}
```
  - Permissions is a way of telling the browser what your extension does and what it needs to do that. For our extension we want to be able to collect information from whatever page we're on.
```
  "permissions": [
    "contextMenus",
    "<all_urls>"
  ]
```
So `<all_urls>` means we have access to all websites the user visits and then the contextMenus permissions means we can add things to the context menu which is what you see when you right click.

![](https://cdn.glitch.com/588b3f9c-dee7-4d4d-ba48-cb75b788703c%2Fcontext_menu_example.png?1532907705751)

```
"browser_action": {
    "default_icon": {
      "48": "https://cdn.glitch.com/588b3f9c-dee7-4d4d-ba48-cb75b788703c%2Ficon.png?1532903868179"
    },
    "default_title": "Collected Data"
  }
```
A browser action is a button that your extension adds to the browser's toolbar.
They can communicate with our javascript so it can tell us when it was clicked.

![](https://cdn.glitch.com/588b3f9c-dee7-4d4d-ba48-cb75b788703c%2Fbrowser-action.png?1532910340209)

So the first thing we're going to do is add an event Listener to the browser action. So in `background.js`, copy:


```
/*
Open a new tab, and load "my-page.html" into it.
*/
function openMyPage() {
   browser.tabs.create({
     "url": "/my-zone.html"
   });
}

/*
Add openMyPage() as a listener to clicks on the browser action.
*/
browser.browserAction.onClicked.addListener(openMyPage);
```

An event listener waits for something (an event) to happen, in this case, this is saying when the browser action is clicked, open a new tab with the html page `my-zone`

Let's test this out!

And then we add an item to the context menu.
```

browser.contextMenus.create({
  id: 'collect-data',
  title: 'Add to your data collection',
  contexts: ['image', 'selection']
});

```

This is saying add an extra option to the menu with that title and it should accept images and selections.

![](https://cdn.glitch.com/588b3f9c-dee7-4d4d-ba48-cb75b788703c%2FScreen%20Shot%202018-07-29%20at%208.45.23%20PM.png?1532911562000)


Now we have to actually do something with the data when the context menu is clicked:

```
browser.contextMenus.onClicked.addListener(async (info) => {

});
```

1. We have to figure out what kind of data is coming in and label it accordingly.
```
let data, type;
  if (info.srcUrl) {
    data = info.srcUrl;
    type = 'new-image';
  }
  else if (info.selectionText) {
    data = info.selectionText;
    type = 'new-text';
  }
```
And then send a message to our zone essentially saying "I want to add this to my zone"
```  
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
```

Our zone will (hopefully) recieve the message. To do that it has to be listening for it
```
browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'new-image') {

  }
  else if (msg.type === 'new-text') {

  }
});
```

The message will come in but again we have to do something to it. In this case we have
to add it to our zone.

So I made a class in a separate file that you don't have to look at if you don't want to
called DataZone which you can think of as a container for data.

Think of it as ... a bucket 5 feet away from you. You can throw stuff in it
from where you are but you don't need to worry (unless you do!) about
what goes on inside.

So we make two buckets (Data Zones) for the two types of data we have:
images and text.

```
const textZone = new DataZone(document.getElementById('text-zone'), 'text');
const imgZone = new DataZone(document.getElementById('img-zone'), 'img');
```
It'll accept the container to put the content and then also the type of content.


So when our zone recieves a message with content, we find out what kind of content
it is and put it in the right container.

```
browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'new-image') {
    // get the container
    // if there's nothing in it, make it an empty array
    let collected = imgZone.state.collected || [];
    // add the content we just got
    const fetchRes = await fetchBlobFromUrl(msg.data);
    collected.push(fetchRes);
    // close the lid
    imgZone.setState({collected});
    return true;
  }
  else if (msg.type === 'new-text') {
    let collected = textZone.state.collected || [];
    collected.push(msg.data);
    textZone.setState({collected});
    return true;
  }
  return true;
});

```

So this is where the analogy breaks kind of? We aren't storing this data
anywhere so it disappears if we close our zone. Imagine...someone takes out
the recycling everytime you're not looking at it.

So we need to store it somewhere. We add a save buton to our zone.

```
  <button class="save-collection">save meeee</button>
```

And then anytime it's clicked we save

```
textZone.containerEl.querySelector("button.save-collection").addEventListener('click', textZone.save);

imgZone.containerEl.querySelector("button.save-collection").addEventListener('click', imgZone.save);
```

And our DataZone already has the ability to save so you just have to
tell it to save. If you want to know more about how this is working you can sneak a look in `utils/store.js` (it's IndexedDB and LocalStorage)

Ok so when you click 'save' it saves. Your zone doesn't know  to look in the place it's saved because it's in a different location so we have to add some code to check if it's in the place we saved it and then tell our zone to get it from there.

```
let collectedText = localStorage.getItem('text');
if (collectedText){
  collectedText = JSON.parse(collectedText);
  textZone.setState({collected: collectedText});
}
loadStoredImages()
  .then((storedImages) => {
    imgZone.setState({collected: storedImages});
  })
  .catch(console.error);
```

The last thing, is since our data now lives in our zone, we have to take it away from whatever
platform it's on. So to do that we need a content script. A content script can access and
modify a page, so it can make things disappear.

So we add a the information for our content script to our `manifest.json`
```
  "content_scripts": [
    {
      "matches": ["*://*.twitter.com/*", "*://*.facebook.com/*"],
      "js": ["content-script.js"]
    }
  ]
  ```

So we need to find out what element is being right clicked on.

```
var clickedEl;

document.addEventListener('mousedown', function(event){
  // Get the element tha was right clicked on.
  if (event.button == 2) {
      clickedEl = event.target;
  }
}, true);
```

Then when we finish moving content to our zone, we send a message saying we're
ready to delete it.
```
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, 'remove', function(response) {
        console.log('byeee');
      });
    });
```

So when sending a message to a content script you do it a bit differently. You ned
to specify what tab to send it to (whih is our current tab)

And then when we recieve that message in the content script, we can delete.
```
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request == 'remove') {
      clickedEl.style.display = 'none';
    }
});
```
