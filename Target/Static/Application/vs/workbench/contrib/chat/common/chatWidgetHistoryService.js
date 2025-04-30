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
import { Emitter } from "../../../../base/common/event.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { Memento } from "../../../common/memento.js";
import { CHAT_PROVIDER_ID } from "./chatParticipantContribTypes.js";
import { ChatAgentLocation } from "./constants.js";
const IChatWidgetHistoryService = createDecorator("IChatWidgetHistoryService");
const ChatInputHistoryMaxEntries = 40;
let ChatWidgetHistoryService = class ChatWidgetHistoryService2 {
  static {
    __name(this, "ChatWidgetHistoryService");
  }
  constructor(storageService) {
    this._onDidClearHistory = new Emitter();
    this.onDidClearHistory = this._onDidClearHistory.event;
    this.memento = new Memento("interactive-session", storageService);
    const loadedState = this.memento.getMemento(
      1,
      1
      /* StorageTarget.MACHINE */
    );
    for (const provider in loadedState.history) {
      loadedState.history[provider] = loadedState.history[provider].map((entry) => typeof entry === "string" ? { text: entry } : entry);
    }
    this.viewState = loadedState;
  }
  getHistory(location) {
    const key = this.getKey(location);
    return this.viewState.history?.[key] ?? [];
  }
  getKey(location) {
    return location === ChatAgentLocation.Panel ? CHAT_PROVIDER_ID : location;
  }
  saveHistory(location, history) {
    if (!this.viewState.history) {
      this.viewState.history = {};
    }
    const key = this.getKey(location);
    this.viewState.history[key] = history.slice(-ChatInputHistoryMaxEntries);
    this.memento.saveMemento();
  }
  clearHistory() {
    this.viewState.history = {};
    this.memento.saveMemento();
    this._onDidClearHistory.fire();
  }
};
ChatWidgetHistoryService = __decorate([
  __param(0, IStorageService)
], ChatWidgetHistoryService);
export {
  ChatInputHistoryMaxEntries,
  ChatWidgetHistoryService,
  IChatWidgetHistoryService
};
//# sourceMappingURL=chatWidgetHistoryService.js.map
