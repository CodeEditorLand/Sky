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
import { localize } from "../../../../nls.js";
import { WorkingCopyBackupService } from "../common/workingCopyBackupService.js";
import { URI } from "../../../../base/common/uri.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IWorkingCopyBackupService } from "../common/workingCopyBackup.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-browser/environmentService.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { ILifecycleService } from "../../lifecycle/common/lifecycle.js";
import { NativeWorkingCopyBackupTracker } from "./workingCopyBackupTracker.js";
let NativeWorkingCopyBackupService = class NativeWorkingCopyBackupService2 extends WorkingCopyBackupService {
  static {
    __name(this, "NativeWorkingCopyBackupService");
  }
  constructor(environmentService, fileService, logService, lifecycleService) {
    super(environmentService.backupPath ? URI.file(environmentService.backupPath).with({ scheme: environmentService.userRoamingDataHome.scheme }) : void 0, fileService, logService);
    this.lifecycleService = lifecycleService;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.lifecycleService.onWillShutdown((event) => event.join(this.joinBackups(), { id: "join.workingCopyBackups", label: localize("join.workingCopyBackups", "Backup working copies") })));
  }
};
NativeWorkingCopyBackupService = __decorate([
  __param(0, INativeWorkbenchEnvironmentService),
  __param(1, IFileService),
  __param(2, ILogService),
  __param(3, ILifecycleService)
], NativeWorkingCopyBackupService);
registerSingleton(
  IWorkingCopyBackupService,
  NativeWorkingCopyBackupService,
  0
  /* InstantiationType.Eager */
);
registerWorkbenchContribution2(
  NativeWorkingCopyBackupTracker.ID,
  NativeWorkingCopyBackupTracker,
  1
  /* WorkbenchPhase.BlockStartup */
);
export {
  NativeWorkingCopyBackupService
};
//# sourceMappingURL=workingCopyBackupService.js.map
