var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { defaultGenerator } from "../../../../base/common/idGenerator.js";
import { equals } from "../../../../base/common/objects.js";
var LoadingPhase;
(function(LoadingPhase2) {
  LoadingPhase2[LoadingPhase2["Created"] = 1] = "Created";
  LoadingPhase2[LoadingPhase2["Loading"] = 2] = "Loading";
  LoadingPhase2[LoadingPhase2["Loaded"] = 3] = "Loaded";
  LoadingPhase2[LoadingPhase2["Errored"] = 4] = "Errored";
  LoadingPhase2[LoadingPhase2["Disposed"] = 5] = "Disposed";
})(LoadingPhase || (LoadingPhase = {}));
class FileQueryCacheState {
  static {
    __name(this, "FileQueryCacheState");
  }
  get cacheKey() {
    if (this.loadingPhase === LoadingPhase.Loaded || !this.previousCacheState) {
      return this._cacheKey;
    }
    return this.previousCacheState.cacheKey;
  }
  get isLoaded() {
    const isLoaded = this.loadingPhase === LoadingPhase.Loaded;
    return isLoaded || !this.previousCacheState ? isLoaded : this.previousCacheState.isLoaded;
  }
  get isUpdating() {
    const isUpdating = this.loadingPhase === LoadingPhase.Loading;
    return isUpdating || !this.previousCacheState ? isUpdating : this.previousCacheState.isUpdating;
  }
  constructor(cacheQuery, loadFn, disposeFn, previousCacheState) {
    this.cacheQuery = cacheQuery;
    this.loadFn = loadFn;
    this.disposeFn = disposeFn;
    this.previousCacheState = previousCacheState;
    this._cacheKey = defaultGenerator.nextId();
    this.query = this.cacheQuery(this._cacheKey);
    this.loadingPhase = LoadingPhase.Created;
    if (this.previousCacheState) {
      const current = Object.assign({}, this.query, { cacheKey: null });
      const previous = Object.assign({}, this.previousCacheState.query, { cacheKey: null });
      if (!equals(current, previous)) {
        this.previousCacheState.dispose();
        this.previousCacheState = void 0;
      }
    }
  }
  load() {
    if (this.isUpdating) {
      return this;
    }
    this.loadingPhase = LoadingPhase.Loading;
    this.loadPromise = (async () => {
      try {
        await this.loadFn(this.query);
        this.loadingPhase = LoadingPhase.Loaded;
        if (this.previousCacheState) {
          this.previousCacheState.dispose();
          this.previousCacheState = void 0;
        }
      } catch (error) {
        this.loadingPhase = LoadingPhase.Errored;
        throw error;
      }
    })();
    return this;
  }
  dispose() {
    if (this.loadPromise) {
      (async () => {
        try {
          await this.loadPromise;
        } catch (error) {
        }
        this.loadingPhase = LoadingPhase.Disposed;
        this.disposeFn(this._cacheKey);
      })();
    } else {
      this.loadingPhase = LoadingPhase.Disposed;
    }
    if (this.previousCacheState) {
      this.previousCacheState.dispose();
      this.previousCacheState = void 0;
    }
  }
}
export {
  FileQueryCacheState
};
//# sourceMappingURL=cacheState.js.map
