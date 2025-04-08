var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as browser from "./browser.js";
import { BrowserFeatures } from "./canIUse.js";
import { IKeyboardEvent, StandardKeyboardEvent } from "./keyboardEvent.js";
import { IMouseEvent, StandardMouseEvent } from "./mouseEvent.js";
import { AbstractIdleValue, IntervalTimer, TimeoutTimer, _runWhenIdle, IdleDeadline } from "../common/async.js";
import { onUnexpectedError } from "../common/errors.js";
import * as event from "../common/event.js";
import dompurify from "./dompurify/dompurify.js";
import { KeyCode } from "../common/keyCodes.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../common/lifecycle.js";
import { RemoteAuthorities, Schemas } from "../common/network.js";
import * as platform from "../common/platform.js";
import { URI } from "../common/uri.js";
import { hash } from "../common/hash.js";
import { CodeWindow, ensureCodeWindow, mainWindow } from "./window.js";
import { isPointWithinTriangle } from "../common/numbers.js";
export * from "./domImpl/domObservable.js";
export * from "./domImpl/n.js";
const {
  registerWindow,
  getWindow,
  getDocument,
  getWindows,
  getWindowsCount,
  getWindowId,
  getWindowById,
  hasWindow,
  onDidRegisterWindow,
  onWillUnregisterWindow,
  onDidUnregisterWindow
} = function() {
  const windows = /* @__PURE__ */ new Map();
  ensureCodeWindow(mainWindow, 1);
  const mainWindowRegistration = { window: mainWindow, disposables: new DisposableStore() };
  windows.set(mainWindow.vscodeWindowId, mainWindowRegistration);
  const onDidRegisterWindow2 = new event.Emitter();
  const onDidUnregisterWindow2 = new event.Emitter();
  const onWillUnregisterWindow2 = new event.Emitter();
  function getWindowById2(windowId, fallbackToMain) {
    const window = typeof windowId === "number" ? windows.get(windowId) : void 0;
    return window ?? (fallbackToMain ? mainWindowRegistration : void 0);
  }
  __name(getWindowById2, "getWindowById");
  return {
    onDidRegisterWindow: onDidRegisterWindow2.event,
    onWillUnregisterWindow: onWillUnregisterWindow2.event,
    onDidUnregisterWindow: onDidUnregisterWindow2.event,
    registerWindow(window) {
      if (windows.has(window.vscodeWindowId)) {
        return Disposable.None;
      }
      const disposables = new DisposableStore();
      const registeredWindow = {
        window,
        disposables: disposables.add(new DisposableStore())
      };
      windows.set(window.vscodeWindowId, registeredWindow);
      disposables.add(toDisposable(() => {
        windows.delete(window.vscodeWindowId);
        onDidUnregisterWindow2.fire(window);
      }));
      disposables.add(addDisposableListener(window, EventType.BEFORE_UNLOAD, () => {
        onWillUnregisterWindow2.fire(window);
      }));
      onDidRegisterWindow2.fire(registeredWindow);
      return disposables;
    },
    getWindows() {
      return windows.values();
    },
    getWindowsCount() {
      return windows.size;
    },
    getWindowId(targetWindow) {
      return targetWindow.vscodeWindowId;
    },
    hasWindow(windowId) {
      return windows.has(windowId);
    },
    getWindowById: getWindowById2,
    getWindow(e) {
      const candidateNode = e;
      if (candidateNode?.ownerDocument?.defaultView) {
        return candidateNode.ownerDocument.defaultView.window;
      }
      const candidateEvent = e;
      if (candidateEvent?.view) {
        return candidateEvent.view.window;
      }
      return mainWindow;
    },
    getDocument(e) {
      const candidateNode = e;
      return getWindow(candidateNode).document;
    }
  };
}();
function clearNode(node) {
  while (node.firstChild) {
    node.firstChild.remove();
  }
}
__name(clearNode, "clearNode");
class DomListener {
  static {
    __name(this, "DomListener");
  }
  _handler;
  _node;
  _type;
  _options;
  constructor(node, type, handler, options) {
    this._node = node;
    this._type = type;
    this._handler = handler;
    this._options = options || false;
    this._node.addEventListener(this._type, this._handler, this._options);
  }
  dispose() {
    if (!this._handler) {
      return;
    }
    this._node.removeEventListener(this._type, this._handler, this._options);
    this._node = null;
    this._handler = null;
  }
}
function addDisposableListener(node, type, handler, useCaptureOrOptions) {
  return new DomListener(node, type, handler, useCaptureOrOptions);
}
__name(addDisposableListener, "addDisposableListener");
function _wrapAsStandardMouseEvent(targetWindow, handler) {
  return function(e) {
    return handler(new StandardMouseEvent(targetWindow, e));
  };
}
__name(_wrapAsStandardMouseEvent, "_wrapAsStandardMouseEvent");
function _wrapAsStandardKeyboardEvent(handler) {
  return function(e) {
    return handler(new StandardKeyboardEvent(e));
  };
}
__name(_wrapAsStandardKeyboardEvent, "_wrapAsStandardKeyboardEvent");
const addStandardDisposableListener = /* @__PURE__ */ __name(function addStandardDisposableListener2(node, type, handler, useCapture) {
  let wrapHandler = handler;
  if (type === "click" || type === "mousedown" || type === "contextmenu") {
    wrapHandler = _wrapAsStandardMouseEvent(getWindow(node), handler);
  } else if (type === "keydown" || type === "keypress" || type === "keyup") {
    wrapHandler = _wrapAsStandardKeyboardEvent(handler);
  }
  return addDisposableListener(node, type, wrapHandler, useCapture);
}, "addStandardDisposableListener");
const addStandardDisposableGenericMouseDownListener = /* @__PURE__ */ __name(function addStandardDisposableListener3(node, handler, useCapture) {
  const wrapHandler = _wrapAsStandardMouseEvent(getWindow(node), handler);
  return addDisposableGenericMouseDownListener(node, wrapHandler, useCapture);
}, "addStandardDisposableListener");
const addStandardDisposableGenericMouseUpListener = /* @__PURE__ */ __name(function addStandardDisposableListener4(node, handler, useCapture) {
  const wrapHandler = _wrapAsStandardMouseEvent(getWindow(node), handler);
  return addDisposableGenericMouseUpListener(node, wrapHandler, useCapture);
}, "addStandardDisposableListener");
function addDisposableGenericMouseDownListener(node, handler, useCapture) {
  return addDisposableListener(node, platform.isIOS && BrowserFeatures.pointerEvents ? EventType.POINTER_DOWN : EventType.MOUSE_DOWN, handler, useCapture);
}
__name(addDisposableGenericMouseDownListener, "addDisposableGenericMouseDownListener");
function addDisposableGenericMouseMoveListener(node, handler, useCapture) {
  return addDisposableListener(node, platform.isIOS && BrowserFeatures.pointerEvents ? EventType.POINTER_MOVE : EventType.MOUSE_MOVE, handler, useCapture);
}
__name(addDisposableGenericMouseMoveListener, "addDisposableGenericMouseMoveListener");
function addDisposableGenericMouseUpListener(node, handler, useCapture) {
  return addDisposableListener(node, platform.isIOS && BrowserFeatures.pointerEvents ? EventType.POINTER_UP : EventType.MOUSE_UP, handler, useCapture);
}
__name(addDisposableGenericMouseUpListener, "addDisposableGenericMouseUpListener");
function runWhenWindowIdle(targetWindow, callback, timeout) {
  return _runWhenIdle(targetWindow, callback, timeout);
}
__name(runWhenWindowIdle, "runWhenWindowIdle");
class WindowIdleValue extends AbstractIdleValue {
  static {
    __name(this, "WindowIdleValue");
  }
  constructor(targetWindow, executor) {
    super(targetWindow, executor);
  }
}
let runAtThisOrScheduleAtNextAnimationFrame;
let scheduleAtNextAnimationFrame;
function disposableWindowInterval(targetWindow, handler, interval, iterations) {
  let iteration = 0;
  const timer = targetWindow.setInterval(() => {
    iteration++;
    if (typeof iterations === "number" && iteration >= iterations || handler() === true) {
      disposable.dispose();
    }
  }, interval);
  const disposable = toDisposable(() => {
    targetWindow.clearInterval(timer);
  });
  return disposable;
}
__name(disposableWindowInterval, "disposableWindowInterval");
class WindowIntervalTimer extends IntervalTimer {
  static {
    __name(this, "WindowIntervalTimer");
  }
  defaultTarget;
  /**
   *
   * @param node The optional node from which the target window is determined
   */
  constructor(node) {
    super();
    this.defaultTarget = node && getWindow(node);
  }
  cancelAndSet(runner, interval, targetWindow) {
    return super.cancelAndSet(runner, interval, targetWindow ?? this.defaultTarget);
  }
}
class AnimationFrameQueueItem {
  static {
    __name(this, "AnimationFrameQueueItem");
  }
  _runner;
  priority;
  _canceled;
  constructor(runner, priority = 0) {
    this._runner = runner;
    this.priority = priority;
    this._canceled = false;
  }
  dispose() {
    this._canceled = true;
  }
  execute() {
    if (this._canceled) {
      return;
    }
    try {
      this._runner();
    } catch (e) {
      onUnexpectedError(e);
    }
  }
  // Sort by priority (largest to lowest)
  static sort(a, b) {
    return b.priority - a.priority;
  }
}
(function() {
  const NEXT_QUEUE = /* @__PURE__ */ new Map();
  const CURRENT_QUEUE = /* @__PURE__ */ new Map();
  const animFrameRequested = /* @__PURE__ */ new Map();
  const inAnimationFrameRunner = /* @__PURE__ */ new Map();
  const animationFrameRunner = /* @__PURE__ */ __name((targetWindowId) => {
    animFrameRequested.set(targetWindowId, false);
    const currentQueue = NEXT_QUEUE.get(targetWindowId) ?? [];
    CURRENT_QUEUE.set(targetWindowId, currentQueue);
    NEXT_QUEUE.set(targetWindowId, []);
    inAnimationFrameRunner.set(targetWindowId, true);
    while (currentQueue.length > 0) {
      currentQueue.sort(AnimationFrameQueueItem.sort);
      const top = currentQueue.shift();
      top.execute();
    }
    inAnimationFrameRunner.set(targetWindowId, false);
  }, "animationFrameRunner");
  scheduleAtNextAnimationFrame = /* @__PURE__ */ __name((targetWindow, runner, priority = 0) => {
    const targetWindowId = getWindowId(targetWindow);
    const item = new AnimationFrameQueueItem(runner, priority);
    let nextQueue = NEXT_QUEUE.get(targetWindowId);
    if (!nextQueue) {
      nextQueue = [];
      NEXT_QUEUE.set(targetWindowId, nextQueue);
    }
    nextQueue.push(item);
    if (!animFrameRequested.get(targetWindowId)) {
      animFrameRequested.set(targetWindowId, true);
      targetWindow.requestAnimationFrame(() => animationFrameRunner(targetWindowId));
    }
    return item;
  }, "scheduleAtNextAnimationFrame");
  runAtThisOrScheduleAtNextAnimationFrame = /* @__PURE__ */ __name((targetWindow, runner, priority) => {
    const targetWindowId = getWindowId(targetWindow);
    if (inAnimationFrameRunner.get(targetWindowId)) {
      const item = new AnimationFrameQueueItem(runner, priority);
      let currentQueue = CURRENT_QUEUE.get(targetWindowId);
      if (!currentQueue) {
        currentQueue = [];
        CURRENT_QUEUE.set(targetWindowId, currentQueue);
      }
      currentQueue.push(item);
      return item;
    } else {
      return scheduleAtNextAnimationFrame(targetWindow, runner, priority);
    }
  }, "runAtThisOrScheduleAtNextAnimationFrame");
})();
function measure(targetWindow, callback) {
  return scheduleAtNextAnimationFrame(
    targetWindow,
    callback,
    1e4
    /* must be early */
  );
}
__name(measure, "measure");
function modify(targetWindow, callback) {
  return scheduleAtNextAnimationFrame(
    targetWindow,
    callback,
    -1e4
    /* must be late */
  );
}
__name(modify, "modify");
const MINIMUM_TIME_MS = 8;
const DEFAULT_EVENT_MERGER = /* @__PURE__ */ __name(function(lastEvent, currentEvent) {
  return currentEvent;
}, "DEFAULT_EVENT_MERGER");
class TimeoutThrottledDomListener extends Disposable {
  static {
    __name(this, "TimeoutThrottledDomListener");
  }
  constructor(node, type, handler, eventMerger = DEFAULT_EVENT_MERGER, minimumTimeMs = MINIMUM_TIME_MS) {
    super();
    let lastEvent = null;
    let lastHandlerTime = 0;
    const timeout = this._register(new TimeoutTimer());
    const invokeHandler = /* @__PURE__ */ __name(() => {
      lastHandlerTime = (/* @__PURE__ */ new Date()).getTime();
      handler(lastEvent);
      lastEvent = null;
    }, "invokeHandler");
    this._register(addDisposableListener(node, type, (e) => {
      lastEvent = eventMerger(lastEvent, e);
      const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - lastHandlerTime;
      if (elapsedTime >= minimumTimeMs) {
        timeout.cancel();
        invokeHandler();
      } else {
        timeout.setIfNotSet(invokeHandler, minimumTimeMs - elapsedTime);
      }
    }));
  }
}
function addDisposableThrottledListener(node, type, handler, eventMerger, minimumTimeMs) {
  return new TimeoutThrottledDomListener(node, type, handler, eventMerger, minimumTimeMs);
}
__name(addDisposableThrottledListener, "addDisposableThrottledListener");
function getComputedStyle(el) {
  return getWindow(el).getComputedStyle(el, null);
}
__name(getComputedStyle, "getComputedStyle");
function getClientArea(element, defaultValue, fallbackElement) {
  const elWindow = getWindow(element);
  const elDocument = elWindow.document;
  if (element !== elDocument.body) {
    return new Dimension(element.clientWidth, element.clientHeight);
  }
  if (platform.isIOS && elWindow?.visualViewport) {
    return new Dimension(elWindow.visualViewport.width, elWindow.visualViewport.height);
  }
  if (elWindow?.innerWidth && elWindow.innerHeight) {
    return new Dimension(elWindow.innerWidth, elWindow.innerHeight);
  }
  if (elDocument.body && elDocument.body.clientWidth && elDocument.body.clientHeight) {
    return new Dimension(elDocument.body.clientWidth, elDocument.body.clientHeight);
  }
  if (elDocument.documentElement && elDocument.documentElement.clientWidth && elDocument.documentElement.clientHeight) {
    return new Dimension(elDocument.documentElement.clientWidth, elDocument.documentElement.clientHeight);
  }
  if (fallbackElement) {
    return getClientArea(fallbackElement, defaultValue);
  }
  if (defaultValue) {
    return defaultValue;
  }
  throw new Error("Unable to figure out browser width and height");
}
__name(getClientArea, "getClientArea");
class SizeUtils {
  static {
    __name(this, "SizeUtils");
  }
  // Adapted from WinJS
  // Converts a CSS positioning string for the specified element to pixels.
  static convertToPixels(element, value) {
    return parseFloat(value) || 0;
  }
  static getDimension(element, cssPropertyName) {
    const computedStyle = getComputedStyle(element);
    const value = computedStyle ? computedStyle.getPropertyValue(cssPropertyName) : "0";
    return SizeUtils.convertToPixels(element, value);
  }
  static getBorderLeftWidth(element) {
    return SizeUtils.getDimension(element, "border-left-width");
  }
  static getBorderRightWidth(element) {
    return SizeUtils.getDimension(element, "border-right-width");
  }
  static getBorderTopWidth(element) {
    return SizeUtils.getDimension(element, "border-top-width");
  }
  static getBorderBottomWidth(element) {
    return SizeUtils.getDimension(element, "border-bottom-width");
  }
  static getPaddingLeft(element) {
    return SizeUtils.getDimension(element, "padding-left");
  }
  static getPaddingRight(element) {
    return SizeUtils.getDimension(element, "padding-right");
  }
  static getPaddingTop(element) {
    return SizeUtils.getDimension(element, "padding-top");
  }
  static getPaddingBottom(element) {
    return SizeUtils.getDimension(element, "padding-bottom");
  }
  static getMarginLeft(element) {
    return SizeUtils.getDimension(element, "margin-left");
  }
  static getMarginTop(element) {
    return SizeUtils.getDimension(element, "margin-top");
  }
  static getMarginRight(element) {
    return SizeUtils.getDimension(element, "margin-right");
  }
  static getMarginBottom(element) {
    return SizeUtils.getDimension(element, "margin-bottom");
  }
}
class Dimension {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  static {
    __name(this, "Dimension");
  }
  static None = new Dimension(0, 0);
  with(width = this.width, height = this.height) {
    if (width !== this.width || height !== this.height) {
      return new Dimension(width, height);
    } else {
      return this;
    }
  }
  static is(obj) {
    return typeof obj === "object" && typeof obj.height === "number" && typeof obj.width === "number";
  }
  static lift(obj) {
    if (obj instanceof Dimension) {
      return obj;
    } else {
      return new Dimension(obj.width, obj.height);
    }
  }
  static equals(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.width === b.width && a.height === b.height;
  }
}
function getTopLeftOffset(element) {
  let offsetParent = element.offsetParent;
  let top = element.offsetTop;
  let left = element.offsetLeft;
  while ((element = element.parentNode) !== null && element !== element.ownerDocument.body && element !== element.ownerDocument.documentElement) {
    top -= element.scrollTop;
    const c = isShadowRoot(element) ? null : getComputedStyle(element);
    if (c) {
      left -= c.direction !== "rtl" ? element.scrollLeft : -element.scrollLeft;
    }
    if (element === offsetParent) {
      left += SizeUtils.getBorderLeftWidth(element);
      top += SizeUtils.getBorderTopWidth(element);
      top += element.offsetTop;
      left += element.offsetLeft;
      offsetParent = element.offsetParent;
    }
  }
  return {
    left,
    top
  };
}
__name(getTopLeftOffset, "getTopLeftOffset");
function size(element, width, height) {
  if (typeof width === "number") {
    element.style.width = `${width}px`;
  }
  if (typeof height === "number") {
    element.style.height = `${height}px`;
  }
}
__name(size, "size");
function position(element, top, right, bottom, left, position2 = "absolute") {
  if (typeof top === "number") {
    element.style.top = `${top}px`;
  }
  if (typeof right === "number") {
    element.style.right = `${right}px`;
  }
  if (typeof bottom === "number") {
    element.style.bottom = `${bottom}px`;
  }
  if (typeof left === "number") {
    element.style.left = `${left}px`;
  }
  element.style.position = position2;
}
__name(position, "position");
function getDomNodePagePosition(domNode) {
  const bb = domNode.getBoundingClientRect();
  const window = getWindow(domNode);
  return {
    left: bb.left + window.scrollX,
    top: bb.top + window.scrollY,
    width: bb.width,
    height: bb.height
  };
}
__name(getDomNodePagePosition, "getDomNodePagePosition");
function isElementInBottomRightQuarter(element, container) {
  const position2 = getDomNodePagePosition(element);
  const clientArea = getClientArea(container);
  return position2.left > clientArea.width / 2 && position2.top > clientArea.height / 2;
}
__name(isElementInBottomRightQuarter, "isElementInBottomRightQuarter");
function getDomNodeZoomLevel(domNode) {
  let testElement = domNode;
  let zoom = 1;
  do {
    const elementZoomLevel = getComputedStyle(testElement).zoom;
    if (elementZoomLevel !== null && elementZoomLevel !== void 0 && elementZoomLevel !== "1") {
      zoom *= elementZoomLevel;
    }
    testElement = testElement.parentElement;
  } while (testElement !== null && testElement !== testElement.ownerDocument.documentElement);
  return zoom;
}
__name(getDomNodeZoomLevel, "getDomNodeZoomLevel");
function getTotalWidth(element) {
  const margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
  return element.offsetWidth + margin;
}
__name(getTotalWidth, "getTotalWidth");
function getContentWidth(element) {
  const border = SizeUtils.getBorderLeftWidth(element) + SizeUtils.getBorderRightWidth(element);
  const padding = SizeUtils.getPaddingLeft(element) + SizeUtils.getPaddingRight(element);
  return element.offsetWidth - border - padding;
}
__name(getContentWidth, "getContentWidth");
function getTotalScrollWidth(element) {
  const margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
  return element.scrollWidth + margin;
}
__name(getTotalScrollWidth, "getTotalScrollWidth");
function getContentHeight(element) {
  const border = SizeUtils.getBorderTopWidth(element) + SizeUtils.getBorderBottomWidth(element);
  const padding = SizeUtils.getPaddingTop(element) + SizeUtils.getPaddingBottom(element);
  return element.offsetHeight - border - padding;
}
__name(getContentHeight, "getContentHeight");
function getTotalHeight(element) {
  const margin = SizeUtils.getMarginTop(element) + SizeUtils.getMarginBottom(element);
  return element.offsetHeight + margin;
}
__name(getTotalHeight, "getTotalHeight");
function getRelativeLeft(element, parent) {
  if (element === null) {
    return 0;
  }
  const elementPosition = getTopLeftOffset(element);
  const parentPosition = getTopLeftOffset(parent);
  return elementPosition.left - parentPosition.left;
}
__name(getRelativeLeft, "getRelativeLeft");
function getLargestChildWidth(parent, children) {
  const childWidths = children.map((child) => {
    return Math.max(getTotalScrollWidth(child), getTotalWidth(child)) + getRelativeLeft(child, parent) || 0;
  });
  const maxWidth = Math.max(...childWidths);
  return maxWidth;
}
__name(getLargestChildWidth, "getLargestChildWidth");
function isAncestor(testChild, testAncestor) {
  return Boolean(testAncestor?.contains(testChild));
}
__name(isAncestor, "isAncestor");
const parentFlowToDataKey = "parentFlowToElementId";
function setParentFlowTo(fromChildElement, toParentElement) {
  fromChildElement.dataset[parentFlowToDataKey] = toParentElement.id;
}
__name(setParentFlowTo, "setParentFlowTo");
function getParentFlowToElement(node) {
  const flowToParentId = node.dataset[parentFlowToDataKey];
  if (typeof flowToParentId === "string") {
    return node.ownerDocument.getElementById(flowToParentId);
  }
  return null;
}
__name(getParentFlowToElement, "getParentFlowToElement");
function isAncestorUsingFlowTo(testChild, testAncestor) {
  let node = testChild;
  while (node) {
    if (node === testAncestor) {
      return true;
    }
    if (isHTMLElement(node)) {
      const flowToParentElement = getParentFlowToElement(node);
      if (flowToParentElement) {
        node = flowToParentElement;
        continue;
      }
    }
    node = node.parentNode;
  }
  return false;
}
__name(isAncestorUsingFlowTo, "isAncestorUsingFlowTo");
function findParentWithClass(node, clazz, stopAtClazzOrNode) {
  while (node && node.nodeType === node.ELEMENT_NODE) {
    if (node.classList.contains(clazz)) {
      return node;
    }
    if (stopAtClazzOrNode) {
      if (typeof stopAtClazzOrNode === "string") {
        if (node.classList.contains(stopAtClazzOrNode)) {
          return null;
        }
      } else {
        if (node === stopAtClazzOrNode) {
          return null;
        }
      }
    }
    node = node.parentNode;
  }
  return null;
}
__name(findParentWithClass, "findParentWithClass");
function hasParentWithClass(node, clazz, stopAtClazzOrNode) {
  return !!findParentWithClass(node, clazz, stopAtClazzOrNode);
}
__name(hasParentWithClass, "hasParentWithClass");
function isShadowRoot(node) {
  return node && !!node.host && !!node.mode;
}
__name(isShadowRoot, "isShadowRoot");
function isInShadowDOM(domNode) {
  return !!getShadowRoot(domNode);
}
__name(isInShadowDOM, "isInShadowDOM");
function getShadowRoot(domNode) {
  while (domNode.parentNode) {
    if (domNode === domNode.ownerDocument?.body) {
      return null;
    }
    domNode = domNode.parentNode;
  }
  return isShadowRoot(domNode) ? domNode : null;
}
__name(getShadowRoot, "getShadowRoot");
function getActiveElement() {
  let result = getActiveDocument().activeElement;
  while (result?.shadowRoot) {
    result = result.shadowRoot.activeElement;
  }
  return result;
}
__name(getActiveElement, "getActiveElement");
function isActiveElement(element) {
  return getActiveElement() === element;
}
__name(isActiveElement, "isActiveElement");
function isAncestorOfActiveElement(ancestor) {
  return isAncestor(getActiveElement(), ancestor);
}
__name(isAncestorOfActiveElement, "isAncestorOfActiveElement");
function isActiveDocument(element) {
  return element.ownerDocument === getActiveDocument();
}
__name(isActiveDocument, "isActiveDocument");
function getActiveDocument() {
  if (getWindowsCount() <= 1) {
    return mainWindow.document;
  }
  const documents = Array.from(getWindows()).map(({ window }) => window.document);
  return documents.find((doc) => doc.hasFocus()) ?? mainWindow.document;
}
__name(getActiveDocument, "getActiveDocument");
function getActiveWindow() {
  const document2 = getActiveDocument();
  return document2.defaultView?.window ?? mainWindow;
}
__name(getActiveWindow, "getActiveWindow");
const sharedMutationObserver = new class {
  mutationObservers = /* @__PURE__ */ new Map();
  observe(target, disposables, options) {
    let mutationObserversPerTarget = this.mutationObservers.get(target);
    if (!mutationObserversPerTarget) {
      mutationObserversPerTarget = /* @__PURE__ */ new Map();
      this.mutationObservers.set(target, mutationObserversPerTarget);
    }
    const optionsHash = hash(options);
    let mutationObserverPerOptions = mutationObserversPerTarget.get(optionsHash);
    if (!mutationObserverPerOptions) {
      const onDidMutate = new event.Emitter();
      const observer = new MutationObserver((mutations) => onDidMutate.fire(mutations));
      observer.observe(target, options);
      const resolvedMutationObserverPerOptions = mutationObserverPerOptions = {
        users: 1,
        observer,
        onDidMutate: onDidMutate.event
      };
      disposables.add(toDisposable(() => {
        resolvedMutationObserverPerOptions.users -= 1;
        if (resolvedMutationObserverPerOptions.users === 0) {
          onDidMutate.dispose();
          observer.disconnect();
          mutationObserversPerTarget?.delete(optionsHash);
          if (mutationObserversPerTarget?.size === 0) {
            this.mutationObservers.delete(target);
          }
        }
      }));
      mutationObserversPerTarget.set(optionsHash, mutationObserverPerOptions);
    } else {
      mutationObserverPerOptions.users += 1;
    }
    return mutationObserverPerOptions.onDidMutate;
  }
}();
function createMetaElement(container = mainWindow.document.head) {
  return createHeadElement("meta", container);
}
__name(createMetaElement, "createMetaElement");
function createLinkElement(container = mainWindow.document.head) {
  return createHeadElement("link", container);
}
__name(createLinkElement, "createLinkElement");
function createHeadElement(tagName, container = mainWindow.document.head) {
  const element = document.createElement(tagName);
  container.appendChild(element);
  return element;
}
__name(createHeadElement, "createHeadElement");
function isHTMLElement(e) {
  return e instanceof HTMLElement || e instanceof getWindow(e).HTMLElement;
}
__name(isHTMLElement, "isHTMLElement");
function isHTMLAnchorElement(e) {
  return e instanceof HTMLAnchorElement || e instanceof getWindow(e).HTMLAnchorElement;
}
__name(isHTMLAnchorElement, "isHTMLAnchorElement");
function isHTMLSpanElement(e) {
  return e instanceof HTMLSpanElement || e instanceof getWindow(e).HTMLSpanElement;
}
__name(isHTMLSpanElement, "isHTMLSpanElement");
function isHTMLTextAreaElement(e) {
  return e instanceof HTMLTextAreaElement || e instanceof getWindow(e).HTMLTextAreaElement;
}
__name(isHTMLTextAreaElement, "isHTMLTextAreaElement");
function isHTMLInputElement(e) {
  return e instanceof HTMLInputElement || e instanceof getWindow(e).HTMLInputElement;
}
__name(isHTMLInputElement, "isHTMLInputElement");
function isHTMLButtonElement(e) {
  return e instanceof HTMLButtonElement || e instanceof getWindow(e).HTMLButtonElement;
}
__name(isHTMLButtonElement, "isHTMLButtonElement");
function isHTMLDivElement(e) {
  return e instanceof HTMLDivElement || e instanceof getWindow(e).HTMLDivElement;
}
__name(isHTMLDivElement, "isHTMLDivElement");
function isSVGElement(e) {
  return e instanceof SVGElement || e instanceof getWindow(e).SVGElement;
}
__name(isSVGElement, "isSVGElement");
function isMouseEvent(e) {
  return e instanceof MouseEvent || e instanceof getWindow(e).MouseEvent;
}
__name(isMouseEvent, "isMouseEvent");
function isKeyboardEvent(e) {
  return e instanceof KeyboardEvent || e instanceof getWindow(e).KeyboardEvent;
}
__name(isKeyboardEvent, "isKeyboardEvent");
function isPointerEvent(e) {
  return e instanceof PointerEvent || e instanceof getWindow(e).PointerEvent;
}
__name(isPointerEvent, "isPointerEvent");
function isDragEvent(e) {
  return e instanceof DragEvent || e instanceof getWindow(e).DragEvent;
}
__name(isDragEvent, "isDragEvent");
const EventType = {
  // Mouse
  CLICK: "click",
  AUXCLICK: "auxclick",
  DBLCLICK: "dblclick",
  MOUSE_UP: "mouseup",
  MOUSE_DOWN: "mousedown",
  MOUSE_OVER: "mouseover",
  MOUSE_MOVE: "mousemove",
  MOUSE_OUT: "mouseout",
  MOUSE_ENTER: "mouseenter",
  MOUSE_LEAVE: "mouseleave",
  MOUSE_WHEEL: "wheel",
  POINTER_UP: "pointerup",
  POINTER_DOWN: "pointerdown",
  POINTER_MOVE: "pointermove",
  POINTER_LEAVE: "pointerleave",
  CONTEXT_MENU: "contextmenu",
  WHEEL: "wheel",
  // Keyboard
  KEY_DOWN: "keydown",
  KEY_PRESS: "keypress",
  KEY_UP: "keyup",
  // HTML Document
  LOAD: "load",
  BEFORE_UNLOAD: "beforeunload",
  UNLOAD: "unload",
  PAGE_SHOW: "pageshow",
  PAGE_HIDE: "pagehide",
  PASTE: "paste",
  ABORT: "abort",
  ERROR: "error",
  RESIZE: "resize",
  SCROLL: "scroll",
  FULLSCREEN_CHANGE: "fullscreenchange",
  WK_FULLSCREEN_CHANGE: "webkitfullscreenchange",
  // Form
  SELECT: "select",
  CHANGE: "change",
  SUBMIT: "submit",
  RESET: "reset",
  FOCUS: "focus",
  FOCUS_IN: "focusin",
  FOCUS_OUT: "focusout",
  BLUR: "blur",
  INPUT: "input",
  // Local Storage
  STORAGE: "storage",
  // Drag
  DRAG_START: "dragstart",
  DRAG: "drag",
  DRAG_ENTER: "dragenter",
  DRAG_LEAVE: "dragleave",
  DRAG_OVER: "dragover",
  DROP: "drop",
  DRAG_END: "dragend",
  // Animation
  ANIMATION_START: browser.isWebKit ? "webkitAnimationStart" : "animationstart",
  ANIMATION_END: browser.isWebKit ? "webkitAnimationEnd" : "animationend",
  ANIMATION_ITERATION: browser.isWebKit ? "webkitAnimationIteration" : "animationiteration"
};
function isEventLike(obj) {
  const candidate = obj;
  return !!(candidate && typeof candidate.preventDefault === "function" && typeof candidate.stopPropagation === "function");
}
__name(isEventLike, "isEventLike");
const EventHelper = {
  stop: /* @__PURE__ */ __name((e, cancelBubble) => {
    e.preventDefault();
    if (cancelBubble) {
      e.stopPropagation();
    }
    return e;
  }, "stop")
};
function saveParentsScrollTop(node) {
  const r = [];
  for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
    r[i] = node.scrollTop;
    node = node.parentNode;
  }
  return r;
}
__name(saveParentsScrollTop, "saveParentsScrollTop");
function restoreParentsScrollTop(node, state) {
  for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
    if (node.scrollTop !== state[i]) {
      node.scrollTop = state[i];
    }
    node = node.parentNode;
  }
}
__name(restoreParentsScrollTop, "restoreParentsScrollTop");
class FocusTracker extends Disposable {
  static {
    __name(this, "FocusTracker");
  }
  _onDidFocus = this._register(new event.Emitter());
  onDidFocus = this._onDidFocus.event;
  _onDidBlur = this._register(new event.Emitter());
  onDidBlur = this._onDidBlur.event;
  _refreshStateHandler;
  static hasFocusWithin(element) {
    if (isHTMLElement(element)) {
      const shadowRoot = getShadowRoot(element);
      const activeElement = shadowRoot ? shadowRoot.activeElement : element.ownerDocument.activeElement;
      return isAncestor(activeElement, element);
    } else {
      const window = element;
      return isAncestor(window.document.activeElement, window.document);
    }
  }
  constructor(element) {
    super();
    let hasFocus = FocusTracker.hasFocusWithin(element);
    let loosingFocus = false;
    const onFocus = /* @__PURE__ */ __name(() => {
      loosingFocus = false;
      if (!hasFocus) {
        hasFocus = true;
        this._onDidFocus.fire();
      }
    }, "onFocus");
    const onBlur = /* @__PURE__ */ __name(() => {
      if (hasFocus) {
        loosingFocus = true;
        (isHTMLElement(element) ? getWindow(element) : element).setTimeout(() => {
          if (loosingFocus) {
            loosingFocus = false;
            hasFocus = false;
            this._onDidBlur.fire();
          }
        }, 0);
      }
    }, "onBlur");
    this._refreshStateHandler = () => {
      const currentNodeHasFocus = FocusTracker.hasFocusWithin(element);
      if (currentNodeHasFocus !== hasFocus) {
        if (hasFocus) {
          onBlur();
        } else {
          onFocus();
        }
      }
    };
    this._register(addDisposableListener(element, EventType.FOCUS, onFocus, true));
    this._register(addDisposableListener(element, EventType.BLUR, onBlur, true));
    if (isHTMLElement(element)) {
      this._register(addDisposableListener(element, EventType.FOCUS_IN, () => this._refreshStateHandler()));
      this._register(addDisposableListener(element, EventType.FOCUS_OUT, () => this._refreshStateHandler()));
    }
  }
  refreshState() {
    this._refreshStateHandler();
  }
}
function trackFocus(element) {
  return new FocusTracker(element);
}
__name(trackFocus, "trackFocus");
function after(sibling, child) {
  sibling.after(child);
  return child;
}
__name(after, "after");
function append(parent, ...children) {
  parent.append(...children);
  if (children.length === 1 && typeof children[0] !== "string") {
    return children[0];
  }
}
__name(append, "append");
function prepend(parent, child) {
  parent.insertBefore(child, parent.firstChild);
  return child;
}
__name(prepend, "prepend");
function reset(parent, ...children) {
  parent.innerText = "";
  append(parent, ...children);
}
__name(reset, "reset");
const SELECTOR_REGEX = /([\w\-]+)?(#([\w\-]+))?((\.([\w\-]+))*)/;
var Namespace = /* @__PURE__ */ ((Namespace2) => {
  Namespace2["HTML"] = "http://www.w3.org/1999/xhtml";
  Namespace2["SVG"] = "http://www.w3.org/2000/svg";
  return Namespace2;
})(Namespace || {});
function _$(namespace, description, attrs, ...children) {
  const match = SELECTOR_REGEX.exec(description);
  if (!match) {
    throw new Error("Bad use of emmet");
  }
  const tagName = match[1] || "div";
  let result;
  if (namespace !== "http://www.w3.org/1999/xhtml" /* HTML */) {
    result = document.createElementNS(namespace, tagName);
  } else {
    result = document.createElement(tagName);
  }
  if (match[3]) {
    result.id = match[3];
  }
  if (match[4]) {
    result.className = match[4].replace(/\./g, " ").trim();
  }
  if (attrs) {
    Object.entries(attrs).forEach(([name, value]) => {
      if (typeof value === "undefined") {
        return;
      }
      if (/^on\w+$/.test(name)) {
        result[name] = value;
      } else if (name === "selected") {
        if (value) {
          result.setAttribute(name, "true");
        }
      } else {
        result.setAttribute(name, value);
      }
    });
  }
  result.append(...children);
  return result;
}
__name(_$, "_$");
function $(description, attrs, ...children) {
  return _$("http://www.w3.org/1999/xhtml" /* HTML */, description, attrs, ...children);
}
__name($, "$");
$.SVG = function(description, attrs, ...children) {
  return _$("http://www.w3.org/2000/svg" /* SVG */, description, attrs, ...children);
};
function join(nodes, separator) {
  const result = [];
  nodes.forEach((node, index) => {
    if (index > 0) {
      if (separator instanceof Node) {
        result.push(separator.cloneNode());
      } else {
        result.push(document.createTextNode(separator));
      }
    }
    result.push(node);
  });
  return result;
}
__name(join, "join");
function setVisibility(visible, ...elements) {
  if (visible) {
    show(...elements);
  } else {
    hide(...elements);
  }
}
__name(setVisibility, "setVisibility");
function show(...elements) {
  for (const element of elements) {
    element.style.display = "";
    element.removeAttribute("aria-hidden");
  }
}
__name(show, "show");
function hide(...elements) {
  for (const element of elements) {
    element.style.display = "none";
    element.setAttribute("aria-hidden", "true");
  }
}
__name(hide, "hide");
function findParentWithAttribute(node, attribute) {
  while (node && node.nodeType === node.ELEMENT_NODE) {
    if (isHTMLElement(node) && node.hasAttribute(attribute)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}
__name(findParentWithAttribute, "findParentWithAttribute");
function removeTabIndexAndUpdateFocus(node) {
  if (!node || !node.hasAttribute("tabIndex")) {
    return;
  }
  if (node.ownerDocument.activeElement === node) {
    const parentFocusable = findParentWithAttribute(node.parentElement, "tabIndex");
    parentFocusable?.focus();
  }
  node.removeAttribute("tabindex");
}
__name(removeTabIndexAndUpdateFocus, "removeTabIndexAndUpdateFocus");
function finalHandler(fn) {
  return (e) => {
    e.preventDefault();
    e.stopPropagation();
    fn(e);
  };
}
__name(finalHandler, "finalHandler");
function domContentLoaded(targetWindow) {
  return new Promise((resolve) => {
    const readyState = targetWindow.document.readyState;
    if (readyState === "complete" || targetWindow.document && targetWindow.document.body !== null) {
      resolve(void 0);
    } else {
      const listener = /* @__PURE__ */ __name(() => {
        targetWindow.window.removeEventListener("DOMContentLoaded", listener, false);
        resolve();
      }, "listener");
      targetWindow.window.addEventListener("DOMContentLoaded", listener, false);
    }
  });
}
__name(domContentLoaded, "domContentLoaded");
function computeScreenAwareSize(window, cssPx) {
  const screenPx = window.devicePixelRatio * cssPx;
  return Math.max(1, Math.floor(screenPx)) / window.devicePixelRatio;
}
__name(computeScreenAwareSize, "computeScreenAwareSize");
function windowOpenNoOpener(url) {
  mainWindow.open(url, "_blank", "noopener");
}
__name(windowOpenNoOpener, "windowOpenNoOpener");
const popupWidth = 780, popupHeight = 640;
function windowOpenPopup(url) {
  const left = Math.floor(mainWindow.screenLeft + mainWindow.innerWidth / 2 - popupWidth / 2);
  const top = Math.floor(mainWindow.screenTop + mainWindow.innerHeight / 2 - popupHeight / 2);
  mainWindow.open(
    url,
    "_blank",
    `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
  );
}
__name(windowOpenPopup, "windowOpenPopup");
function windowOpenWithSuccess(url, noOpener = true) {
  const newTab = mainWindow.open();
  if (newTab) {
    if (noOpener) {
      newTab.opener = null;
    }
    newTab.location.href = url;
    return true;
  }
  return false;
}
__name(windowOpenWithSuccess, "windowOpenWithSuccess");
function animate(targetWindow, fn) {
  const step = /* @__PURE__ */ __name(() => {
    fn();
    stepDisposable = scheduleAtNextAnimationFrame(targetWindow, step);
  }, "step");
  let stepDisposable = scheduleAtNextAnimationFrame(targetWindow, step);
  return toDisposable(() => stepDisposable.dispose());
}
__name(animate, "animate");
RemoteAuthorities.setPreferredWebSchema(/^https:/.test(mainWindow.location.href) ? "https" : "http");
function triggerDownload(dataOrUri, name) {
  let url;
  if (URI.isUri(dataOrUri)) {
    url = dataOrUri.toString(true);
  } else {
    const blob = new Blob([dataOrUri]);
    url = URL.createObjectURL(blob);
    setTimeout(() => URL.revokeObjectURL(url));
  }
  const activeWindow = getActiveWindow();
  const anchor = document.createElement("a");
  activeWindow.document.body.appendChild(anchor);
  anchor.download = name;
  anchor.href = url;
  anchor.click();
  setTimeout(() => anchor.remove());
}
__name(triggerDownload, "triggerDownload");
function triggerUpload() {
  return new Promise((resolve) => {
    const activeWindow = getActiveWindow();
    const input = document.createElement("input");
    activeWindow.document.body.appendChild(input);
    input.type = "file";
    input.multiple = true;
    event.Event.once(event.Event.fromDOMEventEmitter(input, "input"))(() => {
      resolve(input.files ?? void 0);
    });
    input.click();
    setTimeout(() => input.remove());
  });
}
__name(triggerUpload, "triggerUpload");
var DetectedFullscreenMode = /* @__PURE__ */ ((DetectedFullscreenMode2) => {
  DetectedFullscreenMode2[DetectedFullscreenMode2["DOCUMENT"] = 1] = "DOCUMENT";
  DetectedFullscreenMode2[DetectedFullscreenMode2["BROWSER"] = 2] = "BROWSER";
  return DetectedFullscreenMode2;
})(DetectedFullscreenMode || {});
function detectFullscreen(targetWindow) {
  if (targetWindow.document.fullscreenElement || targetWindow.document.webkitFullscreenElement || targetWindow.document.webkitIsFullScreen) {
    return { mode: 1 /* DOCUMENT */, guess: false };
  }
  if (targetWindow.innerHeight === targetWindow.screen.height) {
    return { mode: 2 /* BROWSER */, guess: false };
  }
  if (platform.isMacintosh || platform.isLinux) {
    if (targetWindow.outerHeight === targetWindow.screen.height && targetWindow.outerWidth === targetWindow.screen.width) {
      return { mode: 2 /* BROWSER */, guess: true };
    }
  }
  return null;
}
__name(detectFullscreen, "detectFullscreen");
function hookDomPurifyHrefAndSrcSanitizer(allowedProtocols, allowDataImages = false) {
  const anchor = document.createElement("a");
  dompurify.addHook("afterSanitizeAttributes", (node) => {
    for (const attr of ["href", "src"]) {
      if (node.hasAttribute(attr)) {
        const attrValue = node.getAttribute(attr);
        if (attr === "href" && attrValue.startsWith("#")) {
          continue;
        }
        anchor.href = attrValue;
        if (!allowedProtocols.includes(anchor.protocol.replace(/:$/, ""))) {
          if (allowDataImages && attr === "src" && anchor.href.startsWith("data:")) {
            continue;
          }
          node.removeAttribute(attr);
        }
      }
    }
  });
  return toDisposable(() => {
    dompurify.removeHook("afterSanitizeAttributes");
  });
}
__name(hookDomPurifyHrefAndSrcSanitizer, "hookDomPurifyHrefAndSrcSanitizer");
const defaultSafeProtocols = [
  Schemas.http,
  Schemas.https,
  Schemas.command
];
const basicMarkupHtmlTags = Object.freeze([
  "a",
  "abbr",
  "b",
  "bdo",
  "blockquote",
  "br",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "li",
  "mark",
  "ol",
  "p",
  "pre",
  "q",
  "rp",
  "rt",
  "ruby",
  "samp",
  "small",
  "small",
  "source",
  "span",
  "strike",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
]);
const defaultDomPurifyConfig = Object.freeze({
  ALLOWED_TAGS: ["a", "button", "blockquote", "code", "div", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "input", "label", "li", "p", "pre", "select", "small", "span", "strong", "textarea", "ul", "ol"],
  ALLOWED_ATTR: ["href", "data-href", "data-command", "target", "title", "name", "src", "alt", "class", "id", "role", "tabindex", "style", "data-code", "width", "height", "align", "x-dispatch", "required", "checked", "placeholder", "type", "start"],
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: true
});
function safeInnerHtml(node, value, extraDomPurifyConfig) {
  const hook = hookDomPurifyHrefAndSrcSanitizer(defaultSafeProtocols);
  try {
    const html = dompurify.sanitize(value, { ...defaultDomPurifyConfig, ...extraDomPurifyConfig });
    node.innerHTML = html;
  } finally {
    hook.dispose();
  }
}
__name(safeInnerHtml, "safeInnerHtml");
function toBinary(str) {
  const codeUnits = new Uint16Array(str.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = str.charCodeAt(i);
  }
  let binary = "";
  const uint8array = new Uint8Array(codeUnits.buffer);
  for (let i = 0; i < uint8array.length; i++) {
    binary += String.fromCharCode(uint8array[i]);
  }
  return binary;
}
__name(toBinary, "toBinary");
function multibyteAwareBtoa(str) {
  return btoa(toBinary(str));
}
__name(multibyteAwareBtoa, "multibyteAwareBtoa");
class ModifierKeyEmitter extends event.Emitter {
  static {
    __name(this, "ModifierKeyEmitter");
  }
  _subscriptions = new DisposableStore();
  _keyStatus;
  static instance;
  constructor() {
    super();
    this._keyStatus = {
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
    };
    this._subscriptions.add(event.Event.runAndSubscribe(onDidRegisterWindow, ({ window, disposables }) => this.registerListeners(window, disposables), { window: mainWindow, disposables: this._subscriptions }));
  }
  registerListeners(window, disposables) {
    disposables.add(addDisposableListener(window, "keydown", (e) => {
      if (e.defaultPrevented) {
        return;
      }
      const event2 = new StandardKeyboardEvent(e);
      if (event2.keyCode === KeyCode.Alt && e.repeat) {
        return;
      }
      if (e.altKey && !this._keyStatus.altKey) {
        this._keyStatus.lastKeyPressed = "alt";
      } else if (e.ctrlKey && !this._keyStatus.ctrlKey) {
        this._keyStatus.lastKeyPressed = "ctrl";
      } else if (e.metaKey && !this._keyStatus.metaKey) {
        this._keyStatus.lastKeyPressed = "meta";
      } else if (e.shiftKey && !this._keyStatus.shiftKey) {
        this._keyStatus.lastKeyPressed = "shift";
      } else if (event2.keyCode !== KeyCode.Alt) {
        this._keyStatus.lastKeyPressed = void 0;
      } else {
        return;
      }
      this._keyStatus.altKey = e.altKey;
      this._keyStatus.ctrlKey = e.ctrlKey;
      this._keyStatus.metaKey = e.metaKey;
      this._keyStatus.shiftKey = e.shiftKey;
      if (this._keyStatus.lastKeyPressed) {
        this._keyStatus.event = e;
        this.fire(this._keyStatus);
      }
    }, true));
    disposables.add(addDisposableListener(window, "keyup", (e) => {
      if (e.defaultPrevented) {
        return;
      }
      if (!e.altKey && this._keyStatus.altKey) {
        this._keyStatus.lastKeyReleased = "alt";
      } else if (!e.ctrlKey && this._keyStatus.ctrlKey) {
        this._keyStatus.lastKeyReleased = "ctrl";
      } else if (!e.metaKey && this._keyStatus.metaKey) {
        this._keyStatus.lastKeyReleased = "meta";
      } else if (!e.shiftKey && this._keyStatus.shiftKey) {
        this._keyStatus.lastKeyReleased = "shift";
      } else {
        this._keyStatus.lastKeyReleased = void 0;
      }
      if (this._keyStatus.lastKeyPressed !== this._keyStatus.lastKeyReleased) {
        this._keyStatus.lastKeyPressed = void 0;
      }
      this._keyStatus.altKey = e.altKey;
      this._keyStatus.ctrlKey = e.ctrlKey;
      this._keyStatus.metaKey = e.metaKey;
      this._keyStatus.shiftKey = e.shiftKey;
      if (this._keyStatus.lastKeyReleased) {
        this._keyStatus.event = e;
        this.fire(this._keyStatus);
      }
    }, true));
    disposables.add(addDisposableListener(window.document.body, "mousedown", () => {
      this._keyStatus.lastKeyPressed = void 0;
    }, true));
    disposables.add(addDisposableListener(window.document.body, "mouseup", () => {
      this._keyStatus.lastKeyPressed = void 0;
    }, true));
    disposables.add(addDisposableListener(window.document.body, "mousemove", (e) => {
      if (e.buttons) {
        this._keyStatus.lastKeyPressed = void 0;
      }
    }, true));
    disposables.add(addDisposableListener(window, "blur", () => {
      this.resetKeyStatus();
    }));
  }
  get keyStatus() {
    return this._keyStatus;
  }
  get isModifierPressed() {
    return this._keyStatus.altKey || this._keyStatus.ctrlKey || this._keyStatus.metaKey || this._keyStatus.shiftKey;
  }
  /**
   * Allows to explicitly reset the key status based on more knowledge (#109062)
   */
  resetKeyStatus() {
    this.doResetKeyStatus();
    this.fire(this._keyStatus);
  }
  doResetKeyStatus() {
    this._keyStatus = {
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
    };
  }
  static getInstance() {
    if (!ModifierKeyEmitter.instance) {
      ModifierKeyEmitter.instance = new ModifierKeyEmitter();
    }
    return ModifierKeyEmitter.instance;
  }
  dispose() {
    super.dispose();
    this._subscriptions.dispose();
  }
}
function getCookieValue(name) {
  const match = document.cookie.match("(^|[^;]+)\\s*" + name + "\\s*=\\s*([^;]+)");
  return match ? match.pop() : void 0;
}
__name(getCookieValue, "getCookieValue");
class DragAndDropObserver extends Disposable {
  constructor(element, callbacks) {
    super();
    this.element = element;
    this.callbacks = callbacks;
    this.registerListeners();
  }
  static {
    __name(this, "DragAndDropObserver");
  }
  // A helper to fix issues with repeated DRAG_ENTER / DRAG_LEAVE
  // calls see https://github.com/microsoft/vscode/issues/14470
  // when the element has child elements where the events are fired
  // repeadedly.
  counter = 0;
  // Allows to measure the duration of the drag operation.
  dragStartTime = 0;
  registerListeners() {
    if (this.callbacks.onDragStart) {
      this._register(addDisposableListener(this.element, EventType.DRAG_START, (e) => {
        this.callbacks.onDragStart?.(e);
      }));
    }
    if (this.callbacks.onDrag) {
      this._register(addDisposableListener(this.element, EventType.DRAG, (e) => {
        this.callbacks.onDrag?.(e);
      }));
    }
    this._register(addDisposableListener(this.element, EventType.DRAG_ENTER, (e) => {
      this.counter++;
      this.dragStartTime = e.timeStamp;
      this.callbacks.onDragEnter?.(e);
    }));
    this._register(addDisposableListener(this.element, EventType.DRAG_OVER, (e) => {
      e.preventDefault();
      this.callbacks.onDragOver?.(e, e.timeStamp - this.dragStartTime);
    }));
    this._register(addDisposableListener(this.element, EventType.DRAG_LEAVE, (e) => {
      this.counter--;
      if (this.counter === 0) {
        this.dragStartTime = 0;
        this.callbacks.onDragLeave?.(e);
      }
    }));
    this._register(addDisposableListener(this.element, EventType.DRAG_END, (e) => {
      this.counter = 0;
      this.dragStartTime = 0;
      this.callbacks.onDragEnd?.(e);
    }));
    this._register(addDisposableListener(this.element, EventType.DROP, (e) => {
      this.counter = 0;
      this.dragStartTime = 0;
      this.callbacks.onDrop?.(e);
    }));
  }
}
const H_REGEX = /(?<tag>[\w\-]+)?(?:#(?<id>[\w\-]+))?(?<class>(?:\.(?:[\w\-]+))*)(?:@(?<name>(?:[\w\_])+))?/;
function h(tag, ...args) {
  let attributes;
  let children;
  if (Array.isArray(args[0])) {
    attributes = {};
    children = args[0];
  } else {
    attributes = args[0] || {};
    children = args[1];
  }
  const match = H_REGEX.exec(tag);
  if (!match || !match.groups) {
    throw new Error("Bad use of h");
  }
  const tagName = match.groups["tag"] || "div";
  const el = document.createElement(tagName);
  if (match.groups["id"]) {
    el.id = match.groups["id"];
  }
  const classNames = [];
  if (match.groups["class"]) {
    for (const className of match.groups["class"].split(".")) {
      if (className !== "") {
        classNames.push(className);
      }
    }
  }
  if (attributes.className !== void 0) {
    for (const className of attributes.className.split(".")) {
      if (className !== "") {
        classNames.push(className);
      }
    }
  }
  if (classNames.length > 0) {
    el.className = classNames.join(" ");
  }
  const result = {};
  if (match.groups["name"]) {
    result[match.groups["name"]] = el;
  }
  if (children) {
    for (const c of children) {
      if (isHTMLElement(c)) {
        el.appendChild(c);
      } else if (typeof c === "string") {
        el.append(c);
      } else if ("root" in c) {
        Object.assign(result, c);
        el.appendChild(c.root);
      }
    }
  }
  for (const [key, value] of Object.entries(attributes)) {
    if (key === "className") {
      continue;
    } else if (key === "style") {
      for (const [cssKey, cssValue] of Object.entries(value)) {
        el.style.setProperty(
          camelCaseToHyphenCase(cssKey),
          typeof cssValue === "number" ? cssValue + "px" : "" + cssValue
        );
      }
    } else if (key === "tabIndex") {
      el.tabIndex = value;
    } else {
      el.setAttribute(camelCaseToHyphenCase(key), value.toString());
    }
  }
  result["root"] = el;
  return result;
}
__name(h, "h");
function svgElem(tag, ...args) {
  let attributes;
  let children;
  if (Array.isArray(args[0])) {
    attributes = {};
    children = args[0];
  } else {
    attributes = args[0] || {};
    children = args[1];
  }
  const match = H_REGEX.exec(tag);
  if (!match || !match.groups) {
    throw new Error("Bad use of h");
  }
  const tagName = match.groups["tag"] || "div";
  const el = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  if (match.groups["id"]) {
    el.id = match.groups["id"];
  }
  const classNames = [];
  if (match.groups["class"]) {
    for (const className of match.groups["class"].split(".")) {
      if (className !== "") {
        classNames.push(className);
      }
    }
  }
  if (attributes.className !== void 0) {
    for (const className of attributes.className.split(".")) {
      if (className !== "") {
        classNames.push(className);
      }
    }
  }
  if (classNames.length > 0) {
    el.className = classNames.join(" ");
  }
  const result = {};
  if (match.groups["name"]) {
    result[match.groups["name"]] = el;
  }
  if (children) {
    for (const c of children) {
      if (isHTMLElement(c)) {
        el.appendChild(c);
      } else if (typeof c === "string") {
        el.append(c);
      } else if ("root" in c) {
        Object.assign(result, c);
        el.appendChild(c.root);
      }
    }
  }
  for (const [key, value] of Object.entries(attributes)) {
    if (key === "className") {
      continue;
    } else if (key === "style") {
      for (const [cssKey, cssValue] of Object.entries(value)) {
        el.style.setProperty(
          camelCaseToHyphenCase(cssKey),
          typeof cssValue === "number" ? cssValue + "px" : "" + cssValue
        );
      }
    } else if (key === "tabIndex") {
      el.tabIndex = value;
    } else {
      el.setAttribute(camelCaseToHyphenCase(key), value.toString());
    }
  }
  result["root"] = el;
  return result;
}
__name(svgElem, "svgElem");
function camelCaseToHyphenCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
__name(camelCaseToHyphenCase, "camelCaseToHyphenCase");
function copyAttributes(from, to, filter) {
  for (const { name, value } of from.attributes) {
    if (!filter || filter.includes(name)) {
      to.setAttribute(name, value);
    }
  }
}
__name(copyAttributes, "copyAttributes");
function copyAttribute(from, to, name) {
  const value = from.getAttribute(name);
  if (value) {
    to.setAttribute(name, value);
  } else {
    to.removeAttribute(name);
  }
}
__name(copyAttribute, "copyAttribute");
function trackAttributes(from, to, filter) {
  copyAttributes(from, to, filter);
  const disposables = new DisposableStore();
  disposables.add(sharedMutationObserver.observe(from, disposables, { attributes: true, attributeFilter: filter })((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName) {
        copyAttribute(from, to, mutation.attributeName);
      }
    }
  }));
  return disposables;
}
__name(trackAttributes, "trackAttributes");
function isEditableElement(element) {
  return element.tagName.toLowerCase() === "input" || element.tagName.toLowerCase() === "textarea" || isHTMLElement(element) && !!element.editContext;
}
__name(isEditableElement, "isEditableElement");
class SafeTriangle {
  constructor(originX, originY, target) {
    this.originX = originX;
    this.originY = originY;
    const { top, left, right, bottom } = target.getBoundingClientRect();
    const t = this.points;
    let i = 0;
    t[i++] = left;
    t[i++] = top;
    t[i++] = right;
    t[i++] = top;
    t[i++] = left;
    t[i++] = bottom;
    t[i++] = right;
    t[i++] = bottom;
  }
  static {
    __name(this, "SafeTriangle");
  }
  // 4 points (x, y), 8 length
  points = new Int16Array(8);
  contains(x, y) {
    const { points, originX, originY } = this;
    for (let i = 0; i < 4; i++) {
      const p1 = 2 * i;
      const p2 = 2 * ((i + 1) % 4);
      if (isPointWithinTriangle(x, y, originX, originY, points[p1], points[p1 + 1], points[p2], points[p2 + 1])) {
        return true;
      }
    }
    return false;
  }
}
export {
  $,
  DetectedFullscreenMode,
  Dimension,
  DragAndDropObserver,
  EventHelper,
  EventType,
  ModifierKeyEmitter,
  Namespace,
  SafeTriangle,
  WindowIdleValue,
  WindowIntervalTimer,
  addDisposableGenericMouseDownListener,
  addDisposableGenericMouseMoveListener,
  addDisposableGenericMouseUpListener,
  addDisposableListener,
  addDisposableThrottledListener,
  addStandardDisposableGenericMouseDownListener,
  addStandardDisposableGenericMouseUpListener,
  addStandardDisposableListener,
  after,
  animate,
  append,
  basicMarkupHtmlTags,
  clearNode,
  computeScreenAwareSize,
  copyAttributes,
  createLinkElement,
  createMetaElement,
  detectFullscreen,
  disposableWindowInterval,
  domContentLoaded,
  finalHandler,
  findParentWithClass,
  getActiveDocument,
  getActiveElement,
  getActiveWindow,
  getClientArea,
  getComputedStyle,
  getContentHeight,
  getContentWidth,
  getCookieValue,
  getDocument,
  getDomNodePagePosition,
  getDomNodeZoomLevel,
  getLargestChildWidth,
  getShadowRoot,
  getTopLeftOffset,
  getTotalHeight,
  getTotalScrollWidth,
  getTotalWidth,
  getWindow,
  getWindowById,
  getWindowId,
  getWindows,
  getWindowsCount,
  h,
  hasParentWithClass,
  hasWindow,
  hide,
  hookDomPurifyHrefAndSrcSanitizer,
  isActiveDocument,
  isActiveElement,
  isAncestor,
  isAncestorOfActiveElement,
  isAncestorUsingFlowTo,
  isDragEvent,
  isEditableElement,
  isElementInBottomRightQuarter,
  isEventLike,
  isHTMLAnchorElement,
  isHTMLButtonElement,
  isHTMLDivElement,
  isHTMLElement,
  isHTMLInputElement,
  isHTMLSpanElement,
  isHTMLTextAreaElement,
  isInShadowDOM,
  isKeyboardEvent,
  isMouseEvent,
  isPointerEvent,
  isSVGElement,
  isShadowRoot,
  join,
  measure,
  modify,
  multibyteAwareBtoa,
  onDidRegisterWindow,
  onDidUnregisterWindow,
  onWillUnregisterWindow,
  position,
  prepend,
  registerWindow,
  removeTabIndexAndUpdateFocus,
  reset,
  restoreParentsScrollTop,
  runAtThisOrScheduleAtNextAnimationFrame,
  runWhenWindowIdle,
  safeInnerHtml,
  saveParentsScrollTop,
  scheduleAtNextAnimationFrame,
  setParentFlowTo,
  setVisibility,
  sharedMutationObserver,
  show,
  size,
  svgElem,
  trackAttributes,
  trackFocus,
  triggerDownload,
  triggerUpload,
  windowOpenNoOpener,
  windowOpenPopup,
  windowOpenWithSuccess
};
//# sourceMappingURL=dom.js.map
