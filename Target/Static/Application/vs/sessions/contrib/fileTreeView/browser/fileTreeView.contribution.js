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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { GitHubFileSystemProvider, GITHUB_REMOTE_FILE_SCHEME } from "./githubFileSystemProvider.js";
let GitHubFileSystemProviderContribution = class GitHubFileSystemProviderContribution2 extends Disposable {
  static {
    __name(this, "GitHubFileSystemProviderContribution");
  }
  static {
    this.ID = "workbench.contrib.githubFileSystemProvider";
  }
  constructor(fileService, instantiationService) {
    super();
    const provider = this._register(instantiationService.createInstance(GitHubFileSystemProvider));
    this._register(fileService.registerProvider(GITHUB_REMOTE_FILE_SCHEME, provider));
  }
};
GitHubFileSystemProviderContribution = __decorate([
  __param(0, IFileService),
  __param(1, IInstantiationService)
], GitHubFileSystemProviderContribution);
registerWorkbenchContribution2(
  GitHubFileSystemProviderContribution.ID,
  GitHubFileSystemProviderContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=fileTreeView.contribution.js.map
