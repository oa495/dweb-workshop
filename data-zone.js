/* exported DataZone */
/* global saveCollectedBlobs */

function DataZone(el, type) {
  this.containerEl = el;
  this.type = type;
  this.state = {
    collected: []
  };
  var self = this;
  this.setState = function(state) {
    // Merge the new state on top of the previous one and re-render everything.
    this.state = Object.assign(this.state, state);
    render();
  }

  const render = function() {
    const { collected } = self.state;
    const list = self.containerEl.querySelector("ul");
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
    collected.forEach((item) => {
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

  this.save = function() {
    const { collected } = self.state;
    saveCollectedBlobs(self.type, collected)
      .then(() => {
        self.setState({
          collected: [],
        });
      })
  }
}
