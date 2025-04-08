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
import { localize } from "../../../../nls.js";
import { INotificationService, INotification, INotificationHandle, Severity, NotificationMessage, INotificationActions, IPromptChoice, IPromptOptions, IStatusMessageOptions, NoOpNotification, NeverShowAgainScope, NotificationsFilter, INeverShowAgainOptions, INotificationSource, INotificationSourceFilter, isNotificationSource } from "../../../../platform/notification/common/notification.js";
import { NotificationsModel, ChoiceAction, NotificationChangeType } from "../../../common/notifications.js";
import { Disposable, DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IAction, Action } from "../../../../base/common/actions.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
let NotificationService = class extends Disposable {
  constructor(storageService) {
    super();
    this.storageService = storageService;
    this.globalFilterEnabled = this.storageService.getBoolean(NotificationService.GLOBAL_FILTER_SETTINGS_KEY, StorageScope.APPLICATION, false);
    this.updateFilters();
    this.registerListeners();
  }
  static {
    __name(this, "NotificationService");
  }
  model = this._register(new NotificationsModel());
  _onDidAddNotification = this._register(new Emitter());
  onDidAddNotification = this._onDidAddNotification.event;
  _onDidRemoveNotification = this._register(new Emitter());
  onDidRemoveNotification = this._onDidRemoveNotification.event;
  registerListeners() {
    this._register(this.model.onDidChangeNotification((e) => {
      switch (e.kind) {
        case NotificationChangeType.ADD:
        case NotificationChangeType.REMOVE: {
          const source = typeof e.item.sourceId === "string" && typeof e.item.source === "string" ? { id: e.item.sourceId, label: e.item.source } : e.item.source;
          const notification = {
            message: e.item.message.original,
            severity: e.item.severity,
            source,
            priority: e.item.priority
          };
          if (e.kind === NotificationChangeType.ADD) {
            if (isNotificationSource(source)) {
              if (!this.mapSourceToFilter.has(source.id)) {
                this.setFilter({ ...source, filter: NotificationsFilter.OFF });
              } else {
                this.updateSourceFilter(source);
              }
            }
            this._onDidAddNotification.fire(notification);
          }
          if (e.kind === NotificationChangeType.REMOVE) {
            this._onDidRemoveNotification.fire(notification);
          }
          break;
        }
      }
    }));
  }
  //#region Filters
  static GLOBAL_FILTER_SETTINGS_KEY = "notifications.doNotDisturbMode";
  static PER_SOURCE_FILTER_SETTINGS_KEY = "notifications.perSourceDoNotDisturbMode";
  _onDidChangeFilter = this._register(new Emitter());
  onDidChangeFilter = this._onDidChangeFilter.event;
  globalFilterEnabled;
  mapSourceToFilter = (() => {
    const map = /* @__PURE__ */ new Map();
    for (const sourceFilter of this.storageService.getObject(NotificationService.PER_SOURCE_FILTER_SETTINGS_KEY, StorageScope.APPLICATION, [])) {
      map.set(sourceFilter.id, sourceFilter);
    }
    return map;
  })();
  setFilter(filter) {
    if (typeof filter === "number") {
      if (this.globalFilterEnabled === (filter === NotificationsFilter.ERROR)) {
        return;
      }
      this.globalFilterEnabled = filter === NotificationsFilter.ERROR;
      this.storageService.store(NotificationService.GLOBAL_FILTER_SETTINGS_KEY, this.globalFilterEnabled, StorageScope.APPLICATION, StorageTarget.MACHINE);
      this.updateFilters();
      this._onDidChangeFilter.fire();
    } else {
      const existing = this.mapSourceToFilter.get(filter.id);
      if (existing?.filter === filter.filter && existing.label === filter.label) {
        return;
      }
      this.mapSourceToFilter.set(filter.id, { id: filter.id, label: filter.label, filter: filter.filter });
      this.saveSourceFilters();
      this.updateFilters();
    }
  }
  getFilter(source) {
    if (source) {
      return this.mapSourceToFilter.get(source.id)?.filter ?? NotificationsFilter.OFF;
    }
    return this.globalFilterEnabled ? NotificationsFilter.ERROR : NotificationsFilter.OFF;
  }
  updateSourceFilter(source) {
    const existing = this.mapSourceToFilter.get(source.id);
    if (!existing) {
      return;
    }
    if (existing.label !== source.label) {
      this.mapSourceToFilter.set(source.id, { id: source.id, label: source.label, filter: existing.filter });
      this.saveSourceFilters();
    }
  }
  saveSourceFilters() {
    this.storageService.store(NotificationService.PER_SOURCE_FILTER_SETTINGS_KEY, JSON.stringify([...this.mapSourceToFilter.values()]), StorageScope.APPLICATION, StorageTarget.MACHINE);
  }
  getFilters() {
    return [...this.mapSourceToFilter.values()];
  }
  updateFilters() {
    this.model.setFilter({
      global: this.globalFilterEnabled ? NotificationsFilter.ERROR : NotificationsFilter.OFF,
      sources: new Map([...this.mapSourceToFilter.values()].map((source) => [source.id, source.filter]))
    });
  }
  removeFilter(sourceId) {
    if (this.mapSourceToFilter.delete(sourceId)) {
      this.saveSourceFilters();
      this.updateFilters();
    }
  }
  //#endregion
  info(message) {
    if (Array.isArray(message)) {
      for (const messageEntry of message) {
        this.info(messageEntry);
      }
      return;
    }
    this.model.addNotification({ severity: Severity.Info, message });
  }
  warn(message) {
    if (Array.isArray(message)) {
      for (const messageEntry of message) {
        this.warn(messageEntry);
      }
      return;
    }
    this.model.addNotification({ severity: Severity.Warning, message });
  }
  error(message) {
    if (Array.isArray(message)) {
      for (const messageEntry of message) {
        this.error(messageEntry);
      }
      return;
    }
    this.model.addNotification({ severity: Severity.Error, message });
  }
  notify(notification) {
    const toDispose = new DisposableStore();
    if (notification.neverShowAgain) {
      const scope = this.toStorageScope(notification.neverShowAgain);
      const id = notification.neverShowAgain.id;
      if (this.storageService.getBoolean(id, scope)) {
        return new NoOpNotification();
      }
      const neverShowAgainAction = toDispose.add(new Action(
        "workbench.notification.neverShowAgain",
        localize("neverShowAgain", "Don't Show Again"),
        void 0,
        true,
        async () => {
          handle.close();
          this.storageService.store(id, true, scope, StorageTarget.USER);
        }
      ));
      const actions = {
        primary: notification.actions?.primary || [],
        secondary: notification.actions?.secondary || []
      };
      if (!notification.neverShowAgain.isSecondary) {
        actions.primary = [neverShowAgainAction, ...actions.primary];
      } else {
        actions.secondary = [...actions.secondary, neverShowAgainAction];
      }
      notification.actions = actions;
    }
    const handle = this.model.addNotification(notification);
    Event.once(handle.onDidClose)(() => toDispose.dispose());
    return handle;
  }
  toStorageScope(options) {
    switch (options.scope) {
      case NeverShowAgainScope.APPLICATION:
        return StorageScope.APPLICATION;
      case NeverShowAgainScope.PROFILE:
        return StorageScope.PROFILE;
      case NeverShowAgainScope.WORKSPACE:
        return StorageScope.WORKSPACE;
      default:
        return StorageScope.APPLICATION;
    }
  }
  prompt(severity, message, choices, options) {
    if (options?.neverShowAgain) {
      const scope = this.toStorageScope(options.neverShowAgain);
      const id = options.neverShowAgain.id;
      if (this.storageService.getBoolean(id, scope)) {
        return new NoOpNotification();
      }
      const neverShowAgainChoice = {
        label: localize("neverShowAgain", "Don't Show Again"),
        run: /* @__PURE__ */ __name(() => this.storageService.store(id, true, scope, StorageTarget.USER), "run"),
        isSecondary: options.neverShowAgain.isSecondary
      };
      if (!options.neverShowAgain.isSecondary) {
        choices = [neverShowAgainChoice, ...choices];
      } else {
        choices = [...choices, neverShowAgainChoice];
      }
    }
    let choiceClicked = false;
    const toDispose = new DisposableStore();
    const primaryActions = [];
    const secondaryActions = [];
    choices.forEach((choice, index) => {
      const action = new ChoiceAction(`workbench.dialog.choice.${index}`, choice);
      if (!choice.isSecondary) {
        primaryActions.push(action);
      } else {
        secondaryActions.push(action);
      }
      toDispose.add(action.onDidRun(() => {
        choiceClicked = true;
        if (!choice.keepOpen) {
          handle.close();
        }
      }));
      toDispose.add(action);
    });
    const actions = { primary: primaryActions, secondary: secondaryActions };
    const handle = this.notify({ severity, message, actions, sticky: options?.sticky, priority: options?.priority });
    Event.once(handle.onDidClose)(() => {
      toDispose.dispose();
      if (options && typeof options.onCancel === "function" && !choiceClicked) {
        options.onCancel();
      }
    });
    return handle;
  }
  status(message, options) {
    return this.model.showStatusMessage(message, options);
  }
};
NotificationService = __decorateClass([
  __decorateParam(0, IStorageService)
], NotificationService);
registerSingleton(INotificationService, NotificationService, InstantiationType.Delayed);
export {
  NotificationService
};
//# sourceMappingURL=notificationService.js.map
