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
import { mixin, deepClone } from "../../../base/common/objects.js";
import { Emitter } from "../../../base/common/event.js";
import { IExtHostWorkspace } from "./extHostWorkspace.js";
import { MainContext } from "./extHost.protocol.js";
import { ConfigurationTarget as ExtHostConfigurationTarget } from "./extHostTypes.js";
import { Configuration, ConfigurationChangeEvent } from "../../../platform/configuration/common/configurationModels.js";
import { OVERRIDE_PROPERTY_REGEX } from "../../../platform/configuration/common/configurationRegistry.js";
import { isObject } from "../../../base/common/types.js";
import { Barrier } from "../../../base/common/async.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { URI } from "../../../base/common/uri.js";
function lookUp(tree, key) {
  if (key) {
    const parts = key.split(".");
    let node = tree;
    for (let i = 0; node && i < parts.length; i++) {
      node = node[parts[i]];
    }
    return node;
  }
  return void 0;
}
__name(lookUp, "lookUp");
function isUri(thing) {
  return thing instanceof URI;
}
__name(isUri, "isUri");
function isResourceLanguage(thing) {
  return isObject(thing) && thing.uri instanceof URI && !!thing.languageId && typeof thing.languageId === "string";
}
__name(isResourceLanguage, "isResourceLanguage");
function isLanguage(thing) {
  return isObject(thing) && !thing.uri && !!thing.languageId && typeof thing.languageId === "string";
}
__name(isLanguage, "isLanguage");
function isWorkspaceFolder(thing) {
  return isObject(thing) && thing.uri instanceof URI && (!thing.name || typeof thing.name === "string") && (!thing.index || typeof thing.index === "number");
}
__name(isWorkspaceFolder, "isWorkspaceFolder");
function scopeToOverrides(scope) {
  if (isUri(scope)) {
    return { resource: scope };
  }
  if (isResourceLanguage(scope)) {
    return { resource: scope.uri, overrideIdentifier: scope.languageId };
  }
  if (isLanguage(scope)) {
    return { overrideIdentifier: scope.languageId };
  }
  if (isWorkspaceFolder(scope)) {
    return { resource: scope.uri };
  }
  if (scope === null) {
    return { resource: null };
  }
  return void 0;
}
__name(scopeToOverrides, "scopeToOverrides");
let ExtHostConfiguration = class ExtHostConfiguration2 {
  static {
    __name(this, "ExtHostConfiguration");
  }
  constructor(extHostRpc, extHostWorkspace, logService) {
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadConfiguration);
    this._extHostWorkspace = extHostWorkspace;
    this._logService = logService;
    this._barrier = new Barrier();
    this._actual = null;
  }
  getConfigProvider() {
    return this._barrier.wait().then((_) => this._actual);
  }
  $initializeConfiguration(data) {
    this._actual = new ExtHostConfigProvider(this._proxy, this._extHostWorkspace, data, this._logService);
    this._barrier.open();
  }
  $acceptConfigurationChanged(data, change) {
    this.getConfigProvider().then((provider) => provider.$acceptConfigurationChanged(data, change));
  }
};
ExtHostConfiguration = __decorate([
  __param(0, IExtHostRpcService),
  __param(1, IExtHostWorkspace),
  __param(2, ILogService)
], ExtHostConfiguration);
class ExtHostConfigProvider {
  static {
    __name(this, "ExtHostConfigProvider");
  }
  constructor(proxy, extHostWorkspace, data, logService) {
    this._onDidChangeConfiguration = new Emitter();
    this._proxy = proxy;
    this._logService = logService;
    this._extHostWorkspace = extHostWorkspace;
    this._configuration = Configuration.parse(data, logService);
    this._configurationScopes = this._toMap(data.configurationScopes);
  }
  get onDidChangeConfiguration() {
    return this._onDidChangeConfiguration && this._onDidChangeConfiguration.event;
  }
  $acceptConfigurationChanged(data, change) {
    const previous = { data: this._configuration.toData(), workspace: this._extHostWorkspace.workspace };
    this._configuration = Configuration.parse(data, this._logService);
    this._configurationScopes = this._toMap(data.configurationScopes);
    this._onDidChangeConfiguration.fire(this._toConfigurationChangeEvent(change, previous));
  }
  getConfiguration(section, scope, extensionDescription) {
    const overrides = scopeToOverrides(scope) || {};
    const config = this._toReadonlyValue(this._configuration.getValue(section, overrides, this._extHostWorkspace.workspace));
    if (section) {
      this._validateConfigurationAccess(section, overrides, extensionDescription?.identifier);
    }
    function parseConfigurationTarget(arg) {
      if (arg === void 0 || arg === null) {
        return null;
      }
      if (typeof arg === "boolean") {
        return arg ? 2 : 5;
      }
      switch (arg) {
        case ExtHostConfigurationTarget.Global:
          return 2;
        case ExtHostConfigurationTarget.Workspace:
          return 5;
        case ExtHostConfigurationTarget.WorkspaceFolder:
          return 6;
      }
    }
    __name(parseConfigurationTarget, "parseConfigurationTarget");
    const result = {
      has(key) {
        return typeof lookUp(config, key) !== "undefined";
      },
      get: /* @__PURE__ */ __name((key, defaultValue) => {
        this._validateConfigurationAccess(section ? `${section}.${key}` : key, overrides, extensionDescription?.identifier);
        let result2 = lookUp(config, key);
        if (typeof result2 === "undefined") {
          result2 = defaultValue;
        } else {
          let clonedConfig = void 0;
          const cloneOnWriteProxy = /* @__PURE__ */ __name((target, accessor) => {
            if (isObject(target)) {
              let clonedTarget = void 0;
              const cloneTarget = /* @__PURE__ */ __name(() => {
                clonedConfig = clonedConfig ? clonedConfig : deepClone(config);
                clonedTarget = clonedTarget ? clonedTarget : lookUp(clonedConfig, accessor);
              }, "cloneTarget");
              return new Proxy(target, {
                get: /* @__PURE__ */ __name((target2, property) => {
                  if (typeof property === "string" && property.toLowerCase() === "tojson") {
                    cloneTarget();
                    return () => clonedTarget;
                  }
                  if (clonedConfig) {
                    clonedTarget = clonedTarget ? clonedTarget : lookUp(clonedConfig, accessor);
                    return clonedTarget[property];
                  }
                  const result3 = target2[property];
                  if (typeof property === "string") {
                    return cloneOnWriteProxy(result3, `${accessor}.${property}`);
                  }
                  return result3;
                }, "get"),
                set: /* @__PURE__ */ __name((_target, property, value) => {
                  cloneTarget();
                  if (clonedTarget) {
                    clonedTarget[property] = value;
                  }
                  return true;
                }, "set"),
                deleteProperty: /* @__PURE__ */ __name((_target, property) => {
                  cloneTarget();
                  if (clonedTarget) {
                    delete clonedTarget[property];
                  }
                  return true;
                }, "deleteProperty"),
                defineProperty: /* @__PURE__ */ __name((_target, property, descriptor) => {
                  cloneTarget();
                  if (clonedTarget) {
                    Object.defineProperty(clonedTarget, property, descriptor);
                  }
                  return true;
                }, "defineProperty")
              });
            }
            if (Array.isArray(target)) {
              return deepClone(target);
            }
            return target;
          }, "cloneOnWriteProxy");
          result2 = cloneOnWriteProxy(result2, key);
        }
        return result2;
      }, "get"),
      update: /* @__PURE__ */ __name((key, value, extHostConfigurationTarget, scopeToLanguage) => {
        key = section ? `${section}.${key}` : key;
        const target = parseConfigurationTarget(extHostConfigurationTarget);
        if (value !== void 0) {
          return this._proxy.$updateConfigurationOption(target, key, value, overrides, scopeToLanguage);
        } else {
          return this._proxy.$removeConfigurationOption(target, key, overrides, scopeToLanguage);
        }
      }, "update"),
      inspect: /* @__PURE__ */ __name((key) => {
        key = section ? `${section}.${key}` : key;
        const config2 = this._configuration.inspect(key, overrides, this._extHostWorkspace.workspace);
        if (config2) {
          return {
            key,
            defaultValue: deepClone(config2.policy?.value ?? config2.default?.value),
            globalLocalValue: deepClone(config2.userLocal?.value),
            globalRemoteValue: deepClone(config2.userRemote?.value),
            globalValue: deepClone(config2.user?.value ?? config2.application?.value),
            workspaceValue: deepClone(config2.workspace?.value),
            workspaceFolderValue: deepClone(config2.workspaceFolder?.value),
            defaultLanguageValue: deepClone(config2.default?.override),
            globalLocalLanguageValue: deepClone(config2.userLocal?.override),
            globalRemoteLanguageValue: deepClone(config2.userRemote?.override),
            globalLanguageValue: deepClone(config2.user?.override ?? config2.application?.override),
            workspaceLanguageValue: deepClone(config2.workspace?.override),
            workspaceFolderLanguageValue: deepClone(config2.workspaceFolder?.override),
            languageIds: deepClone(config2.overrideIdentifiers)
          };
        }
        return void 0;
      }, "inspect")
    };
    if (typeof config === "object") {
      mixin(result, config, false);
    }
    return Object.freeze(result);
  }
  _toReadonlyValue(result) {
    const readonlyProxy = /* @__PURE__ */ __name((target) => {
      return isObject(target) ? new Proxy(target, {
        get: /* @__PURE__ */ __name((target2, property) => readonlyProxy(target2[property]), "get"),
        set: /* @__PURE__ */ __name((_target, property, _value) => {
          throw new Error(`TypeError: Cannot assign to read only property '${String(property)}' of object`);
        }, "set"),
        deleteProperty: /* @__PURE__ */ __name((_target, property) => {
          throw new Error(`TypeError: Cannot delete read only property '${String(property)}' of object`);
        }, "deleteProperty"),
        defineProperty: /* @__PURE__ */ __name((_target, property) => {
          throw new Error(`TypeError: Cannot define property '${String(property)}' for a readonly object`);
        }, "defineProperty"),
        setPrototypeOf: /* @__PURE__ */ __name((_target) => {
          throw new Error(`TypeError: Cannot set prototype for a readonly object`);
        }, "setPrototypeOf"),
        isExtensible: /* @__PURE__ */ __name(() => false, "isExtensible"),
        preventExtensions: /* @__PURE__ */ __name(() => true, "preventExtensions")
      }) : target;
    }, "readonlyProxy");
    return readonlyProxy(result);
  }
  _validateConfigurationAccess(key, overrides, extensionId) {
    const scope = OVERRIDE_PROPERTY_REGEX.test(key) ? 5 : this._configurationScopes.get(key);
    const extensionIdText = extensionId ? `[${extensionId.value}] ` : "";
    if (5 === scope) {
      if (typeof overrides?.resource === "undefined") {
        this._logService.warn(`${extensionIdText}Accessing a resource scoped configuration without providing a resource is not expected. To get the effective value for '${key}', provide the URI of a resource or 'null' for any resource.`);
      }
      return;
    }
    if (4 === scope) {
      if (overrides?.resource) {
        this._logService.warn(`${extensionIdText}Accessing a window scoped configuration for a resource is not expected. To associate '${key}' to a resource, define its scope to 'resource' in configuration contributions in 'package.json'.`);
      }
      return;
    }
  }
  _toConfigurationChangeEvent(change, previous) {
    const event = new ConfigurationChangeEvent(change, previous, this._configuration, this._extHostWorkspace.workspace, this._logService);
    return Object.freeze({
      affectsConfiguration: /* @__PURE__ */ __name((section, scope) => event.affectsConfiguration(section, scopeToOverrides(scope)), "affectsConfiguration")
    });
  }
  _toMap(scopes) {
    return scopes.reduce((result, scope) => {
      result.set(scope[0], scope[1]);
      return result;
    }, /* @__PURE__ */ new Map());
  }
}
const IExtHostConfiguration = createDecorator("IExtHostConfiguration");
export {
  ExtHostConfigProvider,
  ExtHostConfiguration,
  IExtHostConfiguration
};
//# sourceMappingURL=extHostConfiguration.js.map
