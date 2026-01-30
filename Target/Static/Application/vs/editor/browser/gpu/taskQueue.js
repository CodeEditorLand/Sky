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
import { getActiveWindow } from "../../../base/browser/dom.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../platform/log/common/log.js";
let TaskQueue = class TaskQueue2 extends Disposable {
  static {
    __name(this, "TaskQueue");
  }
  constructor(_logService) {
    super();
    this._logService = _logService;
    this._tasks = [];
    this._i = 0;
    this._register(toDisposable(() => this.clear()));
  }
  enqueue(task) {
    this._tasks.push(task);
    this._start();
  }
  flush() {
    while (this._i < this._tasks.length) {
      if (!this._tasks[this._i]()) {
        this._i++;
      }
    }
    this.clear();
  }
  clear() {
    if (this._idleCallback) {
      this._cancelCallback(this._idleCallback);
      this._idleCallback = void 0;
    }
    this._i = 0;
    this._tasks.length = 0;
  }
  _start() {
    if (!this._idleCallback) {
      this._idleCallback = this._requestCallback(this._process.bind(this));
    }
  }
  _process(deadline) {
    this._idleCallback = void 0;
    let taskDuration = 0;
    let longestTask = 0;
    let lastDeadlineRemaining = deadline.timeRemaining();
    let deadlineRemaining = 0;
    while (this._i < this._tasks.length) {
      taskDuration = Date.now();
      if (!this._tasks[this._i]()) {
        this._i++;
      }
      taskDuration = Math.max(1, Date.now() - taskDuration);
      longestTask = Math.max(taskDuration, longestTask);
      deadlineRemaining = deadline.timeRemaining();
      if (longestTask * 1.5 > deadlineRemaining) {
        if (lastDeadlineRemaining - taskDuration < -20) {
          this._logService.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(lastDeadlineRemaining - taskDuration))}ms`);
        }
        this._start();
        return;
      }
      lastDeadlineRemaining = deadlineRemaining;
    }
    this.clear();
  }
};
TaskQueue = __decorate([
  __param(0, ILogService)
], TaskQueue);
class PriorityTaskQueue extends TaskQueue {
  static {
    __name(this, "PriorityTaskQueue");
  }
  _requestCallback(callback) {
    return getActiveWindow().setTimeout(() => callback(this._createDeadline(16)));
  }
  _cancelCallback(identifier) {
    getActiveWindow().clearTimeout(identifier);
  }
  _createDeadline(duration) {
    const end = Date.now() + duration;
    return {
      timeRemaining: /* @__PURE__ */ __name(() => Math.max(0, end - Date.now()), "timeRemaining")
    };
  }
}
class IdleTaskQueueInternal extends TaskQueue {
  static {
    __name(this, "IdleTaskQueueInternal");
  }
  _requestCallback(callback) {
    return getActiveWindow().requestIdleCallback(callback);
  }
  _cancelCallback(identifier) {
    getActiveWindow().cancelIdleCallback(identifier);
  }
}
const IdleTaskQueue = "requestIdleCallback" in getActiveWindow() ? IdleTaskQueueInternal : PriorityTaskQueue;
let DebouncedIdleTask = class DebouncedIdleTask2 {
  static {
    __name(this, "DebouncedIdleTask");
  }
  constructor(instantiationService) {
    this._queue = instantiationService.createInstance(IdleTaskQueue);
  }
  set(task) {
    this._queue.clear();
    this._queue.enqueue(task);
  }
  flush() {
    this._queue.flush();
  }
};
DebouncedIdleTask = __decorate([
  __param(0, IInstantiationService)
], DebouncedIdleTask);
export {
  DebouncedIdleTask,
  IdleTaskQueue,
  PriorityTaskQueue
};
//# sourceMappingURL=taskQueue.js.map
