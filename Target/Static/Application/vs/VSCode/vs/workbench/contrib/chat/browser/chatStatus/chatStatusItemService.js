var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
const IChatStatusItemService = createDecorator("chatStatusItemService");
class ChatStatusItemService {
  static {
    __name(this, "ChatStatusItemService");
  }
  constructor() {
    this._entries = /* @__PURE__ */ new Map();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  setOrUpdateEntry(entry) {
    const isUpdate = this._entries.has(entry.id);
    this._entries.set(entry.id, entry);
    if (isUpdate) {
      this._onDidChange.fire({ entry });
    }
  }
  deleteEntry(id) {
    this._entries.delete(id);
  }
  getEntries() {
    return this._entries.values();
  }
}
registerSingleton(
  IChatStatusItemService,
  ChatStatusItemService,
  1
  /* InstantiationType.Delayed */
);
export {
  IChatStatusItemService
};
//# sourceMappingURL=chatStatusItemService.js.map
