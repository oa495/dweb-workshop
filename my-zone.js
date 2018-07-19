function DataZone(el, type) {
  this.containerEl = el;
  this.type = type;
  this.state = {
    collectedBlobs: []
  };
  var self = this;

  this.setState = function(state) {
    // Merge the new state on top of the previous one and re-render everything.
    this.state = Object.assign(this.state, state);
    render();
  }

  const render = function() {
    const { collectedBlobs } = self.state;
    const list = self.containerEl.querySelector("ul");
    console.log('in render', collectedBlobs);
    collectedBlobs.forEach((item) => {
      const li = document.createElement("li");
      if (self.type === 'img') {
        const img = document.createElement("img");
        img.setAttribute("src", item.blobUrl);
        li.appendChild(img);
      }
      else if (self.type === 'text') {
        li.textContent = item;
      }
      list.appendChild(li);
    });
  }
}

async function fetchBlobFromUrl(fetchUrl) {
  const res = await fetch(fetchUrl);
  const blob = await res.blob();

  return {
    blob,
    blobUrl: URL.createObjectURL(blob),
  };
}

const textZone = new DataZone(document.getElementById('text-zone'), 'text');
const imgZone = new DataZone(document.getElementById('img-zone'), 'img');

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'new-image') {
    let collectedBlobs = imgZone.state.collectedBlobs || [];
    const fetchRes = await fetchBlobFromUrl(msg.data);
    collectedBlobs.push(fetchRes);
    imgZone.setState({collectedBlobs});
    console.log('recieved', collectedBlobs);
    return true;
  }
  else if (msg.type === 'new-text') {
    let collectedBlobs = textZone.state.collectedBlobs || [];
    collectedBlobs.push(msg.data);
    textZone.setState({collectedBlobs});
    return true;
  }
  return true;
});
