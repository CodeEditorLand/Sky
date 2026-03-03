var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise } from "../../../../../../base/common/async.js";
import { MutableDisposable, toDisposable } from "../../../../../../base/common/lifecycle.js";
function setupRecreatingStartMarker(xterm, startMarker, fire, store, log) {
  const markerListener = new MutableDisposable();
  const recreateStartMarker = /* @__PURE__ */ __name(() => {
    if (store.isDisposed) {
      return;
    }
    const marker = xterm.raw.registerMarker();
    startMarker.value = marker ?? void 0;
    fire(marker);
    if (!marker) {
      markerListener.clear();
      return;
    }
    markerListener.value = marker.onDispose(() => {
      log?.("Start marker was disposed, recreating");
      recreateStartMarker();
    });
  }, "recreateStartMarker");
  recreateStartMarker();
  store.add(toDisposable(() => {
    markerListener.dispose();
    startMarker.clear();
    fire(void 0);
  }));
  store.add(startMarker);
}
__name(setupRecreatingStartMarker, "setupRecreatingStartMarker");
function createAltBufferPromise(xterm, store, log) {
  const deferred = new DeferredPromise();
  const complete = /* @__PURE__ */ __name(() => {
    if (!deferred.isSettled) {
      log?.("Detected alternate buffer entry");
      deferred.complete();
    }
  }, "complete");
  if (xterm.raw.buffer.active === xterm.raw.buffer.alternate) {
    complete();
  } else {
    store.add(xterm.raw.buffer.onBufferChange(() => {
      if (xterm.raw.buffer.active === xterm.raw.buffer.alternate) {
        complete();
      }
    }));
  }
  return deferred.p;
}
__name(createAltBufferPromise, "createAltBufferPromise");
export {
  createAltBufferPromise,
  setupRecreatingStartMarker
};
//# sourceMappingURL=strategyHelpers.js.map
