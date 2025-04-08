var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../../../../../base/common/lifecycle.js";
import { IReader, derivedWithStore } from "../../../../../../../base/common/observable.js";
import { Rect } from "../../../../../../browser/rect.js";
function setVisualization(data, visualization) {
  data["$$visualization"] = visualization;
}
__name(setVisualization, "setVisualization");
function debugLogRects(rects, elem) {
  setVisualization(rects, new ManyRectVisualizer(rects, elem));
  return rects;
}
__name(debugLogRects, "debugLogRects");
function debugLogRect(rect, elem, name) {
  setVisualization(rect, new HtmlRectVisualizer(rect, elem, name));
  return rect;
}
__name(debugLogRect, "debugLogRect");
class ManyRectVisualizer {
  constructor(_rects, _elem) {
    this._rects = _rects;
    this._elem = _elem;
  }
  static {
    __name(this, "ManyRectVisualizer");
  }
  visualize() {
    const d = [];
    for (const key in this._rects) {
      const v = new HtmlRectVisualizer(this._rects[key], this._elem, key);
      d.push(v.visualize());
    }
    return {
      dispose: /* @__PURE__ */ __name(() => {
        d.forEach((d2) => d2.dispose());
      }, "dispose")
    };
  }
}
class HtmlRectVisualizer {
  constructor(_rect, _elem, _name) {
    this._rect = _rect;
    this._elem = _elem;
    this._name = _name;
  }
  static {
    __name(this, "HtmlRectVisualizer");
  }
  visualize() {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.border = "1px solid red";
    div.style.pointerEvents = "none";
    div.style.zIndex = "100000";
    const label = document.createElement("div");
    label.textContent = this._name;
    label.style.position = "absolute";
    label.style.top = "-20px";
    label.style.left = "0";
    label.style.color = "red";
    label.style.fontSize = "12px";
    label.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
    div.appendChild(label);
    const updatePosition = /* @__PURE__ */ __name(() => {
      const elemRect = this._elem.getBoundingClientRect();
      console.log(elemRect);
      div.style.left = elemRect.left + this._rect.left + "px";
      div.style.top = elemRect.top + this._rect.top + "px";
      div.style.width = this._rect.width + "px";
      div.style.height = this._rect.height + "px";
    }, "updatePosition");
    document.body.appendChild(div);
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(this._elem);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        observer.disconnect();
        div.remove();
      }, "dispose")
    };
  }
}
function debugView(value, reader) {
  if (typeof value === "object" && value && "$$visualization" in value) {
    const vis = value["$$visualization"];
    debugReadDisposable(vis.visualize(), reader);
  }
}
__name(debugView, "debugView");
function debugReadDisposable(d, reader) {
  derivedWithStore((_reader, store) => {
    store.add(d);
    return void 0;
  }).read(reader);
}
__name(debugReadDisposable, "debugReadDisposable");
export {
  debugLogRect,
  debugLogRects,
  debugView,
  setVisualization
};
//# sourceMappingURL=debugVisualization.js.map
