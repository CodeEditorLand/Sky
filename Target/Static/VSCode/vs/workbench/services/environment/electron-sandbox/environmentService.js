var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
import { PerformanceMark } from "../../../../base/common/performance.js";
import { IBrowserWorkbenchEnvironmentService } from "../browser/environmentService.js";
import { IColorScheme, INativeWindowConfiguration, IOSConfiguration, IPath, IPathsToWaitFor } from "../../../../platform/window/common/window.js";
import { IEnvironmentService, INativeEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { refineServiceDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { AbstractNativeEnvironmentService } from "../../../../platform/environment/common/environmentService.js";
import { memoize } from "../../../../base/common/decorators.js";
import { URI } from "../../../../base/common/uri.js";
import { Schemas } from "../../../../base/common/network.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { joinPath } from "../../../../base/common/resources.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
const INativeWorkbenchEnvironmentService = refineServiceDecorator(IEnvironmentService);
class NativeWorkbenchEnvironmentService extends AbstractNativeEnvironmentService {
  constructor(configuration, productService) {
    super(configuration, { homeDir: configuration.homeDir, tmpDir: configuration.tmpDir, userDataDir: configuration.userDataDir }, productService);
    this.configuration = configuration;
  }
  static {
    __name(this, "NativeWorkbenchEnvironmentService");
  }
  get mainPid() {
    return this.configuration.mainPid;
  }
  get machineId() {
    return this.configuration.machineId;
  }
  get sqmId() {
    return this.configuration.sqmId;
  }
  get devDeviceId() {
    return this.configuration.devDeviceId;
  }
  get remoteAuthority() {
    return this.configuration.remoteAuthority;
  }
  get expectsResolverExtension() {
    return !!this.configuration.remoteAuthority?.includes("+");
  }
  get execPath() {
    return this.configuration.execPath;
  }
  get backupPath() {
    return this.configuration.backupPath;
  }
  get window() {
    return {
      id: this.configuration.windowId,
      handle: this.configuration.handle,
      colorScheme: this.configuration.colorScheme,
      maximized: this.configuration.maximized,
      accessibilitySupport: this.configuration.accessibilitySupport,
      perfMarks: this.configuration.perfMarks,
      isInitialStartup: this.configuration.isInitialStartup,
      isCodeCaching: typeof this.configuration.codeCachePath === "string"
    };
  }
  get windowLogsPath() {
    return joinPath(this.logsHome, `window${this.configuration.windowId}`);
  }
  get logFile() {
    return joinPath(this.windowLogsPath, `renderer.log`);
  }
  get extHostLogsPath() {
    return joinPath(this.windowLogsPath, "exthost");
  }
  get webviewExternalEndpoint() {
    return `${Schemas.vscodeWebview}://{{uuid}}`;
  }
  get skipReleaseNotes() {
    return !!this.args["skip-release-notes"];
  }
  get skipWelcome() {
    return !!this.args["skip-welcome"];
  }
  get logExtensionHostCommunication() {
    return !!this.args.logExtensionHostCommunication;
  }
  get enableSmokeTestDriver() {
    return !!this.args["enable-smoke-test-driver"];
  }
  get extensionEnabledProposedApi() {
    if (Array.isArray(this.args["enable-proposed-api"])) {
      return this.args["enable-proposed-api"];
    }
    if ("enable-proposed-api" in this.args) {
      return [];
    }
    return void 0;
  }
  get os() {
    return this.configuration.os;
  }
  get filesToOpenOrCreate() {
    return this.configuration.filesToOpenOrCreate;
  }
  get filesToDiff() {
    return this.configuration.filesToDiff;
  }
  get filesToMerge() {
    return this.configuration.filesToMerge;
  }
  get filesToWait() {
    return this.configuration.filesToWait;
  }
}
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "mainPid", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "machineId", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "sqmId", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "devDeviceId", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "remoteAuthority", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "expectsResolverExtension", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "execPath", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "backupPath", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "window", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "windowLogsPath", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "logFile", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "extHostLogsPath", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "webviewExternalEndpoint", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "skipReleaseNotes", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "skipWelcome", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "logExtensionHostCommunication", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "enableSmokeTestDriver", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "extensionEnabledProposedApi", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "os", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "filesToOpenOrCreate", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "filesToDiff", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "filesToMerge", 1);
__decorateClass([
  memoize
], NativeWorkbenchEnvironmentService.prototype, "filesToWait", 1);
export {
  INativeWorkbenchEnvironmentService,
  NativeWorkbenchEnvironmentService
};
//# sourceMappingURL=environmentService.js.map
