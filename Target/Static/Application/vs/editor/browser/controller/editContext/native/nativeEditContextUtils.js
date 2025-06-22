var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { addDisposableListener, getActiveElement, getShadowRoot } from "../../../../../base/browser/dom.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
class FocusTracker extends Disposable {
  static {
    __name(this, "FocusTracker");
  }
  constructor(_domNode, _onFocusChange) {
    super();
    this._domNode = _domNode;
    this._onFocusChange = _onFocusChange;
    this._isFocused = false;
    this._isPaused = false;
    this._register(addDisposableListener(this._domNode, "focus", () => {
      if (this._isPaused) {
        return;
      }
      this.refreshFocusState();
    }));
    this._register(addDisposableListener(this._domNode, "blur", () => {
      if (this._isPaused) {
        return;
      }
      this._handleFocusedChanged(false);
    }));
  }
  pause() {
    this._isPaused = true;
  }
  resume() {
    this._isPaused = false;
    this.refreshFocusState();
  }
  _handleFocusedChanged(focused) {
    if (this._isFocused === focused) {
      return;
    }
    this._isFocused = focused;
    this._onFocusChange(this._isFocused);
  }
  focus() {
    this._domNode.focus();
    this.refreshFocusState();
  }
  refreshFocusState() {
    const shadowRoot = getShadowRoot(this._domNode);
    const activeElement = shadowRoot ? shadowRoot.activeElement : getActiveElement();
    const focused = this._domNode === activeElement;
    this._handleFocusedChanged(focused);
  }
  get isFocused() {
    return this._isFocused;
  }
}
function editContextAddDisposableListener(target, type, listener, options) {
  target.addEventListener(type, listener, options);
  return {
    dispose() {
      target.removeEventListener(type, listener);
    }
  };
}
__name(editContextAddDisposableListener, "editContextAddDisposableListener");
export {
  FocusTracker,
  editContextAddDisposableListener
};
//# sourceMappingURL=nativeEditContextUtils.js.map
