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
import { localize } from "../../../../nls.js";
import { randomPath } from "../../../../base/common/extpath.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IWorkspaceTrustRequestService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-browser/environmentService.js";
import { IElevatedFileService } from "../common/elevatedFileService.js";
import { isWindows } from "../../../../base/common/platform.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
let NativeElevatedFileService = class NativeElevatedFileService2 {
  static {
    __name(this, "NativeElevatedFileService");
  }
  constructor(nativeHostService, fileService, environmentService, workspaceTrustRequestService, labelService) {
    this.nativeHostService = nativeHostService;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.labelService = labelService;
  }
  isSupported(resource) {
    return resource.scheme === Schemas.file;
  }
  async writeFileElevated(resource, value, options) {
    const trusted = await this.workspaceTrustRequestService.requestWorkspaceTrust({
      message: isWindows ? localize("fileNotTrustedMessageWindows", "You are about to save '{0}' as admin.", this.labelService.getUriLabel(resource)) : localize("fileNotTrustedMessagePosix", "You are about to save '{0}' as super user.", this.labelService.getUriLabel(resource))
    });
    if (!trusted) {
      throw new Error(localize("fileNotTrusted", "Workspace is not trusted."));
    }
    const source = URI.file(randomPath(this.environmentService.userDataPath, "code-elevated"));
    try {
      await this.fileService.writeFile(source, value, options);
      await this.nativeHostService.writeElevated(source, resource, options);
    } finally {
      await this.fileService.del(source);
    }
    return this.fileService.resolve(resource, { resolveMetadata: true });
  }
};
NativeElevatedFileService = __decorate([
  __param(0, INativeHostService),
  __param(1, IFileService),
  __param(2, INativeWorkbenchEnvironmentService),
  __param(3, IWorkspaceTrustRequestService),
  __param(4, ILabelService)
], NativeElevatedFileService);
registerSingleton(
  IElevatedFileService,
  NativeElevatedFileService,
  1
  /* InstantiationType.Delayed */
);
export {
  NativeElevatedFileService
};
//# sourceMappingURL=elevatedFileService.js.map
