var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { ICodeBlockActionContextProvider, IChatCodeBlockContextProviderService } from "./chat.js";
class ChatCodeBlockContextProviderService {
  static {
    __name(this, "ChatCodeBlockContextProviderService");
  }
  _providers = /* @__PURE__ */ new Map();
  get providers() {
    return [...this._providers.values()];
  }
  registerProvider(provider, id) {
    this._providers.set(id, provider);
    return toDisposable(() => this._providers.delete(id));
  }
}
export {
  ChatCodeBlockContextProviderService
};
//# sourceMappingURL=codeBlockContextProviderService.js.map
