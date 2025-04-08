var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IActionViewItemProvider } from "../../../base/browser/ui/actionbar/actionbar.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { InstantiationType, registerSingleton } from "../../instantiation/common/extensions.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { MenuId } from "../common/actions.js";
const IActionViewItemService = createDecorator("IActionViewItemService");
class NullActionViewItemService {
  static {
    __name(this, "NullActionViewItemService");
  }
  _serviceBrand;
  onDidChange = Event.None;
  register(menu, commandId, provider, event) {
    return Disposable.None;
  }
  lookUp(menu, commandId) {
    return void 0;
  }
}
class ActionViewItemService {
  static {
    __name(this, "ActionViewItemService");
  }
  _providers = /* @__PURE__ */ new Map();
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  dispose() {
    this._onDidChange.dispose();
  }
  register(menu, commandOrSubmenuId, provider, event) {
    const id = this._makeKey(menu, commandOrSubmenuId);
    if (this._providers.has(id)) {
      throw new Error(`A provider for the command ${commandOrSubmenuId} and menu ${menu} is already registered.`);
    }
    this._providers.set(id, provider);
    const listener = event?.(() => {
      this._onDidChange.fire(menu);
    });
    return toDisposable(() => {
      listener?.dispose();
      this._providers.delete(id);
    });
  }
  lookUp(menu, commandOrMenuId) {
    return this._providers.get(this._makeKey(menu, commandOrMenuId));
  }
  _makeKey(menu, commandOrMenuId) {
    return `${menu.id}/${commandOrMenuId instanceof MenuId ? commandOrMenuId.id : commandOrMenuId}`;
  }
}
registerSingleton(IActionViewItemService, ActionViewItemService, InstantiationType.Delayed);
export {
  IActionViewItemService,
  NullActionViewItemService
};
//# sourceMappingURL=actionViewItemService.js.map
