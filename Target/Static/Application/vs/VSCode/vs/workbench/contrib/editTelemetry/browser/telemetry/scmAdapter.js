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
import { WeakCachedFunction } from "../../../../../base/common/cache.js";
import { Event } from "../../../../../base/common/event.js";
import { observableSignalFromEvent, derived } from "../../../../../base/common/observable.js";
import { ISCMService } from "../../../scm/common/scm.js";
let ScmAdapter = class ScmAdapter2 {
  static {
    __name(this, "ScmAdapter");
  }
  constructor(_scmService) {
    this._scmService = _scmService;
    this._repos = new WeakCachedFunction((repo) => new ScmRepoAdapter(repo));
    this._reposChangedSignal = observableSignalFromEvent(this, Event.any(this._scmService.onDidAddRepository, this._scmService.onDidRemoveRepository));
  }
  getRepo(uri, reader) {
    this._reposChangedSignal.read(reader);
    const repo = this._scmService.getRepository(uri);
    if (!repo) {
      return void 0;
    }
    return this._repos.get(repo);
  }
};
ScmAdapter = __decorate([
  __param(0, ISCMService)
], ScmAdapter);
class ScmRepoAdapter {
  static {
    __name(this, "ScmRepoAdapter");
  }
  constructor(_repo) {
    this._repo = _repo;
    this.headBranchNameObs = derived((reader) => this._repo.provider.historyProvider.read(reader)?.historyItemRef.read(reader)?.name);
    this.headCommitHashObs = derived((reader) => this._repo.provider.historyProvider.read(reader)?.historyItemRef.read(reader)?.revision);
  }
  async isIgnored(uri) {
    return false;
  }
}
export {
  ScmAdapter,
  ScmRepoAdapter
};
//# sourceMappingURL=scmAdapter.js.map
