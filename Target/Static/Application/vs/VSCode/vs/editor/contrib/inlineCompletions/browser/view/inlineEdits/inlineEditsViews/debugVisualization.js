var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { derived } from "../../../../../../../base/common/observable.js";
function setVisualization(data, visualization) {
  data["$$visualization"] = visualization;
}
__name(setVisualization, "setVisualization");
function debugLogRects(rects, elem) {
  if (Array.isArray(rects)) {
    const record = {};
    rects.forEach((rect, index) => {
      record[index.toString()] = rect;
    });
    rects = record;
  }
  setVisualization(rects, new ManyRectVisualizer(rects, elem));
  return rects;
}
__name(debugLogRects, "debugLogRects");
function debugLogRect(rect, elem, name) {
  setVisualization(rect, new HtmlRectVisualizer(rect, elem, name));
  return rect;
}
__name(debugLogRect, "debugLogRect");
function debugLogHorizontalOffsetRange(rect, elem, name) {
  setVisualization(rect, new HtmlHorizontalOffsetRangeVisualizer(rect, elem, name, 0, "above"));
  return rect;
}
__name(debugLogHorizontalOffsetRange, "debugLogHorizontalOffsetRange");
function debugLogHorizontalOffsetRanges(rects, elem) {
  if (Array.isArray(rects)) {
    const record = {};
    rects.forEach((rect, index) => {
      record[index.toString()] = rect;
    });
    rects = record;
  }
  setVisualization(rects, new ManyHorizontalOffsetRangeVisualizer(rects, elem));
  return rects;
}
__name(debugLogHorizontalOffsetRanges, "debugLogHorizontalOffsetRanges");
class ManyRectVisualizer {
  static {
    __name(this, "ManyRectVisualizer");
  }
  constructor(_rects, _elem) {
    this._rects = _rects;
    this._elem = _elem;
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
class ManyHorizontalOffsetRangeVisualizer {
  static {
    __name(this, "ManyHorizontalOffsetRangeVisualizer");
  }
  constructor(_rects, _elem) {
    this._rects = _rects;
    this._elem = _elem;
  }
  visualize() {
    const d = [];
    const keys = Object.keys(this._rects);
    keys.forEach((key, index) => {
      const labelPosition = index % 2 === 0 ? "above" : "below";
      const v = new HtmlHorizontalOffsetRangeVisualizer(this._rects[key], this._elem, key, index * 12, labelPosition);
      d.push(v.visualize());
    });
    return {
      dispose: /* @__PURE__ */ __name(() => {
        d.forEach((d2) => d2.dispose());
      }, "dispose")
    };
  }
}
class HtmlHorizontalOffsetRangeVisualizer {
  static {
    __name(this, "HtmlHorizontalOffsetRangeVisualizer");
  }
  constructor(_rect, _elem, _name, _verticalOffset = 0, _labelPosition = "above") {
    this._rect = _rect;
    this._elem = _elem;
    this._name = _name;
    this._verticalOffset = _verticalOffset;
    this._labelPosition = _labelPosition;
  }
  visualize() {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.pointerEvents = "none";
    container.style.zIndex = "100000";
    const horizontalLine = document.createElement("div");
    horizontalLine.style.position = "absolute";
    horizontalLine.style.height = "2px";
    horizontalLine.style.backgroundColor = "green";
    horizontalLine.style.top = "50%";
    horizontalLine.style.transform = "translateY(-50%)";
    const startBar = document.createElement("div");
    startBar.style.position = "absolute";
    startBar.style.width = "2px";
    startBar.style.height = "8px";
    startBar.style.backgroundColor = "green";
    startBar.style.left = "0";
    startBar.style.top = "50%";
    startBar.style.transform = "translateY(-50%)";
    const endBar = document.createElement("div");
    endBar.style.position = "absolute";
    endBar.style.width = "2px";
    endBar.style.height = "8px";
    endBar.style.backgroundColor = "green";
    endBar.style.right = "0";
    endBar.style.top = "50%";
    endBar.style.transform = "translateY(-50%)";
    const label = document.createElement("div");
    label.textContent = this._name;
    label.style.position = "absolute";
    if (this._labelPosition === "above") {
      label.style.bottom = "12px";
    } else {
      label.style.top = "12px";
    }
    label.style.left = "2px";
    label.style.color = "green";
    label.style.fontSize = "10px";
    label.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
    label.style.padding = "1px 3px";
    label.style.border = "1px solid green";
    label.style.borderRadius = "2px";
    label.style.whiteSpace = "nowrap";
    label.style.boxShadow = "0 1px 2px rgba(0,0,0,0.15)";
    label.style.fontFamily = "monospace";
    container.appendChild(horizontalLine);
    container.appendChild(startBar);
    container.appendChild(endBar);
    container.appendChild(label);
    const updatePosition = /* @__PURE__ */ __name(() => {
      const elemRect = this._elem.getBoundingClientRect();
      const centerY = this._rect.top + this._rect.height / 2 + this._verticalOffset;
      const left = elemRect.left + this._rect.left;
      const width = this._rect.width;
      container.style.left = left + "px";
      container.style.top = elemRect.top + centerY + "px";
      container.style.width = width + "px";
      container.style.height = "8px";
      horizontalLine.style.width = width + "px";
    }, "updatePosition");
    document.body.appendChild(container);
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(this._elem);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        observer.disconnect();
        container.remove();
      }, "dispose")
    };
  }
}
class HtmlRectVisualizer {
  static {
    __name(this, "HtmlRectVisualizer");
  }
  constructor(_rect, _elem, _name) {
    this._rect = _rect;
    this._elem = _elem;
    this._name = _name;
  }
  visualize() {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.border = "1px solid red";
    div.style.boxSizing = "border-box";
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
  derived({ name: "debugReadDisposable" }, (_reader) => {
    _reader.store.add(d);
    return void 0;
  }).read(reader);
}
__name(debugReadDisposable, "debugReadDisposable");
export {
  debugLogHorizontalOffsetRange,
  debugLogHorizontalOffsetRanges,
  debugLogRect,
  debugLogRects,
  debugView,
  setVisualization
};
//# sourceMappingURL=debugVisualization.js.map
