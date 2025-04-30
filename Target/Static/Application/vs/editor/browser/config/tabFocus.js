var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../base/common/event.js";
class TabFocusImpl {
  static {
    __name(this, "TabFocusImpl");
  }
  constructor() {
    this._tabFocus = false;
    this._onDidChangeTabFocus = new Emitter();
    this.onDidChangeTabFocus = this._onDidChangeTabFocus.event;
  }
  getTabFocusMode() {
    return this._tabFocus;
  }
  setTabFocusMode(tabFocusMode) {
    this._tabFocus = tabFocusMode;
    this._onDidChangeTabFocus.fire(this._tabFocus);
  }
}
const TabFocus = new TabFocusImpl();
export {
  TabFocus
};
//# sourceMappingURL=tabFocus.js.map
