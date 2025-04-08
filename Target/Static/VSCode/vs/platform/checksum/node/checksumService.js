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
import { createHash } from "crypto";
import { listenStream } from "../../../base/common/stream.js";
import { URI } from "../../../base/common/uri.js";
import { IChecksumService } from "../common/checksumService.js";
import { IFileService } from "../../files/common/files.js";
let ChecksumService = class {
  constructor(fileService) {
    this.fileService = fileService;
  }
  static {
    __name(this, "ChecksumService");
  }
  async checksum(resource) {
    const stream = (await this.fileService.readFileStream(resource)).value;
    return new Promise((resolve, reject) => {
      const hash = createHash("sha256");
      listenStream(stream, {
        onData: /* @__PURE__ */ __name((data) => hash.update(data.buffer), "onData"),
        onError: /* @__PURE__ */ __name((error) => reject(error), "onError"),
        onEnd: /* @__PURE__ */ __name(() => resolve(hash.digest("base64").replace(/=+$/, "")), "onEnd")
      });
    });
  }
};
ChecksumService = __decorateClass([
  __decorateParam(0, IFileService)
], ChecksumService);
export {
  ChecksumService
};
//# sourceMappingURL=checksumService.js.map
