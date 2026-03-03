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
var WebviewProtocolProvider_1;
import { protocol } from "electron";
import { COI, FileAccess, Schemas } from "../../../base/common/network.js";
import { URI } from "../../../base/common/uri.js";
import { IFileService } from "../../files/common/files.js";
let WebviewProtocolProvider = class WebviewProtocolProvider2 {
  static {
    __name(this, "WebviewProtocolProvider");
  }
  static {
    WebviewProtocolProvider_1 = this;
  }
  static {
    this.validWebviewFilePaths = /* @__PURE__ */ new Map([
      ["/index.html", { mime: "text/html" }],
      ["/fake.html", { mime: "text/html" }],
      ["/service-worker.js", { mime: "application/javascript" }]
    ]);
  }
  constructor(_fileService) {
    this._fileService = _fileService;
    const webviewHandler = this.handleWebviewRequest.bind(this);
    protocol.handle(Schemas.vscodeWebview, webviewHandler);
  }
  dispose() {
    protocol.unhandle(Schemas.vscodeWebview);
  }
  async handleWebviewRequest(request) {
    try {
      const uri = URI.parse(request.url);
      const entry = WebviewProtocolProvider_1.validWebviewFilePaths.get(uri.path);
      if (entry) {
        const relativeResourcePath = `vs/workbench/contrib/webview/browser/pre${uri.path}`;
        const url = FileAccess.asFileUri(relativeResourcePath);
        const content = await this._fileService.readFile(url);
        return new Response(content.value.buffer.buffer, {
          headers: {
            "Content-Type": entry.mime,
            ...COI.getHeadersFromQuery(request.url),
            "Cross-Origin-Resource-Policy": "cross-origin"
          }
        });
      } else {
        return new Response(null, { status: 403 });
      }
    } catch {
    }
    return new Response(null, { status: 500 });
  }
};
WebviewProtocolProvider = WebviewProtocolProvider_1 = __decorate([
  __param(0, IFileService)
], WebviewProtocolProvider);
export {
  WebviewProtocolProvider
};
//# sourceMappingURL=webviewProtocolProvider.js.map
