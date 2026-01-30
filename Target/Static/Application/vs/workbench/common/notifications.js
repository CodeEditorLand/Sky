var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { NoOpNotification, Severity, NotificationsFilter, NotificationPriority, isNotificationSource } from "../../platform/notification/common/notification.js";
import { toErrorMessage, isErrorWithActions } from "../../base/common/errorMessage.js";
import { Event, Emitter } from "../../base/common/event.js";
import { Disposable } from "../../base/common/lifecycle.js";
import { isCancellationError } from "../../base/common/errors.js";
import { Action } from "../../base/common/actions.js";
import { equals } from "../../base/common/arrays.js";
import { parseLinkedText } from "../../base/common/linkedText.js";
import { mapsStrictEqualIgnoreOrder } from "../../base/common/map.js";
var NotificationChangeType;
(function(NotificationChangeType2) {
  NotificationChangeType2[NotificationChangeType2["ADD"] = 0] = "ADD";
  NotificationChangeType2[NotificationChangeType2["CHANGE"] = 1] = "CHANGE";
  NotificationChangeType2[NotificationChangeType2["EXPAND_COLLAPSE"] = 2] = "EXPAND_COLLAPSE";
  NotificationChangeType2[NotificationChangeType2["REMOVE"] = 3] = "REMOVE";
})(NotificationChangeType || (NotificationChangeType = {}));
var StatusMessageChangeType;
(function(StatusMessageChangeType2) {
  StatusMessageChangeType2[StatusMessageChangeType2["ADD"] = 0] = "ADD";
  StatusMessageChangeType2[StatusMessageChangeType2["REMOVE"] = 1] = "REMOVE";
})(StatusMessageChangeType || (StatusMessageChangeType = {}));
class NotificationHandle extends Disposable {
  static {
    __name(this, "NotificationHandle");
  }
  constructor(item, onClose) {
    super();
    this.item = item;
    this.onClose = onClose;
    this._onDidClose = this._register(new Emitter());
    this.onDidClose = this._onDidClose.event;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.item.onDidChangeVisibility((visible) => this._onDidChangeVisibility.fire(visible)));
    Event.once(this.item.onDidClose)(() => {
      this._onDidClose.fire();
      this.dispose();
    });
  }
  get progress() {
    return this.item.progress;
  }
  updateSeverity(severity) {
    this.item.updateSeverity(severity);
  }
  updateMessage(message) {
    this.item.updateMessage(message);
  }
  updateActions(actions) {
    this.item.updateActions(actions);
  }
  close() {
    this.onClose(this.item);
    this.dispose();
  }
}
class NotificationsModel extends Disposable {
  static {
    __name(this, "NotificationsModel");
  }
  constructor() {
    super(...arguments);
    this._onDidChangeNotification = this._register(new Emitter());
    this.onDidChangeNotification = this._onDidChangeNotification.event;
    this._onDidChangeStatusMessage = this._register(new Emitter());
    this.onDidChangeStatusMessage = this._onDidChangeStatusMessage.event;
    this._onDidChangeFilter = this._register(new Emitter());
    this.onDidChangeFilter = this._onDidChangeFilter.event;
    this._notifications = [];
    this.filter = {
      global: NotificationsFilter.OFF,
      sources: /* @__PURE__ */ new Map()
    };
  }
  static {
    this.NO_OP_NOTIFICATION = new NoOpNotification();
  }
  get notifications() {
    return this._notifications;
  }
  get statusMessage() {
    return this._statusMessage;
  }
  setFilter(filter) {
    let globalChanged = false;
    if (typeof filter.global === "number") {
      globalChanged = this.filter.global !== filter.global;
      this.filter.global = filter.global;
    }
    let sourcesChanged = false;
    if (filter.sources) {
      sourcesChanged = !mapsStrictEqualIgnoreOrder(this.filter.sources, filter.sources);
      this.filter.sources = filter.sources;
    }
    if (globalChanged || sourcesChanged) {
      this._onDidChangeFilter.fire({
        global: globalChanged ? filter.global : void 0,
        sources: sourcesChanged ? filter.sources : void 0
      });
    }
  }
  addNotification(notification) {
    const item = this.createViewItem(notification);
    if (!item) {
      return NotificationsModel.NO_OP_NOTIFICATION;
    }
    const duplicate = this.findNotification(item);
    duplicate?.close();
    this._notifications.splice(0, 0, item);
    this._onDidChangeNotification.fire({
      item,
      index: 0,
      kind: 0
      /* NotificationChangeType.ADD */
    });
    return new NotificationHandle(item, (item2) => this.onClose(item2));
  }
  onClose(item) {
    const liveItem = this.findNotification(item);
    if (liveItem && liveItem !== item) {
      liveItem.close();
    } else {
      item.close();
    }
  }
  findNotification(item) {
    return this._notifications.find((notification) => notification.equals(item));
  }
  createViewItem(notification) {
    const item = NotificationViewItem.create(notification, this.filter);
    if (!item) {
      return void 0;
    }
    const fireNotificationChangeEvent = /* @__PURE__ */ __name((kind, detail) => {
      const index = this._notifications.indexOf(item);
      if (index >= 0) {
        this._onDidChangeNotification.fire({ item, index, kind, detail });
      }
    }, "fireNotificationChangeEvent");
    const itemExpansionChangeListener = item.onDidChangeExpansion(() => fireNotificationChangeEvent(
      2
      /* NotificationChangeType.EXPAND_COLLAPSE */
    ));
    const itemContentChangeListener = item.onDidChangeContent((e) => fireNotificationChangeEvent(1, e.kind));
    Event.once(item.onDidClose)(() => {
      itemExpansionChangeListener.dispose();
      itemContentChangeListener.dispose();
      const index = this._notifications.indexOf(item);
      if (index >= 0) {
        this._notifications.splice(index, 1);
        this._onDidChangeNotification.fire({
          item,
          index,
          kind: 3
          /* NotificationChangeType.REMOVE */
        });
      }
    });
    return item;
  }
  showStatusMessage(message, options) {
    const item = StatusMessageViewItem.create(message, options);
    if (!item) {
      return { close: /* @__PURE__ */ __name(() => {
      }, "close") };
    }
    this._statusMessage = item;
    this._onDidChangeStatusMessage.fire({ kind: 0, item });
    return {
      close: /* @__PURE__ */ __name(() => {
        if (this._statusMessage === item) {
          this._statusMessage = void 0;
          this._onDidChangeStatusMessage.fire({ kind: 1, item });
        }
      }, "close")
    };
  }
}
function isNotificationViewItem(obj) {
  return obj instanceof NotificationViewItem;
}
__name(isNotificationViewItem, "isNotificationViewItem");
var NotificationViewItemContentChangeKind;
(function(NotificationViewItemContentChangeKind2) {
  NotificationViewItemContentChangeKind2[NotificationViewItemContentChangeKind2["SEVERITY"] = 0] = "SEVERITY";
  NotificationViewItemContentChangeKind2[NotificationViewItemContentChangeKind2["MESSAGE"] = 1] = "MESSAGE";
  NotificationViewItemContentChangeKind2[NotificationViewItemContentChangeKind2["ACTIONS"] = 2] = "ACTIONS";
  NotificationViewItemContentChangeKind2[NotificationViewItemContentChangeKind2["PROGRESS"] = 3] = "PROGRESS";
})(NotificationViewItemContentChangeKind || (NotificationViewItemContentChangeKind = {}));
class NotificationViewItemProgress extends Disposable {
  static {
    __name(this, "NotificationViewItemProgress");
  }
  constructor() {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._state = /* @__PURE__ */ Object.create(null);
  }
  get state() {
    return this._state;
  }
  infinite() {
    if (this._state.infinite) {
      return;
    }
    this._state.infinite = true;
    this._state.total = void 0;
    this._state.worked = void 0;
    this._state.done = void 0;
    this._onDidChange.fire();
  }
  done() {
    if (this._state.done) {
      return;
    }
    this._state.done = true;
    this._state.infinite = void 0;
    this._state.total = void 0;
    this._state.worked = void 0;
    this._onDidChange.fire();
  }
  total(value) {
    if (this._state.total === value) {
      return;
    }
    this._state.total = value;
    this._state.infinite = void 0;
    this._state.done = void 0;
    this._onDidChange.fire();
  }
  worked(value) {
    if (typeof this._state.worked === "number") {
      this._state.worked += value;
    } else {
      this._state.worked = value;
    }
    this._state.infinite = void 0;
    this._state.done = void 0;
    this._onDidChange.fire();
  }
}
class NotificationViewItem extends Disposable {
  static {
    __name(this, "NotificationViewItem");
  }
  static {
    this.MAX_MESSAGE_LENGTH = 1e3;
  }
  static create(notification, filter) {
    if (!notification?.message || isCancellationError(notification.message)) {
      return void 0;
    }
    let severity;
    if (typeof notification.severity === "number") {
      severity = notification.severity;
    } else {
      severity = Severity.Info;
    }
    const message = NotificationViewItem.parseNotificationMessage(notification.message);
    if (!message) {
      return void 0;
    }
    let actions;
    if (notification.actions) {
      actions = notification.actions;
    } else if (isErrorWithActions(notification.message)) {
      actions = { primary: notification.message.actions };
    }
    let priority = notification.priority ?? NotificationPriority.DEFAULT;
    if ((priority === NotificationPriority.DEFAULT || priority === NotificationPriority.OPTIONAL) && severity !== Severity.Error) {
      if (filter.global === NotificationsFilter.ERROR) {
        priority = NotificationPriority.SILENT;
      } else if (isNotificationSource(notification.source) && filter.sources.get(notification.source.id) === NotificationsFilter.ERROR) {
        priority = NotificationPriority.SILENT;
      }
    }
    return new NotificationViewItem(notification.id, severity, notification.sticky, priority, message, notification.source, notification.progress, actions);
  }
  static parseNotificationMessage(input) {
    let message;
    if (input instanceof Error) {
      message = toErrorMessage(input, false);
    } else if (typeof input === "string") {
      message = input;
    }
    if (!message) {
      return void 0;
    }
    const raw = message;
    if (message.length > NotificationViewItem.MAX_MESSAGE_LENGTH) {
      message = `${message.substr(0, NotificationViewItem.MAX_MESSAGE_LENGTH)}...`;
    }
    message = message.replace(/(\r\n|\n|\r)/gm, " ").trim();
    const linkedText = parseLinkedText(message);
    return { raw, linkedText, original: input };
  }
  constructor(id, _severity, _sticky, _priority, _message, _source, progress, actions) {
    super();
    this.id = id;
    this._severity = _severity;
    this._sticky = _sticky;
    this._priority = _priority;
    this._message = _message;
    this._source = _source;
    this._visible = false;
    this._onDidChangeExpansion = this._register(new Emitter());
    this.onDidChangeExpansion = this._onDidChangeExpansion.event;
    this._onDidClose = this._register(new Emitter());
    this.onDidClose = this._onDidClose.event;
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    if (progress) {
      this.setProgress(progress);
    }
    this.setActions(actions);
  }
  setProgress(progress) {
    if (progress.infinite) {
      this.progress.infinite();
    } else if (progress.total) {
      this.progress.total(progress.total);
      if (progress.worked) {
        this.progress.worked(progress.worked);
      }
    }
  }
  setActions(actions = { primary: [], secondary: [] }) {
    this._actions = {
      primary: Array.isArray(actions.primary) ? actions.primary : [],
      secondary: Array.isArray(actions.secondary) ? actions.secondary : []
    };
    this._expanded = actions.primary && actions.primary.length > 0;
  }
  get canCollapse() {
    return !this.hasActions;
  }
  get expanded() {
    return !!this._expanded;
  }
  get severity() {
    return this._severity;
  }
  get sticky() {
    if (this._sticky) {
      return true;
    }
    const hasActions = this.hasActions;
    if (hasActions && this._severity === Severity.Error || // notification errors with actions are sticky
    !hasActions && this._expanded || // notifications that got expanded are sticky
    this._progress && !this._progress.state.done) {
      return true;
    }
    return false;
  }
  get priority() {
    return this._priority;
  }
  get hasActions() {
    if (!this._actions) {
      return false;
    }
    if (!this._actions.primary) {
      return false;
    }
    return this._actions.primary.length > 0;
  }
  get hasProgress() {
    return !!this._progress;
  }
  get progress() {
    if (!this._progress) {
      this._progress = this._register(new NotificationViewItemProgress());
      this._register(this._progress.onDidChange(() => this._onDidChangeContent.fire({
        kind: 3
        /* NotificationViewItemContentChangeKind.PROGRESS */
      })));
    }
    return this._progress;
  }
  get message() {
    return this._message;
  }
  get source() {
    return typeof this._source === "string" ? this._source : this._source ? this._source.label : void 0;
  }
  get sourceId() {
    return this._source && typeof this._source !== "string" && "id" in this._source ? this._source.id : void 0;
  }
  get actions() {
    return this._actions;
  }
  get visible() {
    return this._visible;
  }
  updateSeverity(severity) {
    if (severity === this._severity) {
      return;
    }
    this._severity = severity;
    this._onDidChangeContent.fire({
      kind: 0
      /* NotificationViewItemContentChangeKind.SEVERITY */
    });
  }
  updateMessage(input) {
    const message = NotificationViewItem.parseNotificationMessage(input);
    if (!message || message.raw === this._message.raw) {
      return;
    }
    this._message = message;
    this._onDidChangeContent.fire({
      kind: 1
      /* NotificationViewItemContentChangeKind.MESSAGE */
    });
  }
  updateActions(actions) {
    this.setActions(actions);
    this._onDidChangeContent.fire({
      kind: 2
      /* NotificationViewItemContentChangeKind.ACTIONS */
    });
  }
  updateVisibility(visible) {
    if (this._visible !== visible) {
      this._visible = visible;
      this._onDidChangeVisibility.fire(visible);
    }
  }
  expand() {
    if (this._expanded || !this.canCollapse) {
      return;
    }
    this._expanded = true;
    this._onDidChangeExpansion.fire();
  }
  collapse(skipEvents) {
    if (!this._expanded || !this.canCollapse) {
      return;
    }
    this._expanded = false;
    if (!skipEvents) {
      this._onDidChangeExpansion.fire();
    }
  }
  toggle() {
    if (this._expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  close() {
    this._onDidClose.fire();
    this.dispose();
  }
  equals(other) {
    if (this.hasProgress || other.hasProgress) {
      return false;
    }
    if (typeof this.id === "string" || typeof other.id === "string") {
      return this.id === other.id;
    }
    if (typeof this._source === "object") {
      if (this._source.label !== other.source || this._source.id !== other.sourceId) {
        return false;
      }
    } else if (this._source !== other.source) {
      return false;
    }
    if (this._message.raw !== other.message.raw) {
      return false;
    }
    const primaryActions = this._actions?.primary || [];
    const otherPrimaryActions = other.actions?.primary || [];
    return equals(primaryActions, otherPrimaryActions, (action, otherAction) => action.id + action.label === otherAction.id + otherAction.label);
  }
}
class ChoiceAction extends Action {
  static {
    __name(this, "ChoiceAction");
  }
  constructor(id, choice) {
    super(id, choice.label, void 0, true, async () => {
      choice.run();
      this._onDidRun.fire();
    });
    this._onDidRun = this._register(new Emitter());
    this.onDidRun = this._onDidRun.event;
    this._keepOpen = !!choice.keepOpen;
    this._menu = !choice.isSecondary && choice.menu ? choice.menu.map((c, index) => new ChoiceAction(`${id}.${index}`, c)) : void 0;
  }
  get menu() {
    return this._menu;
  }
  get keepOpen() {
    return this._keepOpen;
  }
}
class StatusMessageViewItem {
  static {
    __name(this, "StatusMessageViewItem");
  }
  static create(notification, options) {
    if (!notification || isCancellationError(notification)) {
      return void 0;
    }
    let message;
    if (notification instanceof Error) {
      message = toErrorMessage(notification, false);
    } else if (typeof notification === "string") {
      message = notification;
    }
    if (!message) {
      return void 0;
    }
    return { message, options };
  }
}
export {
  ChoiceAction,
  NotificationChangeType,
  NotificationHandle,
  NotificationViewItem,
  NotificationViewItemContentChangeKind,
  NotificationViewItemProgress,
  NotificationsModel,
  StatusMessageChangeType,
  isNotificationViewItem
};
//# sourceMappingURL=notifications.js.map
