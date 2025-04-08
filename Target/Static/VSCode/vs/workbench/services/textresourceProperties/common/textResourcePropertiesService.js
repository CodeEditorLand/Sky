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
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ITextResourcePropertiesService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { OperatingSystem, OS } from "../../../../base/common/platform.js";
import { Schemas } from "../../../../base/common/network.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IRemoteAgentEnvironment } from "../../../../platform/remote/common/remoteAgentEnvironment.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
let TextResourcePropertiesService = class {
  constructor(configurationService, remoteAgentService, environmentService, storageService) {
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.storageService = storageService;
    remoteAgentService.getEnvironment().then((remoteEnv) => this.remoteEnvironment = remoteEnv);
  }
  static {
    __name(this, "TextResourcePropertiesService");
  }
  remoteEnvironment = null;
  getEOL(resource, language) {
    const eol = this.configurationService.getValue("files.eol", { overrideIdentifier: language, resource });
    if (eol && typeof eol === "string" && eol !== "auto") {
      return eol;
    }
    const os = this.getOS(resource);
    return os === OperatingSystem.Linux || os === OperatingSystem.Macintosh ? "\n" : "\r\n";
  }
  getOS(resource) {
    let os = OS;
    const remoteAuthority = this.environmentService.remoteAuthority;
    if (remoteAuthority) {
      if (resource && resource.scheme !== Schemas.file) {
        const osCacheKey = `resource.authority.os.${remoteAuthority}`;
        os = this.remoteEnvironment ? this.remoteEnvironment.os : (
          /* Get it from cache */
          this.storageService.getNumber(osCacheKey, StorageScope.WORKSPACE, OS)
        );
        this.storageService.store(osCacheKey, os, StorageScope.WORKSPACE, StorageTarget.MACHINE);
      }
    }
    return os;
  }
};
TextResourcePropertiesService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IStorageService)
], TextResourcePropertiesService);
registerSingleton(ITextResourcePropertiesService, TextResourcePropertiesService, InstantiationType.Delayed);
export {
  TextResourcePropertiesService
};
//# sourceMappingURL=textResourcePropertiesService.js.map
