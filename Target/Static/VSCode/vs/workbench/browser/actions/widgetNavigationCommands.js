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
import { KeyMod, KeyCode } from "../../../base/common/keyCodes.js";
import { ContextKeyExpr, IContextKey, IContextKeyService, RawContextKey } from "../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight, KeybindingsRegistry } from "../../../platform/keybinding/common/keybindingsRegistry.js";
import { WorkbenchListFocusContextKey, WorkbenchListScrollAtBottomContextKey, WorkbenchListScrollAtTopContextKey } from "../../../platform/list/browser/listService.js";
import { Event } from "../../../base/common/event.js";
import { combinedDisposable, toDisposable, IDisposable, Disposable } from "../../../base/common/lifecycle.js";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "../../common/contributions.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
function handleFocusEventsGroup(group, handler, onPartFocusChange) {
  const focusedIndices = /* @__PURE__ */ new Set();
  return combinedDisposable(...group.map((events, index) => combinedDisposable(
    events.onDidFocus(() => {
      onPartFocusChange?.(index, "focus");
      if (!focusedIndices.size) {
        handler(true);
      }
      focusedIndices.add(index);
    }),
    events.onDidBlur(() => {
      onPartFocusChange?.(index, "blur");
      focusedIndices.delete(index);
      if (!focusedIndices.size) {
        handler(false);
      }
    })
  )));
}
__name(handleFocusEventsGroup, "handleFocusEventsGroup");
const NavigableContainerFocusedContextKey = new RawContextKey("navigableContainerFocused", false);
let NavigableContainerManager = class {
  constructor(contextKeyService, logService, configurationService) {
    this.logService = logService;
    this.configurationService = configurationService;
    this.focused = NavigableContainerFocusedContextKey.bindTo(contextKeyService);
    NavigableContainerManager.INSTANCE = this;
  }
  static {
    __name(this, "NavigableContainerManager");
  }
  static ID = "workbench.contrib.navigableContainerManager";
  static INSTANCE;
  containers = /* @__PURE__ */ new Set();
  lastContainer;
  focused;
  dispose() {
    this.containers.clear();
    this.focused.reset();
    NavigableContainerManager.INSTANCE = void 0;
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
    return combinedDisposable(
      handleFocusEventsGroup(container.focusNotifiers, (isFocus) => {
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
      }),
      toDisposable(() => {
        instance.containers.delete(container);
        instance.log("NavigableContainerManager.unregister", container.name, instance.lastContainer?.name);
        if (instance.lastContainer === container) {
          instance.focused.set(false);
          instance.lastContainer = void 0;
        }
      })
    );
  }
  static getActive() {
    return this.INSTANCE?.lastContainer;
  }
};
NavigableContainerManager = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IConfigurationService)
], NavigableContainerManager);
function registerNavigableContainer(container) {
  return NavigableContainerManager.register(container);
}
__name(registerNavigableContainer, "registerNavigableContainer");
registerWorkbenchContribution2(NavigableContainerManager.ID, NavigableContainerManager, WorkbenchPhase.BlockStartup);
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "widgetNavigation.focusPrevious",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(
    NavigableContainerFocusedContextKey,
    ContextKeyExpr.or(
      WorkbenchListFocusContextKey?.negate(),
      WorkbenchListScrollAtTopContextKey
    )
  ),
  primary: KeyMod.CtrlCmd | KeyCode.UpArrow,
  handler: /* @__PURE__ */ __name(() => {
    const activeContainer = NavigableContainerManager.getActive();
    activeContainer?.focusPreviousWidget();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "widgetNavigation.focusNext",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(
    NavigableContainerFocusedContextKey,
    ContextKeyExpr.or(
      WorkbenchListFocusContextKey?.negate(),
      WorkbenchListScrollAtBottomContextKey
    )
  ),
  primary: KeyMod.CtrlCmd | KeyCode.DownArrow,
  handler: /* @__PURE__ */ __name(() => {
    const activeContainer = NavigableContainerManager.getActive();
    activeContainer?.focusNextWidget();
  }, "handler")
});
export {
  registerNavigableContainer
};
//# sourceMappingURL=widgetNavigationCommands.js.map
