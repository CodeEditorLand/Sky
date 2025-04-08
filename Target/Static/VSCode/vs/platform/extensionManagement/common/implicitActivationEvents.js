var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedError } from "../../../base/common/errors.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../extensions/common/extensions.js";
class ImplicitActivationEventsImpl {
  static {
    __name(this, "ImplicitActivationEventsImpl");
  }
  _generators = /* @__PURE__ */ new Map();
  _cache = /* @__PURE__ */ new WeakMap();
  register(extensionPointName, generator) {
    this._generators.set(extensionPointName, generator);
  }
  /**
   * This can run correctly only on the renderer process because that is the only place
   * where all extension points and all implicit activation events generators are known.
   */
  readActivationEvents(extensionDescription) {
    if (!this._cache.has(extensionDescription)) {
      this._cache.set(extensionDescription, this._readActivationEvents(extensionDescription));
    }
    return this._cache.get(extensionDescription);
  }
  /**
   * This can run correctly only on the renderer process because that is the only place
   * where all extension points and all implicit activation events generators are known.
   */
  createActivationEventsMap(extensionDescriptions) {
    const result = /* @__PURE__ */ Object.create(null);
    for (const extensionDescription of extensionDescriptions) {
      const activationEvents = this.readActivationEvents(extensionDescription);
      if (activationEvents.length > 0) {
        result[ExtensionIdentifier.toKey(extensionDescription.identifier)] = activationEvents;
      }
    }
    return result;
  }
  _readActivationEvents(desc) {
    if (typeof desc.main === "undefined" && typeof desc.browser === "undefined") {
      return [];
    }
    const activationEvents = Array.isArray(desc.activationEvents) ? desc.activationEvents.slice(0) : [];
    for (let i = 0; i < activationEvents.length; i++) {
      if (activationEvents[i] === "onUri") {
        activationEvents[i] = `onUri:${ExtensionIdentifier.toKey(desc.identifier)}`;
      }
    }
    if (!desc.contributes) {
      return activationEvents;
    }
    for (const extPointName in desc.contributes) {
      const generator = this._generators.get(extPointName);
      if (!generator) {
        continue;
      }
      const contrib = desc.contributes[extPointName];
      const contribArr = Array.isArray(contrib) ? contrib : [contrib];
      try {
        generator(contribArr, activationEvents);
      } catch (err) {
        onUnexpectedError(err);
      }
    }
    return activationEvents;
  }
}
const ImplicitActivationEvents = new ImplicitActivationEventsImpl();
export {
  ImplicitActivationEvents,
  ImplicitActivationEventsImpl
};
//# sourceMappingURL=implicitActivationEvents.js.map
