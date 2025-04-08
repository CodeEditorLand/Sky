var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AppResourcePath, FileAccess, nodeModulesAsarPath, nodeModulesPath, Schemas, VSCODE_AUTHORITY } from "./base/common/network.js";
import * as platform from "./base/common/platform.js";
import { IProductConfiguration } from "./base/common/product.js";
import { URI } from "./base/common/uri.js";
import { generateUuid } from "./base/common/uuid.js";
const canASAR = false;
class DefineCall {
  constructor(id, dependencies, callback) {
    this.id = id;
    this.dependencies = dependencies;
    this.callback = callback;
  }
  static {
    __name(this, "DefineCall");
  }
}
var AMDModuleImporterState = /* @__PURE__ */ ((AMDModuleImporterState2) => {
  AMDModuleImporterState2[AMDModuleImporterState2["Uninitialized"] = 1] = "Uninitialized";
  AMDModuleImporterState2[AMDModuleImporterState2["InitializedInternal"] = 2] = "InitializedInternal";
  AMDModuleImporterState2[AMDModuleImporterState2["InitializedExternal"] = 3] = "InitializedExternal";
  return AMDModuleImporterState2;
})(AMDModuleImporterState || {});
class AMDModuleImporter {
  static {
    __name(this, "AMDModuleImporter");
  }
  static INSTANCE = new AMDModuleImporter();
  _isWebWorker = typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope";
  _isRenderer = typeof document === "object";
  _defineCalls = [];
  _state = 1 /* Uninitialized */;
  _amdPolicy;
  constructor() {
  }
  _initialize() {
    if (this._state === 1 /* Uninitialized */) {
      if (globalThis.define) {
        this._state = 3 /* InitializedExternal */;
        return;
      }
    } else {
      return;
    }
    this._state = 2 /* InitializedInternal */;
    globalThis.define = (id, dependencies, callback) => {
      if (typeof id !== "string") {
        callback = dependencies;
        dependencies = id;
        id = null;
      }
      if (typeof dependencies !== "object" || !Array.isArray(dependencies)) {
        callback = dependencies;
        dependencies = null;
      }
      this._defineCalls.push(new DefineCall(id, dependencies, callback));
    };
    globalThis.define.amd = true;
    if (this._isRenderer) {
      this._amdPolicy = globalThis._VSCODE_WEB_PACKAGE_TTP ?? window.trustedTypes?.createPolicy("amdLoader", {
        createScriptURL(value) {
          if (value.startsWith(window.location.origin)) {
            return value;
          }
          if (value.startsWith(`${Schemas.vscodeFileResource}://${VSCODE_AUTHORITY}`)) {
            return value;
          }
          throw new Error(`[trusted_script_src] Invalid script url: ${value}`);
        }
      });
    } else if (this._isWebWorker) {
      this._amdPolicy = globalThis._VSCODE_WEB_PACKAGE_TTP ?? globalThis.trustedTypes?.createPolicy("amdLoader", {
        createScriptURL(value) {
          return value;
        }
      });
    }
  }
  async load(scriptSrc) {
    this._initialize();
    if (this._state === 3 /* InitializedExternal */) {
      return new Promise((resolve) => {
        const tmpModuleId = generateUuid();
        globalThis.define(tmpModuleId, [scriptSrc], function(moduleResult) {
          resolve(moduleResult);
        });
      });
    }
    const defineCall = await (this._isWebWorker ? this._workerLoadScript(scriptSrc) : this._isRenderer ? this._rendererLoadScript(scriptSrc) : this._nodeJSLoadScript(scriptSrc));
    if (!defineCall) {
      console.warn(`Did not receive a define call from script ${scriptSrc}`);
      return void 0;
    }
    const exports = {};
    const dependencyObjs = [];
    const dependencyModules = [];
    if (Array.isArray(defineCall.dependencies)) {
      for (const mod of defineCall.dependencies) {
        if (mod === "exports") {
          dependencyObjs.push(exports);
        } else {
          dependencyModules.push(mod);
        }
      }
    }
    if (dependencyModules.length > 0) {
      throw new Error(`Cannot resolve dependencies for script ${scriptSrc}. The dependencies are: ${dependencyModules.join(", ")}`);
    }
    if (typeof defineCall.callback === "function") {
      return defineCall.callback(...dependencyObjs) ?? exports;
    } else {
      return defineCall.callback;
    }
  }
  _rendererLoadScript(scriptSrc) {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement("script");
      scriptElement.setAttribute("async", "async");
      scriptElement.setAttribute("type", "text/javascript");
      const unbind = /* @__PURE__ */ __name(() => {
        scriptElement.removeEventListener("load", loadEventListener);
        scriptElement.removeEventListener("error", errorEventListener);
      }, "unbind");
      const loadEventListener = /* @__PURE__ */ __name((e) => {
        unbind();
        resolve(this._defineCalls.pop());
      }, "loadEventListener");
      const errorEventListener = /* @__PURE__ */ __name((e) => {
        unbind();
        reject(e);
      }, "errorEventListener");
      scriptElement.addEventListener("load", loadEventListener);
      scriptElement.addEventListener("error", errorEventListener);
      if (this._amdPolicy) {
        scriptSrc = this._amdPolicy.createScriptURL(scriptSrc);
      }
      scriptElement.setAttribute("src", scriptSrc);
      window.document.getElementsByTagName("head")[0].appendChild(scriptElement);
    });
  }
  async _workerLoadScript(scriptSrc) {
    if (this._amdPolicy) {
      scriptSrc = this._amdPolicy.createScriptURL(scriptSrc);
    }
    await import(scriptSrc);
    return this._defineCalls.pop();
  }
  async _nodeJSLoadScript(scriptSrc) {
    try {
      const fs = (await import(`${"fs"}`)).default;
      const vm = (await import(`${"vm"}`)).default;
      const module = (await import(`${"module"}`)).default;
      const filePath = URI.parse(scriptSrc).fsPath;
      const content = fs.readFileSync(filePath).toString();
      const scriptSource = module.wrap(content.replace(/^#!.*/, ""));
      const script = new vm.Script(scriptSource);
      const compileWrapper = script.runInThisContext();
      compileWrapper.apply();
      return this._defineCalls.pop();
    } catch (error) {
      throw error;
    }
  }
}
const cache = /* @__PURE__ */ new Map();
async function importAMDNodeModule(nodeModuleName, pathInsideNodeModule, isBuilt) {
  if (isBuilt === void 0) {
    const product = globalThis._VSCODE_PRODUCT_JSON;
    isBuilt = Boolean((product ?? globalThis.vscode?.context?.configuration()?.product)?.commit);
  }
  const nodeModulePath = pathInsideNodeModule ? `${nodeModuleName}/${pathInsideNodeModule}` : nodeModuleName;
  if (cache.has(nodeModulePath)) {
    return cache.get(nodeModulePath);
  }
  let scriptSrc;
  if (/^\w[\w\d+.-]*:\/\//.test(nodeModulePath)) {
    scriptSrc = nodeModulePath;
  } else {
    const useASAR = canASAR && isBuilt && !platform.isWeb;
    const actualNodeModulesPath = useASAR ? nodeModulesAsarPath : nodeModulesPath;
    const resourcePath = `${actualNodeModulesPath}/${nodeModulePath}`;
    scriptSrc = FileAccess.asBrowserUri(resourcePath).toString(true);
  }
  const result = AMDModuleImporter.INSTANCE.load(scriptSrc);
  cache.set(nodeModulePath, result);
  return result;
}
__name(importAMDNodeModule, "importAMDNodeModule");
function resolveAmdNodeModulePath(nodeModuleName, pathInsideNodeModule) {
  const product = globalThis._VSCODE_PRODUCT_JSON;
  const isBuilt = Boolean((product ?? globalThis.vscode?.context?.configuration()?.product)?.commit);
  const useASAR = canASAR && isBuilt && !platform.isWeb;
  const nodeModulePath = `${nodeModuleName}/${pathInsideNodeModule}`;
  const actualNodeModulesPath = useASAR ? nodeModulesAsarPath : nodeModulesPath;
  const resourcePath = `${actualNodeModulesPath}/${nodeModulePath}`;
  return FileAccess.asBrowserUri(resourcePath).toString(true);
}
__name(resolveAmdNodeModulePath, "resolveAmdNodeModulePath");
export {
  canASAR,
  importAMDNodeModule,
  resolveAmdNodeModulePath
};
//# sourceMappingURL=amdX.js.map
