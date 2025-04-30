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
import { URI } from "../../../base/common/uri.js";
import { Registry } from "../../../platform/registry/common/platform.js";
import { Extensions as ConfigurationExtensions, getScopes } from "../../../platform/configuration/common/configurationRegistry.js";
import { IWorkspaceContextService } from "../../../platform/workspace/common/workspace.js";
import { MainContext, ExtHostContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { IEnvironmentService } from "../../../platform/environment/common/environment.js";
let MainThreadConfiguration = class MainThreadConfiguration2 {
  static {
    __name(this, "MainThreadConfiguration");
  }
  constructor(extHostContext, _workspaceContextService, configurationService, _environmentService) {
    this._workspaceContextService = _workspaceContextService;
    this.configurationService = configurationService;
    this._environmentService = _environmentService;
    const proxy = extHostContext.getProxy(ExtHostContext.ExtHostConfiguration);
    proxy.$initializeConfiguration(this._getConfigurationData());
    this._configurationListener = configurationService.onDidChangeConfiguration((e) => {
      proxy.$acceptConfigurationChanged(this._getConfigurationData(), e.change);
    });
  }
  _getConfigurationData() {
    const configurationData = { ...this.configurationService.getConfigurationData(), configurationScopes: [] };
    if (!this._environmentService.isBuilt || this._environmentService.isExtensionDevelopment) {
      configurationData.configurationScopes = getScopes();
    }
    return configurationData;
  }
  dispose() {
    this._configurationListener.dispose();
  }
  $updateConfigurationOption(target, key, value, overrides, scopeToLanguage) {
    overrides = { resource: overrides?.resource ? URI.revive(overrides.resource) : void 0, overrideIdentifier: overrides?.overrideIdentifier };
    return this.writeConfiguration(target, key, value, overrides, scopeToLanguage);
  }
  $removeConfigurationOption(target, key, overrides, scopeToLanguage) {
    overrides = { resource: overrides?.resource ? URI.revive(overrides.resource) : void 0, overrideIdentifier: overrides?.overrideIdentifier };
    return this.writeConfiguration(target, key, void 0, overrides, scopeToLanguage);
  }
  writeConfiguration(target, key, value, overrides, scopeToLanguage) {
    target = target !== null && target !== void 0 ? target : this.deriveConfigurationTarget(key, overrides);
    const configurationValue = this.configurationService.inspect(key, overrides);
    switch (target) {
      case 8:
        return this._updateValue(key, value, target, configurationValue?.memory?.override, overrides, scopeToLanguage);
      case 6:
        return this._updateValue(key, value, target, configurationValue?.workspaceFolder?.override, overrides, scopeToLanguage);
      case 5:
        return this._updateValue(key, value, target, configurationValue?.workspace?.override, overrides, scopeToLanguage);
      case 4:
        return this._updateValue(key, value, target, configurationValue?.userRemote?.override, overrides, scopeToLanguage);
      default:
        return this._updateValue(key, value, target, configurationValue?.userLocal?.override, overrides, scopeToLanguage);
    }
  }
  _updateValue(key, value, configurationTarget, overriddenValue, overrides, scopeToLanguage) {
    overrides = scopeToLanguage === true ? overrides : scopeToLanguage === false ? { resource: overrides.resource } : overrides.overrideIdentifier && overriddenValue !== void 0 ? overrides : { resource: overrides.resource };
    return this.configurationService.updateValue(key, value, overrides, configurationTarget, { donotNotifyError: true });
  }
  deriveConfigurationTarget(key, overrides) {
    if (overrides.resource && this._workspaceContextService.getWorkbenchState() === 3) {
      const configurationProperties = Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
      if (configurationProperties[key] && (configurationProperties[key].scope === 5 || configurationProperties[key].scope === 6)) {
        return 6;
      }
    }
    return 5;
  }
};
MainThreadConfiguration = __decorate([
  extHostNamedCustomer(MainContext.MainThreadConfiguration),
  __param(1, IWorkspaceContextService),
  __param(2, IConfigurationService),
  __param(3, IEnvironmentService)
], MainThreadConfiguration);
export {
  MainThreadConfiguration
};
//# sourceMappingURL=mainThreadConfiguration.js.map
