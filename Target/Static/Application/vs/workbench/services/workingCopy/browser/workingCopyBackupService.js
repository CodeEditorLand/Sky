var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IFileService } from "../../../../platform/files/common/files.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { WorkingCopyBackupService } from "../common/workingCopyBackupService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IWorkingCopyBackupService } from "../common/workingCopyBackup.js";
import { joinPath } from "../../../../base/common/resources.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { BrowserWorkingCopyBackupTracker } from "./workingCopyBackupTracker.js";
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
let BrowserWorkingCopyBackupService = class BrowserWorkingCopyBackupService2 extends WorkingCopyBackupService {
  static {
    __name(this, "BrowserWorkingCopyBackupService");
  }
  constructor(contextService, environmentService, fileService, logService) {
    super(joinPath(environmentService.userRoamingDataHome, "Backups", contextService.getWorkspace().id), fileService, logService);
  }
};
BrowserWorkingCopyBackupService = __decorate([
  __param(0, IWorkspaceContextService),
  __param(1, IWorkbenchEnvironmentService),
  __param(2, IFileService),
  __param(3, ILogService)
], BrowserWorkingCopyBackupService);
registerSingleton(
  IWorkingCopyBackupService,
  BrowserWorkingCopyBackupService,
  0
  /* InstantiationType.Eager */
);
registerWorkbenchContribution2(
  BrowserWorkingCopyBackupTracker.ID,
  BrowserWorkingCopyBackupTracker,
  1
  /* WorkbenchPhase.BlockStartup */
);
export {
  BrowserWorkingCopyBackupService
};
//# sourceMappingURL=workingCopyBackupService.js.map
