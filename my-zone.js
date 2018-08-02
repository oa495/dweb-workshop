/* global loadStoredImages, DataZone */

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
textZone.containerEl.querySelector("button.save-collection").addEventListener('click', textZone.save);
imgZone.containerEl.querySelector("button.save-collection").addEventListener('click', imgZone.save);
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


browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'new-image') {
    let collected = imgZone.state.collected || [];
    const fetchRes = await fetchBlobFromUrl(msg.data);
    collected.push(fetchRes);
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
