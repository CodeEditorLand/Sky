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
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { IContextMenuDelegate } from "../../../base/browser/contextmenu.js";
import { ModifierKeyEmitter } from "../../../base/browser/dom.js";
import { IAction, Separator } from "../../../base/common/actions.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { getFlatContextMenuActions } from "../../actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId } from "../../actions/common/actions.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { INotificationService } from "../../notification/common/notification.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { ContextMenuHandler, IContextMenuHandlerOptions } from "./contextMenuHandler.js";
import { IContextMenuMenuDelegate, IContextMenuService, IContextViewService } from "./contextView.js";
let ContextMenuService = class extends Disposable {
  constructor(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService) {
    super();
    this.telemetryService = telemetryService;
    this.notificationService = notificationService;
    this.contextViewService = contextViewService;
    this.keybindingService = keybindingService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
  }
  static {
    __name(this, "ContextMenuService");
  }
  _contextMenuHandler = void 0;
  get contextMenuHandler() {
    if (!this._contextMenuHandler) {
      this._contextMenuHandler = new ContextMenuHandler(this.contextViewService, this.telemetryService, this.notificationService, this.keybindingService);
    }
    return this._contextMenuHandler;
  }
  _onDidShowContextMenu = this._store.add(new Emitter());
  onDidShowContextMenu = this._onDidShowContextMenu.event;
  _onDidHideContextMenu = this._store.add(new Emitter());
  onDidHideContextMenu = this._onDidHideContextMenu.event;
  configure(options) {
    this.contextMenuHandler.configure(options);
  }
  // ContextMenu
  showContextMenu(delegate) {
    delegate = ContextMenuMenuDelegate.transform(delegate, this.menuService, this.contextKeyService);
    this.contextMenuHandler.showContextMenu({
      ...delegate,
      onHide: /* @__PURE__ */ __name((didCancel) => {
        delegate.onHide?.(didCancel);
        this._onDidHideContextMenu.fire();
      }, "onHide")
    });
    ModifierKeyEmitter.getInstance().resetKeyStatus();
    this._onDidShowContextMenu.fire();
  }
};
ContextMenuService = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService)
], ContextMenuService);
var ContextMenuMenuDelegate;
((ContextMenuMenuDelegate2) => {
  function is(thing) {
    return thing && thing.menuId instanceof MenuId;
  }
  __name(is, "is");
  function transform(delegate, menuService, globalContextKeyService) {
    if (!is(delegate)) {
      return delegate;
    }
    const { menuId, menuActionOptions, contextKeyService } = delegate;
    return {
      ...delegate,
      getActions: /* @__PURE__ */ __name(() => {
        let target = [];
        if (menuId) {
          const menu = menuService.getMenuActions(menuId, contextKeyService ?? globalContextKeyService, menuActionOptions);
          target = getFlatContextMenuActions(menu);
        }
        if (!delegate.getActions) {
          return target;
        } else {
          return Separator.join(delegate.getActions(), target);
        }
      }, "getActions")
    };
  }
  ContextMenuMenuDelegate2.transform = transform;
  __name(transform, "transform");
})(ContextMenuMenuDelegate || (ContextMenuMenuDelegate = {}));
export {
  ContextMenuMenuDelegate,
  ContextMenuService
};
//# sourceMappingURL=contextMenuService.js.map
