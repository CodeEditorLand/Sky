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
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Schemas } from "../../../base/common/network.js";
import { URI } from "../../../base/common/uri.js";
import { IDownloadService } from "./download.js";
import { IFileService } from "../../files/common/files.js";
import { asTextOrError, IRequestService } from "../../request/common/request.js";
let DownloadService = class {
  constructor(requestService, fileService) {
    this.requestService = requestService;
    this.fileService = fileService;
  }
  static {
    __name(this, "DownloadService");
  }
  async download(resource, target, cancellationToken = CancellationToken.None) {
    if (resource.scheme === Schemas.file || resource.scheme === Schemas.vscodeRemote) {
      await this.fileService.copy(resource, target);
      return;
    }
    const options = { type: "GET", url: resource.toString(true) };
    const context = await this.requestService.request(options, cancellationToken);
    if (context.res.statusCode === 200) {
      await this.fileService.writeFile(target, context.stream);
    } else {
      const message = await asTextOrError(context);
      throw new Error(`Expected 200, got back ${context.res.statusCode} instead.

${message}`);
    }
  }
};
DownloadService = __decorateClass([
  __decorateParam(0, IRequestService),
  __decorateParam(1, IFileService)
], DownloadService);
export {
  DownloadService
};
//# sourceMappingURL=downloadService.js.map
