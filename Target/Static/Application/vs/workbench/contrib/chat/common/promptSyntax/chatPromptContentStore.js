var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
const IChatPromptContentStore = createDecorator("chatPromptContentStore");
class ChatPromptContentStore extends Disposable {
  static {
    __name(this, "ChatPromptContentStore");
  }
  constructor() {
    super();
    this._contentMap = /* @__PURE__ */ new Map();
  }
  registerContent(uri, content) {
    const key = uri.toString();
    this._contentMap.set(key, content);
    const dispose = /* @__PURE__ */ __name(() => {
      this._contentMap.delete(key);
    }, "dispose");
    return { dispose };
  }
  getContent(uri) {
    return this._contentMap.get(uri.toString());
  }
  dispose() {
    this._contentMap.clear();
    super.dispose();
  }
}
export {
  ChatPromptContentStore,
  IChatPromptContentStore
};
//# sourceMappingURL=chatPromptContentStore.js.map
