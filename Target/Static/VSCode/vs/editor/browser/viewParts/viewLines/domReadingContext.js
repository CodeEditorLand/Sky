var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class DomReadingContext {
  constructor(_domNode, endNode) {
    this._domNode = _domNode;
    this.endNode = endNode;
  }
  static {
    __name(this, "DomReadingContext");
  }
  _didDomLayout = false;
  _clientRectDeltaLeft = 0;
  _clientRectScale = 1;
  _clientRectRead = false;
  get didDomLayout() {
    return this._didDomLayout;
  }
  readClientRect() {
    if (!this._clientRectRead) {
      this._clientRectRead = true;
      const rect = this._domNode.getBoundingClientRect();
      this.markDidDomLayout();
      this._clientRectDeltaLeft = rect.left;
      this._clientRectScale = rect.width / this._domNode.offsetWidth;
    }
  }
  get clientRectDeltaLeft() {
    if (!this._clientRectRead) {
      this.readClientRect();
    }
    return this._clientRectDeltaLeft;
  }
  get clientRectScale() {
    if (!this._clientRectRead) {
      this.readClientRect();
    }
    return this._clientRectScale;
  }
  markDidDomLayout() {
    this._didDomLayout = true;
  }
}
export {
  DomReadingContext
};
//# sourceMappingURL=domReadingContext.js.map
