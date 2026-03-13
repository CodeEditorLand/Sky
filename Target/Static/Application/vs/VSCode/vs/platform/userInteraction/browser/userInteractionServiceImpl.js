var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getWindow, ModifierKeyEmitter, trackFocus } from "../../../base/browser/dom.js";
import { observableFromEvent, observableValue } from "../../../base/common/observable.js";
import { registerSingleton } from "../../instantiation/common/extensions.js";
import { IUserInteractionService } from "./userInteractionService.js";
class UserInteractionService {
  static {
    __name(this, "UserInteractionService");
  }
  constructor() {
    this._modifierObservables = /* @__PURE__ */ new WeakMap();
  }
  readModifierKeyStatus(element, reader) {
    const win = element instanceof Window ? element : getWindow(element);
    let obs = this._modifierObservables.get(win);
    if (!obs) {
      const emitter = ModifierKeyEmitter.getInstance();
      obs = observableFromEvent(this, emitter.event, () => ({
        ctrlKey: emitter.keyStatus.ctrlKey,
        shiftKey: emitter.keyStatus.shiftKey,
        altKey: emitter.keyStatus.altKey,
        metaKey: emitter.keyStatus.metaKey
      }));
      this._modifierObservables.set(win, obs);
    }
    return obs.read(reader);
  }
  createFocusTracker(element, store) {
    const tracker = store.add(trackFocus(element));
    const hasFocusWithin = /* @__PURE__ */ __name((el) => {
      if (el instanceof Window) {
        return el.document.hasFocus();
      }
      const shadowRoot = el.getRootNode() instanceof ShadowRoot ? el.getRootNode() : null;
      const activeElement = shadowRoot ? shadowRoot.activeElement : el.ownerDocument.activeElement;
      return el.contains(activeElement);
    }, "hasFocusWithin");
    const value = observableValue("isFocused", hasFocusWithin(element));
    store.add(tracker.onDidFocus(() => value.set(true, void 0)));
    store.add(tracker.onDidBlur(() => value.set(false, void 0)));
    return value;
  }
  createHoverTracker(element, store) {
    const value = observableValue("isHovered", false);
    const onEnter = /* @__PURE__ */ __name(() => value.set(true, void 0), "onEnter");
    const onLeave = /* @__PURE__ */ __name(() => value.set(false, void 0), "onLeave");
    element.addEventListener("mouseenter", onEnter);
    element.addEventListener("mouseleave", onLeave);
    store.add({
      dispose: /* @__PURE__ */ __name(() => {
        element.removeEventListener("mouseenter", onEnter);
        element.removeEventListener("mouseleave", onLeave);
      }, "dispose")
    });
    return value;
  }
  createDomFocusTracker(element) {
    return trackFocus(element);
  }
}
registerSingleton(
  IUserInteractionService,
  UserInteractionService,
  1
  /* InstantiationType.Delayed */
);
export {
  UserInteractionService
};
//# sourceMappingURL=userInteractionServiceImpl.js.map
