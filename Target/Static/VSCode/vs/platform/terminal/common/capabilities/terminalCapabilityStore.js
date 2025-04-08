var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ITerminalCapabilityImplMap, ITerminalCapabilityStore, TerminalCapability, TerminalCapabilityChangeEvent } from "./capabilities.js";
class TerminalCapabilityStore extends Disposable {
  static {
    __name(this, "TerminalCapabilityStore");
  }
  _map = /* @__PURE__ */ new Map();
  _onDidRemoveCapabilityType = this._register(new Emitter());
  onDidRemoveCapabilityType = this._onDidRemoveCapabilityType.event;
  _onDidAddCapabilityType = this._register(new Emitter());
  onDidAddCapabilityType = this._onDidAddCapabilityType.event;
  _onDidRemoveCapability = this._register(new Emitter());
  onDidRemoveCapability = this._onDidRemoveCapability.event;
  _onDidAddCapability = this._register(new Emitter());
  onDidAddCapability = this._onDidAddCapability.event;
  get items() {
    return this._map.keys();
  }
  add(capability, impl) {
    this._map.set(capability, impl);
    this._onDidAddCapabilityType.fire(capability);
    this._onDidAddCapability.fire({ id: capability, capability: impl });
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
    this._onDidRemoveCapabilityType.fire(capability);
    this._onDidAddCapability.fire({ id: capability, capability: impl });
  }
  has(capability) {
    return this._map.has(capability);
  }
}
class TerminalCapabilityStoreMultiplexer extends Disposable {
  static {
    __name(this, "TerminalCapabilityStoreMultiplexer");
  }
  _stores = [];
  _onDidRemoveCapabilityType = this._register(new Emitter());
  onDidRemoveCapabilityType = this._onDidRemoveCapabilityType.event;
  _onDidAddCapabilityType = this._register(new Emitter());
  onDidAddCapabilityType = this._onDidAddCapabilityType.event;
  _onDidRemoveCapability = this._register(new Emitter());
  onDidRemoveCapability = this._onDidRemoveCapability.event;
  _onDidAddCapability = this._register(new Emitter());
  onDidAddCapability = this._onDidAddCapability.event;
  get items() {
    return this._items();
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
      this._onDidAddCapabilityType.fire(capability);
      this._onDidAddCapability.fire({ id: capability, capability: store.get(capability) });
    }
    this._register(store.onDidAddCapabilityType((e) => this._onDidAddCapabilityType.fire(e)));
    this._register(store.onDidAddCapability((e) => this._onDidAddCapability.fire(e)));
    this._register(store.onDidRemoveCapabilityType((e) => this._onDidRemoveCapabilityType.fire(e)));
    this._register(store.onDidRemoveCapability((e) => this._onDidRemoveCapability.fire(e)));
  }
}
export {
  TerminalCapabilityStore,
  TerminalCapabilityStoreMultiplexer
};
//# sourceMappingURL=terminalCapabilityStore.js.map
