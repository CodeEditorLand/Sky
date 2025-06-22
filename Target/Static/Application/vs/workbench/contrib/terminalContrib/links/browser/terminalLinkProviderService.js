var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
class TerminalLinkProviderService {
  static {
    __name(this, "TerminalLinkProviderService");
  }
  constructor() {
    this._linkProviders = /* @__PURE__ */ new Set();
    this._onDidAddLinkProvider = new Emitter();
    this._onDidRemoveLinkProvider = new Emitter();
  }
  get linkProviders() {
    return this._linkProviders;
  }
  get onDidAddLinkProvider() {
    return this._onDidAddLinkProvider.event;
  }
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
