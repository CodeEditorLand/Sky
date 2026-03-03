var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../base/browser/dom.js";
import { createFastDomNode } from "../../../../base/browser/fastDomNode.js";
import { SmoothScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { PartFingerprints, ViewPart } from "../../view/viewPart.js";
import { getThemeTypeSelector } from "../../../../platform/theme/common/themeService.js";
class EditorScrollbar extends ViewPart {
  static {
    __name(this, "EditorScrollbar");
  }
  constructor(context, linesContent, viewDomNode, overflowGuardDomNode) {
    super(context);
    const options = this._context.configuration.options;
    const scrollbar = options.get(
      117
      /* EditorOption.scrollbar */
    );
    const mouseWheelScrollSensitivity = options.get(
      83
      /* EditorOption.mouseWheelScrollSensitivity */
    );
    const fastScrollSensitivity = options.get(
      49
      /* EditorOption.fastScrollSensitivity */
    );
    const scrollPredominantAxis = options.get(
      120
      /* EditorOption.scrollPredominantAxis */
    );
    const inertialScroll = options.get(
      158
      /* EditorOption.inertialScroll */
    );
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
      scrollByPage: scrollbar.scrollByPage,
      inertialScroll
    };
    this.scrollbar = this._register(new SmoothScrollableElement(linesContent.domNode, scrollbarOptions, this._context.viewLayout.getScrollable()));
    PartFingerprints.write(
      this.scrollbar.getDomNode(),
      6
      /* PartFingerprint.ScrollableElement */
    );
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
      this._context.viewModel.viewLayout.setScrollPosition(
        newScrollPosition,
        1
        /* ScrollType.Immediate */
      );
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
    const layoutInfo = options.get(
      165
      /* EditorOption.layoutInfo */
    );
    this.scrollbarDomNode.setLeft(layoutInfo.contentLeft);
    const minimap = options.get(
      81
      /* EditorOption.minimap */
    );
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
    if (e.hasChanged(
      117
      /* EditorOption.scrollbar */
    ) || e.hasChanged(
      83
      /* EditorOption.mouseWheelScrollSensitivity */
    ) || e.hasChanged(
      49
      /* EditorOption.fastScrollSensitivity */
    )) {
      const options = this._context.configuration.options;
      const scrollbar = options.get(
        117
        /* EditorOption.scrollbar */
      );
      const mouseWheelScrollSensitivity = options.get(
        83
        /* EditorOption.mouseWheelScrollSensitivity */
      );
      const fastScrollSensitivity = options.get(
        49
        /* EditorOption.fastScrollSensitivity */
      );
      const scrollPredominantAxis = options.get(
        120
        /* EditorOption.scrollPredominantAxis */
      );
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
    if (e.hasChanged(
      165
      /* EditorOption.layoutInfo */
    )) {
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
