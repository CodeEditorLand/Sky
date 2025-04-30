var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BugIndicatingError } from "../../common/errors.js";
import { DisposableStore } from "../../common/lifecycle.js";
import { derived, derivedOpts, derivedWithStore, observableValue } from "../../common/observable.js";
import { isSVGElement } from "../dom.js";
var n;
(function(n2) {
  function nodeNs(elementNs = void 0) {
    return (tag, attributes, children) => {
      const className = attributes.class;
      delete attributes.class;
      const ref2 = attributes.ref;
      delete attributes.ref;
      const obsRef = attributes.obsRef;
      delete attributes.obsRef;
      return new ObserverNodeWithElement(tag, ref2, obsRef, elementNs, className, attributes, children);
    };
  }
  __name(nodeNs, "nodeNs");
  function node(tag, elementNs = void 0) {
    const f = nodeNs(elementNs);
    return (attributes, children) => {
      return f(tag, attributes, children);
    };
  }
  __name(node, "node");
  n2.div = node("div");
  n2.elem = nodeNs(void 0);
  n2.svg = node("svg", "http://www.w3.org/2000/svg");
  n2.svgElem = nodeNs("http://www.w3.org/2000/svg");
  function ref() {
    let value = void 0;
    const result = /* @__PURE__ */ __name(function(val) {
      value = val;
    }, "result");
    Object.defineProperty(result, "element", {
      get() {
        if (!value) {
          throw new BugIndicatingError("Make sure the ref is set before accessing the element. Maybe wrong initialization order?");
        }
        return value;
      }
    });
    return result;
  }
  __name(ref, "ref");
  n2.ref = ref;
})(n || (n = {}));
class ObserverNode {
  static {
    __name(this, "ObserverNode");
  }
  constructor(tag, ref, obsRef, ns, className, attributes, children) {
    this._deriveds = [];
    this._element = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
    if (ref) {
      ref(this._element);
    }
    if (obsRef) {
      this._deriveds.push(derivedWithStore((_reader, store) => {
        obsRef(this);
        store.add({
          dispose: /* @__PURE__ */ __name(() => {
            obsRef(null);
          }, "dispose")
        });
      }));
    }
    if (className) {
      if (hasObservable(className)) {
        this._deriveds.push(derived(this, (reader) => {
          setClassName(this._element, getClassName(className, reader));
        }));
      } else {
        setClassName(this._element, getClassName(className, void 0));
      }
    }
    for (const [key, value] of Object.entries(attributes)) {
      if (key === "style") {
        for (const [cssKey, cssValue] of Object.entries(value)) {
          const key2 = camelCaseToHyphenCase(cssKey);
          if (isObservable(cssValue)) {
            this._deriveds.push(derivedOpts({ owner: this, debugName: /* @__PURE__ */ __name(() => `set.style.${key2}`, "debugName") }, (reader) => {
              this._element.style.setProperty(key2, convertCssValue(cssValue.read(reader)));
            }));
          } else {
            this._element.style.setProperty(key2, convertCssValue(cssValue));
          }
        }
      } else if (key === "tabIndex") {
        if (isObservable(value)) {
          this._deriveds.push(derived(this, (reader) => {
            this._element.tabIndex = value.read(reader);
          }));
        } else {
          this._element.tabIndex = value;
        }
      } else if (key.startsWith("on")) {
        this._element[key] = value;
      } else {
        if (isObservable(value)) {
          this._deriveds.push(derivedOpts({ owner: this, debugName: /* @__PURE__ */ __name(() => `set.${key}`, "debugName") }, (reader) => {
            setOrRemoveAttribute(this._element, key, value.read(reader));
          }));
        } else {
          setOrRemoveAttribute(this._element, key, value);
        }
      }
    }
    if (children) {
      let getChildren2 = function(reader, children2) {
        if (isObservable(children2)) {
          return getChildren2(reader, children2.read(reader));
        }
        if (Array.isArray(children2)) {
          return children2.flatMap((c) => getChildren2(reader, c));
        }
        if (children2 instanceof ObserverNode) {
          if (reader) {
            children2.readEffect(reader);
          }
          return [children2._element];
        }
        if (children2) {
          return [children2];
        }
        return [];
      };
      var getChildren = getChildren2;
      __name(getChildren2, "getChildren");
      const d = derived(this, (reader) => {
        this._element.replaceChildren(...getChildren2(reader, children));
      });
      this._deriveds.push(d);
      if (!childrenIsObservable(children)) {
        d.get();
      }
    }
  }
  readEffect(reader) {
    for (const d of this._deriveds) {
      d.read(reader);
    }
  }
  keepUpdated(store) {
    derived((reader) => {
      this.readEffect(reader);
    }).recomputeInitiallyAndOnChange(store);
    return this;
  }
  /**
   * Creates a live element that will keep the element updated as long as the returned object is not disposed.
  */
  toDisposableLiveElement() {
    const store = new DisposableStore();
    this.keepUpdated(store);
    return new LiveElement(this._element, store);
  }
}
function setClassName(domNode, className) {
  if (isSVGElement(domNode)) {
    domNode.setAttribute("class", className);
  } else {
    domNode.className = className;
  }
}
__name(setClassName, "setClassName");
function resolve(value, reader, cb) {
  if (isObservable(value)) {
    cb(value.read(reader));
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) {
      resolve(v, reader, cb);
    }
    return;
  }
  cb(value);
}
__name(resolve, "resolve");
function getClassName(className, reader) {
  let result = "";
  resolve(className, reader, (val) => {
    if (val) {
      if (result.length === 0) {
        result = val;
      } else {
        result += " " + val;
      }
    }
  });
  return result;
}
__name(getClassName, "getClassName");
function hasObservable(value) {
  if (isObservable(value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some((v) => hasObservable(v));
  }
  return false;
}
__name(hasObservable, "hasObservable");
function convertCssValue(value) {
  if (typeof value === "number") {
    return value + "px";
  }
  return value;
}
__name(convertCssValue, "convertCssValue");
function childrenIsObservable(children) {
  if (isObservable(children)) {
    return true;
  }
  if (Array.isArray(children)) {
    return children.some((c) => childrenIsObservable(c));
  }
  return false;
}
__name(childrenIsObservable, "childrenIsObservable");
class LiveElement {
  static {
    __name(this, "LiveElement");
  }
  constructor(element, _disposable) {
    this.element = element;
    this._disposable = _disposable;
  }
  dispose() {
    this._disposable.dispose();
  }
}
class ObserverNodeWithElement extends ObserverNode {
  static {
    __name(this, "ObserverNodeWithElement");
  }
  constructor() {
    super(...arguments);
    this._isHovered = void 0;
    this._didMouseMoveDuringHover = void 0;
  }
  get element() {
    return this._element;
  }
  get isHovered() {
    if (!this._isHovered) {
      const hovered = observableValue("hovered", false);
      this._element.addEventListener("mouseenter", (_e) => hovered.set(true, void 0));
      this._element.addEventListener("mouseleave", (_e) => hovered.set(false, void 0));
      this._isHovered = hovered;
    }
    return this._isHovered;
  }
  get didMouseMoveDuringHover() {
    if (!this._didMouseMoveDuringHover) {
      let _hovering = false;
      const hovered = observableValue("didMouseMoveDuringHover", false);
      this._element.addEventListener("mouseenter", (_e) => {
        _hovering = true;
      });
      this._element.addEventListener("mousemove", (_e) => {
        if (_hovering) {
          hovered.set(true, void 0);
        }
      });
      this._element.addEventListener("mouseleave", (_e) => {
        _hovering = false;
        hovered.set(false, void 0);
      });
      this._didMouseMoveDuringHover = hovered;
    }
    return this._didMouseMoveDuringHover;
  }
}
function setOrRemoveAttribute(element, key, value) {
  if (value === null || value === void 0) {
    element.removeAttribute(camelCaseToHyphenCase(key));
  } else {
    element.setAttribute(camelCaseToHyphenCase(key), String(value));
  }
}
__name(setOrRemoveAttribute, "setOrRemoveAttribute");
function camelCaseToHyphenCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
__name(camelCaseToHyphenCase, "camelCaseToHyphenCase");
function isObservable(obj) {
  return obj && typeof obj === "object" && obj["read"] !== void 0 && obj["reportChanges"] !== void 0;
}
__name(isObservable, "isObservable");
export {
  LiveElement,
  ObserverNode,
  ObserverNodeWithElement,
  n
};
//# sourceMappingURL=n.js.map
