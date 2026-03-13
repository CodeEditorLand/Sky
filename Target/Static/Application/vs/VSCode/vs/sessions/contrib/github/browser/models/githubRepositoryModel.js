var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
const LOG_PREFIX = "[GitHubRepositoryModel]";
class GitHubRepositoryModel extends Disposable {
  static {
    __name(this, "GitHubRepositoryModel");
  }
  constructor(owner, repo, _fetcher, _logService) {
    super();
    this.owner = owner;
    this.repo = repo;
    this._fetcher = _fetcher;
    this._logService = _logService;
    this._repository = observableValue(this, void 0);
    this.repository = this._repository;
  }
  async refresh() {
    try {
      const data = await this._fetcher.getRepository(this.owner, this.repo);
      this._repository.set(data, void 0);
    } catch (err) {
      this._logService.error(`${LOG_PREFIX} Failed to refresh repository ${this.owner}/${this.repo}:`, err);
    }
  }
}
export {
  GitHubRepositoryModel
};
//# sourceMappingURL=githubRepositoryModel.js.map
