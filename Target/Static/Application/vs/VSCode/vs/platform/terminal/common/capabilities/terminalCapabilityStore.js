var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { memoize } from "../../../../base/common/decorators.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
class TerminalCapabilityStore extends Disposable {
  static {
    __name(this, "TerminalCapabilityStore");
  }
  constructor() {
    super(...arguments);
    this._map = /* @__PURE__ */ new Map();
    this._onDidAddCapability = this._register(new Emitter());
    this._onDidRemoveCapability = this._register(new Emitter());
  }
  get onDidAddCapability() {
    return this._onDidAddCapability.event;
  }
  get onDidRemoveCapability() {
    return this._onDidRemoveCapability.event;
  }
  get onDidChangeCapabilities() {
    return Event.map(Event.any(this._onDidAddCapability.event, this._onDidRemoveCapability.event), () => void 0, this._store);
  }
  get onDidAddCommandDetectionCapability() {
    return Event.map(Event.filter(this.onDidAddCapability, (e) => e.id === 2, this._store), (e) => e.capability, this._store);
  }
  get onDidRemoveCommandDetectionCapability() {
    return Event.map(Event.filter(this.onDidRemoveCapability, (e) => e.id === 2, this._store), () => void 0, this._store);
  }
  get onDidAddCwdDetectionCapability() {
    return Event.map(Event.filter(this.onDidAddCapability, (e) => e.id === 0, this._store), (e) => e.capability, this._store);
  }
  get onDidRemoveCwdDetectionCapability() {
    return Event.map(Event.filter(this.onDidRemoveCapability, (e) => e.id === 0, this._store), () => void 0, this._store);
  }
  get items() {
    return this._map.keys();
  }
  createOnDidRemoveCapabilityOfTypeEvent(type) {
    return Event.map(Event.filter(this.onDidRemoveCapability, (e) => e.id === type), (e) => e.capability);
  }
  createOnDidAddCapabilityOfTypeEvent(type) {
    return Event.map(Event.filter(this.onDidAddCapability, (e) => e.id === type), (e) => e.capability);
  }
  add(capability, impl) {
    this._map.set(capability, impl);
    this._onDidAddCapability.fire(createCapabilityEvent(capability, impl));
  }
  get(capability) {
    return this._map.get(capability);
  }
  remove(capability) {
    const impl = this._map.get(capability);
    if (!impl) {
      return;
    }
    this._map.delete(capability);
    this._onDidRemoveCapability.fire(createCapabilityEvent(capability, impl));
  }
  has(capability) {
    return this._map.has(capability);
  }
}
__decorate([
  memoize
], TerminalCapabilityStore.prototype, "onDidChangeCapabilities", null);
__decorate([
  memoize
], TerminalCapabilityStore.prototype, "onDidAddCommandDetectionCapability", null);
__decorate([
  memoize
], TerminalCapabilityStore.prototype, "onDidRemoveCommandDetectionCapability", null);
__decorate([
  memoize
], TerminalCapabilityStore.prototype, "onDidAddCwdDetectionCapability", null);
__decorate([
  memoize
], TerminalCapabilityStore.prototype, "onDidRemoveCwdDetectionCapability", null);
class TerminalCapabilityStoreMultiplexer extends Disposable {
  static {
    __name(this, "TerminalCapabilityStoreMultiplexer");
  }
  constructor() {
    super(...arguments);
    this._stores = [];
    this._onDidAddCapability = this._register(new Emitter());
    this._onDidRemoveCapability = this._register(new Emitter());
  }
  get onDidAddCapability() {
    return this._onDidAddCapability.event;
  }
  get onDidRemoveCapability() {
    return this._onDidRemoveCapability.event;
  }
  get onDidChangeCapabilities() {
    return Event.map(Event.any(this._onDidAddCapability.event, this._onDidRemoveCapability.event), () => void 0, this._store);
  }
  get onDidAddCommandDetectionCapability() {
    return Event.map(Event.filter(this.onDidAddCapability, (e) => e.id === 2, this._store), (e) => e.capability, this._store);
  }
  get onDidRemoveCommandDetectionCapability() {
    return Event.map(Event.filter(this.onDidRemoveCapability, (e) => e.id === 2, this._store), () => void 0, this._store);
  }
  get onDidAddCwdDetectionCapability() {
    return Event.map(Event.filter(this.onDidAddCapability, (e) => e.id === 0, this._store), (e) => e.capability, this._store);
  }
  get onDidRemoveCwdDetectionCapability() {
    return Event.map(Event.filter(this.onDidRemoveCapability, (e) => e.id === 0, this._store), () => void 0, this._store);
  }
  get items() {
    return this._items();
  }
  createOnDidRemoveCapabilityOfTypeEvent(type) {
    return Event.map(Event.filter(this.onDidRemoveCapability, (e) => e.id === type), (e) => e.capability);
  }
  createOnDidAddCapabilityOfTypeEvent(type) {
    return Event.map(Event.filter(this.onDidAddCapability, (e) => e.id === type), (e) => e.capability);
  }
  *_items() {
    for (const store of this._stores) {
      for (const c of store.items) {
        yield c;
      }
    }
  }
  has(capability) {
    for (const store of this._stores) {
      for (const c of store.items) {
        if (c === capability) {
          return true;
        }
      }
    }
    return false;
  }
  get(capability) {
    for (const store of this._stores) {
      const c = store.get(capability);
      if (c) {
        return c;
      }
    }
    return void 0;
  }
  add(store) {
    this._stores.push(store);
    for (const capability of store.items) {
      this._onDidAddCapability.fire(createCapabilityEvent(capability, store.get(capability)));
    }
    this._register(store.onDidAddCapability((e) => this._onDidAddCapability.fire(e)));
    this._register(store.onDidRemoveCapability((e) => this._onDidRemoveCapability.fire(e)));
  }
}
__decorate([
  memoize
], TerminalCapabilityStoreMultiplexer.prototype, "onDidChangeCapabilities", null);
__decorate([
  memoize
], TerminalCapabilityStoreMultiplexer.prototype, "onDidAddCommandDetectionCapability", null);
__decorate([
  memoize
], TerminalCapabilityStoreMultiplexer.prototype, "onDidRemoveCommandDetectionCapability", null);
__decorate([
  memoize
], TerminalCapabilityStoreMultiplexer.prototype, "onDidAddCwdDetectionCapability", null);
__decorate([
  memoize
], TerminalCapabilityStoreMultiplexer.prototype, "onDidRemoveCwdDetectionCapability", null);
function createCapabilityEvent(capability, impl) {
  return { id: capability, capability: impl };
}
__name(createCapabilityEvent, "createCapabilityEvent");
export {
  TerminalCapabilityStore,
  TerminalCapabilityStoreMultiplexer
};
//# sourceMappingURL=terminalCapabilityStore.js.map
