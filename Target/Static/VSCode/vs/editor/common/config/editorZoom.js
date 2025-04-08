import { Emitter, Event } from "../../../base/common/event.js";
const EditorZoom = new class {
  _zoomLevel = 0;
  _onDidChangeZoomLevel = new Emitter();
  onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
  getZoomLevel() {
    return this._zoomLevel;
  }
  setZoomLevel(zoomLevel) {
    zoomLevel = Math.min(Math.max(-5, zoomLevel), 20);
    if (this._zoomLevel === zoomLevel) {
      return;
    }
    this._zoomLevel = zoomLevel;
    this._onDidChangeZoomLevel.fire(this._zoomLevel);
  }
}();
export {
  EditorZoom
};
//# sourceMappingURL=editorZoom.js.map
