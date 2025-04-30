var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import BaseSeverity from "../../../base/common/severity.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
var Severity = BaseSeverity;
const INotificationService = createDecorator("notificationService");
var NotificationPriority;
(function(NotificationPriority2) {
  NotificationPriority2[NotificationPriority2["DEFAULT"] = 0] = "DEFAULT";
  NotificationPriority2[NotificationPriority2["OPTIONAL"] = 1] = "OPTIONAL";
  NotificationPriority2[NotificationPriority2["SILENT"] = 2] = "SILENT";
  NotificationPriority2[NotificationPriority2["URGENT"] = 3] = "URGENT";
})(NotificationPriority || (NotificationPriority = {}));
var NeverShowAgainScope;
(function(NeverShowAgainScope2) {
  NeverShowAgainScope2[NeverShowAgainScope2["WORKSPACE"] = 0] = "WORKSPACE";
  NeverShowAgainScope2[NeverShowAgainScope2["PROFILE"] = 1] = "PROFILE";
  NeverShowAgainScope2[NeverShowAgainScope2["APPLICATION"] = 2] = "APPLICATION";
})(NeverShowAgainScope || (NeverShowAgainScope = {}));
function isNotificationSource(thing) {
  if (thing) {
    const candidate = thing;
    return typeof candidate.id === "string" && typeof candidate.label === "string";
  }
  return false;
}
__name(isNotificationSource, "isNotificationSource");
var NotificationsFilter;
(function(NotificationsFilter2) {
  NotificationsFilter2[NotificationsFilter2["OFF"] = 0] = "OFF";
  NotificationsFilter2[NotificationsFilter2["ERROR"] = 1] = "ERROR";
})(NotificationsFilter || (NotificationsFilter = {}));
class NoOpNotification {
  static {
    __name(this, "NoOpNotification");
  }
  constructor() {
    this.progress = new NoOpProgress();
    this.onDidClose = Event.None;
    this.onDidChangeVisibility = Event.None;
  }
  updateSeverity(severity) {
  }
  updateMessage(message) {
  }
  updateActions(actions) {
  }
  close() {
  }
}
class NoOpProgress {
  static {
    __name(this, "NoOpProgress");
  }
  infinite() {
  }
  done() {
  }
  total(value) {
  }
  worked(value) {
  }
}
export {
  INotificationService,
  NeverShowAgainScope,
  NoOpNotification,
  NoOpProgress,
  NotificationPriority,
  NotificationsFilter,
  Severity,
  isNotificationSource
};
//# sourceMappingURL=notification.js.map
