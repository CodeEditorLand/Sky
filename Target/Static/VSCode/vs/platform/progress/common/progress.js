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
import { IAction } from "../../../base/common/actions.js";
import { DeferredPromise } from "../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { Disposable, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { INotificationSource, NotificationPriority } from "../../notification/common/notification.js";
const IProgressService = createDecorator("progressService");
var ProgressLocation = /* @__PURE__ */ ((ProgressLocation2) => {
  ProgressLocation2[ProgressLocation2["Explorer"] = 1] = "Explorer";
  ProgressLocation2[ProgressLocation2["Scm"] = 3] = "Scm";
  ProgressLocation2[ProgressLocation2["Extensions"] = 5] = "Extensions";
  ProgressLocation2[ProgressLocation2["Window"] = 10] = "Window";
  ProgressLocation2[ProgressLocation2["Notification"] = 15] = "Notification";
  ProgressLocation2[ProgressLocation2["Dialog"] = 20] = "Dialog";
  return ProgressLocation2;
})(ProgressLocation || {});
const emptyProgressRunner = Object.freeze({
  total() {
  },
  worked() {
  },
  done() {
  }
});
class Progress {
  constructor(callback) {
    this.callback = callback;
  }
  static {
    __name(this, "Progress");
  }
  static None = Object.freeze({ report() {
  } });
  _value;
  get value() {
    return this._value;
  }
  report(item) {
    this._value = item;
    this.callback(this._value);
  }
}
class AsyncProgress {
  constructor(callback) {
    this.callback = callback;
  }
  static {
    __name(this, "AsyncProgress");
  }
  _value;
  get value() {
    return this._value;
  }
  _asyncQueue;
  _processingAsyncQueue;
  _drainListener;
  report(item) {
    if (!this._asyncQueue) {
      this._asyncQueue = [item];
    } else {
      this._asyncQueue.push(item);
    }
    this._processAsyncQueue();
  }
  async _processAsyncQueue() {
    if (this._processingAsyncQueue) {
      return;
    }
    try {
      this._processingAsyncQueue = true;
      while (this._asyncQueue && this._asyncQueue.length) {
        const item = this._asyncQueue.shift();
        this._value = item;
        await this.callback(this._value);
      }
    } finally {
      this._processingAsyncQueue = false;
      const drainListener = this._drainListener;
      this._drainListener = void 0;
      drainListener?.();
    }
  }
  drain() {
    if (this._processingAsyncQueue) {
      return new Promise((resolve) => {
        const prevListener = this._drainListener;
        this._drainListener = () => {
          prevListener?.();
          resolve();
        };
      });
    }
    return Promise.resolve();
  }
}
let UnmanagedProgress = class extends Disposable {
  static {
    __name(this, "UnmanagedProgress");
  }
  deferred = new DeferredPromise();
  reporter;
  lastStep;
  constructor(options, progressService) {
    super();
    progressService.withProgress(options, (reporter) => {
      this.reporter = reporter;
      if (this.lastStep) {
        reporter.report(this.lastStep);
      }
      return this.deferred.p;
    });
    this._register(toDisposable(() => this.deferred.complete()));
  }
  report(step) {
    if (this.reporter) {
      this.reporter.report(step);
    } else {
      this.lastStep = step;
    }
  }
};
UnmanagedProgress = __decorateClass([
  __decorateParam(1, IProgressService)
], UnmanagedProgress);
class LongRunningOperation extends Disposable {
  constructor(progressIndicator) {
    super();
    this.progressIndicator = progressIndicator;
  }
  static {
    __name(this, "LongRunningOperation");
  }
  currentOperationId = 0;
  currentOperationDisposables = this._register(new DisposableStore());
  currentProgressRunner;
  currentProgressTimeout;
  start(progressDelay) {
    this.stop();
    const newOperationId = ++this.currentOperationId;
    const newOperationToken = new CancellationTokenSource();
    this.currentProgressTimeout = setTimeout(() => {
      if (newOperationId === this.currentOperationId) {
        this.currentProgressRunner = this.progressIndicator.show(true);
      }
    }, progressDelay);
    this.currentOperationDisposables.add(toDisposable(() => clearTimeout(this.currentProgressTimeout)));
    this.currentOperationDisposables.add(toDisposable(() => newOperationToken.cancel()));
    this.currentOperationDisposables.add(toDisposable(() => this.currentProgressRunner ? this.currentProgressRunner.done() : void 0));
    return {
      id: newOperationId,
      token: newOperationToken.token,
      stop: /* @__PURE__ */ __name(() => this.doStop(newOperationId), "stop"),
      isCurrent: /* @__PURE__ */ __name(() => this.currentOperationId === newOperationId, "isCurrent")
    };
  }
  stop() {
    this.doStop(this.currentOperationId);
  }
  doStop(operationId) {
    if (this.currentOperationId === operationId) {
      this.currentOperationDisposables.clear();
    }
  }
}
const IEditorProgressService = createDecorator("editorProgressService");
export {
  AsyncProgress,
  IEditorProgressService,
  IProgressService,
  LongRunningOperation,
  Progress,
  ProgressLocation,
  UnmanagedProgress,
  emptyProgressRunner
};
//# sourceMappingURL=progress.js.map
