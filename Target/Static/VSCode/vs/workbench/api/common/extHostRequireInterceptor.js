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
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as performance from "../../../base/common/performance.js";
import { URI } from "../../../base/common/uri.js";
import { MainThreadTelemetryShape, MainContext } from "./extHost.protocol.js";
import { ExtHostConfigProvider, IExtHostConfiguration } from "./extHostConfiguration.js";
import { nullExtensionDescription } from "../../services/extensions/common/extensions.js";
import * as vscode from "vscode";
import { ExtensionIdentifierMap } from "../../../platform/extensions/common/extensions.js";
import { IExtensionApiFactory, IExtensionRegistries } from "./extHost.api.impl.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { ExtensionPaths, IExtHostExtensionService } from "./extHostExtensionService.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { escapeRegExpCharacters } from "../../../base/common/strings.js";
let RequireInterceptor = class {
  constructor(_apiFactory, _extensionRegistry, _instaService, _extHostConfiguration, _extHostExtensionService, _initData, _logService) {
    this._apiFactory = _apiFactory;
    this._extensionRegistry = _extensionRegistry;
    this._instaService = _instaService;
    this._extHostConfiguration = _extHostConfiguration;
    this._extHostExtensionService = _extHostExtensionService;
    this._initData = _initData;
    this._logService = _logService;
    this._factories = /* @__PURE__ */ new Map();
    this._alternatives = [];
  }
  static {
    __name(this, "RequireInterceptor");
  }
  _factories;
  _alternatives;
  async install() {
    this._installInterceptor();
    performance.mark("code/extHost/willWaitForConfig");
    const configProvider = await this._extHostConfiguration.getConfigProvider();
    performance.mark("code/extHost/didWaitForConfig");
    const extensionPaths = await this._extHostExtensionService.getExtensionPathIndex();
    this.register(new VSCodeNodeModuleFactory(this._apiFactory, extensionPaths, this._extensionRegistry, configProvider, this._logService));
    this.register(this._instaService.createInstance(NodeModuleAliasingModuleFactory));
    if (this._initData.remote.isRemote) {
      this.register(this._instaService.createInstance(OpenNodeModuleFactory, extensionPaths, this._initData.environment.appUriScheme));
    }
  }
  register(interceptor) {
    if ("nodeModuleName" in interceptor) {
      if (Array.isArray(interceptor.nodeModuleName)) {
        for (const moduleName of interceptor.nodeModuleName) {
          this._factories.set(moduleName, interceptor);
        }
      } else {
        this._factories.set(interceptor.nodeModuleName, interceptor);
      }
    }
    if (typeof interceptor.alternativeModuleName === "function") {
      this._alternatives.push((moduleName) => {
        return interceptor.alternativeModuleName(moduleName);
      });
    }
  }
};
RequireInterceptor = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IExtHostConfiguration),
  __decorateParam(4, IExtHostExtensionService),
  __decorateParam(5, IExtHostInitDataService),
  __decorateParam(6, ILogService)
], RequireInterceptor);
let NodeModuleAliasingModuleFactory = class {
  static {
    __name(this, "NodeModuleAliasingModuleFactory");
  }
  /**
   * Map of aliased internal node_modules, used to allow for modules to be
   * renamed without breaking extensions. In the form "original -> new name".
   */
  static aliased = /* @__PURE__ */ new Map([
    ["vscode-ripgrep", "@vscode/ripgrep"],
    ["vscode-windows-registry", "@vscode/windows-registry"]
  ]);
  re;
  constructor(initData) {
    if (initData.environment.appRoot && NodeModuleAliasingModuleFactory.aliased.size) {
      const root = escapeRegExpCharacters(this.forceForwardSlashes(initData.environment.appRoot.fsPath));
      const npmIdChrs = `[a-z0-9_.-]`;
      const npmModuleName = `@${npmIdChrs}+\\/${npmIdChrs}+|${npmIdChrs}+`;
      const moduleFolders = "node_modules|node_modules\\.asar(?:\\.unpacked)?";
      this.re = new RegExp(`^(${root}/${moduleFolders}\\/)(${npmModuleName})(.*)$`, "i");
    }
  }
  alternativeModuleName(name) {
    if (!this.re) {
      return;
    }
    const result = this.re.exec(this.forceForwardSlashes(name));
    if (!result) {
      return;
    }
    const [, prefix, moduleName, suffix] = result;
    const dealiased = NodeModuleAliasingModuleFactory.aliased.get(moduleName);
    if (dealiased === void 0) {
      return;
    }
    console.warn(`${moduleName} as been renamed to ${dealiased}, please update your imports`);
    return prefix + dealiased + suffix;
  }
  forceForwardSlashes(str) {
    return str.replace(/\\/g, "/");
  }
};
NodeModuleAliasingModuleFactory = __decorateClass([
  __decorateParam(0, IExtHostInitDataService)
], NodeModuleAliasingModuleFactory);
class VSCodeNodeModuleFactory {
  constructor(_apiFactory, _extensionPaths, _extensionRegistry, _configProvider, _logService) {
    this._apiFactory = _apiFactory;
    this._extensionPaths = _extensionPaths;
    this._extensionRegistry = _extensionRegistry;
    this._configProvider = _configProvider;
    this._logService = _logService;
  }
  static {
    __name(this, "VSCodeNodeModuleFactory");
  }
  nodeModuleName = "vscode";
  _extApiImpl = new ExtensionIdentifierMap();
  _defaultApiImpl;
  load(_request, parent) {
    const ext = this._extensionPaths.findSubstr(parent);
    if (ext) {
      let apiImpl = this._extApiImpl.get(ext.identifier);
      if (!apiImpl) {
        apiImpl = this._apiFactory(ext, this._extensionRegistry, this._configProvider);
        this._extApiImpl.set(ext.identifier, apiImpl);
      }
      return apiImpl;
    }
    if (!this._defaultApiImpl) {
      let extensionPathsPretty = "";
      this._extensionPaths.forEach((value, index) => extensionPathsPretty += `	${index} -> ${value.identifier.value}
`);
      this._logService.warn(`Could not identify extension for 'vscode' require call from ${parent}. These are the extension path mappings: 
${extensionPathsPretty}`);
      this._defaultApiImpl = this._apiFactory(nullExtensionDescription, this._extensionRegistry, this._configProvider);
    }
    return this._defaultApiImpl;
  }
}
let OpenNodeModuleFactory = class {
  constructor(_extensionPaths, _appUriScheme, rpcService) {
    this._extensionPaths = _extensionPaths;
    this._appUriScheme = _appUriScheme;
    this._mainThreadTelemetry = rpcService.getProxy(MainContext.MainThreadTelemetry);
    const mainThreadWindow = rpcService.getProxy(MainContext.MainThreadWindow);
    this._impl = (target, options) => {
      const uri = URI.parse(target);
      if (options) {
        return this.callOriginal(target, options);
      }
      if (uri.scheme === "http" || uri.scheme === "https") {
        return mainThreadWindow.$openUri(uri, target, { allowTunneling: true });
      } else if (uri.scheme === "mailto" || uri.scheme === this._appUriScheme) {
        return mainThreadWindow.$openUri(uri, target, {});
      }
      return this.callOriginal(target, options);
    };
  }
  static {
    __name(this, "OpenNodeModuleFactory");
  }
  nodeModuleName = ["open", "opn"];
  _extensionId;
  _original;
  _impl;
  _mainThreadTelemetry;
  load(request, parent, original) {
    const extension = this._extensionPaths.findSubstr(parent);
    if (extension) {
      this._extensionId = extension.identifier.value;
      this.sendShimmingTelemetry();
    }
    this._original = original(request);
    return this._impl;
  }
  callOriginal(target, options) {
    this.sendNoForwardTelemetry();
    return this._original(target, options);
  }
  sendShimmingTelemetry() {
    if (!this._extensionId) {
      return;
    }
    this._mainThreadTelemetry.$publicLog2("shimming.open", { extension: this._extensionId });
  }
  sendNoForwardTelemetry() {
    if (!this._extensionId) {
      return;
    }
    this._mainThreadTelemetry.$publicLog2("shimming.open.call.noForward", { extension: this._extensionId });
  }
};
OpenNodeModuleFactory = __decorateClass([
  __decorateParam(2, IExtHostRpcService)
], OpenNodeModuleFactory);
export {
  RequireInterceptor
};
//# sourceMappingURL=extHostRequireInterceptor.js.map
