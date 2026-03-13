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
import { basename, dirname } from "../../../../base/common/resources.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { Promises } from "../../../../base/common/async.js";
let LogsDataCleaner = class LogsDataCleaner2 extends Disposable {
  static {
    __name(this, "LogsDataCleaner");
  }
  constructor(environmentService, fileService, lifecycleService) {
    super();
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.lifecycleService = lifecycleService;
    this.cleanUpOldLogsSoon();
  }
  cleanUpOldLogsSoon() {
    let handle = setTimeout(async () => {
      handle = void 0;
      const stat = await this.fileService.resolve(dirname(this.environmentService.logsHome));
      if (stat.children) {
        const currentLog = basename(this.environmentService.logsHome);
        const allSessions = stat.children.filter((stat2) => stat2.isDirectory && /^\d{8}T\d{6}$/.test(stat2.name));
        const oldSessions = allSessions.sort().filter((d, i) => d.name !== currentLog);
        const toDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 49));
        Promises.settled(toDelete.map((stat2) => this.fileService.del(stat2.resource, { recursive: true })));
      }
    }, 10 * 1e3);
    this._register(this.lifecycleService.onWillShutdown(() => {
      if (handle) {
        clearTimeout(handle);
        handle = void 0;
      }
    }));
  }
};
LogsDataCleaner = __decorate([
  __param(0, IWorkbenchEnvironmentService),
  __param(1, IFileService),
  __param(2, ILifecycleService)
], LogsDataCleaner);
export {
  LogsDataCleaner
};
//# sourceMappingURL=logsDataCleaner.js.map
