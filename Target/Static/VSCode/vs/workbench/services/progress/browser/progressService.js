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
import "./media/progressService.css";
import { localize } from "../../../../nls.js";
import { IDisposable, dispose, DisposableStore, Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { IProgressService, IProgressOptions, IProgressStep, ProgressLocation, IProgress, Progress, IProgressCompositeOptions, IProgressNotificationOptions, IProgressRunner, IProgressIndicator, IProgressWindowOptions, IProgressDialogOptions } from "../../../../platform/progress/common/progress.js";
import { StatusbarAlignment, IStatusbarService, IStatusbarEntryAccessor, IStatusbarEntry } from "../../statusbar/browser/statusbar.js";
import { DeferredPromise, RunOnceScheduler, timeout } from "../../../../base/common/async.js";
import { ProgressBadge, IActivityService } from "../../activity/common/activity.js";
import { INotificationService, Severity, INotificationHandle, NotificationPriority, isNotificationSource, NotificationsFilter } from "../../../../platform/notification/common/notification.js";
import { Action } from "../../../../base/common/actions.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { Dialog } from "../../../../base/browser/ui/dialog/dialog.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { parseLinkedText } from "../../../../base/common/linkedText.js";
import { IViewDescriptorService, ViewContainerLocation } from "../../../common/views.js";
import { IViewsService } from "../../views/common/viewsService.js";
import { IPaneCompositePartService } from "../../panecomposite/browser/panecomposite.js";
import { stripIcons } from "../../../../base/common/iconLabels.js";
import { IUserActivityService } from "../../userActivity/common/userActivityService.js";
import { createWorkbenchDialogOptions } from "../../../../platform/dialogs/browser/dialog.js";
let ProgressService = class extends Disposable {
  constructor(activityService, paneCompositeService, viewDescriptorService, viewsService, notificationService, statusbarService, layoutService, keybindingService, userActivityService) {
    super();
    this.activityService = activityService;
    this.paneCompositeService = paneCompositeService;
    this.viewDescriptorService = viewDescriptorService;
    this.viewsService = viewsService;
    this.notificationService = notificationService;
    this.statusbarService = statusbarService;
    this.layoutService = layoutService;
    this.keybindingService = keybindingService;
    this.userActivityService = userActivityService;
  }
  static {
    __name(this, "ProgressService");
  }
  async withProgress(options, originalTask, onDidCancel) {
    const { location } = options;
    const task = /* @__PURE__ */ __name(async (progress) => {
      const activeLock = this.userActivityService.markActive({ whenHeldFor: 15e3 });
      try {
        return await originalTask(progress);
      } finally {
        activeLock.dispose();
      }
    }, "task");
    const handleStringLocation = /* @__PURE__ */ __name((location2) => {
      const viewContainer = this.viewDescriptorService.getViewContainerById(location2);
      if (viewContainer) {
        const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
        if (viewContainerLocation !== null) {
          return this.withPaneCompositeProgress(location2, viewContainerLocation, task, { ...options, location: location2 });
        }
      }
      if (this.viewDescriptorService.getViewDescriptorById(location2) !== null) {
        return this.withViewProgress(location2, task, { ...options, location: location2 });
      }
      throw new Error(`Bad progress location: ${location2}`);
    }, "handleStringLocation");
    if (typeof location === "string") {
      return handleStringLocation(location);
    }
    switch (location) {
      case ProgressLocation.Notification: {
        let priority = options.priority;
        if (priority !== NotificationPriority.URGENT) {
          if (this.notificationService.getFilter() === NotificationsFilter.ERROR) {
            priority = NotificationPriority.SILENT;
          } else if (isNotificationSource(options.source) && this.notificationService.getFilter(options.source) === NotificationsFilter.ERROR) {
            priority = NotificationPriority.SILENT;
          }
        }
        return this.withNotificationProgress({ ...options, location, priority }, task, onDidCancel);
      }
      case ProgressLocation.Window: {
        const type = options.type;
        if (options.command) {
          return this.withWindowProgress({ ...options, location, type }, task);
        }
        return this.withNotificationProgress({ delay: 150, ...options, priority: NotificationPriority.SILENT, location: ProgressLocation.Notification, type }, task, onDidCancel);
      }
      case ProgressLocation.Explorer:
        return this.withPaneCompositeProgress("workbench.view.explorer", ViewContainerLocation.Sidebar, task, { ...options, location });
      case ProgressLocation.Scm:
        return handleStringLocation("workbench.scm");
      case ProgressLocation.Extensions:
        return this.withPaneCompositeProgress("workbench.view.extensions", ViewContainerLocation.Sidebar, task, { ...options, location });
      case ProgressLocation.Dialog:
        return this.withDialogProgress(options, task, onDidCancel);
      default:
        throw new Error(`Bad progress location: ${location}`);
    }
  }
  windowProgressStack = [];
  windowProgressStatusEntry = void 0;
  withWindowProgress(options, callback) {
    const task = [options, new Progress(() => this.updateWindowProgress())];
    const promise = callback(task[1]);
    let delayHandle = setTimeout(() => {
      delayHandle = void 0;
      this.windowProgressStack.unshift(task);
      this.updateWindowProgress();
      Promise.all([
        timeout(150),
        promise
      ]).finally(() => {
        const idx = this.windowProgressStack.indexOf(task);
        this.windowProgressStack.splice(idx, 1);
        this.updateWindowProgress();
      });
    }, 150);
    return promise.finally(() => clearTimeout(delayHandle));
  }
  updateWindowProgress(idx = 0) {
    if (idx < this.windowProgressStack.length) {
      const [options, progress] = this.windowProgressStack[idx];
      const progressTitle = options.title;
      const progressMessage = progress.value && progress.value.message;
      const progressCommand = options.command;
      let text;
      let title;
      const source = options.source && typeof options.source !== "string" ? options.source.label : options.source;
      if (progressTitle && progressMessage) {
        text = localize("progress.text2", "{0}: {1}", progressTitle, progressMessage);
        title = source ? localize("progress.title3", "[{0}] {1}: {2}", source, progressTitle, progressMessage) : text;
      } else if (progressTitle) {
        text = progressTitle;
        title = source ? localize("progress.title2", "[{0}]: {1}", source, progressTitle) : text;
      } else if (progressMessage) {
        text = progressMessage;
        title = source ? localize("progress.title2", "[{0}]: {1}", source, progressMessage) : text;
      } else {
        this.updateWindowProgress(idx + 1);
        return;
      }
      const statusEntryProperties = {
        name: localize("status.progress", "Progress Message"),
        text,
        showProgress: options.type || true,
        ariaLabel: text,
        tooltip: stripIcons(title).trim(),
        command: progressCommand
      };
      if (this.windowProgressStatusEntry) {
        this.windowProgressStatusEntry.update(statusEntryProperties);
      } else {
        this.windowProgressStatusEntry = this.statusbarService.addEntry(
          statusEntryProperties,
          "status.progress",
          StatusbarAlignment.LEFT,
          -Number.MAX_VALUE
          /* almost last entry */
        );
      }
    } else {
      this.windowProgressStatusEntry?.dispose();
      this.windowProgressStatusEntry = void 0;
    }
  }
  withNotificationProgress(options, callback, onDidCancel) {
    const progressStateModel = new class extends Disposable {
      _onDidReport = this._register(new Emitter());
      onDidReport = this._onDidReport.event;
      _onWillDispose = this._register(new Emitter());
      onWillDispose = this._onWillDispose.event;
      _step = void 0;
      get step() {
        return this._step;
      }
      _done = false;
      get done() {
        return this._done;
      }
      promise;
      constructor() {
        super();
        this.promise = callback(this);
        this.promise.finally(() => {
          this.dispose();
        });
      }
      report(step) {
        this._step = step;
        this._onDidReport.fire(step);
      }
      cancel(choice) {
        onDidCancel?.(choice);
        this.dispose();
      }
      dispose() {
        this._done = true;
        this._onWillDispose.fire();
        super.dispose();
      }
    }();
    const createWindowProgress = /* @__PURE__ */ __name(() => {
      const promise = new DeferredPromise();
      this.withWindowProgress({
        location: ProgressLocation.Window,
        title: options.title ? parseLinkedText(options.title).toString() : void 0,
        // convert markdown links => string
        command: "notifications.showList",
        type: options.type
      }, (progress) => {
        function reportProgress(step) {
          if (step.message) {
            progress.report({
              message: parseLinkedText(step.message).toString()
              // convert markdown links => string
            });
          }
        }
        __name(reportProgress, "reportProgress");
        if (progressStateModel.step) {
          reportProgress(progressStateModel.step);
        }
        const onDidReportListener = progressStateModel.onDidReport((step) => reportProgress(step));
        promise.p.finally(() => onDidReportListener.dispose());
        Event.once(progressStateModel.onWillDispose)(() => promise.complete());
        return promise.p;
      });
      return toDisposable(() => promise.complete());
    }, "createWindowProgress");
    const createNotification = /* @__PURE__ */ __name((message, priority, increment) => {
      const notificationDisposables = new DisposableStore();
      const primaryActions = options.primaryActions ? Array.from(options.primaryActions) : [];
      const secondaryActions = options.secondaryActions ? Array.from(options.secondaryActions) : [];
      if (options.buttons) {
        options.buttons.forEach((button, index) => {
          const buttonAction = new class extends Action {
            constructor() {
              super(`progress.button.${button}`, button, void 0, true);
            }
            async run() {
              progressStateModel.cancel(index);
            }
          }();
          notificationDisposables.add(buttonAction);
          primaryActions.push(buttonAction);
        });
      }
      if (options.cancellable) {
        const cancelAction = new class extends Action {
          constructor() {
            super("progress.cancel", typeof options.cancellable === "string" ? options.cancellable : localize("cancel", "Cancel"), void 0, true);
          }
          async run() {
            progressStateModel.cancel();
          }
        }();
        notificationDisposables.add(cancelAction);
        primaryActions.push(cancelAction);
      }
      const notification = this.notificationService.notify({
        severity: Severity.Info,
        message: stripIcons(message),
        // status entries support codicons, but notifications do not (https://github.com/microsoft/vscode/issues/145722)
        source: options.source,
        actions: { primary: primaryActions, secondary: secondaryActions },
        progress: typeof increment === "number" && increment >= 0 ? { total: 100, worked: increment } : { infinite: true },
        priority
      });
      let windowProgressDisposable = void 0;
      const onVisibilityChange = /* @__PURE__ */ __name((visible) => {
        dispose(windowProgressDisposable);
        if (!visible && !progressStateModel.done) {
          windowProgressDisposable = createWindowProgress();
        }
      }, "onVisibilityChange");
      notificationDisposables.add(notification.onDidChangeVisibility(onVisibilityChange));
      if (priority === NotificationPriority.SILENT) {
        onVisibilityChange(false);
      }
      Event.once(notification.onDidClose)(() => {
        notificationDisposables.dispose();
        dispose(windowProgressDisposable);
      });
      return notification;
    }, "createNotification");
    const updateProgress = /* @__PURE__ */ __name((notification, increment) => {
      if (typeof increment === "number" && increment >= 0) {
        notification.progress.total(100);
        notification.progress.worked(increment);
      } else {
        notification.progress.infinite();
      }
    }, "updateProgress");
    let notificationHandle;
    let notificationTimeout;
    let titleAndMessage;
    const updateNotification = /* @__PURE__ */ __name((step) => {
      if (step?.message && options.title) {
        titleAndMessage = `${options.title}: ${step.message}`;
      } else {
        titleAndMessage = options.title || step?.message;
      }
      if (!notificationHandle && titleAndMessage) {
        if (typeof options.delay === "number" && options.delay > 0) {
          if (typeof notificationTimeout !== "number") {
            notificationTimeout = setTimeout(() => notificationHandle = createNotification(titleAndMessage, options.priority, step?.increment), options.delay);
          }
        } else {
          notificationHandle = createNotification(titleAndMessage, options.priority, step?.increment);
        }
      }
      if (notificationHandle) {
        if (titleAndMessage) {
          notificationHandle.updateMessage(titleAndMessage);
        }
        if (typeof step?.increment === "number") {
          updateProgress(notificationHandle, step.increment);
        }
      }
    }, "updateNotification");
    updateNotification(progressStateModel.step);
    const listener = progressStateModel.onDidReport((step) => updateNotification(step));
    Event.once(progressStateModel.onWillDispose)(() => listener.dispose());
    (async () => {
      try {
        if (typeof options.delay === "number" && options.delay > 0) {
          await progressStateModel.promise;
        } else {
          await Promise.all([timeout(800), progressStateModel.promise]);
        }
      } finally {
        clearTimeout(notificationTimeout);
        notificationHandle?.close();
      }
    })();
    return progressStateModel.promise;
  }
  withPaneCompositeProgress(paneCompositeId, viewContainerLocation, task, options) {
    const progressIndicator = this.paneCompositeService.getProgressIndicator(paneCompositeId, viewContainerLocation);
    const promise = progressIndicator ? this.withCompositeProgress(progressIndicator, task, options) : task({ report: /* @__PURE__ */ __name(() => {
    }, "report") });
    if (viewContainerLocation === ViewContainerLocation.Sidebar) {
      this.showOnActivityBar(paneCompositeId, options, promise);
    }
    return promise;
  }
  withViewProgress(viewId, task, options) {
    const progressIndicator = this.viewsService.getViewProgressIndicator(viewId);
    const promise = progressIndicator ? this.withCompositeProgress(progressIndicator, task, options) : task({ report: /* @__PURE__ */ __name(() => {
    }, "report") });
    const viewletId = this.viewDescriptorService.getViewContainerByViewId(viewId)?.id;
    if (viewletId === void 0) {
      return promise;
    }
    this.showOnActivityBar(viewletId, options, promise);
    return promise;
  }
  showOnActivityBar(viewletId, options, promise) {
    let activityProgress;
    let delayHandle = setTimeout(() => {
      delayHandle = void 0;
      const handle = this.activityService.showViewContainerActivity(viewletId, { badge: new ProgressBadge(() => "") });
      const startTimeVisible = Date.now();
      const minTimeVisible = 300;
      activityProgress = {
        dispose() {
          const d = Date.now() - startTimeVisible;
          if (d < minTimeVisible) {
            setTimeout(() => handle.dispose(), minTimeVisible - d);
          } else {
            handle.dispose();
          }
        }
      };
    }, options.delay || 300);
    promise.finally(() => {
      clearTimeout(delayHandle);
      dispose(activityProgress);
    });
  }
  withCompositeProgress(progressIndicator, task, options) {
    let discreteProgressRunner = void 0;
    function updateProgress(stepOrTotal) {
      let total = void 0;
      let increment = void 0;
      if (typeof stepOrTotal !== "undefined") {
        if (typeof stepOrTotal === "number") {
          total = stepOrTotal;
        } else if (typeof stepOrTotal.increment === "number") {
          total = stepOrTotal.total ?? 100;
          increment = stepOrTotal.increment;
        }
      }
      if (typeof total === "number") {
        if (!discreteProgressRunner) {
          discreteProgressRunner = progressIndicator.show(total, options.delay);
          promise.catch(
            () => void 0
            /* ignore */
          ).finally(() => discreteProgressRunner?.done());
        }
        if (typeof increment === "number") {
          discreteProgressRunner.worked(increment);
        }
      } else {
        discreteProgressRunner?.done();
        progressIndicator.showWhile(promise, options.delay);
      }
      return discreteProgressRunner;
    }
    __name(updateProgress, "updateProgress");
    const promise = task({
      report: /* @__PURE__ */ __name((progress) => {
        updateProgress(progress);
      }, "report")
    });
    updateProgress(options.total);
    return promise;
  }
  withDialogProgress(options, task, onDidCancel) {
    const disposables = new DisposableStore();
    let dialog;
    let taskCompleted = false;
    const createDialog = /* @__PURE__ */ __name((message) => {
      const buttons = options.buttons || [];
      if (!options.sticky) {
        buttons.push(
          options.cancellable ? typeof options.cancellable === "boolean" ? localize("cancel", "Cancel") : options.cancellable : localize("dismiss", "Dismiss")
        );
      }
      dialog = new Dialog(
        this.layoutService.activeContainer,
        message,
        buttons,
        createWorkbenchDialogOptions({
          type: "pending",
          detail: options.detail,
          cancelId: buttons.length - 1,
          disableCloseAction: options.sticky,
          disableDefaultAction: options.sticky
        }, this.keybindingService, this.layoutService)
      );
      disposables.add(dialog);
      dialog.show().then((dialogResult) => {
        if (!taskCompleted) {
          onDidCancel?.(dialogResult.button);
        }
        dispose(dialog);
      });
      return dialog;
    }, "createDialog");
    let delay = options.delay ?? 0;
    let latestMessage = void 0;
    const scheduler = disposables.add(new RunOnceScheduler(() => {
      delay = 0;
      if (latestMessage && !dialog) {
        dialog = createDialog(latestMessage);
      } else if (latestMessage) {
        dialog.updateMessage(latestMessage);
      }
    }, 0));
    const updateDialog = /* @__PURE__ */ __name(function(message) {
      latestMessage = message;
      if (!scheduler.isScheduled()) {
        scheduler.schedule(delay);
      }
    }, "updateDialog");
    const promise = task({
      report: /* @__PURE__ */ __name((progress) => {
        updateDialog(progress.message);
      }, "report")
    });
    promise.finally(() => {
      taskCompleted = true;
      dispose(disposables);
    });
    if (options.title) {
      updateDialog(options.title);
    }
    return promise;
  }
};
ProgressService = __decorateClass([
  __decorateParam(0, IActivityService),
  __decorateParam(1, IPaneCompositePartService),
  __decorateParam(2, IViewDescriptorService),
  __decorateParam(3, IViewsService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IStatusbarService),
  __decorateParam(6, ILayoutService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, IUserActivityService)
], ProgressService);
registerSingleton(IProgressService, ProgressService, InstantiationType.Delayed);
export {
  ProgressService
};
//# sourceMappingURL=progressService.js.map
