var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { h } from "../../../../../base/browser/dom.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ICodeEditor, IOverlayWidget, IViewZoneChangeAccessor } from "../../../../../editor/browser/editorBrowser.js";
import { Event } from "../../../../../base/common/event.js";
class FixedZoneWidget extends Disposable {
  constructor(editor, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp) {
    super();
    this.editor = editor;
    this.viewZoneId = viewZoneAccessor.addZone({
      domNode: document.createElement("div"),
      afterLineNumber,
      heightInPx: height,
      ordinal: 5e4 + 1,
      onComputedHeight: /* @__PURE__ */ __name((height2) => {
        this.widgetDomNode.style.height = `${height2}px`;
      }, "onComputedHeight"),
      onDomNodeTop: /* @__PURE__ */ __name((top) => {
        this.widgetDomNode.style.top = `${top}px`;
      }, "onDomNodeTop")
    });
    viewZoneIdsToCleanUp.push(this.viewZoneId);
    this._register(Event.runAndSubscribe(this.editor.onDidLayoutChange, () => {
      this.widgetDomNode.style.left = this.editor.getLayoutInfo().contentLeft + "px";
    }));
    this.editor.addOverlayWidget(this.overlayWidget);
    this._register({
      dispose: /* @__PURE__ */ __name(() => {
        this.editor.removeOverlayWidget(this.overlayWidget);
      }, "dispose")
    });
  }
  static {
    __name(this, "FixedZoneWidget");
  }
  static counter = 0;
  overlayWidgetId = `fixedZoneWidget-${FixedZoneWidget.counter++}`;
  viewZoneId;
  widgetDomNode = h("div.fixed-zone-widget").root;
  overlayWidget = {
    getId: /* @__PURE__ */ __name(() => this.overlayWidgetId, "getId"),
    getDomNode: /* @__PURE__ */ __name(() => this.widgetDomNode, "getDomNode"),
    getPosition: /* @__PURE__ */ __name(() => null, "getPosition")
  };
}
export {
  FixedZoneWidget
};
//# sourceMappingURL=fixedZoneWidget.js.map
