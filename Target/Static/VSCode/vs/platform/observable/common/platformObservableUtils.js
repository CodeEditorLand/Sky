var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../base/common/lifecycle.js";
import { autorunOpts, IObservable, IReader, observableFromEventOpts } from "../../../base/common/observable.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { ContextKeyValue, IContextKeyService, RawContextKey } from "../../contextkey/common/contextkey.js";
function observableConfigValue(key, defaultValue, configurationService) {
  return observableFromEventOpts(
    { debugName: /* @__PURE__ */ __name(() => `Configuration Key "${key}"`, "debugName") },
    (handleChange) => configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(key)) {
        handleChange(e);
      }
    }),
    () => configurationService.getValue(key) ?? defaultValue
  );
}
__name(observableConfigValue, "observableConfigValue");
function bindContextKey(key, service, computeValue) {
  const boundKey = key.bindTo(service);
  return autorunOpts({ debugName: /* @__PURE__ */ __name(() => `Set Context Key "${key.key}"`, "debugName") }, (reader) => {
    boundKey.set(computeValue(reader));
  });
}
__name(bindContextKey, "bindContextKey");
export {
  bindContextKey,
  observableConfigValue
};
//# sourceMappingURL=platformObservableUtils.js.map
