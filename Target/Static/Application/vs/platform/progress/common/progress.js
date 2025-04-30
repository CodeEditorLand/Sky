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
import { DeferredPromise } from "../../../base/common/async.js";
import { CancellationTokenSource } from "../../../base/common/cancellation.js";
import { Disposable, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IProgressService = createDecorator("progressService");
var ProgressLocation;
(function(ProgressLocation2) {
  ProgressLocation2[ProgressLocation2["Explorer"] = 1] = "Explorer";
  ProgressLocation2[ProgressLocation2["Scm"] = 3] = "Scm";
  ProgressLocation2[ProgressLocation2["Extensions"] = 5] = "Extensions";
  ProgressLocation2[ProgressLocation2["Window"] = 10] = "Window";
  ProgressLocation2[ProgressLocation2["Notification"] = 15] = "Notification";
  ProgressLocation2[ProgressLocation2["Dialog"] = 20] = "Dialog";
})(ProgressLocation || (ProgressLocation = {}));
const emptyProgressRunner = Object.freeze({
  total() {
  },
  worked() {
  },
  done() {
  }
});
class Progress {
  static {
    __name(this, "Progress");
  }
  static {
    this.None = Object.freeze({ report() {
    } });
  }
  get value() {
    return this._value;
  }
  constructor(callback) {
    this.callback = callback;
  }
  report(item) {
    this._value = item;
    this.callback(this._value);
  }
}
class AsyncProgress {
  static {
    __name(this, "AsyncProgress");
  }
  get value() {
    return this._value;
  }
  constructor(callback) {
    this.callback = callback;
  }
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
let UnmanagedProgress = class UnmanagedProgress2 extends Disposable {
  static {
    __name(this, "UnmanagedProgress");
  }
  constructor(options, progressService) {
    super();
    this.deferred = new DeferredPromise();
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
UnmanagedProgress = __decorate([
  __param(1, IProgressService)
], UnmanagedProgress);
class LongRunningOperation extends Disposable {
  static {
    __name(this, "LongRunningOperation");
  }
  constructor(progressIndicator) {
    super();
    this.progressIndicator = progressIndicator;
    this.currentOperationId = 0;
    this.currentOperationDisposables = this._register(new DisposableStore());
  }
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
