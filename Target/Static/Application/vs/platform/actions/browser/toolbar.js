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
import { addDisposableListener, getWindow } from "../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { ToggleMenuAction, ToolBar } from "../../../base/browser/ui/toolbar/toolbar.js";
import { Separator, toAction } from "../../../base/common/actions.js";
import { coalesceInPlace } from "../../../base/common/arrays.js";
import { intersection } from "../../../base/common/collections.js";
import { BugIndicatingError } from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { localize } from "../../../nls.js";
import { createActionViewItem, getActionBarActions } from "./menuEntryActionViewItem.js";
import { IMenuService, MenuItemAction, SubmenuItemAction } from "../common/actions.js";
import { createConfigureKeybindingAction } from "../common/menuService.js";
import { ICommandService } from "../../commands/common/commands.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IContextMenuService } from "../../contextview/browser/contextView.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IActionViewItemService } from "./actionViewItemService.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
var HiddenItemStrategy;
(function(HiddenItemStrategy2) {
  HiddenItemStrategy2[HiddenItemStrategy2["NoHide"] = -1] = "NoHide";
  HiddenItemStrategy2[HiddenItemStrategy2["Ignore"] = 0] = "Ignore";
  HiddenItemStrategy2[HiddenItemStrategy2["RenderInSecondaryGroup"] = 1] = "RenderInSecondaryGroup";
})(HiddenItemStrategy || (HiddenItemStrategy = {}));
let WorkbenchToolBar = class WorkbenchToolBar2 extends ToolBar {
  static {
    __name(this, "WorkbenchToolBar");
  }
  constructor(container, _options, _menuService, _contextKeyService, _contextMenuService, _keybindingService, _commandService, telemetryService) {
    super(container, _contextMenuService, {
      // defaults
      getKeyBinding: /* @__PURE__ */ __name((action) => _keybindingService.lookupKeybinding(action.id) ?? void 0, "getKeyBinding"),
      // options (override defaults)
      ..._options,
      // mandatory (overide options)
      allowContextMenu: true,
      skipTelemetry: typeof _options?.telemetrySource === "string"
    });
    this._options = _options;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this._contextMenuService = _contextMenuService;
    this._keybindingService = _keybindingService;
    this._commandService = _commandService;
    this._sessionDisposables = this._store.add(new DisposableStore());
    const telemetrySource = _options?.telemetrySource;
    if (telemetrySource) {
      this._store.add(this.actionBar.onDidRun((e) => telemetryService.publicLog2("workbenchActionExecuted", { id: e.action.id, from: telemetrySource })));
    }
  }
  setActions(_primary, _secondary = [], menuIds) {
    this._sessionDisposables.clear();
    const primary = _primary.slice();
    const secondary = _secondary.slice();
    const toggleActions = [];
    let toggleActionsCheckedCount = 0;
    const extraSecondary = [];
    let someAreHidden = false;
    if (this._options?.hiddenItemStrategy !== -1) {
      for (let i = 0; i < primary.length; i++) {
        const action = primary[i];
        if (!(action instanceof MenuItemAction) && !(action instanceof SubmenuItemAction)) {
          continue;
        }
        if (!action.hideActions) {
          continue;
        }
        toggleActions.push(action.hideActions.toggle);
        if (action.hideActions.toggle.checked) {
          toggleActionsCheckedCount++;
        }
        if (action.hideActions.isHidden) {
          someAreHidden = true;
          primary[i] = void 0;
          if (this._options?.hiddenItemStrategy !== 0) {
            extraSecondary[i] = action;
          }
        }
      }
    }
    if (this._options?.overflowBehavior !== void 0) {
      const exemptedIds = intersection(new Set(this._options.overflowBehavior.exempted), Iterable.map(primary, (a) => a?.id));
      const maxItems = this._options.overflowBehavior.maxItems - exemptedIds.size;
      let count = 0;
      for (let i = 0; i < primary.length; i++) {
        const action = primary[i];
        if (!action) {
          continue;
        }
        count++;
        if (exemptedIds.has(action.id)) {
          continue;
        }
        if (count >= maxItems) {
          primary[i] = void 0;
          extraSecondary[i] = action;
        }
      }
    }
    coalesceInPlace(primary);
    coalesceInPlace(extraSecondary);
    super.setActions(primary, Separator.join(extraSecondary, secondary));
    if (toggleActions.length > 0 || primary.length > 0) {
      this._sessionDisposables.add(addDisposableListener(this.getElement(), "contextmenu", (e) => {
        const event = new StandardMouseEvent(getWindow(this.getElement()), e);
        const action = this.getItemAction(event.target);
        if (!action) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        const primaryActions = [];
        if (action instanceof MenuItemAction && action.menuKeybinding) {
          primaryActions.push(action.menuKeybinding);
        } else if (!(action instanceof SubmenuItemAction || action instanceof ToggleMenuAction)) {
          const supportsKeybindings = !!this._keybindingService.lookupKeybinding(action.id);
          primaryActions.push(createConfigureKeybindingAction(this._commandService, this._keybindingService, action.id, void 0, supportsKeybindings));
        }
        if (toggleActions.length > 0) {
          let noHide = false;
          if (toggleActionsCheckedCount === 1 && this._options?.hiddenItemStrategy === 0) {
            noHide = true;
            for (let i = 0; i < toggleActions.length; i++) {
              if (toggleActions[i].checked) {
                toggleActions[i] = toAction({
                  id: action.id,
                  label: action.label,
                  checked: true,
                  enabled: false,
                  run() {
                  }
                });
                break;
              }
            }
          }
          if (!noHide && (action instanceof MenuItemAction || action instanceof SubmenuItemAction)) {
            if (!action.hideActions) {
              return;
            }
            primaryActions.push(action.hideActions.hide);
          } else {
            primaryActions.push(toAction({
              id: "label",
              label: localize("hide", "Hide"),
              enabled: false,
              run() {
              }
            }));
          }
        }
        const actions = Separator.join(primaryActions, toggleActions);
        if (this._options?.resetMenu && !menuIds) {
          menuIds = [this._options.resetMenu];
        }
        if (someAreHidden && menuIds) {
          actions.push(new Separator());
          actions.push(toAction({
            id: "resetThisMenu",
            label: localize("resetThisMenu", "Reset Menu"),
            run: /* @__PURE__ */ __name(() => this._menuService.resetHiddenStates(menuIds), "run")
          }));
        }
        if (actions.length === 0) {
          return;
        }
        this._contextMenuService.showContextMenu({
          getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
          getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
          // add context menu actions (iff appicable)
          menuId: this._options?.contextMenu,
          menuActionOptions: { renderShortTitle: true, ...this._options?.menuOptions },
          skipTelemetry: typeof this._options?.telemetrySource === "string",
          contextKeyService: this._contextKeyService
        });
      }));
    }
  }
};
WorkbenchToolBar = __decorate([
  __param(2, IMenuService),
  __param(3, IContextKeyService),
  __param(4, IContextMenuService),
  __param(5, IKeybindingService),
  __param(6, ICommandService),
  __param(7, ITelemetryService)
], WorkbenchToolBar);
let MenuWorkbenchToolBar = class MenuWorkbenchToolBar2 extends WorkbenchToolBar {
  static {
    __name(this, "MenuWorkbenchToolBar");
  }
  constructor(container, menuId, options, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService, actionViewService, instaService) {
    super(container, {
      resetMenu: menuId,
      ...options,
      actionViewItemProvider: /* @__PURE__ */ __name((action, opts) => {
        let provider = actionViewService.lookUp(menuId, action instanceof SubmenuItemAction ? action.item.submenu.id : action.id);
        if (!provider) {
          provider = options?.actionViewItemProvider;
        }
        const viewItem = provider?.(action, opts);
        if (viewItem) {
          return viewItem;
        }
        return createActionViewItem(instaService, action, opts);
      }, "actionViewItemProvider")
    }, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService);
    this._onDidChangeMenuItems = this._store.add(new Emitter());
    this.onDidChangeMenuItems = this._onDidChangeMenuItems.event;
    const menu = this._store.add(menuService.createMenu(menuId, contextKeyService, { emitEventsForSubmenuChanges: true, eventDebounceDelay: options?.eventDebounceDelay }));
    const updateToolbar = /* @__PURE__ */ __name(() => {
      const { primary, secondary } = getActionBarActions(menu.getActions(options?.menuOptions), options?.toolbarOptions?.primaryGroup, options?.toolbarOptions?.shouldInlineSubmenu, options?.toolbarOptions?.useSeparatorsInPrimaryActions);
      container.classList.toggle("has-no-actions", primary.length === 0 && secondary.length === 0);
      super.setActions(primary, secondary);
    }, "updateToolbar");
    this._store.add(menu.onDidChange(() => {
      updateToolbar();
      this._onDidChangeMenuItems.fire(this);
    }));
    this._store.add(actionViewService.onDidChange((e) => {
      if (e === menuId) {
        updateToolbar();
      }
    }));
    updateToolbar();
  }
  /**
   * @deprecated The WorkbenchToolBar does not support this method because it works with menus.
   */
  setActions() {
    throw new BugIndicatingError("This toolbar is populated from a menu.");
  }
};
MenuWorkbenchToolBar = __decorate([
  __param(3, IMenuService),
  __param(4, IContextKeyService),
  __param(5, IContextMenuService),
  __param(6, IKeybindingService),
  __param(7, ICommandService),
  __param(8, ITelemetryService),
  __param(9, IActionViewItemService),
  __param(10, IInstantiationService)
], MenuWorkbenchToolBar);
export {
  HiddenItemStrategy,
  MenuWorkbenchToolBar,
  WorkbenchToolBar
};
//# sourceMappingURL=toolbar.js.map
