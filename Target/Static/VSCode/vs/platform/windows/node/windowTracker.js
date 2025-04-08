var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancelablePromise, createCancelablePromise } from "../../../base/common/async.js";
import { Event } from "../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
class ActiveWindowManager extends Disposable {
  static {
    __name(this, "ActiveWindowManager");
  }
  disposables = this._register(new DisposableStore());
  firstActiveWindowIdPromise;
  activeWindowId;
  constructor({ onDidOpenMainWindow, onDidFocusMainWindow, getActiveWindowId }) {
    super();
    const onActiveWindowChange = Event.latch(Event.any(onDidOpenMainWindow, onDidFocusMainWindow));
    onActiveWindowChange(this.setActiveWindow, this, this.disposables);
    this.firstActiveWindowIdPromise = createCancelablePromise(() => getActiveWindowId());
    (async () => {
      try {
        const windowId = await this.firstActiveWindowIdPromise;
        this.activeWindowId = typeof this.activeWindowId === "number" ? this.activeWindowId : windowId;
      } catch (error) {
      } finally {
        this.firstActiveWindowIdPromise = void 0;
      }
    })();
  }
  setActiveWindow(windowId) {
    if (this.firstActiveWindowIdPromise) {
      this.firstActiveWindowIdPromise.cancel();
      this.firstActiveWindowIdPromise = void 0;
    }
    this.activeWindowId = windowId;
  }
  async getActiveClientId() {
    const id = this.firstActiveWindowIdPromise ? await this.firstActiveWindowIdPromise : this.activeWindowId;
    return `window:${id}`;
  }
}
export {
  ActiveWindowManager
};
//# sourceMappingURL=windowTracker.js.map
