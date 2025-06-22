var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { getMediaOrTextMime } from "../../../../base/common/mime.js";
import { URI } from "../../../../base/common/uri.js";
import { FileOperationError, IFileService } from "../../../../platform/files/common/files.js";
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
let BrowserRemoteResourceLoader = class BrowserRemoteResourceLoader2 extends Disposable {
  static {
    __name(this, "BrowserRemoteResourceLoader");
  }
  constructor(fileService, provider) {
    super();
    this.provider = provider;
    this._register(provider.onDidReceiveRequest(async (request) => {
      let uri;
      try {
        uri = JSON.parse(decodeURIComponent(request.uri.query));
      } catch {
        return request.respondWith(404, new Uint8Array(), {});
      }
      let content;
      try {
        content = await fileService.readFile(URI.from(uri, true));
      } catch (e) {
        const str = VSBuffer.fromString(e.message).buffer;
        if (e instanceof FileOperationError && e.fileOperationResult === 1) {
          return request.respondWith(404, str, {});
        } else {
          return request.respondWith(500, str, {});
        }
      }
      const mime = uri.path && getMediaOrTextMime(uri.path);
      request.respondWith(200, content.value.buffer, mime ? { "content-type": mime } : {});
    }));
  }
  getResourceUriProvider() {
    const baseUri = URI.parse(document.location.href);
    return (uri) => baseUri.with({
      path: this.provider.path,
      query: JSON.stringify(uri)
    });
  }
};
BrowserRemoteResourceLoader = __decorate([
  __param(0, IFileService)
], BrowserRemoteResourceLoader);
export {
  BrowserRemoteResourceLoader
};
//# sourceMappingURL=browserRemoteResourceHandler.js.map
