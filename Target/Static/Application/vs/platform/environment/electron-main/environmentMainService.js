var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { memoize } from "../../../base/common/decorators.js";
import { join } from "../../../base/common/path.js";
import { isLinux } from "../../../base/common/platform.js";
import { createStaticIPCHandle } from "../../../base/parts/ipc/node/ipc.net.js";
import { IEnvironmentService } from "../common/environment.js";
import { NativeEnvironmentService } from "../node/environmentService.js";
import { refineServiceDecorator } from "../../instantiation/common/instantiation.js";
const IEnvironmentMainService = refineServiceDecorator(IEnvironmentService);
class EnvironmentMainService extends NativeEnvironmentService {
  static {
    __name(this, "EnvironmentMainService");
  }
  constructor() {
    super(...arguments);
    this._snapEnv = {};
  }
  get backupHome() {
    return join(this.userDataPath, "Backups");
  }
  get mainIPCHandle() {
    return createStaticIPCHandle(this.userDataPath, "main", this.productService.version);
  }
  get mainLockfile() {
    return join(this.userDataPath, "code.lock");
  }
  get disableUpdates() {
    return !!this.args["disable-updates"];
  }
  get crossOriginIsolated() {
    return !!this.args["enable-coi"];
  }
  get enableRDPDisplayTracking() {
    return !!this.args["enable-rdp-display-tracking"];
  }
  get codeCachePath() {
    return process.env["VSCODE_CODE_CACHE_PATH"] || void 0;
  }
  get useCodeCache() {
    return !!this.codeCachePath;
  }
  unsetSnapExportedVariables() {
    if (!isLinux) {
      return;
    }
    for (const key in process.env) {
      if (key.endsWith("_VSCODE_SNAP_ORIG")) {
        const originalKey = key.slice(0, -17);
        if (this._snapEnv[originalKey]) {
          continue;
        }
        if (process.env[originalKey]) {
          this._snapEnv[originalKey] = process.env[originalKey];
        }
        if (process.env[key]) {
          process.env[originalKey] = process.env[key];
        } else {
          delete process.env[originalKey];
        }
      }
    }
  }
  restoreSnapExportedVariables() {
    if (!isLinux) {
      return;
    }
    for (const key in this._snapEnv) {
      process.env[key] = this._snapEnv[key];
      delete this._snapEnv[key];
    }
  }
}
__decorate([
  memoize
], EnvironmentMainService.prototype, "backupHome", null);
__decorate([
  memoize
], EnvironmentMainService.prototype, "mainIPCHandle", null);
__decorate([
  memoize
], EnvironmentMainService.prototype, "mainLockfile", null);
__decorate([
  memoize
], EnvironmentMainService.prototype, "disableUpdates", null);
__decorate([
  memoize
], EnvironmentMainService.prototype, "crossOriginIsolated", null);
__decorate([
  memoize
], EnvironmentMainService.prototype, "enableRDPDisplayTracking", null);
__decorate([
  memoize
], EnvironmentMainService.prototype, "codeCachePath", null);
__decorate([
  memoize
], EnvironmentMainService.prototype, "useCodeCache", null);
export {
  EnvironmentMainService,
  IEnvironmentMainService
};
//# sourceMappingURL=environmentMainService.js.map
