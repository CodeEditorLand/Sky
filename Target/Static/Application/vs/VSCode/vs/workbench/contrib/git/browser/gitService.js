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
import { BugIndicatingError } from "../../../../base/common/errors.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { observableValueOpts } from "../../../../base/common/observable.js";
import { structuralEquals } from "../../../../base/common/equals.js";
import { AutoOpenBarrier } from "../../../../base/common/async.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let GitService = class GitService2 extends Disposable {
  static {
    __name(this, "GitService");
  }
  get repositories() {
    return this._delegate?.repositories ?? [];
  }
  constructor(logService) {
    super();
    this.logService = logService;
    this._delegateBarrier = new AutoOpenBarrier(1e4);
  }
  setDelegate(delegate) {
    if (this._delegate) {
      this.logService.error("[GitService][setDelegate] GitExtension delegate is already set.");
      throw new BugIndicatingError("GitExtension delegate is already set.");
    }
    this._delegate = delegate;
    this._delegateBarrier.open();
    return toDisposable(() => {
      this._delegate = void 0;
    });
  }
  async openRepository(uri) {
    await this._delegateBarrier.wait();
    if (!this._delegate) {
      this.logService.warn("[GitService][openRepository] GitExtension delegate is not set after 10 seconds. Cannot open repository.");
      return void 0;
    }
    return this._delegate.openRepository(uri);
  }
};
GitService = __decorate([
  __param(0, ILogService)
], GitService);
class GitRepository extends Disposable {
  static {
    __name(this, "GitRepository");
  }
  updateState(state) {
    this.state.set(state, void 0);
  }
  constructor(rootUri, initialState, delegate) {
    super();
    this.delegate = delegate;
    this.rootUri = rootUri;
    this.state = observableValueOpts({ owner: this, equalsFn: structuralEquals }, initialState);
  }
  async getRefs(query, token) {
    return this.delegate.getRefs(this.rootUri, query, token);
  }
  async diffBetweenWithStats(ref1, ref2, path) {
    return this.delegate.diffBetweenWithStats(this.rootUri, ref1, ref2, path);
  }
}
export {
  GitRepository,
  GitService
};
//# sourceMappingURL=gitService.js.map
