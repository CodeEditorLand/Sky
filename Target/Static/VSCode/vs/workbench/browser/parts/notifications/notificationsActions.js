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
import "./media/notificationsActions.css";
import { INotificationViewItem } from "../../../common/notifications.js";
import { localize } from "../../../../nls.js";
import { Action } from "../../../../base/common/actions.js";
import { CLEAR_NOTIFICATION, EXPAND_NOTIFICATION, COLLAPSE_NOTIFICATION, CLEAR_ALL_NOTIFICATIONS, HIDE_NOTIFICATIONS_CENTER, TOGGLE_DO_NOT_DISTURB_MODE, TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE } from "./notificationsCommands.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
const clearIcon = registerIcon("notifications-clear", Codicon.close, localize("clearIcon", "Icon for the clear action in notifications."));
const clearAllIcon = registerIcon("notifications-clear-all", Codicon.clearAll, localize("clearAllIcon", "Icon for the clear all action in notifications."));
const hideIcon = registerIcon("notifications-hide", Codicon.chevronDown, localize("hideIcon", "Icon for the hide action in notifications."));
const expandIcon = registerIcon("notifications-expand", Codicon.chevronUp, localize("expandIcon", "Icon for the expand action in notifications."));
const collapseIcon = registerIcon("notifications-collapse", Codicon.chevronDown, localize("collapseIcon", "Icon for the collapse action in notifications."));
const configureIcon = registerIcon("notifications-configure", Codicon.gear, localize("configureIcon", "Icon for the configure action in notifications."));
const doNotDisturbIcon = registerIcon("notifications-do-not-disturb", Codicon.bellSlash, localize("doNotDisturbIcon", "Icon for the mute all action in notifications."));
let ClearNotificationAction = class extends Action {
  constructor(id, label, commandService) {
    super(id, label, ThemeIcon.asClassName(clearIcon));
    this.commandService = commandService;
  }
  static {
    __name(this, "ClearNotificationAction");
  }
  static ID = CLEAR_NOTIFICATION;
  static LABEL = localize("clearNotification", "Clear Notification");
  async run(notification) {
    this.commandService.executeCommand(CLEAR_NOTIFICATION, notification);
  }
};
ClearNotificationAction = __decorateClass([
  __decorateParam(2, ICommandService)
], ClearNotificationAction);
let ClearAllNotificationsAction = class extends Action {
  constructor(id, label, commandService) {
    super(id, label, ThemeIcon.asClassName(clearAllIcon));
    this.commandService = commandService;
  }
  static {
    __name(this, "ClearAllNotificationsAction");
  }
  static ID = CLEAR_ALL_NOTIFICATIONS;
  static LABEL = localize("clearNotifications", "Clear All Notifications");
  async run() {
    this.commandService.executeCommand(CLEAR_ALL_NOTIFICATIONS);
  }
};
ClearAllNotificationsAction = __decorateClass([
  __decorateParam(2, ICommandService)
], ClearAllNotificationsAction);
let ToggleDoNotDisturbAction = class extends Action {
  constructor(id, label, commandService) {
    super(id, label, ThemeIcon.asClassName(doNotDisturbIcon));
    this.commandService = commandService;
  }
  static {
    __name(this, "ToggleDoNotDisturbAction");
  }
  static ID = TOGGLE_DO_NOT_DISTURB_MODE;
  static LABEL = localize("toggleDoNotDisturbMode", "Toggle Do Not Disturb Mode");
  async run() {
    this.commandService.executeCommand(TOGGLE_DO_NOT_DISTURB_MODE);
  }
};
ToggleDoNotDisturbAction = __decorateClass([
  __decorateParam(2, ICommandService)
], ToggleDoNotDisturbAction);
let ToggleDoNotDisturbBySourceAction = class extends Action {
  constructor(id, label, commandService) {
    super(id, label);
    this.commandService = commandService;
  }
  static {
    __name(this, "ToggleDoNotDisturbBySourceAction");
  }
  static ID = TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE;
  static LABEL = localize("toggleDoNotDisturbModeBySource", "Toggle Do Not Disturb Mode By Source...");
  async run() {
    this.commandService.executeCommand(TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE);
  }
};
ToggleDoNotDisturbBySourceAction = __decorateClass([
  __decorateParam(2, ICommandService)
], ToggleDoNotDisturbBySourceAction);
class ConfigureDoNotDisturbAction extends Action {
  static {
    __name(this, "ConfigureDoNotDisturbAction");
  }
  static ID = "workbench.action.configureDoNotDisturbMode";
  static LABEL = localize("configureDoNotDisturbMode", "Configure Do Not Disturb...");
  constructor(id, label) {
    super(id, label, ThemeIcon.asClassName(doNotDisturbIcon));
  }
}
let HideNotificationsCenterAction = class extends Action {
  constructor(id, label, commandService) {
    super(id, label, ThemeIcon.asClassName(hideIcon));
    this.commandService = commandService;
  }
  static {
    __name(this, "HideNotificationsCenterAction");
  }
  static ID = HIDE_NOTIFICATIONS_CENTER;
  static LABEL = localize("hideNotificationsCenter", "Hide Notifications");
  async run() {
    this.commandService.executeCommand(HIDE_NOTIFICATIONS_CENTER);
  }
};
HideNotificationsCenterAction = __decorateClass([
  __decorateParam(2, ICommandService)
], HideNotificationsCenterAction);
let ExpandNotificationAction = class extends Action {
  constructor(id, label, commandService) {
    super(id, label, ThemeIcon.asClassName(expandIcon));
    this.commandService = commandService;
  }
  static {
    __name(this, "ExpandNotificationAction");
  }
  static ID = EXPAND_NOTIFICATION;
  static LABEL = localize("expandNotification", "Expand Notification");
  async run(notification) {
    this.commandService.executeCommand(EXPAND_NOTIFICATION, notification);
  }
};
ExpandNotificationAction = __decorateClass([
  __decorateParam(2, ICommandService)
], ExpandNotificationAction);
let CollapseNotificationAction = class extends Action {
  constructor(id, label, commandService) {
    super(id, label, ThemeIcon.asClassName(collapseIcon));
    this.commandService = commandService;
  }
  static {
    __name(this, "CollapseNotificationAction");
  }
  static ID = COLLAPSE_NOTIFICATION;
  static LABEL = localize("collapseNotification", "Collapse Notification");
  async run(notification) {
    this.commandService.executeCommand(COLLAPSE_NOTIFICATION, notification);
  }
};
CollapseNotificationAction = __decorateClass([
  __decorateParam(2, ICommandService)
], CollapseNotificationAction);
class ConfigureNotificationAction extends Action {
  constructor(id, label, notification) {
    super(id, label, ThemeIcon.asClassName(configureIcon));
    this.notification = notification;
  }
  static {
    __name(this, "ConfigureNotificationAction");
  }
  static ID = "workbench.action.configureNotification";
  static LABEL = localize("configureNotification", "More Actions...");
}
let CopyNotificationMessageAction = class extends Action {
  constructor(id, label, clipboardService) {
    super(id, label);
    this.clipboardService = clipboardService;
  }
  static {
    __name(this, "CopyNotificationMessageAction");
  }
  static ID = "workbench.action.copyNotificationMessage";
  static LABEL = localize("copyNotification", "Copy Text");
  run(notification) {
    return this.clipboardService.writeText(notification.message.raw);
  }
};
CopyNotificationMessageAction = __decorateClass([
  __decorateParam(2, IClipboardService)
], CopyNotificationMessageAction);
export {
  ClearAllNotificationsAction,
  ClearNotificationAction,
  CollapseNotificationAction,
  ConfigureDoNotDisturbAction,
  ConfigureNotificationAction,
  CopyNotificationMessageAction,
  ExpandNotificationAction,
  HideNotificationsCenterAction,
  ToggleDoNotDisturbAction,
  ToggleDoNotDisturbBySourceAction
};
//# sourceMappingURL=notificationsActions.js.map
