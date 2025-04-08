var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken, CancellationTokenSource } from "./cancellation.js";
import { IDisposable } from "./lifecycle.js";
class Cache {
  constructor(task) {
    this.task = task;
  }
  static {
    __name(this, "Cache");
  }
  result = null;
  get() {
    if (this.result) {
      return this.result;
    }
    const cts = new CancellationTokenSource();
    const promise = this.task(cts.token);
    this.result = {
      promise,
      dispose: /* @__PURE__ */ __name(() => {
        this.result = null;
        cts.cancel();
        cts.dispose();
      }, "dispose")
    };
    return this.result;
  }
}
function identity(t) {
  return t;
}
__name(identity, "identity");
class LRUCachedFunction {
  static {
    __name(this, "LRUCachedFunction");
  }
  lastCache = void 0;
  lastArgKey = void 0;
  _fn;
  _computeKey;
  constructor(arg1, arg2) {
    if (typeof arg1 === "function") {
      this._fn = arg1;
      this._computeKey = identity;
    } else {
      this._fn = arg2;
      this._computeKey = arg1.getCacheKey;
    }
  }
  get(arg) {
    const key = this._computeKey(arg);
    if (this.lastArgKey !== key) {
      this.lastArgKey = key;
      this.lastCache = this._fn(arg);
    }
    return this.lastCache;
  }
}
class CachedFunction {
  static {
    __name(this, "CachedFunction");
  }
  _map = /* @__PURE__ */ new Map();
  _map2 = /* @__PURE__ */ new Map();
  get cachedValues() {
    return this._map;
  }
  _fn;
  _computeKey;
  constructor(arg1, arg2) {
    if (typeof arg1 === "function") {
      this._fn = arg1;
      this._computeKey = identity;
    } else {
      this._fn = arg2;
      this._computeKey = arg1.getCacheKey;
    }
  }
  get(arg) {
    const key = this._computeKey(arg);
    if (this._map2.has(key)) {
      return this._map2.get(key);
    }
    const value = this._fn(arg);
    this._map.set(arg, value);
    this._map2.set(key, value);
    return value;
  }
}
export {
  Cache,
  CachedFunction,
  LRUCachedFunction,
  identity
};
//# sourceMappingURL=cache.js.map
