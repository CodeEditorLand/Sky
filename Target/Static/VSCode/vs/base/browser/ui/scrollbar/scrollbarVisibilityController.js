var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FastDomNode } from "../../fastDomNode.js";
import { TimeoutTimer } from "../../../common/async.js";
import { Disposable } from "../../../common/lifecycle.js";
import { ScrollbarVisibility } from "../../../common/scrollable.js";
class ScrollbarVisibilityController extends Disposable {
  static {
    __name(this, "ScrollbarVisibilityController");
  }
  _visibility;
  _visibleClassName;
  _invisibleClassName;
  _domNode;
  _rawShouldBeVisible;
  _shouldBeVisible;
  _isNeeded;
  _isVisible;
  _revealTimer;
  constructor(visibility, visibleClassName, invisibleClassName) {
    super();
    this._visibility = visibility;
    this._visibleClassName = visibleClassName;
    this._invisibleClassName = invisibleClassName;
    this._domNode = null;
    this._isVisible = false;
    this._isNeeded = false;
    this._rawShouldBeVisible = false;
    this._shouldBeVisible = false;
    this._revealTimer = this._register(new TimeoutTimer());
  }
  setVisibility(visibility) {
    if (this._visibility !== visibility) {
      this._visibility = visibility;
      this._updateShouldBeVisible();
    }
  }
  // ----------------- Hide / Reveal
  setShouldBeVisible(rawShouldBeVisible) {
    this._rawShouldBeVisible = rawShouldBeVisible;
    this._updateShouldBeVisible();
  }
  _applyVisibilitySetting() {
    if (this._visibility === ScrollbarVisibility.Hidden) {
      return false;
    }
    if (this._visibility === ScrollbarVisibility.Visible) {
      return true;
    }
    return this._rawShouldBeVisible;
  }
  _updateShouldBeVisible() {
    const shouldBeVisible = this._applyVisibilitySetting();
    if (this._shouldBeVisible !== shouldBeVisible) {
      this._shouldBeVisible = shouldBeVisible;
      this.ensureVisibility();
    }
  }
  setIsNeeded(isNeeded) {
    if (this._isNeeded !== isNeeded) {
      this._isNeeded = isNeeded;
      this.ensureVisibility();
    }
  }
  setDomNode(domNode) {
    this._domNode = domNode;
    this._domNode.setClassName(this._invisibleClassName);
    this.setShouldBeVisible(false);
  }
  ensureVisibility() {
    if (!this._isNeeded) {
      this._hide(false);
      return;
    }
    if (this._shouldBeVisible) {
      this._reveal();
    } else {
      this._hide(true);
    }
  }
  _reveal() {
    if (this._isVisible) {
      return;
    }
    this._isVisible = true;
    this._revealTimer.setIfNotSet(() => {
      this._domNode?.setClassName(this._visibleClassName);
    }, 0);
  }
  _hide(withFadeAway) {
    this._revealTimer.cancel();
    if (!this._isVisible) {
      return;
    }
    this._isVisible = false;
    this._domNode?.setClassName(this._invisibleClassName + (withFadeAway ? " fade" : ""));
  }
}
export {
  ScrollbarVisibilityController
};
//# sourceMappingURL=scrollbarVisibilityController.js.map
