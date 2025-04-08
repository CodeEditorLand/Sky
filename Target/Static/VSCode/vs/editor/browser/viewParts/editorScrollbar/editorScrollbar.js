var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../base/browser/dom.js";
import { FastDomNode, createFastDomNode } from "../../../../base/browser/fastDomNode.js";
import { IOverviewRulerLayoutInfo, SmoothScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { ScrollableElementChangeOptions, ScrollableElementCreationOptions } from "../../../../base/browser/ui/scrollbar/scrollableElementOptions.js";
import { PartFingerprint, PartFingerprints, ViewPart } from "../../view/viewPart.js";
import { INewScrollPosition, ScrollType } from "../../../common/editorCommon.js";
import { RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewContext } from "../../../common/viewModel/viewContext.js";
import * as viewEvents from "../../../common/viewEvents.js";
import { getThemeTypeSelector } from "../../../../platform/theme/common/themeService.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { IMouseWheelEvent } from "../../../../base/browser/mouseEvent.js";
class EditorScrollbar extends ViewPart {
  static {
    __name(this, "EditorScrollbar");
  }
  scrollbar;
  scrollbarDomNode;
  constructor(context, linesContent, viewDomNode, overflowGuardDomNode) {
    super(context);
    const options = this._context.configuration.options;
    const scrollbar = options.get(EditorOption.scrollbar);
    const mouseWheelScrollSensitivity = options.get(EditorOption.mouseWheelScrollSensitivity);
    const fastScrollSensitivity = options.get(EditorOption.fastScrollSensitivity);
    const scrollPredominantAxis = options.get(EditorOption.scrollPredominantAxis);
    const scrollbarOptions = {
      listenOnDomNode: viewDomNode.domNode,
      className: "editor-scrollable " + getThemeTypeSelector(context.theme.type),
      useShadows: false,
      lazyRender: true,
      vertical: scrollbar.vertical,
      horizontal: scrollbar.horizontal,
      verticalHasArrows: scrollbar.verticalHasArrows,
      horizontalHasArrows: scrollbar.horizontalHasArrows,
      verticalScrollbarSize: scrollbar.verticalScrollbarSize,
      verticalSliderSize: scrollbar.verticalSliderSize,
      horizontalScrollbarSize: scrollbar.horizontalScrollbarSize,
      horizontalSliderSize: scrollbar.horizontalSliderSize,
      handleMouseWheel: scrollbar.handleMouseWheel,
      alwaysConsumeMouseWheel: scrollbar.alwaysConsumeMouseWheel,
      arrowSize: scrollbar.arrowSize,
      mouseWheelScrollSensitivity,
      fastScrollSensitivity,
      scrollPredominantAxis,
      scrollByPage: scrollbar.scrollByPage
    };
    this.scrollbar = this._register(new SmoothScrollableElement(linesContent.domNode, scrollbarOptions, this._context.viewLayout.getScrollable()));
    PartFingerprints.write(this.scrollbar.getDomNode(), PartFingerprint.ScrollableElement);
    this.scrollbarDomNode = createFastDomNode(this.scrollbar.getDomNode());
    this.scrollbarDomNode.setPosition("absolute");
    this._setLayout();
    const onBrowserDesperateReveal = /* @__PURE__ */ __name((domNode, lookAtScrollTop, lookAtScrollLeft) => {
      const newScrollPosition = {};
      if (lookAtScrollTop) {
        const deltaTop = domNode.scrollTop;
        if (deltaTop) {
          newScrollPosition.scrollTop = this._context.viewLayout.getCurrentScrollTop() + deltaTop;
          domNode.scrollTop = 0;
        }
      }
      if (lookAtScrollLeft) {
        const deltaLeft = domNode.scrollLeft;
        if (deltaLeft) {
          newScrollPosition.scrollLeft = this._context.viewLayout.getCurrentScrollLeft() + deltaLeft;
          domNode.scrollLeft = 0;
        }
      }
      this._context.viewModel.viewLayout.setScrollPosition(newScrollPosition, ScrollType.Immediate);
    }, "onBrowserDesperateReveal");
    this._register(dom.addDisposableListener(viewDomNode.domNode, "scroll", (e) => onBrowserDesperateReveal(viewDomNode.domNode, true, true)));
    this._register(dom.addDisposableListener(linesContent.domNode, "scroll", (e) => onBrowserDesperateReveal(linesContent.domNode, true, false)));
    this._register(dom.addDisposableListener(overflowGuardDomNode.domNode, "scroll", (e) => onBrowserDesperateReveal(overflowGuardDomNode.domNode, true, false)));
    this._register(dom.addDisposableListener(this.scrollbarDomNode.domNode, "scroll", (e) => onBrowserDesperateReveal(this.scrollbarDomNode.domNode, true, false)));
  }
  dispose() {
    super.dispose();
  }
  _setLayout() {
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this.scrollbarDomNode.setLeft(layoutInfo.contentLeft);
    const minimap = options.get(EditorOption.minimap);
    const side = minimap.side;
    if (side === "right") {
      this.scrollbarDomNode.setWidth(layoutInfo.contentWidth + layoutInfo.minimap.minimapWidth);
    } else {
      this.scrollbarDomNode.setWidth(layoutInfo.contentWidth);
    }
    this.scrollbarDomNode.setHeight(layoutInfo.height);
  }
  getOverviewRulerLayoutInfo() {
    return this.scrollbar.getOverviewRulerLayoutInfo();
  }
  getDomNode() {
    return this.scrollbarDomNode;
  }
  delegateVerticalScrollbarPointerDown(browserEvent) {
    this.scrollbar.delegateVerticalScrollbarPointerDown(browserEvent);
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    this.scrollbar.delegateScrollFromMouseWheelEvent(browserEvent);
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    if (e.hasChanged(EditorOption.scrollbar) || e.hasChanged(EditorOption.mouseWheelScrollSensitivity) || e.hasChanged(EditorOption.fastScrollSensitivity)) {
      const options = this._context.configuration.options;
      const scrollbar = options.get(EditorOption.scrollbar);
      const mouseWheelScrollSensitivity = options.get(EditorOption.mouseWheelScrollSensitivity);
      const fastScrollSensitivity = options.get(EditorOption.fastScrollSensitivity);
      const scrollPredominantAxis = options.get(EditorOption.scrollPredominantAxis);
      const newOpts = {
        vertical: scrollbar.vertical,
        horizontal: scrollbar.horizontal,
        verticalScrollbarSize: scrollbar.verticalScrollbarSize,
        horizontalScrollbarSize: scrollbar.horizontalScrollbarSize,
        scrollByPage: scrollbar.scrollByPage,
        handleMouseWheel: scrollbar.handleMouseWheel,
        mouseWheelScrollSensitivity,
        fastScrollSensitivity,
        scrollPredominantAxis
      };
      this.scrollbar.updateOptions(newOpts);
    }
    if (e.hasChanged(EditorOption.layoutInfo)) {
      this._setLayout();
    }
    return true;
  }
  onScrollChanged(e) {
    return true;
  }
  onThemeChanged(e) {
    this.scrollbar.updateClassName("editor-scrollable " + getThemeTypeSelector(this._context.theme.type));
    return true;
  }
  // --- end event handlers
  prepareRender(ctx) {
  }
  render(ctx) {
    this.scrollbar.renderNow();
  }
}
export {
  EditorScrollbar
};
//# sourceMappingURL=editorScrollbar.js.map
