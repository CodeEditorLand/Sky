var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import "./hover.css";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { Emitter } from "../../../base/common/event.js";
import * as dom from "../../../base/browser/dom.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { HoverAction, HoverWidget as BaseHoverWidget, getHoverAccessibleViewHint } from "../../../base/browser/ui/hover/hoverWidget.js";
import { Widget } from "../../../base/browser/ui/widget.js";
import { IMarkdownRendererService } from "../../markdown/browser/markdownRenderer.js";
import { isMarkdownString } from "../../../base/common/htmlContent.js";
import { localize } from "../../../nls.js";
import { isMacintosh } from "../../../base/common/platform.js";
import { IAccessibilityService } from "../../accessibility/common/accessibility.js";
import { status } from "../../../base/browser/ui/aria/aria.js";
import { TimeoutTimer } from "../../../base/common/async.js";
import { isNumber } from "../../../base/common/types.js";
const $ = dom.$;
var Constants;
(function(Constants2) {
  Constants2[Constants2["PointerSize"] = 3] = "PointerSize";
  Constants2[Constants2["HoverBorderWidth"] = 2] = "HoverBorderWidth";
  Constants2[Constants2["HoverWindowEdgeMargin"] = 2] = "HoverWindowEdgeMargin";
})(Constants || (Constants = {}));
let HoverWidget = class HoverWidget2 extends Widget {
  static {
    __name(this, "HoverWidget");
  }
  get _targetWindow() {
    return dom.getWindow(this._target.targetElements[0]);
  }
  get _targetDocumentElement() {
    return dom.getWindow(this._target.targetElements[0]).document.documentElement;
  }
  get isDisposed() {
    return this._isDisposed;
  }
  get isMouseIn() {
    return this._lockMouseTracker.isMouseIn;
  }
  get domNode() {
    return this._hover.containerDomNode;
  }
  get onDispose() {
    return this._onDispose.event;
  }
  get onRequestLayout() {
    return this._onRequestLayout.event;
  }
  get anchor() {
    return this._hoverPosition === 2 ? 0 : 1;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  /**
   * Whether the hover is "locked" by holding the alt/option key. When locked, the hover will not
   * hide and can be hovered regardless of whether the `hideOnHover` hover option is set.
   */
  get isLocked() {
    return this._isLocked;
  }
  set isLocked(value) {
    if (this._isLocked === value) {
      return;
    }
    this._isLocked = value;
    this._hoverContainer.classList.toggle("locked", this._isLocked);
  }
  /**
   * Adds an element to be tracked by this hover's mouse tracker. Mouse events on
   * this element will be considered as being "inside" the hover, preventing it
   * from closing. This is used for nested hovers where the child hover's container
   * should be treated as part of the parent hover.
   */
  addMouseTrackingElement(element) {
    return this._lockMouseTracker.addElement(element);
  }
  constructor(options, _keybindingService, _configurationService, _markdownRenderer, _accessibilityService) {
    super();
    this._keybindingService = _keybindingService;
    this._configurationService = _configurationService;
    this._markdownRenderer = _markdownRenderer;
    this._accessibilityService = _accessibilityService;
    this._messageListeners = new DisposableStore();
    this._isDisposed = false;
    this._forcePosition = false;
    this._x = 0;
    this._y = 0;
    this._isLocked = false;
    this._enableFocusTraps = false;
    this._addedFocusTrap = false;
    this._maxHeightRatioRelativeToWindow = 0.5;
    this._onDispose = this._register(new Emitter());
    this._onRequestLayout = this._register(new Emitter());
    this._linkHandler = options.linkHandler;
    this._target = "targetElements" in options.target ? options.target : new ElementHoverTarget(options.target);
    if (options.style) {
      switch (options.style) {
        case 1: {
          options.appearance ??= {};
          options.appearance.compact ??= true;
          options.appearance.showPointer ??= true;
          break;
        }
        case 2: {
          options.appearance ??= {};
          options.appearance.compact ??= true;
          break;
        }
      }
    }
    this._hoverPointer = options.appearance?.showPointer ? $("div.workbench-hover-pointer") : void 0;
    this._hover = this._register(new BaseHoverWidget(!options.appearance?.skipFadeInAnimation));
    this._hover.containerDomNode.classList.add("workbench-hover");
    if (options.appearance?.compact) {
      this._hover.containerDomNode.classList.add("workbench-hover", "compact");
    }
    if (options.additionalClasses) {
      this._hover.containerDomNode.classList.add(...options.additionalClasses);
    }
    if (options.position?.forcePosition) {
      this._forcePosition = true;
    }
    if (options.trapFocus) {
      this._enableFocusTraps = true;
    }
    const maxHeightRatio = options.appearance?.maxHeightRatio;
    if (maxHeightRatio !== void 0 && maxHeightRatio > 0 && maxHeightRatio <= 1) {
      this._maxHeightRatioRelativeToWindow = maxHeightRatio;
    }
    this._hoverPosition = options.position?.hoverPosition === void 0 ? 3 : isNumber(options.position.hoverPosition) ? options.position.hoverPosition : 2;
    this.onmousedown(this._hover.containerDomNode, (e) => e.stopPropagation());
    this.onkeydown(this._hover.containerDomNode, (e) => {
      if (e.equals(
        9
        /* KeyCode.Escape */
      )) {
        this.dispose();
      }
    });
    this._register(dom.addDisposableListener(this._targetWindow, "blur", () => this.dispose()));
    const rowElement = $("div.hover-row.markdown-hover");
    const contentsElement = $("div.hover-contents");
    if (typeof options.content === "string") {
      contentsElement.textContent = options.content;
      contentsElement.style.whiteSpace = "pre-wrap";
    } else if (dom.isHTMLElement(options.content)) {
      contentsElement.appendChild(options.content);
      contentsElement.classList.add("html-hover-contents");
    } else {
      const markdown = options.content;
      const { element } = this._register(this._markdownRenderer.render(markdown, {
        actionHandler: this._linkHandler,
        asyncRenderCallback: /* @__PURE__ */ __name(() => {
          contentsElement.classList.add("code-hover-contents");
          this.layout();
          this._onRequestLayout.fire();
        }, "asyncRenderCallback")
      }));
      contentsElement.appendChild(element);
    }
    rowElement.appendChild(contentsElement);
    this._hover.contentsDomNode.appendChild(rowElement);
    if (options.actions && options.actions.length > 0) {
      const statusBarElement = $("div.hover-row.status-bar");
      const actionsElement = $("div.actions");
      options.actions.forEach((action) => {
        const keybinding = this._keybindingService.lookupKeybinding(action.commandId);
        const keybindingLabel = keybinding ? keybinding.getLabel() : null;
        this._register(HoverAction.render(actionsElement, {
          label: action.label,
          commandId: action.commandId,
          run: /* @__PURE__ */ __name((e) => {
            action.run(e);
            this.dispose();
          }, "run"),
          iconClass: action.iconClass
        }, keybindingLabel));
      });
      statusBarElement.appendChild(actionsElement);
      this._hover.containerDomNode.appendChild(statusBarElement);
    }
    this._hoverContainer = $("div.workbench-hover-container");
    if (this._hoverPointer) {
      this._hoverContainer.appendChild(this._hoverPointer);
    }
    this._hoverContainer.appendChild(this._hover.containerDomNode);
    let hideOnHover;
    if (options.actions && options.actions.length > 0) {
      hideOnHover = false;
    } else {
      if (options.persistence?.hideOnHover === void 0) {
        hideOnHover = typeof options.content === "string" || isMarkdownString(options.content) && !options.content.value.includes("](") && !options.content.value.includes("</a>");
      } else {
        hideOnHover = options.persistence.hideOnHover;
      }
    }
    if (options.appearance?.showHoverHint) {
      const statusBarElement = $("div.hover-row.status-bar");
      const infoElement = $("div.info");
      infoElement.textContent = localize("hoverhint", "Hold {0} key to mouse over", isMacintosh ? "Option" : "Alt");
      statusBarElement.appendChild(infoElement);
      this._hover.containerDomNode.appendChild(statusBarElement);
    }
    const mouseTrackerTargets = [...this._target.targetElements];
    if (!hideOnHover) {
      mouseTrackerTargets.push(this._hoverContainer);
    }
    const mouseTracker = this._register(new CompositeMouseTracker(mouseTrackerTargets));
    this._register(mouseTracker.onMouseOut(() => {
      if (!this._isLocked) {
        this.dispose();
      }
    }));
    if (hideOnHover) {
      const mouseTracker2Targets = [...this._target.targetElements, this._hoverContainer];
      this._lockMouseTracker = this._register(new CompositeMouseTracker(mouseTracker2Targets));
      this._register(this._lockMouseTracker.onMouseOut(() => {
        if (!this._isLocked) {
          this.dispose();
        }
      }));
    } else {
      this._lockMouseTracker = mouseTracker;
    }
  }
  addFocusTrap() {
    if (!this._enableFocusTraps || this._addedFocusTrap) {
      return;
    }
    this._addedFocusTrap = true;
    const firstContainerFocusElement = this._hover.containerDomNode;
    const lastContainerFocusElement = this.findLastFocusableChild(this._hover.containerDomNode);
    if (lastContainerFocusElement) {
      const beforeContainerFocusElement = dom.prepend(this._hoverContainer, $("div"));
      const afterContainerFocusElement = dom.append(this._hoverContainer, $("div"));
      beforeContainerFocusElement.tabIndex = 0;
      afterContainerFocusElement.tabIndex = 0;
      this._register(dom.addDisposableListener(afterContainerFocusElement, "focus", (e) => {
        firstContainerFocusElement.focus();
        e.preventDefault();
      }));
      this._register(dom.addDisposableListener(beforeContainerFocusElement, "focus", (e) => {
        lastContainerFocusElement.focus();
        e.preventDefault();
      }));
    }
  }
  findLastFocusableChild(root) {
    if (root.hasChildNodes()) {
      for (let i = 0; i < root.childNodes.length; i++) {
        const node = root.childNodes.item(root.childNodes.length - i - 1);
        if (node.nodeType === node.ELEMENT_NODE) {
          const parsedNode = node;
          if (typeof parsedNode.tabIndex === "number" && parsedNode.tabIndex >= 0) {
            return parsedNode;
          }
        }
        const recursivelyFoundElement = this.findLastFocusableChild(node);
        if (recursivelyFoundElement) {
          return recursivelyFoundElement;
        }
      }
    }
    return void 0;
  }
  render(container) {
    container.appendChild(this._hoverContainer);
    const hoverFocused = this._hoverContainer.contains(this._hoverContainer.ownerDocument.activeElement);
    const accessibleViewHint = hoverFocused && getHoverAccessibleViewHint(this._configurationService.getValue("accessibility.verbosity.hover") === true && this._accessibilityService.isScreenReaderOptimized(), this._keybindingService.lookupKeybinding("editor.action.accessibleView")?.getAriaLabel());
    if (accessibleViewHint) {
      status(accessibleViewHint);
    }
    this.layout();
    this.addFocusTrap();
  }
  layout() {
    this._hover.containerDomNode.classList.remove("right-aligned");
    this._hover.contentsDomNode.style.maxHeight = "";
    const getZoomAccountedBoundingClientRect = /* @__PURE__ */ __name((e) => {
      const zoom = dom.getDomNodeZoomLevel(e);
      const boundingRect = e.getBoundingClientRect();
      return {
        top: boundingRect.top * zoom,
        bottom: boundingRect.bottom * zoom,
        right: boundingRect.right * zoom,
        left: boundingRect.left * zoom
      };
    }, "getZoomAccountedBoundingClientRect");
    const targetBounds = this._target.targetElements.map((e) => getZoomAccountedBoundingClientRect(e));
    const { top, right, bottom, left } = targetBounds[0];
    const width = right - left;
    const height = bottom - top;
    const targetRect = {
      top,
      right,
      bottom,
      left,
      width,
      height,
      center: {
        x: left + width / 2,
        y: top + height / 2
      }
    };
    this.adjustHorizontalHoverPosition(targetRect);
    this.adjustVerticalHoverPosition(targetRect);
    this.adjustHoverMaxHeight(targetRect);
    this._hoverContainer.style.padding = "";
    this._hoverContainer.style.margin = "";
    if (this._hoverPointer) {
      switch (this._hoverPosition) {
        case 1:
          targetRect.left += 3;
          targetRect.right += 3;
          this._hoverContainer.style.paddingLeft = `${3}px`;
          this._hoverContainer.style.marginLeft = `${-3}px`;
          break;
        case 0:
          targetRect.left -= 3;
          targetRect.right -= 3;
          this._hoverContainer.style.paddingRight = `${3}px`;
          this._hoverContainer.style.marginRight = `${-3}px`;
          break;
        case 2:
          targetRect.top += 3;
          targetRect.bottom += 3;
          this._hoverContainer.style.paddingTop = `${3}px`;
          this._hoverContainer.style.marginTop = `${-3}px`;
          break;
        case 3:
          targetRect.top -= 3;
          targetRect.bottom -= 3;
          this._hoverContainer.style.paddingBottom = `${3}px`;
          this._hoverContainer.style.marginBottom = `${-3}px`;
          break;
      }
      targetRect.center.x = targetRect.left + width / 2;
      targetRect.center.y = targetRect.top + height / 2;
    }
    this.computeXCordinate(targetRect);
    this.computeYCordinate(targetRect);
    if (this._hoverPointer) {
      this._hoverPointer.classList.remove("top");
      this._hoverPointer.classList.remove("left");
      this._hoverPointer.classList.remove("right");
      this._hoverPointer.classList.remove("bottom");
      this.setHoverPointerPosition(targetRect);
    }
    this._hover.onContentsChanged();
  }
  computeXCordinate(target) {
    const hoverWidth = this._hover.containerDomNode.clientWidth + 2;
    if (this._target.x !== void 0) {
      this._x = this._target.x;
    } else if (this._hoverPosition === 1) {
      this._x = target.right;
    } else if (this._hoverPosition === 0) {
      this._x = target.left - hoverWidth;
    } else {
      if (this._hoverPointer) {
        this._x = target.center.x - this._hover.containerDomNode.clientWidth / 2;
      } else {
        this._x = target.left;
      }
      if (this._x + hoverWidth >= this._targetDocumentElement.clientWidth) {
        this._hover.containerDomNode.classList.add("right-aligned");
        this._x = Math.max(this._targetDocumentElement.clientWidth - hoverWidth - 2, this._targetDocumentElement.clientLeft);
      }
    }
    if (this._x < this._targetDocumentElement.clientLeft) {
      this._x = target.left + 2;
    }
  }
  computeYCordinate(target) {
    if (this._target.y !== void 0) {
      this._y = this._target.y;
    } else if (this._hoverPosition === 3) {
      this._y = target.top;
    } else if (this._hoverPosition === 2) {
      this._y = target.bottom - 2;
    } else {
      if (this._hoverPointer) {
        this._y = target.center.y + this._hover.containerDomNode.clientHeight / 2;
      } else {
        this._y = target.bottom;
      }
    }
    if (this._y > this._targetWindow.innerHeight) {
      this._y = target.bottom;
    }
  }
  adjustHorizontalHoverPosition(target) {
    if (this._target.x !== void 0) {
      return;
    }
    const hoverPointerOffset = this._hoverPointer ? 3 : 0;
    if (this._forcePosition) {
      const padding = hoverPointerOffset + 2;
      if (this._hoverPosition === 1) {
        this._hover.containerDomNode.style.maxWidth = `${this._targetDocumentElement.clientWidth - target.right - padding}px`;
      } else if (this._hoverPosition === 0) {
        this._hover.containerDomNode.style.maxWidth = `${target.left - padding}px`;
      }
      return;
    }
    if (this._hoverPosition === 1) {
      const roomOnRight = this._targetDocumentElement.clientWidth - target.right;
      if (roomOnRight < this._hover.containerDomNode.clientWidth + hoverPointerOffset) {
        const roomOnLeft = target.left;
        if (roomOnLeft >= this._hover.containerDomNode.clientWidth + hoverPointerOffset) {
          this._hoverPosition = 0;
        } else {
          this._hoverPosition = 2;
        }
      }
    } else if (this._hoverPosition === 0) {
      const roomOnLeft = target.left;
      if (roomOnLeft < this._hover.containerDomNode.clientWidth + hoverPointerOffset) {
        const roomOnRight = this._targetDocumentElement.clientWidth - target.right;
        if (roomOnRight >= this._hover.containerDomNode.clientWidth + hoverPointerOffset) {
          this._hoverPosition = 1;
        } else {
          this._hoverPosition = 2;
        }
      }
      if (target.left - this._hover.containerDomNode.clientWidth - hoverPointerOffset <= this._targetDocumentElement.clientLeft) {
        this._hoverPosition = 1;
      }
    }
  }
  adjustVerticalHoverPosition(target) {
    if (this._target.y !== void 0 || this._forcePosition) {
      return;
    }
    const hoverPointerOffset = this._hoverPointer ? 3 : 0;
    if (this._hoverPosition === 3) {
      if (target.top - this._hover.containerDomNode.clientHeight - hoverPointerOffset < 0) {
        this._hoverPosition = 2;
      }
    } else if (this._hoverPosition === 2) {
      if (target.bottom + this._hover.containerDomNode.offsetHeight + hoverPointerOffset > this._targetWindow.innerHeight) {
        this._hoverPosition = 3;
      }
    }
  }
  adjustHoverMaxHeight(target) {
    let maxHeight = this._targetWindow.innerHeight * this._maxHeightRatioRelativeToWindow;
    if (this._forcePosition) {
      const padding = (this._hoverPointer ? 3 : 0) + 2;
      if (this._hoverPosition === 3) {
        maxHeight = Math.min(maxHeight, target.top - padding);
      } else if (this._hoverPosition === 2) {
        maxHeight = Math.min(maxHeight, this._targetWindow.innerHeight - target.bottom - padding);
      }
    }
    this._hover.containerDomNode.style.maxHeight = `${maxHeight}px`;
    if (this._hover.contentsDomNode.clientHeight < this._hover.contentsDomNode.scrollHeight) {
      const extraRightPadding = `${this._hover.scrollbar.options.verticalScrollbarSize}px`;
      if (this._hover.contentsDomNode.style.paddingRight !== extraRightPadding) {
        this._hover.contentsDomNode.style.paddingRight = extraRightPadding;
      }
    }
  }
  setHoverPointerPosition(target) {
    if (!this._hoverPointer) {
      return;
    }
    switch (this._hoverPosition) {
      case 0:
      case 1: {
        this._hoverPointer.classList.add(this._hoverPosition === 0 ? "right" : "left");
        const hoverHeight = this._hover.containerDomNode.clientHeight;
        if (hoverHeight > target.height) {
          this._hoverPointer.style.top = `${target.center.y - (this._y - hoverHeight) - 3}px`;
        } else {
          this._hoverPointer.style.top = `${Math.round(hoverHeight / 2) - 3}px`;
        }
        break;
      }
      case 3:
      case 2: {
        this._hoverPointer.classList.add(this._hoverPosition === 3 ? "bottom" : "top");
        const hoverWidth = this._hover.containerDomNode.clientWidth;
        let pointerLeftPosition = Math.round(hoverWidth / 2) - 3;
        const pointerX = this._x + pointerLeftPosition;
        if (pointerX < target.left || pointerX > target.right) {
          pointerLeftPosition = target.center.x - this._x - 3;
        }
        this._hoverPointer.style.left = `${pointerLeftPosition}px`;
        break;
      }
    }
  }
  focus() {
    this._hover.containerDomNode.focus();
  }
  hide() {
    this.dispose();
  }
  dispose() {
    if (!this._isDisposed) {
      this._onDispose.fire();
      this._target.dispose?.();
      this._hoverContainer.remove();
      this._messageListeners.dispose();
      super.dispose();
    }
    this._isDisposed = true;
  }
};
HoverWidget = __decorate([
  __param(1, IKeybindingService),
  __param(2, IConfigurationService),
  __param(3, IMarkdownRendererService),
  __param(4, IAccessibilityService)
], HoverWidget);
class CompositeMouseTracker extends Widget {
  static {
    __name(this, "CompositeMouseTracker");
  }
  get onMouseOut() {
    return this._onMouseOut.event;
  }
  get isMouseIn() {
    return this._isMouseIn;
  }
  /**
   * @param _elements The target elements to track mouse in/out events on.
   * @param _eventDebounceDelay The delay in ms to debounce the event firing. This is used to
   * allow a short period for the mouse to move into the hover or a nearby target element. For
   * example hovering a scroll bar will not hide the hover immediately.
   */
  constructor(_elements, _eventDebounceDelay = 200) {
    super();
    this._elements = _elements;
    this._eventDebounceDelay = _eventDebounceDelay;
    this._isMouseIn = true;
    this._mouseTimer = this._register(new MutableDisposable());
    this._onMouseOut = this._register(new Emitter());
    for (const element of this._elements) {
      this.onmouseover(element, () => this._onTargetMouseOver());
      this.onmouseleave(element, () => this._onTargetMouseLeave());
    }
  }
  _onTargetMouseOver() {
    this._isMouseIn = true;
    this._mouseTimer.clear();
  }
  _onTargetMouseLeave() {
    this._isMouseIn = false;
    this._mouseTimer.value = new TimeoutTimer(() => this._fireIfMouseOutside(), this._eventDebounceDelay);
  }
  _fireIfMouseOutside() {
    if (!this._isMouseIn) {
      this._onMouseOut.fire();
    }
  }
  /**
   * Adds an element to be tracked by this mouse tracker. Mouse events on this
   * element will be considered as being "inside" the tracked area.
   */
  addElement(element) {
    if (this._elements.includes(element)) {
      return Disposable.None;
    }
    this._elements.push(element);
    const store = new DisposableStore();
    store.add(dom.addDisposableListener(element, dom.EventType.MOUSE_OVER, () => this._onTargetMouseOver()));
    store.add(dom.addDisposableListener(element, dom.EventType.MOUSE_LEAVE, () => this._onTargetMouseLeave()));
    store.add(toDisposable(() => {
      const index = this._elements.indexOf(element);
      if (index >= 0) {
        this._elements.splice(index, 1);
      }
    }));
    return store;
  }
}
class ElementHoverTarget {
  static {
    __name(this, "ElementHoverTarget");
  }
  constructor(_element) {
    this._element = _element;
    this.targetElements = [this._element];
  }
  dispose() {
  }
}
export {
  HoverWidget
};
//# sourceMappingURL=hoverWidget.js.map
