var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
import { $, append, EventHelper, EventLike, getWindow, isHTMLElement } from "../../dom.js";
import { createStyleSheet } from "../../domStylesheets.js";
import { DomEmitter } from "../../event.js";
import { EventType, Gesture } from "../../touch.js";
import { Delayer } from "../../../common/async.js";
import { memoize } from "../../../common/decorators.js";
import { Emitter, Event } from "../../../common/event.js";
import { Disposable, DisposableStore, toDisposable } from "../../../common/lifecycle.js";
import { isMacintosh } from "../../../common/platform.js";
import "./sash.css";
const DEBUG = false;
var OrthogonalEdge = /* @__PURE__ */ ((OrthogonalEdge2) => {
  OrthogonalEdge2["North"] = "north";
  OrthogonalEdge2["South"] = "south";
  OrthogonalEdge2["East"] = "east";
  OrthogonalEdge2["West"] = "west";
  return OrthogonalEdge2;
})(OrthogonalEdge || {});
var Orientation = /* @__PURE__ */ ((Orientation2) => {
  Orientation2[Orientation2["VERTICAL"] = 0] = "VERTICAL";
  Orientation2[Orientation2["HORIZONTAL"] = 1] = "HORIZONTAL";
  return Orientation2;
})(Orientation || {});
var SashState = /* @__PURE__ */ ((SashState2) => {
  SashState2[SashState2["Disabled"] = 0] = "Disabled";
  SashState2[SashState2["AtMinimum"] = 1] = "AtMinimum";
  SashState2[SashState2["AtMaximum"] = 2] = "AtMaximum";
  SashState2[SashState2["Enabled"] = 3] = "Enabled";
  return SashState2;
})(SashState || {});
let globalSize = 4;
const onDidChangeGlobalSize = new Emitter();
function setGlobalSashSize(size) {
  globalSize = size;
  onDidChangeGlobalSize.fire(size);
}
__name(setGlobalSashSize, "setGlobalSashSize");
let globalHoverDelay = 300;
const onDidChangeHoverDelay = new Emitter();
function setGlobalHoverDelay(size) {
  globalHoverDelay = size;
  onDidChangeHoverDelay.fire(size);
}
__name(setGlobalHoverDelay, "setGlobalHoverDelay");
class MouseEventFactory {
  constructor(el) {
    this.el = el;
  }
  static {
    __name(this, "MouseEventFactory");
  }
  disposables = new DisposableStore();
  get onPointerMove() {
    return this.disposables.add(new DomEmitter(getWindow(this.el), "mousemove")).event;
  }
  get onPointerUp() {
    return this.disposables.add(new DomEmitter(getWindow(this.el), "mouseup")).event;
  }
  dispose() {
    this.disposables.dispose();
  }
}
__decorateClass([
  memoize
], MouseEventFactory.prototype, "onPointerMove", 1);
__decorateClass([
  memoize
], MouseEventFactory.prototype, "onPointerUp", 1);
class GestureEventFactory {
  constructor(el) {
    this.el = el;
  }
  static {
    __name(this, "GestureEventFactory");
  }
  disposables = new DisposableStore();
  get onPointerMove() {
    return this.disposables.add(new DomEmitter(this.el, EventType.Change)).event;
  }
  get onPointerUp() {
    return this.disposables.add(new DomEmitter(this.el, EventType.End)).event;
  }
  dispose() {
    this.disposables.dispose();
  }
}
__decorateClass([
  memoize
], GestureEventFactory.prototype, "onPointerMove", 1);
__decorateClass([
  memoize
], GestureEventFactory.prototype, "onPointerUp", 1);
class OrthogonalPointerEventFactory {
  constructor(factory) {
    this.factory = factory;
  }
  static {
    __name(this, "OrthogonalPointerEventFactory");
  }
  get onPointerMove() {
    return this.factory.onPointerMove;
  }
  get onPointerUp() {
    return this.factory.onPointerUp;
  }
  dispose() {
  }
}
__decorateClass([
  memoize
], OrthogonalPointerEventFactory.prototype, "onPointerMove", 1);
__decorateClass([
  memoize
], OrthogonalPointerEventFactory.prototype, "onPointerUp", 1);
const PointerEventsDisabledCssClass = "pointer-events-disabled";
class Sash extends Disposable {
  static {
    __name(this, "Sash");
  }
  el;
  layoutProvider;
  orientation;
  size;
  hoverDelay = globalHoverDelay;
  hoverDelayer = this._register(new Delayer(this.hoverDelay));
  _state = 3 /* Enabled */;
  onDidEnablementChange = this._register(new Emitter());
  _onDidStart = this._register(new Emitter());
  _onDidChange = this._register(new Emitter());
  _onDidReset = this._register(new Emitter());
  _onDidEnd = this._register(new Emitter());
  orthogonalStartSashDisposables = this._register(new DisposableStore());
  _orthogonalStartSash;
  orthogonalStartDragHandleDisposables = this._register(new DisposableStore());
  _orthogonalStartDragHandle;
  orthogonalEndSashDisposables = this._register(new DisposableStore());
  _orthogonalEndSash;
  orthogonalEndDragHandleDisposables = this._register(new DisposableStore());
  _orthogonalEndDragHandle;
  get state() {
    return this._state;
  }
  get orthogonalStartSash() {
    return this._orthogonalStartSash;
  }
  get orthogonalEndSash() {
    return this._orthogonalEndSash;
  }
  /**
   * The state of a sash defines whether it can be interacted with by the user
   * as well as what mouse cursor to use, when hovered.
   */
  set state(state) {
    if (this._state === state) {
      return;
    }
    this.el.classList.toggle("disabled", state === 0 /* Disabled */);
    this.el.classList.toggle("minimum", state === 1 /* AtMinimum */);
    this.el.classList.toggle("maximum", state === 2 /* AtMaximum */);
    this._state = state;
    this.onDidEnablementChange.fire(state);
  }
  /**
   * An event which fires whenever the user starts dragging this sash.
   */
  onDidStart = this._onDidStart.event;
  /**
   * An event which fires whenever the user moves the mouse while
   * dragging this sash.
   */
  onDidChange = this._onDidChange.event;
  /**
   * An event which fires whenever the user double clicks this sash.
   */
  onDidReset = this._onDidReset.event;
  /**
   * An event which fires whenever the user stops dragging this sash.
   */
  onDidEnd = this._onDidEnd.event;
  /**
   * A linked sash will be forwarded the same user interactions and events
   * so it moves exactly the same way as this sash.
   *
   * Useful in 2x2 grids. Not meant for widespread usage.
   */
  linkedSash = void 0;
  /**
   * A reference to another sash, perpendicular to this one, which
   * aligns at the start of this one. A corner sash will be created
   * automatically at that location.
   *
   * The start of a horizontal sash is its left-most position.
   * The start of a vertical sash is its top-most position.
   */
  set orthogonalStartSash(sash) {
    if (this._orthogonalStartSash === sash) {
      return;
    }
    this.orthogonalStartDragHandleDisposables.clear();
    this.orthogonalStartSashDisposables.clear();
    if (sash) {
      const onChange = /* @__PURE__ */ __name((state) => {
        this.orthogonalStartDragHandleDisposables.clear();
        if (state !== 0 /* Disabled */) {
          this._orthogonalStartDragHandle = append(this.el, $(".orthogonal-drag-handle.start"));
          this.orthogonalStartDragHandleDisposables.add(toDisposable(() => this._orthogonalStartDragHandle.remove()));
          this.orthogonalStartDragHandleDisposables.add(new DomEmitter(this._orthogonalStartDragHandle, "mouseenter")).event(() => Sash.onMouseEnter(sash), void 0, this.orthogonalStartDragHandleDisposables);
          this.orthogonalStartDragHandleDisposables.add(new DomEmitter(this._orthogonalStartDragHandle, "mouseleave")).event(() => Sash.onMouseLeave(sash), void 0, this.orthogonalStartDragHandleDisposables);
        }
      }, "onChange");
      this.orthogonalStartSashDisposables.add(sash.onDidEnablementChange.event(onChange, this));
      onChange(sash.state);
    }
    this._orthogonalStartSash = sash;
  }
  /**
   * A reference to another sash, perpendicular to this one, which
   * aligns at the end of this one. A corner sash will be created
   * automatically at that location.
   *
   * The end of a horizontal sash is its right-most position.
   * The end of a vertical sash is its bottom-most position.
   */
  set orthogonalEndSash(sash) {
    if (this._orthogonalEndSash === sash) {
      return;
    }
    this.orthogonalEndDragHandleDisposables.clear();
    this.orthogonalEndSashDisposables.clear();
    if (sash) {
      const onChange = /* @__PURE__ */ __name((state) => {
        this.orthogonalEndDragHandleDisposables.clear();
        if (state !== 0 /* Disabled */) {
          this._orthogonalEndDragHandle = append(this.el, $(".orthogonal-drag-handle.end"));
          this.orthogonalEndDragHandleDisposables.add(toDisposable(() => this._orthogonalEndDragHandle.remove()));
          this.orthogonalEndDragHandleDisposables.add(new DomEmitter(this._orthogonalEndDragHandle, "mouseenter")).event(() => Sash.onMouseEnter(sash), void 0, this.orthogonalEndDragHandleDisposables);
          this.orthogonalEndDragHandleDisposables.add(new DomEmitter(this._orthogonalEndDragHandle, "mouseleave")).event(() => Sash.onMouseLeave(sash), void 0, this.orthogonalEndDragHandleDisposables);
        }
      }, "onChange");
      this.orthogonalEndSashDisposables.add(sash.onDidEnablementChange.event(onChange, this));
      onChange(sash.state);
    }
    this._orthogonalEndSash = sash;
  }
  constructor(container, layoutProvider, options) {
    super();
    this.el = append(container, $(".monaco-sash"));
    if (options.orthogonalEdge) {
      this.el.classList.add(`orthogonal-edge-${options.orthogonalEdge}`);
    }
    if (isMacintosh) {
      this.el.classList.add("mac");
    }
    const onMouseDown = this._register(new DomEmitter(this.el, "mousedown")).event;
    this._register(onMouseDown((e) => this.onPointerStart(e, new MouseEventFactory(container)), this));
    const onMouseDoubleClick = this._register(new DomEmitter(this.el, "dblclick")).event;
    this._register(onMouseDoubleClick(this.onPointerDoublePress, this));
    const onMouseEnter = this._register(new DomEmitter(this.el, "mouseenter")).event;
    this._register(onMouseEnter(() => Sash.onMouseEnter(this)));
    const onMouseLeave = this._register(new DomEmitter(this.el, "mouseleave")).event;
    this._register(onMouseLeave(() => Sash.onMouseLeave(this)));
    this._register(Gesture.addTarget(this.el));
    const onTouchStart = this._register(new DomEmitter(this.el, EventType.Start)).event;
    this._register(onTouchStart((e) => this.onPointerStart(e, new GestureEventFactory(this.el)), this));
    const onTap = this._register(new DomEmitter(this.el, EventType.Tap)).event;
    let doubleTapTimeout = void 0;
    this._register(onTap((event) => {
      if (doubleTapTimeout) {
        clearTimeout(doubleTapTimeout);
        doubleTapTimeout = void 0;
        this.onPointerDoublePress(event);
        return;
      }
      clearTimeout(doubleTapTimeout);
      doubleTapTimeout = setTimeout(() => doubleTapTimeout = void 0, 250);
    }, this));
    if (typeof options.size === "number") {
      this.size = options.size;
      if (options.orientation === 0 /* VERTICAL */) {
        this.el.style.width = `${this.size}px`;
      } else {
        this.el.style.height = `${this.size}px`;
      }
    } else {
      this.size = globalSize;
      this._register(onDidChangeGlobalSize.event((size) => {
        this.size = size;
        this.layout();
      }));
    }
    this._register(onDidChangeHoverDelay.event((delay) => this.hoverDelay = delay));
    this.layoutProvider = layoutProvider;
    this.orthogonalStartSash = options.orthogonalStartSash;
    this.orthogonalEndSash = options.orthogonalEndSash;
    this.orientation = options.orientation || 0 /* VERTICAL */;
    if (this.orientation === 1 /* HORIZONTAL */) {
      this.el.classList.add("horizontal");
      this.el.classList.remove("vertical");
    } else {
      this.el.classList.remove("horizontal");
      this.el.classList.add("vertical");
    }
    this.el.classList.toggle("debug", DEBUG);
    this.layout();
  }
  onPointerStart(event, pointerEventFactory) {
    EventHelper.stop(event);
    let isMultisashResize = false;
    if (!event.__orthogonalSashEvent) {
      const orthogonalSash = this.getOrthogonalSash(event);
      if (orthogonalSash) {
        isMultisashResize = true;
        event.__orthogonalSashEvent = true;
        orthogonalSash.onPointerStart(event, new OrthogonalPointerEventFactory(pointerEventFactory));
      }
    }
    if (this.linkedSash && !event.__linkedSashEvent) {
      event.__linkedSashEvent = true;
      this.linkedSash.onPointerStart(event, new OrthogonalPointerEventFactory(pointerEventFactory));
    }
    if (!this.state) {
      return;
    }
    const iframes = this.el.ownerDocument.getElementsByTagName("iframe");
    for (const iframe of iframes) {
      iframe.classList.add(PointerEventsDisabledCssClass);
    }
    const startX = event.pageX;
    const startY = event.pageY;
    const altKey = event.altKey;
    const startEvent = { startX, currentX: startX, startY, currentY: startY, altKey };
    this.el.classList.add("active");
    this._onDidStart.fire(startEvent);
    const style = createStyleSheet(this.el);
    const updateStyle = /* @__PURE__ */ __name(() => {
      let cursor = "";
      if (isMultisashResize) {
        cursor = "all-scroll";
      } else if (this.orientation === 1 /* HORIZONTAL */) {
        if (this.state === 1 /* AtMinimum */) {
          cursor = "s-resize";
        } else if (this.state === 2 /* AtMaximum */) {
          cursor = "n-resize";
        } else {
          cursor = isMacintosh ? "row-resize" : "ns-resize";
        }
      } else {
        if (this.state === 1 /* AtMinimum */) {
          cursor = "e-resize";
        } else if (this.state === 2 /* AtMaximum */) {
          cursor = "w-resize";
        } else {
          cursor = isMacintosh ? "col-resize" : "ew-resize";
        }
      }
      style.textContent = `* { cursor: ${cursor} !important; }`;
    }, "updateStyle");
    const disposables = new DisposableStore();
    updateStyle();
    if (!isMultisashResize) {
      this.onDidEnablementChange.event(updateStyle, null, disposables);
    }
    const onPointerMove = /* @__PURE__ */ __name((e) => {
      EventHelper.stop(e, false);
      const event2 = { startX, currentX: e.pageX, startY, currentY: e.pageY, altKey };
      this._onDidChange.fire(event2);
    }, "onPointerMove");
    const onPointerUp = /* @__PURE__ */ __name((e) => {
      EventHelper.stop(e, false);
      style.remove();
      this.el.classList.remove("active");
      this._onDidEnd.fire();
      disposables.dispose();
      for (const iframe of iframes) {
        iframe.classList.remove(PointerEventsDisabledCssClass);
      }
    }, "onPointerUp");
    pointerEventFactory.onPointerMove(onPointerMove, null, disposables);
    pointerEventFactory.onPointerUp(onPointerUp, null, disposables);
    disposables.add(pointerEventFactory);
  }
  onPointerDoublePress(e) {
    const orthogonalSash = this.getOrthogonalSash(e);
    if (orthogonalSash) {
      orthogonalSash._onDidReset.fire();
    }
    if (this.linkedSash) {
      this.linkedSash._onDidReset.fire();
    }
    this._onDidReset.fire();
  }
  static onMouseEnter(sash, fromLinkedSash = false) {
    if (sash.el.classList.contains("active")) {
      sash.hoverDelayer.cancel();
      sash.el.classList.add("hover");
    } else {
      sash.hoverDelayer.trigger(() => sash.el.classList.add("hover"), sash.hoverDelay).then(void 0, () => {
      });
    }
    if (!fromLinkedSash && sash.linkedSash) {
      Sash.onMouseEnter(sash.linkedSash, true);
    }
  }
  static onMouseLeave(sash, fromLinkedSash = false) {
    sash.hoverDelayer.cancel();
    sash.el.classList.remove("hover");
    if (!fromLinkedSash && sash.linkedSash) {
      Sash.onMouseLeave(sash.linkedSash, true);
    }
  }
  /**
   * Forcefully stop any user interactions with this sash.
   * Useful when hiding a parent component, while the user is still
   * interacting with the sash.
   */
  clearSashHoverState() {
    Sash.onMouseLeave(this);
  }
  /**
   * Layout the sash. The sash will size and position itself
   * based on its provided {@link ISashLayoutProvider layout provider}.
   */
  layout() {
    if (this.orientation === 0 /* VERTICAL */) {
      const verticalProvider = this.layoutProvider;
      this.el.style.left = verticalProvider.getVerticalSashLeft(this) - this.size / 2 + "px";
      if (verticalProvider.getVerticalSashTop) {
        this.el.style.top = verticalProvider.getVerticalSashTop(this) + "px";
      }
      if (verticalProvider.getVerticalSashHeight) {
        this.el.style.height = verticalProvider.getVerticalSashHeight(this) + "px";
      }
    } else {
      const horizontalProvider = this.layoutProvider;
      this.el.style.top = horizontalProvider.getHorizontalSashTop(this) - this.size / 2 + "px";
      if (horizontalProvider.getHorizontalSashLeft) {
        this.el.style.left = horizontalProvider.getHorizontalSashLeft(this) + "px";
      }
      if (horizontalProvider.getHorizontalSashWidth) {
        this.el.style.width = horizontalProvider.getHorizontalSashWidth(this) + "px";
      }
    }
  }
  getOrthogonalSash(e) {
    const target = e.initialTarget ?? e.target;
    if (!target || !isHTMLElement(target)) {
      return void 0;
    }
    if (target.classList.contains("orthogonal-drag-handle")) {
      return target.classList.contains("start") ? this.orthogonalStartSash : this.orthogonalEndSash;
    }
    return void 0;
  }
  dispose() {
    super.dispose();
    this.el.remove();
  }
}
export {
  Orientation,
  OrthogonalEdge,
  Sash,
  SashState,
  setGlobalHoverDelay,
  setGlobalSashSize
};
//# sourceMappingURL=sash.js.map
