var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from "../../../../base/common/buffer.js";
import { URI } from "../../../../base/common/uri.js";
import { IFileStatWithMetadata, IWriteFileOptions } from "../../../../platform/files/common/files.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IElevatedFileService } from "../common/elevatedFileService.js";
class BrowserElevatedFileService {
  static {
    __name(this, "BrowserElevatedFileService");
  }
  _serviceBrand;
  isSupported(resource) {
    return false;
  }
  async writeFileElevated(resource, value, options) {
    throw new Error("Unsupported");
  }
}
registerSingleton(IElevatedFileService, BrowserElevatedFileService, InstantiationType.Delayed);
export {
  BrowserElevatedFileService
};
//# sourceMappingURL=elevatedFileService.js.map
