var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
class TabFocusImpl {
  static {
    __name(this, "TabFocusImpl");
  }
  _tabFocus = false;
  _onDidChangeTabFocus = new Emitter();
  onDidChangeTabFocus = this._onDidChangeTabFocus.event;
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
