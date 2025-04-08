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
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingsRegistry, KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { INotificationViewItem, isNotificationViewItem, NotificationsModel } from "../../../common/notifications.js";
import { MenuRegistry, MenuId } from "../../../../platform/actions/common/actions.js";
import { localize, localize2 } from "../../../../nls.js";
import { IListService, WorkbenchList } from "../../../../platform/list/browser/listService.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { NotificationFocusedContext, NotificationsCenterVisibleContext, NotificationsToastsVisibleContext } from "../../../common/contextkeys.js";
import { INotificationService, INotificationSourceFilter, NotificationsFilter } from "../../../../platform/notification/common/notification.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ActionRunner, IAction, WorkbenchActionExecutedEvent, WorkbenchActionExecutedClassification } from "../../../../base/common/actions.js";
import { IQuickInputService, IQuickPickItem } from "../../../../platform/quickinput/common/quickInput.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
const SHOW_NOTIFICATIONS_CENTER = "notifications.showList";
const HIDE_NOTIFICATIONS_CENTER = "notifications.hideList";
const TOGGLE_NOTIFICATIONS_CENTER = "notifications.toggleList";
const HIDE_NOTIFICATION_TOAST = "notifications.hideToasts";
const FOCUS_NOTIFICATION_TOAST = "notifications.focusToasts";
const FOCUS_NEXT_NOTIFICATION_TOAST = "notifications.focusNextToast";
const FOCUS_PREVIOUS_NOTIFICATION_TOAST = "notifications.focusPreviousToast";
const FOCUS_FIRST_NOTIFICATION_TOAST = "notifications.focusFirstToast";
const FOCUS_LAST_NOTIFICATION_TOAST = "notifications.focusLastToast";
const COLLAPSE_NOTIFICATION = "notification.collapse";
const EXPAND_NOTIFICATION = "notification.expand";
const ACCEPT_PRIMARY_ACTION_NOTIFICATION = "notification.acceptPrimaryAction";
const TOGGLE_NOTIFICATION = "notification.toggle";
const CLEAR_NOTIFICATION = "notification.clear";
const CLEAR_ALL_NOTIFICATIONS = "notifications.clearAll";
const TOGGLE_DO_NOT_DISTURB_MODE = "notifications.toggleDoNotDisturbMode";
const TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE = "notifications.toggleDoNotDisturbModeBySource";
function getNotificationFromContext(listService, context) {
  if (isNotificationViewItem(context)) {
    return context;
  }
  const list = listService.lastFocusedList;
  if (list instanceof WorkbenchList) {
    let element = list.getFocusedElements()[0];
    if (!isNotificationViewItem(element)) {
      if (list.isDOMFocused()) {
        element = list.element(0);
      }
    }
    if (isNotificationViewItem(element)) {
      return element;
    }
  }
  return void 0;
}
__name(getNotificationFromContext, "getNotificationFromContext");
function registerNotificationCommands(center, toasts, model) {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: SHOW_NOTIFICATIONS_CENTER,
    weight: KeybindingWeight.WorkbenchContrib,
    primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyN),
    handler: /* @__PURE__ */ __name(() => {
      toasts.hide();
      center.show();
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: HIDE_NOTIFICATIONS_CENTER,
    weight: KeybindingWeight.WorkbenchContrib + 50,
    when: NotificationsCenterVisibleContext,
    primary: KeyCode.Escape,
    handler: /* @__PURE__ */ __name(() => center.hide(), "handler")
  });
  CommandsRegistry.registerCommand(TOGGLE_NOTIFICATIONS_CENTER, () => {
    if (center.isVisible) {
      center.hide();
    } else {
      toasts.hide();
      center.show();
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLEAR_NOTIFICATION,
    weight: KeybindingWeight.WorkbenchContrib,
    when: NotificationFocusedContext,
    primary: KeyCode.Delete,
    mac: {
      primary: KeyMod.CtrlCmd | KeyCode.Backspace
    },
    handler: /* @__PURE__ */ __name((accessor, args) => {
      const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
      const notification = getNotificationFromContext(accessor.get(IListService), args);
      if (notification && !notification.hasProgress) {
        notification.close();
        accessibilitySignalService.playSignal(AccessibilitySignal.clear);
      }
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: EXPAND_NOTIFICATION,
    weight: KeybindingWeight.WorkbenchContrib,
    when: NotificationFocusedContext,
    primary: KeyCode.RightArrow,
    handler: /* @__PURE__ */ __name((accessor, args) => {
      const notification = getNotificationFromContext(accessor.get(IListService), args);
      notification?.expand();
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: ACCEPT_PRIMARY_ACTION_NOTIFICATION,
    weight: KeybindingWeight.WorkbenchContrib,
    when: ContextKeyExpr.or(NotificationFocusedContext, NotificationsToastsVisibleContext),
    primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyA,
    handler: /* @__PURE__ */ __name((accessor) => {
      const actionRunner = accessor.get(IInstantiationService).createInstance(NotificationActionRunner);
      const notification = getNotificationFromContext(accessor.get(IListService)) || model.notifications.at(0);
      if (!notification) {
        return;
      }
      const primaryAction = notification.actions?.primary ? notification.actions.primary.at(0) : void 0;
      if (!primaryAction) {
        return;
      }
      actionRunner.run(primaryAction, notification);
      notification.close();
      actionRunner.dispose();
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: COLLAPSE_NOTIFICATION,
    weight: KeybindingWeight.WorkbenchContrib,
    when: NotificationFocusedContext,
    primary: KeyCode.LeftArrow,
    handler: /* @__PURE__ */ __name((accessor, args) => {
      const notification = getNotificationFromContext(accessor.get(IListService), args);
      notification?.collapse();
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: TOGGLE_NOTIFICATION,
    weight: KeybindingWeight.WorkbenchContrib,
    when: NotificationFocusedContext,
    primary: KeyCode.Space,
    secondary: [KeyCode.Enter],
    handler: /* @__PURE__ */ __name((accessor) => {
      const notification = getNotificationFromContext(accessor.get(IListService));
      notification?.toggle();
    }, "handler")
  });
  CommandsRegistry.registerCommand(HIDE_NOTIFICATION_TOAST, (accessor) => {
    toasts.hide();
  });
  KeybindingsRegistry.registerKeybindingRule({
    id: HIDE_NOTIFICATION_TOAST,
    weight: KeybindingWeight.WorkbenchContrib - 50,
    // lower when not focused (e.g. let editor suggest win over this command)
    when: NotificationsToastsVisibleContext,
    primary: KeyCode.Escape
  });
  KeybindingsRegistry.registerKeybindingRule({
    id: HIDE_NOTIFICATION_TOAST,
    weight: KeybindingWeight.WorkbenchContrib + 100,
    // higher when focused
    when: ContextKeyExpr.and(NotificationsToastsVisibleContext, NotificationFocusedContext),
    primary: KeyCode.Escape
  });
  CommandsRegistry.registerCommand(FOCUS_NOTIFICATION_TOAST, () => toasts.focus());
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: FOCUS_NEXT_NOTIFICATION_TOAST,
    weight: KeybindingWeight.WorkbenchContrib,
    when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
    primary: KeyCode.DownArrow,
    handler: /* @__PURE__ */ __name(() => {
      toasts.focusNext();
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: FOCUS_PREVIOUS_NOTIFICATION_TOAST,
    weight: KeybindingWeight.WorkbenchContrib,
    when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
    primary: KeyCode.UpArrow,
    handler: /* @__PURE__ */ __name(() => {
      toasts.focusPrevious();
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: FOCUS_FIRST_NOTIFICATION_TOAST,
    weight: KeybindingWeight.WorkbenchContrib,
    when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
    primary: KeyCode.PageUp,
    secondary: [KeyCode.Home],
    handler: /* @__PURE__ */ __name(() => {
      toasts.focusFirst();
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: FOCUS_LAST_NOTIFICATION_TOAST,
    weight: KeybindingWeight.WorkbenchContrib,
    when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
    primary: KeyCode.PageDown,
    secondary: [KeyCode.End],
    handler: /* @__PURE__ */ __name(() => {
      toasts.focusLast();
    }, "handler")
  });
  CommandsRegistry.registerCommand(CLEAR_ALL_NOTIFICATIONS, () => center.clearAll());
  CommandsRegistry.registerCommand(TOGGLE_DO_NOT_DISTURB_MODE, (accessor) => {
    const notificationService = accessor.get(INotificationService);
    notificationService.setFilter(notificationService.getFilter() === NotificationsFilter.ERROR ? NotificationsFilter.OFF : NotificationsFilter.ERROR);
  });
  CommandsRegistry.registerCommand(TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE, (accessor) => {
    const notificationService = accessor.get(INotificationService);
    const quickInputService = accessor.get(IQuickInputService);
    const sortedFilters = notificationService.getFilters().sort((a, b) => a.label.localeCompare(b.label));
    const disposables = new DisposableStore();
    const picker = disposables.add(quickInputService.createQuickPick());
    picker.items = sortedFilters.map((source) => ({
      id: source.id,
      label: source.label,
      tooltip: `${source.label} (${source.id})`,
      filter: source.filter
    }));
    picker.canSelectMany = true;
    picker.placeholder = localize("selectSources", "Select sources to enable all notifications from");
    picker.selectedItems = picker.items.filter((item) => item.filter === NotificationsFilter.OFF);
    picker.show();
    disposables.add(picker.onDidAccept(async () => {
      for (const item of picker.items) {
        notificationService.setFilter({
          id: item.id,
          label: item.label,
          filter: picker.selectedItems.includes(item) ? NotificationsFilter.OFF : NotificationsFilter.ERROR
        });
      }
      picker.hide();
    }));
    disposables.add(picker.onDidHide(() => disposables.dispose()));
  });
  const category = localize2("notifications", "Notifications");
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: SHOW_NOTIFICATIONS_CENTER, title: localize2("showNotifications", "Show Notifications"), category } });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: HIDE_NOTIFICATIONS_CENTER, title: localize2("hideNotifications", "Hide Notifications"), category }, when: NotificationsCenterVisibleContext });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: CLEAR_ALL_NOTIFICATIONS, title: localize2("clearAllNotifications", "Clear All Notifications"), category } });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: ACCEPT_PRIMARY_ACTION_NOTIFICATION, title: localize2("acceptNotificationPrimaryAction", "Accept Notification Primary Action"), category } });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: TOGGLE_DO_NOT_DISTURB_MODE, title: localize2("toggleDoNotDisturbMode", "Toggle Do Not Disturb Mode"), category } });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE, title: localize2("toggleDoNotDisturbModeBySource", "Toggle Do Not Disturb Mode By Source..."), category } });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: FOCUS_NOTIFICATION_TOAST, title: localize2("focusNotificationToasts", "Focus Notification Toast"), category }, when: NotificationsToastsVisibleContext });
}
__name(registerNotificationCommands, "registerNotificationCommands");
let NotificationActionRunner = class extends ActionRunner {
  constructor(telemetryService, notificationService) {
    super();
    this.telemetryService = telemetryService;
    this.notificationService = notificationService;
  }
  static {
    __name(this, "NotificationActionRunner");
  }
  async runAction(action, context) {
    this.telemetryService.publicLog2("workbenchActionExecuted", { id: action.id, from: "message" });
    try {
      await super.runAction(action, context);
    } catch (error) {
      this.notificationService.error(error);
    }
  }
};
NotificationActionRunner = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, INotificationService)
], NotificationActionRunner);
export {
  ACCEPT_PRIMARY_ACTION_NOTIFICATION,
  CLEAR_ALL_NOTIFICATIONS,
  CLEAR_NOTIFICATION,
  COLLAPSE_NOTIFICATION,
  EXPAND_NOTIFICATION,
  HIDE_NOTIFICATIONS_CENTER,
  HIDE_NOTIFICATION_TOAST,
  NotificationActionRunner,
  SHOW_NOTIFICATIONS_CENTER,
  TOGGLE_DO_NOT_DISTURB_MODE,
  TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE,
  getNotificationFromContext,
  registerNotificationCommands
};
//# sourceMappingURL=notificationsCommands.js.map
