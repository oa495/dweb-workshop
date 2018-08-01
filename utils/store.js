/* global IDBFiles */
/* exported saveCollectedBlobs, loadStoredImages, removeStoredImages */

"use strict";

async function saveCollectedBlobs(type, collectedBlobs) {
  if (type === 'text') {
    localStorage.setItem("text", JSON.stringify(collectedBlobs));
  }
  else {
    const storedImages = await IDBFiles.getFileStorage({name: "stored-images"});
    for (const item of collectedBlobs) {
        await storedImages.put(item.blobUrl, item.blob);
    }
    console.log('saved images');
  }
}

async function loadStoredImages() {
  const imagesStore = await IDBFiles.getFileStorage({name: "stored-images"});
  const imagesList = await imagesStore.list();
  let storedImages = [];
  for (const storedName of imagesList) {
    const blob = await imagesStore.get(storedName);
    storedImages.push({storedName, blobUrl: URL.createObjectURL(blob)});
  }
  return storedImages;
}
