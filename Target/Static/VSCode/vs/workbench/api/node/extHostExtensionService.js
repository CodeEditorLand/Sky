var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as performance from "../../../base/common/performance.js";
import { createApiFactoryAndRegisterActors } from "../common/extHost.api.impl.js";
import { INodeModuleFactory, RequireInterceptor } from "../common/extHostRequireInterceptor.js";
import { ExtensionActivationTimesBuilder } from "../common/extHostExtensionActivator.js";
import { connectProxyResolver } from "./proxyResolver.js";
import { AbstractExtHostExtensionService } from "../common/extHostExtensionService.js";
import { ExtHostDownloadService } from "./extHostDownloadService.js";
import { URI } from "../../../base/common/uri.js";
import { Schemas } from "../../../base/common/network.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { ExtensionRuntime } from "../common/extHostTypes.js";
import { CLIServer } from "./extHostCLIServer.js";
import { realpathSync } from "../../../base/node/extpath.js";
import { ExtHostConsoleForwarder } from "./extHostConsoleForwarder.js";
import { ExtHostDiskFileSystemProvider } from "./extHostDiskFileSystemProvider.js";
import nodeModule from "node:module";
import { assertType } from "../../../base/common/types.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { BidirectionalMap } from "../../../base/common/map.js";
import { DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
const require2 = nodeModule.createRequire(import.meta.url);
class NodeModuleRequireInterceptor extends RequireInterceptor {
  static {
    __name(this, "NodeModuleRequireInterceptor");
  }
  _installInterceptor() {
    const that = this;
    const node_module = require2("module");
    const originalLoad = node_module._load;
    node_module._load = /* @__PURE__ */ __name(function load(request, parent, isMain) {
      request = applyAlternatives(request);
      if (!that._factories.has(request)) {
        return originalLoad.apply(this, arguments);
      }
      return that._factories.get(request).load(
        request,
        URI.file(realpathSync(parent.filename)),
        (request2) => originalLoad.apply(this, [request2, parent, isMain])
      );
    }, "load");
    const originalLookup = node_module._resolveLookupPaths;
    node_module._resolveLookupPaths = (request, parent) => {
      return originalLookup.call(this, applyAlternatives(request), parent);
    };
    const originalResolveFilename = node_module._resolveFilename;
    node_module._resolveFilename = /* @__PURE__ */ __name(function resolveFilename(request, parent, isMain, options) {
      if (request === "vsda" && Array.isArray(options?.paths) && options.paths.length === 0) {
        options.paths = node_module._nodeModulePaths(import.meta.dirname);
      }
      return originalResolveFilename.call(this, request, parent, isMain, options);
    }, "resolveFilename");
    const applyAlternatives = /* @__PURE__ */ __name((request) => {
      for (const alternativeModuleName of that._alternatives) {
        const alternative = alternativeModuleName(request);
        if (alternative) {
          request = alternative;
          break;
        }
      }
      return request;
    }, "applyAlternatives");
  }
}
class NodeModuleESMInterceptor extends RequireInterceptor {
  static {
    __name(this, "NodeModuleESMInterceptor");
  }
  static _createDataUri(scriptContent) {
    return `data:text/javascript;base64,${Buffer.from(scriptContent).toString("base64")}`;
  }
  // This string is a script that runs in the loader thread of NodeJS.
  static _loaderScript = `
	let lookup;
	export const initialize = async (context) => {
		let requestIds = 0;
		const { port } = context;
		const pendingRequests = new Map();
		port.onmessage = (event) => {
			const { id, url } = event.data;
			pendingRequests.get(id)?.(url);
		};
		lookup = url => {
			// debugger;
			const myId = requestIds++;
			return new Promise((resolve) => {
				pendingRequests.set(myId, resolve);
				port.postMessage({ id: myId, url, });
			});
		};
	};
	export const resolve = async (specifier, context, nextResolve) => {
		if (specifier !== 'vscode' || !context.parentURL) {
			return nextResolve(specifier, context);
		}
		const otherUrl = await lookup(context.parentURL);
		return {
			url: otherUrl,
			shortCircuit: true,
		};
	};`;
  static _vscodeImportFnName = `_VSCODE_IMPORT_VSCODE_API`;
  _store = new DisposableStore();
  dispose() {
    this._store.dispose();
  }
  _installInterceptor() {
    const apiInstances = new BidirectionalMap();
    const apiImportDataUrl = /* @__PURE__ */ new Map();
    Object.defineProperty(globalThis, NodeModuleESMInterceptor._vscodeImportFnName, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: /* @__PURE__ */ __name((key) => {
        return apiInstances.getKey(key);
      }, "value")
    });
    const { port1, port2 } = new MessageChannel();
    let apiModuleFactory;
    const port1LayerCheckerWorkaround = port1;
    port1LayerCheckerWorkaround.onmessage = (e) => {
      if (!apiModuleFactory) {
        apiModuleFactory = this._factories.get("vscode");
        assertType(apiModuleFactory);
      }
      const { id, url } = e.data;
      const uri = URI.parse(url);
      const apiInstance = apiModuleFactory.load("_not_used", uri, () => {
        throw new Error("CANNOT LOAD MODULE from here.");
      });
      let key = apiInstances.get(apiInstance);
      if (!key) {
        key = generateUuid();
        apiInstances.set(apiInstance, key);
      }
      let scriptDataUrlSrc = apiImportDataUrl.get(key);
      if (!scriptDataUrlSrc) {
        const jsCode = `const _vscodeInstance = globalThis.${NodeModuleESMInterceptor._vscodeImportFnName}('${key}');

${Object.keys(apiInstance).map((name) => `export const ${name} = _vscodeInstance['${name}'];`).join("\n")}`;
        scriptDataUrlSrc = NodeModuleESMInterceptor._createDataUri(jsCode);
        apiImportDataUrl.set(key, scriptDataUrlSrc);
      }
      port1.postMessage({
        id,
        url: scriptDataUrlSrc
      });
    };
    nodeModule.register(NodeModuleESMInterceptor._createDataUri(NodeModuleESMInterceptor._loaderScript), {
      parentURL: import.meta.url,
      data: { port: port2 },
      transferList: [port2]
    });
    this._store.add(toDisposable(() => {
      port1.close();
      port2.close();
    }));
  }
}
class ExtHostExtensionService extends AbstractExtHostExtensionService {
  static {
    __name(this, "ExtHostExtensionService");
  }
  extensionRuntime = ExtensionRuntime.Node;
  async _beforeAlmostReadyToRunExtensions() {
    this._instaService.createInstance(ExtHostConsoleForwarder);
    const extensionApiFactory = this._instaService.invokeFunction(createApiFactoryAndRegisterActors);
    this._instaService.createInstance(ExtHostDownloadService);
    if (this._initData.remote.isRemote && this._initData.remote.authority) {
      const cliServer = this._instaService.createInstance(CLIServer);
      process.env["VSCODE_IPC_HOOK_CLI"] = cliServer.ipcHandlePath;
    }
    this._instaService.createInstance(ExtHostDiskFileSystemProvider);
    await this._instaService.createInstance(NodeModuleRequireInterceptor, extensionApiFactory, { mine: this._myRegistry, all: this._globalRegistry }).install();
    await this._store.add(this._instaService.createInstance(NodeModuleESMInterceptor, extensionApiFactory, { mine: this._myRegistry, all: this._globalRegistry })).install();
    performance.mark("code/extHost/didInitAPI");
    const configProvider = await this._extHostConfiguration.getConfigProvider();
    await connectProxyResolver(this._extHostWorkspace, configProvider, this, this._logService, this._mainThreadTelemetryProxy, this._initData, this._store);
    performance.mark("code/extHost/didInitProxyResolver");
  }
  _getEntryPoint(extensionDescription) {
    return extensionDescription.main;
  }
  async _doLoadModule(extension, module, activationTimesBuilder, mode) {
    if (module.scheme !== Schemas.file) {
      throw new Error(`Cannot load URI: '${module}', must be of file-scheme`);
    }
    let r = null;
    activationTimesBuilder.codeLoadingStart();
    this._logService.trace(`ExtensionService#loadModule [${mode}] -> ${module.toString(true)}`);
    this._logService.flush();
    const extensionId = extension?.identifier.value;
    if (extension) {
      await this._extHostLocalizationService.initializeLocalizedMessages(extension);
    }
    try {
      if (extensionId) {
        performance.mark(`code/extHost/willLoadExtensionCode/${extensionId}`);
      }
      if (mode === "esm") {
        r = await import(module.fsPath);
      } else {
        r = require2(module.fsPath);
      }
    } finally {
      if (extensionId) {
        performance.mark(`code/extHost/didLoadExtensionCode/${extensionId}`);
      }
      activationTimesBuilder.codeLoadingStop();
    }
    return r;
  }
  async _loadCommonJSModule(extension, module, activationTimesBuilder) {
    return this._doLoadModule(extension, module, activationTimesBuilder, "cjs");
  }
  async _loadESMModule(extension, module, activationTimesBuilder) {
    return this._doLoadModule(extension, module, activationTimesBuilder, "esm");
  }
  async $setRemoteEnvironment(env) {
    if (!this._initData.remote.isRemote) {
      return;
    }
    for (const key in env) {
      const value = env[key];
      if (value === null) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}
export {
  ExtHostExtensionService
};
//# sourceMappingURL=extHostExtensionService.js.map
