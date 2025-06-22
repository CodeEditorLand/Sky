var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { distinct } from "../../../base/common/arrays.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
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
const IIgnoredExtensionsManagementService = createDecorator("IIgnoredExtensionsManagementService");
let IgnoredExtensionsManagementService = class IgnoredExtensionsManagementService2 {
  static {
    __name(this, "IgnoredExtensionsManagementService");
  }
  constructor(configurationService) {
    this.configurationService = configurationService;
  }
  hasToNeverSyncExtension(extensionId) {
    const configuredIgnoredExtensions = this.getConfiguredIgnoredExtensions();
    return configuredIgnoredExtensions.includes(extensionId.toLowerCase());
  }
  hasToAlwaysSyncExtension(extensionId) {
    const configuredIgnoredExtensions = this.getConfiguredIgnoredExtensions();
    return configuredIgnoredExtensions.includes(`-${extensionId.toLowerCase()}`);
  }
  updateIgnoredExtensions(ignoredExtensionId, ignore) {
    let currentValue = [...this.configurationService.getValue("settingsSync.ignoredExtensions")].map((id) => id.toLowerCase());
    currentValue = currentValue.filter((v) => v !== ignoredExtensionId && v !== `-${ignoredExtensionId}`);
    if (ignore) {
      currentValue.push(ignoredExtensionId.toLowerCase());
    }
    return this.configurationService.updateValue(
      "settingsSync.ignoredExtensions",
      currentValue.length ? currentValue : void 0,
      2
      /* ConfigurationTarget.USER */
    );
  }
  updateSynchronizedExtensions(extensionId, sync) {
    let currentValue = [...this.configurationService.getValue("settingsSync.ignoredExtensions")].map((id) => id.toLowerCase());
    currentValue = currentValue.filter((v) => v !== extensionId && v !== `-${extensionId}`);
    if (sync) {
      currentValue.push(`-${extensionId.toLowerCase()}`);
    }
    return this.configurationService.updateValue(
      "settingsSync.ignoredExtensions",
      currentValue.length ? currentValue : void 0,
      2
      /* ConfigurationTarget.USER */
    );
  }
  getIgnoredExtensions(installed) {
    const defaultIgnoredExtensions = installed.filter((i) => i.isMachineScoped).map((i) => i.identifier.id.toLowerCase());
    const value = this.getConfiguredIgnoredExtensions().map((id) => id.toLowerCase());
    const added = [], removed = [];
    if (Array.isArray(value)) {
      for (const key of value) {
        if (key.startsWith("-")) {
          removed.push(key.substring(1));
        } else {
          added.push(key);
        }
      }
    }
    return distinct([...defaultIgnoredExtensions, ...added].filter((setting) => !removed.includes(setting)));
  }
  getConfiguredIgnoredExtensions() {
    return (this.configurationService.getValue("settingsSync.ignoredExtensions") || []).map((id) => id.toLowerCase());
  }
};
IgnoredExtensionsManagementService = __decorate([
  __param(0, IConfigurationService)
], IgnoredExtensionsManagementService);
export {
  IIgnoredExtensionsManagementService,
  IgnoredExtensionsManagementService
};
//# sourceMappingURL=ignoredExtensions.js.map
