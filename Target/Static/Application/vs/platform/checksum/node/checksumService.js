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
import { createHash } from "crypto";
import { listenStream } from "../../../base/common/stream.js";
import { IFileService } from "../../files/common/files.js";
let ChecksumService = class ChecksumService2 {
  static {
    __name(this, "ChecksumService");
  }
  constructor(fileService) {
    this.fileService = fileService;
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
ChecksumService = __decorate([
  __param(0, IFileService)
], ChecksumService);
export {
  ChecksumService
};
//# sourceMappingURL=checksumService.js.map
