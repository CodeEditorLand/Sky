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
import { Disposable, DisposableMap } from "../../../../base/common/lifecycle.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { GitHubApiClient } from "./githubApiClient.js";
import { GitHubRepositoryFetcher } from "./fetchers/githubRepositoryFetcher.js";
import { GitHubPRFetcher } from "./fetchers/githubPRFetcher.js";
import { GitHubPRCIFetcher } from "./fetchers/githubPRCIFetcher.js";
import { GitHubRepositoryModel } from "./models/githubRepositoryModel.js";
import { GitHubPullRequestModel } from "./models/githubPullRequestModel.js";
import { GitHubPullRequestCIModel } from "./models/githubPullRequestCIModel.js";
const IGitHubService = createDecorator("sessionsGitHubService");
const LOG_PREFIX = "[GitHubService]";
let GitHubService = class GitHubService2 extends Disposable {
  static {
    __name(this, "GitHubService");
  }
  constructor(instantiationService, _logService) {
    super();
    this._logService = _logService;
    this._repositories = this._register(new DisposableMap());
    this._pullRequests = this._register(new DisposableMap());
    this._ciModels = this._register(new DisposableMap());
    this._apiClient = this._register(instantiationService.createInstance(GitHubApiClient));
    this._repoFetcher = new GitHubRepositoryFetcher(this._apiClient);
    this._prFetcher = new GitHubPRFetcher(this._apiClient);
    this._ciFetcher = new GitHubPRCIFetcher(this._apiClient);
  }
  getRepository(owner, repo) {
    const key = `${owner}/${repo}`;
    let model = this._repositories.get(key);
    if (!model) {
      this._logService.trace(`${LOG_PREFIX} Creating repository model for ${key}`);
      model = new GitHubRepositoryModel(owner, repo, this._repoFetcher, this._logService);
      this._repositories.set(key, model);
    }
    return model;
  }
  getPullRequest(owner, repo, prNumber) {
    const key = `${owner}/${repo}/${prNumber}`;
    let model = this._pullRequests.get(key);
    if (!model) {
      this._logService.trace(`${LOG_PREFIX} Creating PR model for ${key}`);
      model = new GitHubPullRequestModel(owner, repo, prNumber, this._prFetcher, this._logService);
      this._pullRequests.set(key, model);
    }
    return model;
  }
  getPullRequestCI(owner, repo, headRef) {
    const key = `${owner}/${repo}/${headRef}`;
    let model = this._ciModels.get(key);
    if (!model) {
      this._logService.trace(`${LOG_PREFIX} Creating CI model for ${key}`);
      model = new GitHubPullRequestCIModel(owner, repo, headRef, this._ciFetcher, this._logService);
      this._ciModels.set(key, model);
    }
    return model;
  }
};
GitHubService = __decorate([
  __param(0, IInstantiationService),
  __param(1, ILogService)
], GitHubService);
export {
  GitHubService,
  IGitHubService
};
//# sourceMappingURL=githubService.js.map
