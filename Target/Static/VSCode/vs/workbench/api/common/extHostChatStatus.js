var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as extHostProtocol from "./extHost.protocol.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
class ExtHostChatStatus {
  static {
    __name(this, "ExtHostChatStatus");
  }
  _proxy;
  _items = /* @__PURE__ */ new Map();
  constructor(mainContext) {
    this._proxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadChatStatus);
  }
  createChatStatusItem(extension, id) {
    const internalId = asChatItemIdentifier(extension.identifier, id);
    if (this._items.has(internalId)) {
      throw new Error(`Chat status item '${id}' already exists`);
    }
    const state = {
      id: internalId,
      title: "",
      description: "",
      detail: ""
    };
    let disposed = false;
    let visible = false;
    const syncState = /* @__PURE__ */ __name(() => {
      if (disposed) {
        throw new Error("Chat status item is disposed");
      }
      if (!visible) {
        return;
      }
      this._proxy.$setEntry(id, state);
    }, "syncState");
    const item = Object.freeze({
      id,
      get title() {
        return state.title;
      },
      set title(value) {
        state.title = value;
        syncState();
      },
      get description() {
        return state.description;
      },
      set description(value) {
        state.description = value;
        syncState();
      },
      get detail() {
        return state.detail;
      },
      set detail(value) {
        state.detail = value;
        syncState();
      },
      show: /* @__PURE__ */ __name(() => {
        visible = true;
        syncState();
      }, "show"),
      hide: /* @__PURE__ */ __name(() => {
        visible = false;
        this._proxy.$disposeEntry(id);
      }, "hide"),
      dispose: /* @__PURE__ */ __name(() => {
        disposed = true;
        this._proxy.$disposeEntry(id);
        this._items.delete(internalId);
      }, "dispose")
    });
    this._items.set(internalId, item);
    return item;
  }
}
function asChatItemIdentifier(extension, id) {
  return `${ExtensionIdentifier.toKey(extension)}.${id}`;
}
__name(asChatItemIdentifier, "asChatItemIdentifier");
export {
  ExtHostChatStatus
};
//# sourceMappingURL=extHostChatStatus.js.map
