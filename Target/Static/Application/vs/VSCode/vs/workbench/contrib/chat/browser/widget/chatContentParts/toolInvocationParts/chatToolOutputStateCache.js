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
import { Event } from "../../../../../../../base/common/event.js";
import { LRUCache } from "../../../../../../../base/common/map.js";
import { createDecorator } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { IStorageService, WillSaveStateReason } from "../../../../../../../platform/storage/common/storage.js";
import { registerSingleton } from "../../../../../../../platform/instantiation/common/extensions.js";
const IChatToolOutputStateCache = createDecorator("IChatToolOutputStateCache");
const CACHE_STORAGE_KEY = "chat/toolOutputStateCache";
const CACHE_LIMIT = 100;
let ChatToolOutputStateCache = class ChatToolOutputStateCache2 {
  static {
    __name(this, "ChatToolOutputStateCache");
  }
  constructor(storageService) {
    this._cache = new LRUCache(CACHE_LIMIT, 0.75);
    const raw = storageService.get(CACHE_STORAGE_KEY, 1, "{}");
    this._deserialize(raw);
    const onWillSaveStateBecauseOfShutdown = Event.filter(storageService.onWillSaveState, (e) => e.reason === WillSaveStateReason.SHUTDOWN);
    Event.once(onWillSaveStateBecauseOfShutdown)(() => {
      storageService.store(
        CACHE_STORAGE_KEY,
        this._serialize(),
        1,
        1
        /* StorageTarget.MACHINE */
      );
    });
  }
  get(toolCallId) {
    return this._cache.get(toolCallId);
  }
  set(toolCallId, state) {
    this._cache.set(toolCallId, state);
  }
  _serialize() {
    const data = /* @__PURE__ */ Object.create(null);
    for (const [key, value] of this._cache) {
      data[key] = value;
    }
    return JSON.stringify(data);
  }
  _deserialize(raw) {
    try {
      const data = JSON.parse(raw);
      for (const key in data) {
        const state = data[key];
        if (typeof state.webviewOrigin === "string" && typeof state.height === "number") {
          this._cache.set(key, state);
        }
      }
    } catch {
    }
  }
};
ChatToolOutputStateCache = __decorate([
  __param(0, IStorageService)
], ChatToolOutputStateCache);
registerSingleton(
  IChatToolOutputStateCache,
  ChatToolOutputStateCache,
  1
  /* InstantiationType.Delayed */
);
export {
  ChatToolOutputStateCache,
  IChatToolOutputStateCache
};
//# sourceMappingURL=chatToolOutputStateCache.js.map
