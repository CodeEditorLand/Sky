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
import { Separator, SubmenuAction } from "../../../../base/common/actions.js";
import * as dom from "../../../../base/browser/dom.js";
import { IContextMenuService, IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { getZoomFactor } from "../../../../base/browser/browser.js";
import { unmnemonicLabel } from "../../../../base/common/labels.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { createSingleCallFunction } from "../../../../base/common/functional.js";
import { popup } from "../../../../base/parts/contextmenu/electron-browser/contextmenu.js";
import { hasNativeContextMenu } from "../../../../platform/window/common/window.js";
import { isMacintosh, isWindows } from "../../../../base/common/platform.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextMenuMenuDelegate, ContextMenuService as HTMLContextMenuService } from "../../../../platform/contextview/browser/contextMenuService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { stripIcons } from "../../../../base/common/iconLabels.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { Emitter } from "../../../../base/common/event.js";
import { isAnchor } from "../../../../base/browser/ui/contextview/contextview.js";
import { IMenuService } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
let ContextMenuService = class ContextMenuService2 {
  static {
    __name(this, "ContextMenuService");
  }
  get onDidShowContextMenu() {
    return this.impl.onDidShowContextMenu;
  }
  get onDidHideContextMenu() {
    return this.impl.onDidHideContextMenu;
  }
  constructor(notificationService, telemetryService, keybindingService, configurationService, contextViewService, menuService, contextKeyService) {
    function createContextMenuService(native) {
      return native ? new NativeContextMenuService(notificationService, telemetryService, keybindingService, menuService, contextKeyService) : new HTMLContextMenuService(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService);
    }
    __name(createContextMenuService, "createContextMenuService");
    let isNativeContextMenu = hasNativeContextMenu(configurationService);
    this.impl = createContextMenuService(isNativeContextMenu);
    if (isMacintosh) {
      this.listener = configurationService.onDidChangeConfiguration((e) => {
        if (!e.affectsConfiguration(
          "window.menuStyle"
          /* MenuSettings.MenuStyle */
        )) {
          return;
        }
        const newIsNativeContextMenu = hasNativeContextMenu(configurationService);
        if (newIsNativeContextMenu === isNativeContextMenu) {
          return;
        }
        this.impl.dispose();
        this.impl = createContextMenuService(newIsNativeContextMenu);
        isNativeContextMenu = newIsNativeContextMenu;
      });
    }
  }
  dispose() {
    this.listener?.dispose();
    this.impl.dispose();
  }
  showContextMenu(delegate) {
    this.impl.showContextMenu(delegate);
  }
};
ContextMenuService = __decorate([
  __param(0, INotificationService),
  __param(1, ITelemetryService),
  __param(2, IKeybindingService),
  __param(3, IConfigurationService),
  __param(4, IContextViewService),
  __param(5, IMenuService),
  __param(6, IContextKeyService)
], ContextMenuService);
let NativeContextMenuService = class NativeContextMenuService2 extends Disposable {
  static {
    __name(this, "NativeContextMenuService");
  }
  constructor(notificationService, telemetryService, keybindingService, menuService, contextKeyService) {
    super();
    this.notificationService = notificationService;
    this.telemetryService = telemetryService;
    this.keybindingService = keybindingService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this._onDidShowContextMenu = this._store.add(new Emitter());
    this.onDidShowContextMenu = this._onDidShowContextMenu.event;
    this._onDidHideContextMenu = this._store.add(new Emitter());
    this.onDidHideContextMenu = this._onDidHideContextMenu.event;
  }
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
        const clientRect = anchor.getBoundingClientRect();
        const elementPosition = { left: clientRect.left, top: clientRect.top, width: clientRect.width, height: clientRect.height };
        const win = dom.getWindow(anchor);
        const vw = win.innerWidth;
        const vh = win.innerHeight;
        const isClipped = clientRect.left < 0 || clientRect.top < 0 || clientRect.right > vw || clientRect.bottom > vh;
        zoom *= dom.getDomNodeZoomLevel(anchor);
        if (isClipped) {
          x = Math.min(Math.max(clientRect.right, 0), vw);
          y = Math.min(Math.max(clientRect.bottom, 0), vh);
        } else {
          if (delegate.anchorAxisAlignment === 1) {
            if (delegate.anchorAlignment === 0) {
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
            if (delegate.anchorAlignment === 0) {
              x = elementPosition.left;
              y = elementPosition.top + elementPosition.height;
            } else {
              x = elementPosition.left + elementPosition.width;
              y = elementPosition.top + elementPosition.height;
            }
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
      if (entry.checked) {
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
      const keybinding = delegate.getKeyBinding ? delegate.getKeyBinding(entry) : this.keybindingService.lookupKeybinding(entry.id);
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
NativeContextMenuService = __decorate([
  __param(0, INotificationService),
  __param(1, ITelemetryService),
  __param(2, IKeybindingService),
  __param(3, IMenuService),
  __param(4, IContextKeyService)
], NativeContextMenuService);
registerSingleton(
  IContextMenuService,
  ContextMenuService,
  1
  /* InstantiationType.Delayed */
);
export {
  ContextMenuService
};
//# sourceMappingURL=contextmenuService.js.map
