var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { Emitter } from "vs/base/common/event.js";
import { ResolveConfiguration } from "./Orchestrate/ResolveConfiguration.js";
const GetValueFromObject = /* @__PURE__ */ __name((ConfigurationObject, Key) => {
  if (typeof ConfigurationObject !== "object" || ConfigurationObject === null) {
    return void 0;
  }
  return Key.split(".").reduce(
    (current, part) => current ? current[part] : void 0,
    ConfigurationObject
  );
}, "GetValueFromObject");
const Definition = Effect.gen(function* (_) {
  const ConfigurationData = yield* _(ResolveConfiguration);
  const Service = {
    _serviceBrand: void 0,
    /**
     * Gets a configuration value.
     */
    getValue(section, overrides) {
      if (!section) {
        return ConfigurationData;
      }
      return GetValueFromObject(ConfigurationData, section);
    },
    // --- Stubs for read-write and complex inspection methods ---
    // A full implementation would require RPC calls to Mountain.
    updateValue: /* @__PURE__ */ __name(() => Promise.resolve(), "updateValue"),
    inspect: /* @__PURE__ */ __name((key, overrides) => {
      const value = Service.getValue(key, overrides);
      return {
        key,
        value,
        defaultValue: value,
        // Stub
        userValue: value,
        // Stub
        workspaceValue: value,
        // Stub
        workspaceFolderValue: value
        // Stub
      };
    }, "inspect"),
    keys: /* @__PURE__ */ __name(() => ({
      default: [],
      user: [],
      workspace: [],
      workspaceFolder: []
    }), "keys"),
    reloadConfiguration: /* @__PURE__ */ __name(() => Promise.resolve(), "reloadConfiguration"),
    onDidChangeConfiguration: new Emitter().event
  };
  return Service;
});
var Definition_default = Definition;
export {
  Definition_default as default
};
//# sourceMappingURL=Definition.js.map
