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
import { equals as arraysEqual } from "../../../../../base/common/arrays.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { Memento } from "../../../../common/memento.js";
import { CHAT_PROVIDER_ID } from "../participants/chatParticipantContribTypes.js";
import { ChatAgentLocation, ChatModeKind } from "../constants.js";
const IChatWidgetHistoryService = createDecorator("IChatWidgetHistoryService");
const ChatInputHistoryMaxEntries = 40;
let ChatWidgetHistoryService = class ChatWidgetHistoryService2 extends Disposable {
  static {
    __name(this, "ChatWidgetHistoryService");
  }
  constructor(storageService) {
    super();
    this._onDidChangeHistory = this._register(new Emitter());
    this.changed = false;
    this.onDidChangeHistory = this._onDidChangeHistory.event;
    this.memento = new Memento("interactive-session", storageService);
    const loadedState = this.memento.getMemento(
      1,
      1
      /* StorageTarget.MACHINE */
    );
    this.viewState = loadedState;
    this._register(storageService.onWillSaveState(() => {
      if (this.changed) {
        this.memento.saveMemento();
        this.changed = false;
      }
    }));
  }
  getHistory(location) {
    const key = this.getKey(location);
    const history = this.viewState.history?.[key] ?? [];
    return history.map((entry) => this.migrateHistoryEntry(entry));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  migrateHistoryEntry(entry) {
    if (entry.inputText !== void 0) {
      return entry;
    }
    const oldEntry = entry;
    const oldState = oldEntry.state ?? {};
    let modeId;
    let modeKind;
    if (oldState.chatMode) {
      if (typeof oldState.chatMode === "string") {
        modeId = oldState.chatMode;
        modeKind = Object.values(ChatModeKind).includes(oldState.chatMode) ? oldState.chatMode : void 0;
      } else if (typeof oldState.chatMode === "object" && oldState.chatMode !== null) {
        const oldMode = oldState.chatMode;
        modeId = oldMode.id ?? ChatModeKind.Ask;
        modeKind = oldMode.id && Object.values(ChatModeKind).includes(oldMode.id) ? oldMode.id : void 0;
      } else {
        modeId = ChatModeKind.Ask;
        modeKind = ChatModeKind.Ask;
      }
    } else {
      modeId = ChatModeKind.Ask;
      modeKind = ChatModeKind.Ask;
    }
    return {
      inputText: oldEntry.text ?? "",
      attachments: oldState.chatContextAttachments ?? [],
      mode: {
        id: modeId,
        kind: modeKind
      },
      contrib: oldEntry.state || {},
      selectedModel: void 0,
      selections: []
    };
  }
  getKey(location) {
    return location === ChatAgentLocation.Chat ? CHAT_PROVIDER_ID : location;
  }
  append(location, history) {
    this.viewState.history ??= {};
    const key = this.getKey(location);
    this.viewState.history[key] = this.getHistory(location).concat(history).slice(-ChatInputHistoryMaxEntries);
    this.changed = true;
    this._onDidChangeHistory.fire({ kind: "append", entry: history });
  }
  clearHistory() {
    this.viewState.history = {};
    this.changed = true;
    this._onDidChangeHistory.fire({ kind: "clear" });
  }
};
ChatWidgetHistoryService = __decorate([
  __param(0, IStorageService)
], ChatWidgetHistoryService);
let ChatHistoryNavigator = class ChatHistoryNavigator2 extends Disposable {
  static {
    __name(this, "ChatHistoryNavigator");
  }
  get values() {
    return this.chatWidgetHistoryService.getHistory(this.location);
  }
  constructor(location, chatWidgetHistoryService) {
    super();
    this.location = location;
    this.chatWidgetHistoryService = chatWidgetHistoryService;
    this._overlay = [];
    this._history = this.chatWidgetHistoryService.getHistory(this.location);
    this._currentIndex = this._history.length;
    this._register(this.chatWidgetHistoryService.onDidChangeHistory((e) => {
      if (e.kind === "append") {
        const prevLength = this._history.length;
        this._history = this.chatWidgetHistoryService.getHistory(this.location);
        const newLength = this._history.length;
        if (prevLength === newLength) {
          this._overlay.shift();
          if (this._currentIndex < this._history.length) {
            this._currentIndex = Math.max(this._currentIndex - 1, 0);
          }
        } else if (this._currentIndex === prevLength) {
          this._currentIndex = newLength;
        }
      } else if (e.kind === "clear") {
        this._history = [];
        this._currentIndex = 0;
        this._overlay = [];
      }
    }));
  }
  isAtEnd() {
    return this._currentIndex === Math.max(this._history.length, this._overlay.length);
  }
  isAtStart() {
    return this._currentIndex === 0;
  }
  /**
   * Replaces a history entry at the current index in this view of the history.
   * Allows editing of old history entries while preventing accidental navigation
   * from losing the edits.
   */
  overlay(entry) {
    this._overlay[this._currentIndex] = entry;
  }
  resetCursor() {
    this._currentIndex = this._history.length;
  }
  previous() {
    this._currentIndex = Math.max(this._currentIndex - 1, 0);
    return this.current();
  }
  next() {
    this._currentIndex = Math.min(this._currentIndex + 1, this._history.length);
    return this.current();
  }
  current() {
    return this._overlay[this._currentIndex] ?? this._history[this._currentIndex];
  }
  /**
   * Appends a new entry to the navigator. Resets the state back to the end
   * and clears any overlayed entries.
   */
  append(entry) {
    this._overlay = [];
    this._currentIndex = this._history.length;
    if (!entriesEqual(this._history.at(-1), entry)) {
      this.chatWidgetHistoryService.append(this.location, entry);
    }
  }
};
ChatHistoryNavigator = __decorate([
  __param(1, IChatWidgetHistoryService)
], ChatHistoryNavigator);
function entriesEqual(a, b) {
  if (!a || !b) {
    return false;
  }
  if (a.inputText !== b.inputText) {
    return false;
  }
  if (!arraysEqual(a.attachments, b.attachments, (x, y) => x.id === y.id)) {
    return false;
  }
  return true;
}
__name(entriesEqual, "entriesEqual");
export {
  ChatHistoryNavigator,
  ChatInputHistoryMaxEntries,
  ChatWidgetHistoryService,
  IChatWidgetHistoryService
};
//# sourceMappingURL=chatWidgetHistoryService.js.map
