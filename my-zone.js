function DataZone(el, type) {
  this.containerEl = el;
  this.type = type;
  this.state = {
    collectedBlobs: []
  };

  this.setState = function(state) {
    // Merge the new state on top of the previous one and re-render everything.
    this.state = Object.assign(this.state, state);
    render();
  }

  const render = function() {
    const { collectedBlobs } = this.state;
    console.log(collectedBlobs);
    const list = this.containerEl.querySelector("ul");
    collectedBlobs.forEach((item) => {
      console.log(item);
      const li = document.createElement("li");
      if (this.type === 'image') {
        const img = document.createElement("img");
        li.setAttribute("id", item.uuid);
        img.setAttribute("src", item.blobUrl);
        li.appendChild(img);
      }
      else if (this.type === 'text') {
        li.textContent = item;
        console.log('list item', li);
      }
      list.appendChild(li);
      console.log(list);
    });
  }
}

async function fetchBlobFromUrl(fetchUrl) {
  const res = await fetch(fetchUrl);
  const blob = await res.blob();

  return {
    blob,
    blobUrl: URL.createObjectURL(blob),
    fetchUrl,
    uuid: uuidv4(),
  };
}

const textZone = new DataZone(document.getElementById('text-zone'), 'text');
const imgZone = new DataZone(document.getElementById('img-zone'), 'img');

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'new-image') {
    let collectedBlobs = imgZone.state.collectedBlobs || [];
    const fetchRes = await fetchBlobFromUrl(msg.data);
    collectedBlobs.push(fetchRes);
    console.log('in here');
    imgZone.setState({collectedBlobs});
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
