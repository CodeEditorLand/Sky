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
var NavigableContainerManager_1;
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../platform/contextkey/common/contextkey.js";
import { KeybindingsRegistry } from "../../../platform/keybinding/common/keybindingsRegistry.js";
import { WorkbenchListFocusContextKey, WorkbenchListScrollAtBottomContextKey, WorkbenchListScrollAtTopContextKey } from "../../../platform/list/browser/listService.js";
import { combinedDisposable, toDisposable, Disposable } from "../../../base/common/lifecycle.js";
import { registerWorkbenchContribution2 } from "../../common/contributions.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
function handleFocusEventsGroup(group, handler, onPartFocusChange) {
  const focusedIndices = /* @__PURE__ */ new Set();
  return combinedDisposable(...group.map((events, index) => combinedDisposable(events.onDidFocus(() => {
    onPartFocusChange?.(index, "focus");
    if (!focusedIndices.size) {
      handler(true);
    }
    focusedIndices.add(index);
  }), events.onDidBlur(() => {
    onPartFocusChange?.(index, "blur");
    focusedIndices.delete(index);
    if (!focusedIndices.size) {
      handler(false);
    }
  }))));
}
__name(handleFocusEventsGroup, "handleFocusEventsGroup");
const NavigableContainerFocusedContextKey = new RawContextKey("navigableContainerFocused", false);
let NavigableContainerManager = class NavigableContainerManager2 {
  static {
    __name(this, "NavigableContainerManager");
  }
  static {
    NavigableContainerManager_1 = this;
  }
  static {
    this.ID = "workbench.contrib.navigableContainerManager";
  }
  constructor(contextKeyService, logService, configurationService) {
    this.logService = logService;
    this.configurationService = configurationService;
    this.containers = /* @__PURE__ */ new Set();
    this.focused = NavigableContainerFocusedContextKey.bindTo(contextKeyService);
    NavigableContainerManager_1.INSTANCE = this;
  }
  dispose() {
    this.containers.clear();
    this.focused.reset();
    NavigableContainerManager_1.INSTANCE = void 0;
  }
  get debugEnabled() {
    return this.configurationService.getValue("workbench.navigibleContainer.enableDebug");
  }
  log(msg, ...args) {
    if (this.debugEnabled) {
      this.logService.debug(msg, ...args);
    }
  }
  static register(container) {
    const instance = this.INSTANCE;
    if (!instance) {
      return Disposable.None;
    }
    instance.containers.add(container);
    instance.log("NavigableContainerManager.register", container.name);
    return combinedDisposable(handleFocusEventsGroup(container.focusNotifiers, (isFocus) => {
      if (isFocus) {
        instance.log("NavigableContainerManager.focus", container.name);
        instance.focused.set(true);
        instance.lastContainer = container;
      } else {
        instance.log("NavigableContainerManager.blur", container.name, instance.lastContainer?.name);
        if (instance.lastContainer === container) {
          instance.focused.set(false);
          instance.lastContainer = void 0;
        }
      }
    }, (index, event) => {
      instance.log("NavigableContainerManager.partFocusChange", container.name, index, event);
    }), toDisposable(() => {
      instance.containers.delete(container);
      instance.log("NavigableContainerManager.unregister", container.name, instance.lastContainer?.name);
      if (instance.lastContainer === container) {
        instance.focused.set(false);
        instance.lastContainer = void 0;
      }
    }));
  }
  static getActive() {
    return this.INSTANCE?.lastContainer;
  }
};
NavigableContainerManager = NavigableContainerManager_1 = __decorate([
  __param(0, IContextKeyService),
  __param(1, ILogService),
  __param(2, IConfigurationService)
], NavigableContainerManager);
function registerNavigableContainer(container) {
  return NavigableContainerManager.register(container);
}
__name(registerNavigableContainer, "registerNavigableContainer");
registerWorkbenchContribution2(
  NavigableContainerManager.ID,
  NavigableContainerManager,
  1
  /* WorkbenchPhase.BlockStartup */
);
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "widgetNavigation.focusPrevious",
  weight: 200,
  when: ContextKeyExpr.and(NavigableContainerFocusedContextKey, ContextKeyExpr.or(WorkbenchListFocusContextKey?.negate(), WorkbenchListScrollAtTopContextKey)),
  primary: 2048 | 16,
  handler: /* @__PURE__ */ __name(() => {
    const activeContainer = NavigableContainerManager.getActive();
    activeContainer?.focusPreviousWidget();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "widgetNavigation.focusNext",
  weight: 200,
  when: ContextKeyExpr.and(NavigableContainerFocusedContextKey, ContextKeyExpr.or(WorkbenchListFocusContextKey?.negate(), WorkbenchListScrollAtBottomContextKey)),
  primary: 2048 | 18,
  handler: /* @__PURE__ */ __name(() => {
    const activeContainer = NavigableContainerManager.getActive();
    activeContainer?.focusNextWidget();
  }, "handler")
});
export {
  registerNavigableContainer
};
//# sourceMappingURL=widgetNavigationCommands.js.map
