var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IBufferMarkCapability, TerminalCapability, IMarkProperties } from "./capabilities.js";
class BufferMarkCapability extends Disposable {
  constructor(_terminal) {
    super();
    this._terminal = _terminal;
  }
  static {
    __name(this, "BufferMarkCapability");
  }
  type = TerminalCapability.BufferMarkDetection;
  _idToMarkerMap = /* @__PURE__ */ new Map();
  _anonymousMarkers = /* @__PURE__ */ new Map();
  _onMarkAdded = this._register(new Emitter());
  onMarkAdded = this._onMarkAdded.event;
  *markers() {
    for (const m of this._idToMarkerMap.values()) {
      yield m;
    }
    for (const m of this._anonymousMarkers.values()) {
      yield m;
    }
  }
  addMark(properties) {
    const marker = properties?.marker || this._terminal.registerMarker();
    const id = properties?.id;
    if (!marker) {
      return;
    }
    if (id) {
      this._idToMarkerMap.set(id, marker);
      marker.onDispose(() => this._idToMarkerMap.delete(id));
    } else {
      this._anonymousMarkers.set(marker.id, marker);
      marker.onDispose(() => this._anonymousMarkers.delete(marker.id));
    }
    this._onMarkAdded.fire({ marker, id, hidden: properties?.hidden, hoverMessage: properties?.hoverMessage });
  }
  getMark(id) {
    return this._idToMarkerMap.get(id);
  }
}
export {
  BufferMarkCapability
};
//# sourceMappingURL=bufferMarkCapability.js.map
