var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "./event.js";
import { DisposableStore, IDisposable } from "./lifecycle.js";
const shortcutEvent = Object.freeze(function(callback, context) {
  const handle = setTimeout(callback.bind(context), 0);
  return { dispose() {
    clearTimeout(handle);
  } };
});
var CancellationToken;
((CancellationToken2) => {
  function isCancellationToken(thing) {
    if (thing === CancellationToken2.None || thing === CancellationToken2.Cancelled) {
      return true;
    }
    if (thing instanceof MutableToken) {
      return true;
    }
    if (!thing || typeof thing !== "object") {
      return false;
    }
    return typeof thing.isCancellationRequested === "boolean" && typeof thing.onCancellationRequested === "function";
  }
  CancellationToken2.isCancellationToken = isCancellationToken;
  __name(isCancellationToken, "isCancellationToken");
  CancellationToken2.None = Object.freeze({
    isCancellationRequested: false,
    onCancellationRequested: Event.None
  });
  CancellationToken2.Cancelled = Object.freeze({
    isCancellationRequested: true,
    onCancellationRequested: shortcutEvent
  });
})(CancellationToken || (CancellationToken = {}));
class MutableToken {
  static {
    __name(this, "MutableToken");
  }
  _isCancelled = false;
  _emitter = null;
  cancel() {
    if (!this._isCancelled) {
      this._isCancelled = true;
      if (this._emitter) {
        this._emitter.fire(void 0);
        this.dispose();
      }
    }
  }
  get isCancellationRequested() {
    return this._isCancelled;
  }
  get onCancellationRequested() {
    if (this._isCancelled) {
      return shortcutEvent;
    }
    if (!this._emitter) {
      this._emitter = new Emitter();
    }
    return this._emitter.event;
  }
  dispose() {
    if (this._emitter) {
      this._emitter.dispose();
      this._emitter = null;
    }
  }
}
class CancellationTokenSource {
  static {
    __name(this, "CancellationTokenSource");
  }
  _token = void 0;
  _parentListener = void 0;
  constructor(parent) {
    this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
  }
  get token() {
    if (!this._token) {
      this._token = new MutableToken();
    }
    return this._token;
  }
  cancel() {
    if (!this._token) {
      this._token = CancellationToken.Cancelled;
    } else if (this._token instanceof MutableToken) {
      this._token.cancel();
    }
  }
  dispose(cancel = false) {
    if (cancel) {
      this.cancel();
    }
    this._parentListener?.dispose();
    if (!this._token) {
      this._token = CancellationToken.None;
    } else if (this._token instanceof MutableToken) {
      this._token.dispose();
    }
  }
}
function cancelOnDispose(store) {
  const source = new CancellationTokenSource();
  store.add({ dispose() {
    source.cancel();
  } });
  return source.token;
}
__name(cancelOnDispose, "cancelOnDispose");
export {
  CancellationToken,
  CancellationTokenSource,
  cancelOnDispose
};
//# sourceMappingURL=cancellation.js.map
