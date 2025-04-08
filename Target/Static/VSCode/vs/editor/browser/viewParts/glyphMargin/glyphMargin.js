var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FastDomNode, createFastDomNode } from "../../../../base/browser/fastDomNode.js";
import { ArrayQueue } from "../../../../base/common/arrays.js";
import "./glyphMargin.css";
import { IGlyphMarginWidget, IGlyphMarginWidgetPosition } from "../../editorBrowser.js";
import { DynamicViewOverlay } from "../../view/dynamicViewOverlay.js";
import { RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewPart } from "../../view/viewPart.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { GlyphMarginLane } from "../../../common/model.js";
import * as viewEvents from "../../../common/viewEvents.js";
import { ViewContext } from "../../../common/viewModel/viewContext.js";
class DecorationToRender {
  constructor(startLineNumber, endLineNumber, className, tooltip, zIndex) {
    this.startLineNumber = startLineNumber;
    this.endLineNumber = endLineNumber;
    this.className = className;
    this.tooltip = tooltip;
    this.zIndex = zIndex ?? 0;
  }
  static {
    __name(this, "DecorationToRender");
  }
  _decorationToRenderBrand = void 0;
  zIndex;
}
class LineDecorationToRender {
  constructor(className, zIndex, tooltip) {
    this.className = className;
    this.zIndex = zIndex;
    this.tooltip = tooltip;
  }
  static {
    __name(this, "LineDecorationToRender");
  }
}
class VisibleLineDecorationsToRender {
  static {
    __name(this, "VisibleLineDecorationsToRender");
  }
  decorations = [];
  add(decoration) {
    this.decorations.push(decoration);
  }
  getDecorations() {
    return this.decorations;
  }
}
class DedupOverlay extends DynamicViewOverlay {
  static {
    __name(this, "DedupOverlay");
  }
  /**
   * Returns an array with an element for each visible line number.
   */
  _render(visibleStartLineNumber, visibleEndLineNumber, decorations) {
    const output = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      output[lineIndex] = new VisibleLineDecorationsToRender();
    }
    if (decorations.length === 0) {
      return output;
    }
    decorations.sort((a, b) => {
      if (a.className === b.className) {
        if (a.startLineNumber === b.startLineNumber) {
          return a.endLineNumber - b.endLineNumber;
        }
        return a.startLineNumber - b.startLineNumber;
      }
      return a.className < b.className ? -1 : 1;
    });
    let prevClassName = null;
    let prevEndLineIndex = 0;
    for (let i = 0, len = decorations.length; i < len; i++) {
      const d = decorations[i];
      const className = d.className;
      const zIndex = d.zIndex;
      let startLineIndex = Math.max(d.startLineNumber, visibleStartLineNumber) - visibleStartLineNumber;
      const endLineIndex = Math.min(d.endLineNumber, visibleEndLineNumber) - visibleStartLineNumber;
      if (prevClassName === className) {
        startLineIndex = Math.max(prevEndLineIndex + 1, startLineIndex);
        prevEndLineIndex = Math.max(prevEndLineIndex, endLineIndex);
      } else {
        prevClassName = className;
        prevEndLineIndex = endLineIndex;
      }
      for (let i2 = startLineIndex; i2 <= prevEndLineIndex; i2++) {
        output[i2].add(new LineDecorationToRender(className, zIndex, d.tooltip));
      }
    }
    return output;
  }
}
class GlyphMarginWidgets extends ViewPart {
  static {
    __name(this, "GlyphMarginWidgets");
  }
  domNode;
  _lineHeight;
  _glyphMargin;
  _glyphMarginLeft;
  _glyphMarginWidth;
  _glyphMarginDecorationLaneCount;
  _managedDomNodes;
  _decorationGlyphsToRender;
  _widgets = {};
  constructor(context) {
    super(context);
    this._context = context;
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setClassName("glyph-margin-widgets");
    this.domNode.setPosition("absolute");
    this.domNode.setTop(0);
    this._lineHeight = options.get(EditorOption.lineHeight);
    this._glyphMargin = options.get(EditorOption.glyphMargin);
    this._glyphMarginLeft = layoutInfo.glyphMarginLeft;
    this._glyphMarginWidth = layoutInfo.glyphMarginWidth;
    this._glyphMarginDecorationLaneCount = layoutInfo.glyphMarginDecorationLaneCount;
    this._managedDomNodes = [];
    this._decorationGlyphsToRender = [];
  }
  dispose() {
    this._managedDomNodes = [];
    this._decorationGlyphsToRender = [];
    this._widgets = {};
    super.dispose();
  }
  getWidgets() {
    return Object.values(this._widgets);
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this._lineHeight = options.get(EditorOption.lineHeight);
    this._glyphMargin = options.get(EditorOption.glyphMargin);
    this._glyphMarginLeft = layoutInfo.glyphMarginLeft;
    this._glyphMarginWidth = layoutInfo.glyphMarginWidth;
    this._glyphMarginDecorationLaneCount = layoutInfo.glyphMarginDecorationLaneCount;
    return true;
  }
  onDecorationsChanged(e) {
    return true;
  }
  onFlushed(e) {
    return true;
  }
  onLinesChanged(e) {
    return true;
  }
  onLinesDeleted(e) {
    return true;
  }
  onLinesInserted(e) {
    return true;
  }
  onScrollChanged(e) {
    return e.scrollTopChanged;
  }
  onZonesChanged(e) {
    return true;
  }
  // --- end event handlers
  // --- begin widget management
  addWidget(widget) {
    const domNode = createFastDomNode(widget.getDomNode());
    this._widgets[widget.getId()] = {
      widget,
      preference: widget.getPosition(),
      domNode,
      renderInfo: null
    };
    domNode.setPosition("absolute");
    domNode.setDisplay("none");
    domNode.setAttribute("widgetId", widget.getId());
    this.domNode.appendChild(domNode);
    this.setShouldRender();
  }
  setWidgetPosition(widget, preference) {
    const myWidget = this._widgets[widget.getId()];
    if (myWidget.preference.lane === preference.lane && myWidget.preference.zIndex === preference.zIndex && Range.equalsRange(myWidget.preference.range, preference.range)) {
      return false;
    }
    myWidget.preference = preference;
    this.setShouldRender();
    return true;
  }
  removeWidget(widget) {
    const widgetId = widget.getId();
    if (this._widgets[widgetId]) {
      const widgetData = this._widgets[widgetId];
      const domNode = widgetData.domNode.domNode;
      delete this._widgets[widgetId];
      domNode.remove();
      this.setShouldRender();
    }
  }
  // --- end widget management
  _collectDecorationBasedGlyphRenderRequest(ctx, requests) {
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    const decorations = ctx.getDecorationsInViewport();
    for (const d of decorations) {
      const glyphMarginClassName = d.options.glyphMarginClassName;
      if (!glyphMarginClassName) {
        continue;
      }
      const startLineNumber = Math.max(d.range.startLineNumber, visibleStartLineNumber);
      const endLineNumber = Math.min(d.range.endLineNumber, visibleEndLineNumber);
      const lane = d.options.glyphMargin?.position ?? GlyphMarginLane.Center;
      const zIndex = d.options.zIndex ?? 0;
      for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
        const modelPosition = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(lineNumber, 0));
        const laneIndex = this._context.viewModel.glyphLanes.getLanesAtLine(modelPosition.lineNumber).indexOf(lane);
        requests.push(new DecorationBasedGlyphRenderRequest(lineNumber, laneIndex, zIndex, glyphMarginClassName));
      }
    }
  }
  _collectWidgetBasedGlyphRenderRequest(ctx, requests) {
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    for (const widget of Object.values(this._widgets)) {
      const range = widget.preference.range;
      const { startLineNumber, endLineNumber } = this._context.viewModel.coordinatesConverter.convertModelRangeToViewRange(Range.lift(range));
      if (!startLineNumber || !endLineNumber || endLineNumber < visibleStartLineNumber || startLineNumber > visibleEndLineNumber) {
        continue;
      }
      const widgetLineNumber = Math.max(startLineNumber, visibleStartLineNumber);
      const modelPosition = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(widgetLineNumber, 0));
      const laneIndex = this._context.viewModel.glyphLanes.getLanesAtLine(modelPosition.lineNumber).indexOf(widget.preference.lane);
      requests.push(new WidgetBasedGlyphRenderRequest(widgetLineNumber, laneIndex, widget.preference.zIndex, widget));
    }
  }
  _collectSortedGlyphRenderRequests(ctx) {
    const requests = [];
    this._collectDecorationBasedGlyphRenderRequest(ctx, requests);
    this._collectWidgetBasedGlyphRenderRequest(ctx, requests);
    requests.sort((a, b) => {
      if (a.lineNumber === b.lineNumber) {
        if (a.laneIndex === b.laneIndex) {
          if (a.zIndex === b.zIndex) {
            if (b.type === a.type) {
              if (a.type === 0 /* Decoration */ && b.type === 0 /* Decoration */) {
                return a.className < b.className ? -1 : 1;
              }
              return 0;
            }
            return b.type - a.type;
          }
          return b.zIndex - a.zIndex;
        }
        return a.laneIndex - b.laneIndex;
      }
      return a.lineNumber - b.lineNumber;
    });
    return requests;
  }
  /**
   * Will store render information in each widget's renderInfo and in `_decorationGlyphsToRender`.
   */
  prepareRender(ctx) {
    if (!this._glyphMargin) {
      this._decorationGlyphsToRender = [];
      return;
    }
    for (const widget of Object.values(this._widgets)) {
      widget.renderInfo = null;
    }
    const requests = new ArrayQueue(this._collectSortedGlyphRenderRequests(ctx));
    const decorationGlyphsToRender = [];
    while (requests.length > 0) {
      const first = requests.peek();
      if (!first) {
        break;
      }
      const requestsAtLocation = requests.takeWhile((el) => el.lineNumber === first.lineNumber && el.laneIndex === first.laneIndex);
      if (!requestsAtLocation || requestsAtLocation.length === 0) {
        break;
      }
      const winner = requestsAtLocation[0];
      if (winner.type === 0 /* Decoration */) {
        const classNames = [];
        for (const request of requestsAtLocation) {
          if (request.zIndex !== winner.zIndex || request.type !== winner.type) {
            break;
          }
          if (classNames.length === 0 || classNames[classNames.length - 1] !== request.className) {
            classNames.push(request.className);
          }
        }
        decorationGlyphsToRender.push(winner.accept(classNames.join(" ")));
      } else {
        winner.widget.renderInfo = {
          lineNumber: winner.lineNumber,
          laneIndex: winner.laneIndex
        };
      }
    }
    this._decorationGlyphsToRender = decorationGlyphsToRender;
  }
  render(ctx) {
    if (!this._glyphMargin) {
      for (const widget of Object.values(this._widgets)) {
        widget.domNode.setDisplay("none");
      }
      while (this._managedDomNodes.length > 0) {
        const domNode = this._managedDomNodes.pop();
        domNode?.domNode.remove();
      }
      return;
    }
    const width = Math.round(this._glyphMarginWidth / this._glyphMarginDecorationLaneCount);
    for (const widget of Object.values(this._widgets)) {
      if (!widget.renderInfo) {
        widget.domNode.setDisplay("none");
      } else {
        const top = ctx.viewportData.relativeVerticalOffset[widget.renderInfo.lineNumber - ctx.viewportData.startLineNumber];
        const left = this._glyphMarginLeft + widget.renderInfo.laneIndex * this._lineHeight;
        widget.domNode.setDisplay("block");
        widget.domNode.setTop(top);
        widget.domNode.setLeft(left);
        widget.domNode.setWidth(width);
        widget.domNode.setHeight(this._lineHeight);
      }
    }
    for (let i = 0; i < this._decorationGlyphsToRender.length; i++) {
      const dec = this._decorationGlyphsToRender[i];
      const top = ctx.viewportData.relativeVerticalOffset[dec.lineNumber - ctx.viewportData.startLineNumber];
      const left = this._glyphMarginLeft + dec.laneIndex * this._lineHeight;
      let domNode;
      if (i < this._managedDomNodes.length) {
        domNode = this._managedDomNodes[i];
      } else {
        domNode = createFastDomNode(document.createElement("div"));
        this._managedDomNodes.push(domNode);
        this.domNode.appendChild(domNode);
      }
      domNode.setClassName(`cgmr codicon ` + dec.combinedClassName);
      domNode.setPosition(`absolute`);
      domNode.setTop(top);
      domNode.setLeft(left);
      domNode.setWidth(width);
      domNode.setHeight(this._lineHeight);
    }
    while (this._managedDomNodes.length > this._decorationGlyphsToRender.length) {
      const domNode = this._managedDomNodes.pop();
      domNode?.domNode.remove();
    }
  }
}
var GlyphRenderRequestType = /* @__PURE__ */ ((GlyphRenderRequestType2) => {
  GlyphRenderRequestType2[GlyphRenderRequestType2["Decoration"] = 0] = "Decoration";
  GlyphRenderRequestType2[GlyphRenderRequestType2["Widget"] = 1] = "Widget";
  return GlyphRenderRequestType2;
})(GlyphRenderRequestType || {});
class DecorationBasedGlyphRenderRequest {
  constructor(lineNumber, laneIndex, zIndex, className) {
    this.lineNumber = lineNumber;
    this.laneIndex = laneIndex;
    this.zIndex = zIndex;
    this.className = className;
  }
  static {
    __name(this, "DecorationBasedGlyphRenderRequest");
  }
  type = 0 /* Decoration */;
  accept(combinedClassName) {
    return new DecorationBasedGlyph(this.lineNumber, this.laneIndex, combinedClassName);
  }
}
class WidgetBasedGlyphRenderRequest {
  constructor(lineNumber, laneIndex, zIndex, widget) {
    this.lineNumber = lineNumber;
    this.laneIndex = laneIndex;
    this.zIndex = zIndex;
    this.widget = widget;
  }
  static {
    __name(this, "WidgetBasedGlyphRenderRequest");
  }
  type = 1 /* Widget */;
}
class DecorationBasedGlyph {
  constructor(lineNumber, laneIndex, combinedClassName) {
    this.lineNumber = lineNumber;
    this.laneIndex = laneIndex;
    this.combinedClassName = combinedClassName;
  }
  static {
    __name(this, "DecorationBasedGlyph");
  }
}
export {
  DecorationToRender,
  DedupOverlay,
  GlyphMarginWidgets,
  LineDecorationToRender,
  VisibleLineDecorationsToRender
};
//# sourceMappingURL=glyphMargin.js.map
