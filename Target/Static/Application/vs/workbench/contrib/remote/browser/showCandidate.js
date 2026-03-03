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
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { IRemoteExplorerService } from "../../../services/remote/common/remoteExplorerService.js";
let ShowCandidateContribution = class ShowCandidateContribution2 extends Disposable {
  static {
    __name(this, "ShowCandidateContribution");
  }
  static {
    this.ID = "workbench.contrib.showPortCandidate";
  }
  constructor(remoteExplorerService, environmentService) {
    super();
    const showPortCandidate = environmentService.options?.tunnelProvider?.showPortCandidate;
    if (showPortCandidate) {
      this._register(remoteExplorerService.setCandidateFilter(async (candidates) => {
        const filters = await Promise.all(candidates.map((candidate) => showPortCandidate(candidate.host, candidate.port, candidate.detail ?? "")));
        const filteredCandidates = [];
        if (filters.length !== candidates.length) {
          return candidates;
        }
        for (let i = 0; i < candidates.length; i++) {
          if (filters[i]) {
            filteredCandidates.push(candidates[i]);
          }
        }
        return filteredCandidates;
      }));
    }
  }
};
ShowCandidateContribution = __decorate([
  __param(0, IRemoteExplorerService),
  __param(1, IBrowserWorkbenchEnvironmentService)
], ShowCandidateContribution);
export {
  ShowCandidateContribution
};
//# sourceMappingURL=showCandidate.js.map
