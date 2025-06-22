var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { BaseConfigurationResolverService } from "./baseConfigurationResolverService.js";
import { IConfigurationResolverService } from "../common/configurationResolver.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { IPathService } from "../../path/common/pathService.js";
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
let ConfigurationResolverService = class ConfigurationResolverService2 extends BaseConfigurationResolverService {
  static {
    __name(this, "ConfigurationResolverService");
  }
  constructor(editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService, storageService) {
    super({ getAppRoot: /* @__PURE__ */ __name(() => void 0, "getAppRoot"), getExecPath: /* @__PURE__ */ __name(() => void 0, "getExecPath") }, Promise.resolve(/* @__PURE__ */ Object.create(null)), editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService, storageService);
  }
};
ConfigurationResolverService = __decorate([
  __param(0, IEditorService),
  __param(1, IConfigurationService),
  __param(2, ICommandService),
  __param(3, IWorkspaceContextService),
  __param(4, IQuickInputService),
  __param(5, ILabelService),
  __param(6, IPathService),
  __param(7, IExtensionService),
  __param(8, IStorageService)
], ConfigurationResolverService);
registerSingleton(
  IConfigurationResolverService,
  ConfigurationResolverService,
  1
  /* InstantiationType.Delayed */
);
export {
  ConfigurationResolverService
};
//# sourceMappingURL=configurationResolverService.js.map
