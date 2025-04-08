var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Emitter, Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { Memento } from "../../../common/memento.js";
import { ModifiedFileEntryState } from "./chatEditingService.js";
import { IChatRequestVariableEntry } from "./chatModel.js";
import { CHAT_PROVIDER_ID } from "./chatParticipantContribTypes.js";
import { ChatAgentLocation, ChatMode } from "./constants.js";
const IChatWidgetHistoryService = createDecorator("IChatWidgetHistoryService");
const ChatInputHistoryMaxEntries = 40;
let ChatWidgetHistoryService = class {
  static {
    __name(this, "ChatWidgetHistoryService");
  }
  _serviceBrand;
  memento;
  viewState;
  _onDidClearHistory = new Emitter();
  onDidClearHistory = this._onDidClearHistory.event;
  constructor(storageService) {
    this.memento = new Memento("interactive-session", storageService);
    const loadedState = this.memento.getMemento(StorageScope.WORKSPACE, StorageTarget.MACHINE);
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
ChatWidgetHistoryService = __decorateClass([
  __decorateParam(0, IStorageService)
], ChatWidgetHistoryService);
export {
  ChatInputHistoryMaxEntries,
  ChatWidgetHistoryService,
  IChatWidgetHistoryService
};
//# sourceMappingURL=chatWidgetHistoryService.js.map
