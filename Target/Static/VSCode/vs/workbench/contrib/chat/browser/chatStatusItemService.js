var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../base/common/event.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IChatStatusItemService = createDecorator("IChatStatusItemService");
class ChatStatusItemService {
  static {
    __name(this, "ChatStatusItemService");
  }
  _serviceBrand;
  _entries = /* @__PURE__ */ new Map();
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
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
registerSingleton(IChatStatusItemService, ChatStatusItemService, InstantiationType.Delayed);
export {
  IChatStatusItemService
};
//# sourceMappingURL=chatStatusItemService.js.map
