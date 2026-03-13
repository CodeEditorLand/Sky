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
var NotificationService_1;
import { localize } from "../../../../nls.js";
import { INotificationService, Severity, NoOpNotification, NeverShowAgainScope, NotificationsFilter, isNotificationSource } from "../../../../platform/notification/common/notification.js";
import { NotificationsModel, ChoiceAction } from "../../../common/notifications.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { Action } from "../../../../base/common/actions.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
let NotificationService = class NotificationService2 extends Disposable {
  static {
    __name(this, "NotificationService");
  }
  static {
    NotificationService_1 = this;
  }
  constructor(storageService) {
    super();
    this.storageService = storageService;
    this.model = this._register(new NotificationsModel());
    this._onDidChangeFilter = this._register(new Emitter());
    this.onDidChangeFilter = this._onDidChangeFilter.event;
    this.mapSourceToFilter = (() => {
      const map = /* @__PURE__ */ new Map();
      for (const sourceFilter of this.storageService.getObject(NotificationService_1.PER_SOURCE_FILTER_SETTINGS_KEY, -1, [])) {
        map.set(sourceFilter.id, sourceFilter);
      }
      return map;
    })();
    this.globalFilterEnabled = this.storageService.getBoolean(NotificationService_1.GLOBAL_FILTER_SETTINGS_KEY, -1, false);
    this.updateFilters();
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.model.onDidChangeNotification((e) => {
      switch (e.kind) {
        case 0: {
          const source = typeof e.item.sourceId === "string" && typeof e.item.source === "string" ? { id: e.item.sourceId, label: e.item.source } : e.item.source;
          if (isNotificationSource(source)) {
            if (!this.mapSourceToFilter.has(source.id)) {
              this.setFilter({ ...source, filter: NotificationsFilter.OFF });
            } else {
              this.updateSourceFilter(source);
            }
          }
          break;
        }
      }
    }));
  }
  static {
    this.GLOBAL_FILTER_SETTINGS_KEY = "notifications.doNotDisturbMode";
  }
  static {
    this.PER_SOURCE_FILTER_SETTINGS_KEY = "notifications.perSourceDoNotDisturbMode";
  }
  setFilter(filter) {
    if (typeof filter === "number") {
      if (this.globalFilterEnabled === (filter === NotificationsFilter.ERROR)) {
        return;
      }
      this.globalFilterEnabled = filter === NotificationsFilter.ERROR;
      this.storageService.store(
        NotificationService_1.GLOBAL_FILTER_SETTINGS_KEY,
        this.globalFilterEnabled,
        -1,
        1
        /* StorageTarget.MACHINE */
      );
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
    this.storageService.store(
      NotificationService_1.PER_SOURCE_FILTER_SETTINGS_KEY,
      JSON.stringify([...this.mapSourceToFilter.values()]),
      -1,
      1
      /* StorageTarget.MACHINE */
    );
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
      const neverShowAgainAction = toDispose.add(new Action("workbench.notification.neverShowAgain", localize("neverShowAgain", "Don't Show Again"), void 0, true, async () => {
        handle.close();
        this.storageService.store(
          id,
          true,
          scope,
          0
          /* StorageTarget.USER */
        );
      }));
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
        return -1;
      case NeverShowAgainScope.PROFILE:
        return 0;
      case NeverShowAgainScope.WORKSPACE:
        return 1;
      default:
        return -1;
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
        run: /* @__PURE__ */ __name(() => this.storageService.store(
          id,
          true,
          scope,
          0
          /* StorageTarget.USER */
        ), "run"),
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
NotificationService = NotificationService_1 = __decorate([
  __param(0, IStorageService)
], NotificationService);
registerSingleton(
  INotificationService,
  NotificationService,
  1
  /* InstantiationType.Delayed */
);
export {
  NotificationService
};
//# sourceMappingURL=notificationService.js.map
