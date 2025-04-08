var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ITerminalExternalLinkProvider } from "../../../terminal/browser/terminal.js";
import { ITerminalLinkProviderService } from "./links.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
class TerminalLinkProviderService {
  static {
    __name(this, "TerminalLinkProviderService");
  }
  _linkProviders = /* @__PURE__ */ new Set();
  get linkProviders() {
    return this._linkProviders;
  }
  _onDidAddLinkProvider = new Emitter();
  get onDidAddLinkProvider() {
    return this._onDidAddLinkProvider.event;
  }
  _onDidRemoveLinkProvider = new Emitter();
  get onDidRemoveLinkProvider() {
    return this._onDidRemoveLinkProvider.event;
  }
  registerLinkProvider(linkProvider) {
    const disposables = [];
    this._linkProviders.add(linkProvider);
    this._onDidAddLinkProvider.fire(linkProvider);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        for (const disposable of disposables) {
          disposable.dispose();
        }
        this._linkProviders.delete(linkProvider);
        this._onDidRemoveLinkProvider.fire(linkProvider);
      }, "dispose")
    };
  }
}
export {
  TerminalLinkProviderService
};
//# sourceMappingURL=terminalLinkProviderService.js.map
