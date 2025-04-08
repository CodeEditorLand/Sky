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
import { localize } from "../../../../nls.js";
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from "../../../../base/common/buffer.js";
import { randomPath } from "../../../../base/common/extpath.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { IFileService, IFileStatWithMetadata, IWriteFileOptions } from "../../../../platform/files/common/files.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IWorkspaceTrustRequestService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
import { IElevatedFileService } from "../common/elevatedFileService.js";
import { isWindows } from "../../../../base/common/platform.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
let NativeElevatedFileService = class {
  constructor(nativeHostService, fileService, environmentService, workspaceTrustRequestService, labelService) {
    this.nativeHostService = nativeHostService;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.labelService = labelService;
  }
  static {
    __name(this, "NativeElevatedFileService");
  }
  _serviceBrand;
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
NativeElevatedFileService = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, IFileService),
  __decorateParam(2, INativeWorkbenchEnvironmentService),
  __decorateParam(3, IWorkspaceTrustRequestService),
  __decorateParam(4, ILabelService)
], NativeElevatedFileService);
registerSingleton(IElevatedFileService, NativeElevatedFileService, InstantiationType.Delayed);
export {
  NativeElevatedFileService
};
//# sourceMappingURL=elevatedFileService.js.map
