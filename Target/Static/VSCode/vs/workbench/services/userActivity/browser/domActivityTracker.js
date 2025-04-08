var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../base/browser/dom.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { IUserActivityService } from "../common/userActivityService.js";
const CHECK_INTERVAL = 3e4;
const MIN_INTERVALS_WITHOUT_ACTIVITY = 2;
const eventListenerOptions = {
  passive: true,
  /** does not preventDefault() */
  capture: true
  /** should dispatch first (before anyone stopPropagation()) */
};
class DomActivityTracker extends Disposable {
  static {
    __name(this, "DomActivityTracker");
  }
  constructor(userActivityService) {
    super();
    let intervalsWithoutActivity = MIN_INTERVALS_WITHOUT_ACTIVITY;
    const intervalTimer = this._register(new dom.WindowIntervalTimer());
    const activeMutex = this._register(new MutableDisposable());
    activeMutex.value = userActivityService.markActive();
    const onInterval = /* @__PURE__ */ __name(() => {
      if (++intervalsWithoutActivity === MIN_INTERVALS_WITHOUT_ACTIVITY) {
        activeMutex.clear();
        intervalTimer.cancel();
      }
    }, "onInterval");
    const onActivity = /* @__PURE__ */ __name((targetWindow) => {
      if (intervalsWithoutActivity === MIN_INTERVALS_WITHOUT_ACTIVITY) {
        activeMutex.value = userActivityService.markActive();
        intervalTimer.cancelAndSet(onInterval, CHECK_INTERVAL, targetWindow);
      }
      intervalsWithoutActivity = 0;
    }, "onActivity");
    this._register(Event.runAndSubscribe(dom.onDidRegisterWindow, ({ window, disposables }) => {
      disposables.add(dom.addDisposableListener(window.document, "touchstart", () => onActivity(window), eventListenerOptions));
      disposables.add(dom.addDisposableListener(window.document, "mousedown", () => onActivity(window), eventListenerOptions));
      disposables.add(dom.addDisposableListener(window.document, "keydown", () => onActivity(window), eventListenerOptions));
    }, { window: mainWindow, disposables: this._store }));
    onActivity(mainWindow);
  }
}
export {
  DomActivityTracker
};
//# sourceMappingURL=domActivityTracker.js.map
