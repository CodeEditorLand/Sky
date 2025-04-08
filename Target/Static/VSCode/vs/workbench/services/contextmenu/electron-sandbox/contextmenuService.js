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
import { IAction, WorkbenchActionExecutedEvent, WorkbenchActionExecutedClassification, Separator, SubmenuAction } from "../../../../base/common/actions.js";
import * as dom from "../../../../base/browser/dom.js";
import { IContextMenuMenuDelegate, IContextMenuService, IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { getZoomFactor } from "../../../../base/browser/browser.js";
import { unmnemonicLabel } from "../../../../base/common/labels.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IContextMenuDelegate, IContextMenuEvent } from "../../../../base/browser/contextmenu.js";
import { createSingleCallFunction } from "../../../../base/common/functional.js";
import { IContextMenuItem } from "../../../../base/parts/contextmenu/common/contextmenu.js";
import { popup } from "../../../../base/parts/contextmenu/electron-sandbox/contextmenu.js";
import { hasNativeTitlebar } from "../../../../platform/window/common/window.js";
import { isMacintosh, isWindows } from "../../../../base/common/platform.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextMenuMenuDelegate, ContextMenuService as HTMLContextMenuService } from "../../../../platform/contextview/browser/contextMenuService.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { stripIcons } from "../../../../base/common/iconLabels.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import { AnchorAlignment, AnchorAxisAlignment, isAnchor } from "../../../../base/browser/ui/contextview/contextview.js";
import { IMenuService } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
let ContextMenuService = class {
  static {
    __name(this, "ContextMenuService");
  }
  impl;
  get onDidShowContextMenu() {
    return this.impl.onDidShowContextMenu;
  }
  get onDidHideContextMenu() {
    return this.impl.onDidHideContextMenu;
  }
  constructor(notificationService, telemetryService, keybindingService, configurationService, contextViewService, menuService, contextKeyService) {
    if (!isMacintosh && !hasNativeTitlebar(configurationService)) {
      this.impl = new HTMLContextMenuService(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService);
    } else {
      this.impl = new NativeContextMenuService(notificationService, telemetryService, keybindingService, menuService, contextKeyService);
    }
  }
  dispose() {
    this.impl.dispose();
  }
  showContextMenu(delegate) {
    this.impl.showContextMenu(delegate);
  }
};
ContextMenuService = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextViewService),
  __decorateParam(5, IMenuService),
  __decorateParam(6, IContextKeyService)
], ContextMenuService);
let NativeContextMenuService = class extends Disposable {
  constructor(notificationService, telemetryService, keybindingService, menuService, contextKeyService) {
    super();
    this.notificationService = notificationService;
    this.telemetryService = telemetryService;
    this.keybindingService = keybindingService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
  }
  static {
    __name(this, "NativeContextMenuService");
  }
  _onDidShowContextMenu = this._store.add(new Emitter());
  onDidShowContextMenu = this._onDidShowContextMenu.event;
  _onDidHideContextMenu = this._store.add(new Emitter());
  onDidHideContextMenu = this._onDidHideContextMenu.event;
  showContextMenu(delegate) {
    delegate = ContextMenuMenuDelegate.transform(delegate, this.menuService, this.contextKeyService);
    const actions = delegate.getActions();
    if (actions.length) {
      const onHide = createSingleCallFunction(() => {
        delegate.onHide?.(false);
        dom.ModifierKeyEmitter.getInstance().resetKeyStatus();
        this._onDidHideContextMenu.fire();
      });
      const menu = this.createMenu(delegate, actions, onHide);
      const anchor = delegate.getAnchor();
      let x;
      let y;
      let zoom = getZoomFactor(dom.isHTMLElement(anchor) ? dom.getWindow(anchor) : dom.getActiveWindow());
      if (dom.isHTMLElement(anchor)) {
        const elementPosition = dom.getDomNodePagePosition(anchor);
        zoom *= dom.getDomNodeZoomLevel(anchor);
        if (delegate.anchorAxisAlignment === AnchorAxisAlignment.HORIZONTAL) {
          if (delegate.anchorAlignment === AnchorAlignment.LEFT) {
            x = elementPosition.left;
            y = elementPosition.top;
          } else {
            x = elementPosition.left + elementPosition.width;
            y = elementPosition.top;
          }
          if (!isMacintosh) {
            const window = dom.getWindow(anchor);
            const availableHeightForMenu = window.screen.height - y;
            if (availableHeightForMenu < actions.length * (isWindows ? 45 : 32)) {
              y += elementPosition.height;
            }
          }
        } else {
          if (delegate.anchorAlignment === AnchorAlignment.LEFT) {
            x = elementPosition.left;
            y = elementPosition.top + elementPosition.height;
          } else {
            x = elementPosition.left + elementPosition.width;
            y = elementPosition.top + elementPosition.height;
          }
        }
        if (isMacintosh) {
          y += 4 / zoom;
        }
      } else if (isAnchor(anchor)) {
        x = anchor.x;
        y = anchor.y;
      } else {
      }
      if (typeof x === "number") {
        x = Math.floor(x * zoom);
      }
      if (typeof y === "number") {
        y = Math.floor(y * zoom);
      }
      popup(menu, { x, y, positioningItem: delegate.autoSelectFirstItem ? 0 : void 0 }, () => onHide());
      this._onDidShowContextMenu.fire();
    }
  }
  createMenu(delegate, entries, onHide, submenuIds = /* @__PURE__ */ new Set()) {
    return coalesce(entries.map((entry) => this.createMenuItem(delegate, entry, onHide, submenuIds)));
  }
  createMenuItem(delegate, entry, onHide, submenuIds) {
    if (entry instanceof Separator) {
      return { type: "separator" };
    }
    if (entry instanceof SubmenuAction) {
      if (submenuIds.has(entry.id)) {
        console.warn(`Found submenu cycle: ${entry.id}`);
        return void 0;
      }
      return {
        label: unmnemonicLabel(stripIcons(entry.label)).trim(),
        submenu: this.createMenu(delegate, entry.actions, onHide, /* @__PURE__ */ new Set([...submenuIds, entry.id]))
      };
    } else {
      let type = void 0;
      if (!!entry.checked) {
        if (typeof delegate.getCheckedActionsRepresentation === "function") {
          type = delegate.getCheckedActionsRepresentation(entry);
        } else {
          type = "checkbox";
        }
      }
      const item = {
        label: unmnemonicLabel(stripIcons(entry.label)).trim(),
        checked: !!entry.checked,
        type,
        enabled: !!entry.enabled,
        click: /* @__PURE__ */ __name((event) => {
          onHide();
          this.runAction(entry, delegate, event);
        }, "click")
      };
      const keybinding = !!delegate.getKeyBinding ? delegate.getKeyBinding(entry) : this.keybindingService.lookupKeybinding(entry.id);
      if (keybinding) {
        const electronAccelerator = keybinding.getElectronAccelerator();
        if (electronAccelerator) {
          item.accelerator = electronAccelerator;
        } else {
          const label = keybinding.getLabel();
          if (label) {
            item.label = `${item.label} [${label}]`;
          }
        }
      }
      return item;
    }
  }
  async runAction(actionToRun, delegate, event) {
    if (!delegate.skipTelemetry) {
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: actionToRun.id, from: "contextMenu" });
    }
    const context = delegate.getActionsContext ? delegate.getActionsContext(event) : void 0;
    try {
      if (delegate.actionRunner) {
        await delegate.actionRunner.run(actionToRun, context);
      } else if (actionToRun.enabled) {
        await actionToRun.run(context);
      }
    } catch (error) {
      this.notificationService.error(error);
    }
  }
};
NativeContextMenuService = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextKeyService)
], NativeContextMenuService);
registerSingleton(IContextMenuService, ContextMenuService, InstantiationType.Delayed);
export {
  ContextMenuService
};
//# sourceMappingURL=contextmenuService.js.map
