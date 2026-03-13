var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { DebugLocation, derivedOpts, observableFromEvent, observableFromEventOpts } from "../../../base/common/observable.js";
function observableConfigValue(key, defaultValue, configurationService, debugLocation = DebugLocation.ofCaller()) {
  return observableFromEventOpts({ debugName: /* @__PURE__ */ __name(() => `Configuration Key "${key}"`, "debugName") }, (handleChange) => configurationService.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(key)) {
      handleChange(e);
    }
  }), () => configurationService.getValue(key) ?? defaultValue, debugLocation);
}
__name(observableConfigValue, "observableConfigValue");
function bindContextKey(key, service, computeValue, debugLocation = DebugLocation.ofCaller()) {
  const boundKey = key.bindTo(service);
  const store = new DisposableStore();
  derivedOpts({ debugName: /* @__PURE__ */ __name(() => `Set Context Key "${key.key}"`, "debugName") }, (reader) => {
    const value = computeValue(reader);
    boundKey.set(value);
    return value;
  }, debugLocation).recomputeInitiallyAndOnChange(store);
  return store;
}
__name(bindContextKey, "bindContextKey");
function observableContextKey(key, contextKeyService, debugLocation = DebugLocation.ofCaller()) {
  return observableFromEvent(void 0, contextKeyService.onDidChangeContext, () => contextKeyService.getContextKeyValue(key), debugLocation);
}
__name(observableContextKey, "observableContextKey");
export {
  bindContextKey,
  observableConfigValue,
  observableContextKey
};
//# sourceMappingURL=platformObservableUtils.js.map
