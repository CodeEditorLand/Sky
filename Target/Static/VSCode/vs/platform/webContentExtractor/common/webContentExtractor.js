var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { URI } from "../../../base/common/uri.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IWebContentExtractorService = createDecorator("IWebContentExtractorService");
const ISharedWebContentExtractorService = createDecorator("ISharedWebContentExtractorService");
class NullWebContentExtractorService {
  static {
    __name(this, "NullWebContentExtractorService");
  }
  _serviceBrand;
  extract(_uri) {
    throw new Error("Not implemented");
  }
}
class NullSharedWebContentExtractorService {
  static {
    __name(this, "NullSharedWebContentExtractorService");
  }
  _serviceBrand;
  readImage(_uri, _token) {
    throw new Error("Not implemented");
  }
}
export {
  ISharedWebContentExtractorService,
  IWebContentExtractorService,
  NullSharedWebContentExtractorService,
  NullWebContentExtractorService
};
//# sourceMappingURL=webContentExtractor.js.map
