var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { ButtonBar } from "../../../base/browser/ui/button/button.js";
import { createInstantHoverDelegate } from "../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { ActionRunner, SubmenuAction } from "../../../base/common/actions.js";
import { Codicon } from "../../../base/common/codicons.js";
import { Emitter } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { localize } from "../../../nls.js";
import { getActionBarActions } from "./menuEntryActionViewItem.js";
import { IMenuService, MenuItemAction } from "../common/actions.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IContextMenuService } from "../../contextview/browser/contextView.js";
import { IHoverService } from "../../hover/browser/hover.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
let WorkbenchButtonBar = class WorkbenchButtonBar2 extends ButtonBar {
  static {
    __name(this, "WorkbenchButtonBar");
  }
  constructor(container, _options, _contextMenuService, _keybindingService, telemetryService, _hoverService) {
    super(container);
    this._options = _options;
    this._contextMenuService = _contextMenuService;
    this._keybindingService = _keybindingService;
    this._hoverService = _hoverService;
    this._store = new DisposableStore();
    this._updateStore = new DisposableStore();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._actionRunner = this._store.add(new ActionRunner());
    if (_options?.telemetrySource) {
      this._actionRunner.onDidRun((e) => {
        telemetryService.publicLog2("workbenchActionExecuted", { id: e.action.id, from: _options.telemetrySource });
      }, void 0, this._store);
    }
  }
  dispose() {
    this._onDidChange.dispose();
    this._updateStore.dispose();
    this._store.dispose();
    super.dispose();
  }
  update(actions, secondary) {
    const conifgProvider = this._options?.buttonConfigProvider ?? (() => ({ showLabel: true }));
    this._updateStore.clear();
    this.clear();
    const hoverDelegate = this._updateStore.add(createInstantHoverDelegate());
    for (let i = 0; i < actions.length; i++) {
      const secondary2 = i > 0;
      const actionOrSubmenu = actions[i];
      let action;
      let btn;
      let tooltip = actionOrSubmenu.tooltip || actionOrSubmenu.label;
      if (!(actionOrSubmenu instanceof SubmenuAction)) {
        tooltip = this._keybindingService.appendKeybinding(tooltip, actionOrSubmenu.id);
      }
      if (actionOrSubmenu instanceof SubmenuAction && actionOrSubmenu.actions.length > 0) {
        const [first, ...rest] = actionOrSubmenu.actions;
        action = first;
        btn = this.addButtonWithDropdown({
          secondary: conifgProvider(action, i)?.isSecondary ?? secondary2,
          actionRunner: this._actionRunner,
          actions: rest,
          contextMenuProvider: this._contextMenuService,
          ariaLabel: tooltip,
          supportIcons: true,
          small: this._options?.small
        });
      } else {
        action = actionOrSubmenu;
        btn = this.addButton({
          secondary: conifgProvider(action, i)?.isSecondary ?? secondary2,
          ariaLabel: tooltip,
          supportIcons: true,
          small: this._options?.small
        });
      }
      btn.enabled = action.enabled;
      btn.checked = action.checked ?? false;
      btn.element.classList.add("default-colors");
      const showLabel = conifgProvider(action, i)?.showLabel ?? true;
      if (showLabel) {
        btn.label = action.label;
      } else {
        btn.element.classList.add("monaco-text-button");
      }
      if (conifgProvider(action, i)?.showIcon) {
        if (action instanceof MenuItemAction && ThemeIcon.isThemeIcon(action.item.icon)) {
          if (!showLabel) {
            btn.icon = action.item.icon;
          } else {
            btn.label = `$(${action.item.icon.id}) ${action.label}`;
          }
        } else if (action.class) {
          btn.element.classList.add(...action.class.split(" "));
        }
      }
      this._updateStore.add(this._hoverService.setupManagedHover(hoverDelegate, btn.element, tooltip));
      this._updateStore.add(btn.onDidClick(async () => {
        this._actionRunner.run(action);
      }));
    }
    if (secondary.length > 0) {
      const btn = this.addButton({
        secondary: true,
        ariaLabel: localize("moreActions", "More Actions"),
        small: this._options?.small
      });
      btn.icon = Codicon.dropDownButton;
      btn.element.classList.add("default-colors", "monaco-text-button");
      btn.enabled = true;
      this._updateStore.add(this._hoverService.setupManagedHover(hoverDelegate, btn.element, localize("moreActions", "More Actions")));
      this._updateStore.add(btn.onDidClick(async () => {
        this._contextMenuService.showContextMenu({
          getAnchor: /* @__PURE__ */ __name(() => btn.element, "getAnchor"),
          getActions: /* @__PURE__ */ __name(() => secondary, "getActions"),
          actionRunner: this._actionRunner,
          onHide: /* @__PURE__ */ __name(() => btn.element.setAttribute("aria-expanded", "false"), "onHide")
        });
        btn.element.setAttribute("aria-expanded", "true");
      }));
    }
    this._onDidChange.fire(this);
  }
};
WorkbenchButtonBar = __decorate([
  __param(2, IContextMenuService),
  __param(3, IKeybindingService),
  __param(4, ITelemetryService),
  __param(5, IHoverService)
], WorkbenchButtonBar);
let MenuWorkbenchButtonBar = class MenuWorkbenchButtonBar2 extends WorkbenchButtonBar {
  static {
    __name(this, "MenuWorkbenchButtonBar");
  }
  constructor(container, menuId, options, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService, hoverService) {
    super(container, options, contextMenuService, keybindingService, telemetryService, hoverService);
    const menu = menuService.createMenu(menuId, contextKeyService);
    this._store.add(menu);
    const update = /* @__PURE__ */ __name(() => {
      this.clear();
      const actions = getActionBarActions(menu.getActions(options?.menuOptions), options?.toolbarOptions?.primaryGroup);
      super.update(actions.primary, actions.secondary);
    }, "update");
    this._store.add(menu.onDidChange(update));
    update();
  }
  dispose() {
    super.dispose();
  }
  update(_actions) {
    throw new Error("Use Menu or WorkbenchButtonBar");
  }
};
MenuWorkbenchButtonBar = __decorate([
  __param(3, IMenuService),
  __param(4, IContextKeyService),
  __param(5, IContextMenuService),
  __param(6, IKeybindingService),
  __param(7, ITelemetryService),
  __param(8, IHoverService)
], MenuWorkbenchButtonBar);
export {
  MenuWorkbenchButtonBar,
  WorkbenchButtonBar
};
//# sourceMappingURL=buttonbar.js.map
