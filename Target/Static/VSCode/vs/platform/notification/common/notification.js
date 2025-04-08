var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IAction } from "../../../base/common/actions.js";
import { Event } from "../../../base/common/event.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import BaseSeverity from "../../../base/common/severity.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const Severity = BaseSeverity;
const INotificationService = createDecorator("notificationService");
var NotificationPriority = /* @__PURE__ */ ((NotificationPriority2) => {
  NotificationPriority2[NotificationPriority2["DEFAULT"] = 0] = "DEFAULT";
  NotificationPriority2[NotificationPriority2["OPTIONAL"] = 1] = "OPTIONAL";
  NotificationPriority2[NotificationPriority2["SILENT"] = 2] = "SILENT";
  NotificationPriority2[NotificationPriority2["URGENT"] = 3] = "URGENT";
  return NotificationPriority2;
})(NotificationPriority || {});
var NeverShowAgainScope = /* @__PURE__ */ ((NeverShowAgainScope2) => {
  NeverShowAgainScope2[NeverShowAgainScope2["WORKSPACE"] = 0] = "WORKSPACE";
  NeverShowAgainScope2[NeverShowAgainScope2["PROFILE"] = 1] = "PROFILE";
  NeverShowAgainScope2[NeverShowAgainScope2["APPLICATION"] = 2] = "APPLICATION";
  return NeverShowAgainScope2;
})(NeverShowAgainScope || {});
function isNotificationSource(thing) {
  if (thing) {
    const candidate = thing;
    return typeof candidate.id === "string" && typeof candidate.label === "string";
  }
  return false;
}
__name(isNotificationSource, "isNotificationSource");
var NotificationsFilter = /* @__PURE__ */ ((NotificationsFilter2) => {
  NotificationsFilter2[NotificationsFilter2["OFF"] = 0] = "OFF";
  NotificationsFilter2[NotificationsFilter2["ERROR"] = 1] = "ERROR";
  return NotificationsFilter2;
})(NotificationsFilter || {});
class NoOpNotification {
  static {
    __name(this, "NoOpNotification");
  }
  progress = new NoOpProgress();
  onDidClose = Event.None;
  onDidChangeVisibility = Event.None;
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
