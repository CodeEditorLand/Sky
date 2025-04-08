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
import { IHistory } from "../../../../base/common/history.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
let ReplaceWidgetHistory = class {
  constructor(storageService) {
    this.storageService = storageService;
    this._onDidChangeEmitter = new Emitter();
    this.onDidChange = this._onDidChangeEmitter.event;
    this.load();
  }
  static {
    __name(this, "ReplaceWidgetHistory");
  }
  static FIND_HISTORY_KEY = "workbench.replace.history";
  inMemoryValues = /* @__PURE__ */ new Set();
  onDidChange;
  _onDidChangeEmitter;
  static _instance = null;
  static getOrCreate(storageService) {
    if (!ReplaceWidgetHistory._instance) {
      ReplaceWidgetHistory._instance = new ReplaceWidgetHistory(storageService);
    }
    return ReplaceWidgetHistory._instance;
  }
  delete(t) {
    const result = this.inMemoryValues.delete(t);
    this.save();
    return result;
  }
  add(t) {
    this.inMemoryValues.add(t);
    this.save();
    return this;
  }
  has(t) {
    return this.inMemoryValues.has(t);
  }
  clear() {
    this.inMemoryValues.clear();
    this.save();
  }
  forEach(callbackfn, thisArg) {
    this.load();
    return this.inMemoryValues.forEach(callbackfn);
  }
  replace(t) {
    this.inMemoryValues = new Set(t);
    this.save();
  }
  load() {
    let result;
    const raw = this.storageService.get(
      ReplaceWidgetHistory.FIND_HISTORY_KEY,
      StorageScope.WORKSPACE
    );
    if (raw) {
      try {
        result = JSON.parse(raw);
      } catch (e) {
      }
    }
    this.inMemoryValues = new Set(result || []);
  }
  // Run saves async
  save() {
    const elements = [];
    this.inMemoryValues.forEach((e) => elements.push(e));
    return new Promise((resolve) => {
      this.storageService.store(
        ReplaceWidgetHistory.FIND_HISTORY_KEY,
        JSON.stringify(elements),
        StorageScope.WORKSPACE,
        StorageTarget.USER
      );
      this._onDidChangeEmitter.fire(elements);
      resolve();
    });
  }
};
ReplaceWidgetHistory = __decorateClass([
  __decorateParam(0, IStorageService)
], ReplaceWidgetHistory);
export {
  ReplaceWidgetHistory
};
//# sourceMappingURL=replaceWidgetHistory.js.map
