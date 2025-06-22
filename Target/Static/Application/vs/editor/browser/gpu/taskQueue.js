var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getActiveWindow } from "../../../base/browser/dom.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
class TaskQueue extends Disposable {
  static {
    __name(this, "TaskQueue");
  }
  constructor() {
    super();
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
          console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(lastDeadlineRemaining - taskDuration))}ms`);
        }
        this._start();
        return;
      }
      lastDeadlineRemaining = deadlineRemaining;
    }
    this.clear();
  }
}
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
class DebouncedIdleTask {
  static {
    __name(this, "DebouncedIdleTask");
  }
  constructor() {
    this._queue = new IdleTaskQueue();
  }
  set(task) {
    this._queue.clear();
    this._queue.enqueue(task);
  }
  flush() {
    this._queue.flush();
  }
}
export {
  DebouncedIdleTask,
  IdleTaskQueue,
  PriorityTaskQueue
};
//# sourceMappingURL=taskQueue.js.map
