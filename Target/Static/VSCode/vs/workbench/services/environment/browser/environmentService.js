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
import { Schemas } from "../../../../base/common/network.js";
import { joinPath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ExtensionKind, IEnvironmentService, IExtensionHostDebugParams } from "../../../../platform/environment/common/environment.js";
import { IPath } from "../../../../platform/window/common/window.js";
import { IWorkbenchEnvironmentService } from "../common/environmentService.js";
import { IWorkbenchConstructionOptions } from "../../../browser/web.api.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { memoize } from "../../../../base/common/decorators.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { parseLineAndColumnAware } from "../../../../base/common/extpath.js";
import { LogLevelToString } from "../../../../platform/log/common/log.js";
import { isUndefined } from "../../../../base/common/types.js";
import { refineServiceDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ITextEditorOptions } from "../../../../platform/editor/common/editor.js";
import { EXTENSION_IDENTIFIER_WITH_LOG_REGEX } from "../../../../platform/environment/common/environmentService.js";
const IBrowserWorkbenchEnvironmentService = refineServiceDecorator(IEnvironmentService);
class BrowserWorkbenchEnvironmentService {
  constructor(workspaceId, logsHome, options, productService) {
    this.workspaceId = workspaceId;
    this.logsHome = logsHome;
    this.options = options;
    this.productService = productService;
    if (options.workspaceProvider && Array.isArray(options.workspaceProvider.payload)) {
      try {
        this.payload = new Map(options.workspaceProvider.payload);
      } catch (error) {
        onUnexpectedError(error);
      }
    }
  }
  static {
    __name(this, "BrowserWorkbenchEnvironmentService");
  }
  get remoteAuthority() {
    return this.options.remoteAuthority;
  }
  get expectsResolverExtension() {
    return !!this.options.remoteAuthority?.includes("+") && !this.options.webSocketFactory;
  }
  get isBuilt() {
    return !!this.productService.commit;
  }
  get logLevel() {
    const logLevelFromPayload = this.payload?.get("logLevel");
    if (logLevelFromPayload) {
      return logLevelFromPayload.split(",").find((entry) => !EXTENSION_IDENTIFIER_WITH_LOG_REGEX.test(entry));
    }
    return this.options.developmentOptions?.logLevel !== void 0 ? LogLevelToString(this.options.developmentOptions?.logLevel) : void 0;
  }
  get extensionLogLevel() {
    const logLevelFromPayload = this.payload?.get("logLevel");
    if (logLevelFromPayload) {
      const result = [];
      for (const entry of logLevelFromPayload.split(",")) {
        const matches = EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(entry);
        if (matches && matches[1] && matches[2]) {
          result.push([matches[1], matches[2]]);
        }
      }
      return result.length ? result : void 0;
    }
    return this.options.developmentOptions?.extensionLogLevel !== void 0 ? this.options.developmentOptions?.extensionLogLevel.map(([extension, logLevel]) => [extension, LogLevelToString(logLevel)]) : void 0;
  }
  get profDurationMarkers() {
    const profDurationMarkersFromPayload = this.payload?.get("profDurationMarkers");
    if (profDurationMarkersFromPayload) {
      const result = [];
      for (const entry of profDurationMarkersFromPayload.split(",")) {
        result.push(entry);
      }
      return result.length === 2 ? result : void 0;
    }
    return void 0;
  }
  get windowLogsPath() {
    return this.logsHome;
  }
  get logFile() {
    return joinPath(this.windowLogsPath, "window.log");
  }
  get userRoamingDataHome() {
    return URI.file("/User").with({ scheme: Schemas.vscodeUserData });
  }
  get argvResource() {
    return joinPath(this.userRoamingDataHome, "argv.json");
  }
  get cacheHome() {
    return joinPath(this.userRoamingDataHome, "caches");
  }
  get workspaceStorageHome() {
    return joinPath(this.userRoamingDataHome, "workspaceStorage");
  }
  get localHistoryHome() {
    return joinPath(this.userRoamingDataHome, "History");
  }
  get stateResource() {
    return joinPath(this.userRoamingDataHome, "State", "storage.json");
  }
  get userDataSyncHome() {
    return joinPath(this.userRoamingDataHome, "sync", this.workspaceId);
  }
  get sync() {
    return void 0;
  }
  get keyboardLayoutResource() {
    return joinPath(this.userRoamingDataHome, "keyboardLayout.json");
  }
  get untitledWorkspacesHome() {
    return joinPath(this.userRoamingDataHome, "Workspaces");
  }
  get serviceMachineIdResource() {
    return joinPath(this.userRoamingDataHome, "machineid");
  }
  get extHostLogsPath() {
    return joinPath(this.logsHome, "exthost");
  }
  extensionHostDebugEnvironment = void 0;
  get debugExtensionHost() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.params;
  }
  get isExtensionDevelopment() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.isExtensionDevelopment;
  }
  get extensionDevelopmentLocationURI() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.extensionDevelopmentLocationURI;
  }
  get extensionDevelopmentLocationKind() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.extensionDevelopmentKind;
  }
  get extensionTestsLocationURI() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.extensionTestsLocationURI;
  }
  get extensionEnabledProposedApi() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.extensionEnabledProposedApi;
  }
  get debugRenderer() {
    if (!this.extensionHostDebugEnvironment) {
      this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
    }
    return this.extensionHostDebugEnvironment.debugRenderer;
  }
  get enableSmokeTestDriver() {
    return this.options.developmentOptions?.enableSmokeTestDriver;
  }
  get disableExtensions() {
    return this.payload?.get("disableExtensions") === "true";
  }
  get enableExtensions() {
    return this.options.enabledExtensions;
  }
  get webviewExternalEndpoint() {
    const endpoint = this.options.webviewEndpoint || this.productService.webviewContentExternalBaseUrlTemplate || "https://{{uuid}}.vscode-cdn.net/{{quality}}/{{commit}}/out/vs/workbench/contrib/webview/browser/pre/";
    const webviewExternalEndpointCommit = this.payload?.get("webviewExternalEndpointCommit");
    return endpoint.replace("{{commit}}", webviewExternalEndpointCommit ?? this.productService.commit ?? "ef65ac1ba57f57f2a3961bfe94aa20481caca4c6").replace("{{quality}}", (webviewExternalEndpointCommit ? "insider" : this.productService.quality) ?? "insider");
  }
  get extensionTelemetryLogResource() {
    return joinPath(this.logsHome, "extensionTelemetry.log");
  }
  get disableTelemetry() {
    return false;
  }
  get verbose() {
    return this.payload?.get("verbose") === "true";
  }
  get logExtensionHostCommunication() {
    return this.payload?.get("logExtensionHostCommunication") === "true";
  }
  get skipReleaseNotes() {
    return this.payload?.get("skipReleaseNotes") === "true";
  }
  get skipWelcome() {
    return this.payload?.get("skipWelcome") === "true";
  }
  get disableWorkspaceTrust() {
    return !this.options.enableWorkspaceTrust;
  }
  get profile() {
    return this.payload?.get("profile");
  }
  get editSessionId() {
    return this.options.editSessionId;
  }
  payload;
  resolveExtensionHostDebugEnvironment() {
    const extensionHostDebugEnvironment = {
      params: {
        port: null,
        break: false
      },
      debugRenderer: false,
      isExtensionDevelopment: false,
      extensionDevelopmentLocationURI: void 0,
      extensionDevelopmentKind: void 0
    };
    if (this.payload) {
      for (const [key, value] of this.payload) {
        switch (key) {
          case "extensionDevelopmentPath":
            if (!extensionHostDebugEnvironment.extensionDevelopmentLocationURI) {
              extensionHostDebugEnvironment.extensionDevelopmentLocationURI = [];
            }
            extensionHostDebugEnvironment.extensionDevelopmentLocationURI.push(URI.parse(value));
            extensionHostDebugEnvironment.isExtensionDevelopment = true;
            break;
          case "extensionDevelopmentKind":
            extensionHostDebugEnvironment.extensionDevelopmentKind = [value];
            break;
          case "extensionTestsPath":
            extensionHostDebugEnvironment.extensionTestsLocationURI = URI.parse(value);
            break;
          case "debugRenderer":
            extensionHostDebugEnvironment.debugRenderer = value === "true";
            break;
          case "debugId":
            extensionHostDebugEnvironment.params.debugId = value;
            break;
          case "inspect-brk-extensions":
            extensionHostDebugEnvironment.params.port = parseInt(value);
            extensionHostDebugEnvironment.params.break = true;
            break;
          case "inspect-extensions":
            extensionHostDebugEnvironment.params.port = parseInt(value);
            break;
          case "enableProposedApi":
            extensionHostDebugEnvironment.extensionEnabledProposedApi = [];
            break;
        }
      }
    }
    const developmentOptions = this.options.developmentOptions;
    if (developmentOptions && !extensionHostDebugEnvironment.isExtensionDevelopment) {
      if (developmentOptions.extensions?.length) {
        extensionHostDebugEnvironment.extensionDevelopmentLocationURI = developmentOptions.extensions.map((e) => URI.revive(e));
        extensionHostDebugEnvironment.isExtensionDevelopment = true;
      }
      if (developmentOptions.extensionTestsPath) {
        extensionHostDebugEnvironment.extensionTestsLocationURI = URI.revive(developmentOptions.extensionTestsPath);
      }
    }
    return extensionHostDebugEnvironment;
  }
  get filesToOpenOrCreate() {
    if (this.payload) {
      const fileToOpen = this.payload.get("openFile");
      if (fileToOpen) {
        const fileUri = URI.parse(fileToOpen);
        if (this.payload.has("gotoLineMode")) {
          const pathColumnAware = parseLineAndColumnAware(fileUri.path);
          return [{
            fileUri: fileUri.with({ path: pathColumnAware.path }),
            options: {
              selection: !isUndefined(pathColumnAware.line) ? { startLineNumber: pathColumnAware.line, startColumn: pathColumnAware.column || 1 } : void 0
            }
          }];
        }
        return [{ fileUri }];
      }
    }
    return void 0;
  }
  get filesToDiff() {
    if (this.payload) {
      const fileToDiffPrimary = this.payload.get("diffFilePrimary");
      const fileToDiffSecondary = this.payload.get("diffFileSecondary");
      if (fileToDiffPrimary && fileToDiffSecondary) {
        return [
          { fileUri: URI.parse(fileToDiffSecondary) },
          { fileUri: URI.parse(fileToDiffPrimary) }
        ];
      }
    }
    return void 0;
  }
  get filesToMerge() {
    if (this.payload) {
      const fileToMerge1 = this.payload.get("mergeFile1");
      const fileToMerge2 = this.payload.get("mergeFile2");
      const fileToMergeBase = this.payload.get("mergeFileBase");
      const fileToMergeResult = this.payload.get("mergeFileResult");
      if (fileToMerge1 && fileToMerge2 && fileToMergeBase && fileToMergeResult) {
        return [
          { fileUri: URI.parse(fileToMerge1) },
          { fileUri: URI.parse(fileToMerge2) },
          { fileUri: URI.parse(fileToMergeBase) },
          { fileUri: URI.parse(fileToMergeResult) }
        ];
      }
    }
    return void 0;
  }
}
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "remoteAuthority", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "expectsResolverExtension", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "isBuilt", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "logLevel", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "windowLogsPath", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "logFile", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "userRoamingDataHome", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "argvResource", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "cacheHome", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "workspaceStorageHome", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "localHistoryHome", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "stateResource", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "userDataSyncHome", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "sync", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "keyboardLayoutResource", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "untitledWorkspacesHome", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "serviceMachineIdResource", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extHostLogsPath", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "debugExtensionHost", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "isExtensionDevelopment", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extensionDevelopmentLocationURI", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extensionDevelopmentLocationKind", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extensionTestsLocationURI", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extensionEnabledProposedApi", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "debugRenderer", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "enableSmokeTestDriver", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "disableExtensions", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "enableExtensions", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "webviewExternalEndpoint", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "extensionTelemetryLogResource", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "disableTelemetry", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "verbose", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "logExtensionHostCommunication", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "skipReleaseNotes", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "skipWelcome", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "disableWorkspaceTrust", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "profile", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "editSessionId", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "filesToOpenOrCreate", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "filesToDiff", 1);
__decorateClass([
  memoize
], BrowserWorkbenchEnvironmentService.prototype, "filesToMerge", 1);
export {
  BrowserWorkbenchEnvironmentService,
  IBrowserWorkbenchEnvironmentService
};
//# sourceMappingURL=environmentService.js.map
