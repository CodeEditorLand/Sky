var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { protocol } from "electron";
import { Disposable } from "../../../base/common/lifecycle.js";
import { AppResourcePath, COI, FileAccess, Schemas } from "../../../base/common/network.js";
import { URI } from "../../../base/common/uri.js";
class WebviewProtocolProvider extends Disposable {
  static {
    __name(this, "WebviewProtocolProvider");
  }
  static validWebviewFilePaths = /* @__PURE__ */ new Map([
    ["/index.html", "index.html"],
    ["/fake.html", "fake.html"],
    ["/service-worker.js", "service-worker.js"]
  ]);
  constructor() {
    super();
    const webviewHandler = this.handleWebviewRequest.bind(this);
    protocol.registerFileProtocol(Schemas.vscodeWebview, webviewHandler);
  }
  handleWebviewRequest(request, callback) {
    try {
      const uri = URI.parse(request.url);
      const entry = WebviewProtocolProvider.validWebviewFilePaths.get(uri.path);
      if (typeof entry === "string") {
        const relativeResourcePath = `vs/workbench/contrib/webview/browser/pre/${entry}`;
        const url = FileAccess.asFileUri(relativeResourcePath);
        return callback({
          path: url.fsPath,
          headers: {
            ...COI.getHeadersFromQuery(request.url),
            "Cross-Origin-Resource-Policy": "cross-origin"
          }
        });
      } else {
        return callback({
          error: -10
          /* ACCESS_DENIED - https://cs.chromium.org/chromium/src/net/base/net_error_list.h?l=32 */
        });
      }
    } catch {
    }
    return callback({
      error: -2
      /* FAILED - https://cs.chromium.org/chromium/src/net/base/net_error_list.h?l=32 */
    });
  }
}
export {
  WebviewProtocolProvider
};
//# sourceMappingURL=webviewProtocolProvider.js.map
