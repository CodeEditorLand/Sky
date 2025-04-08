import { IStringDictionary } from "../../../../../base/common/collections.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationPropertySchema } from "../../../../../platform/configuration/common/configurationRegistry.js";
var TerminalInitialHintSettingId = /* @__PURE__ */ ((TerminalInitialHintSettingId2) => {
  TerminalInitialHintSettingId2["Enabled"] = "terminal.integrated.initialHint";
  return TerminalInitialHintSettingId2;
})(TerminalInitialHintSettingId || {});
const terminalInitialHintConfiguration = {
  ["terminal.integrated.initialHint" /* Enabled */]: {
    restricted: true,
    markdownDescription: localize("terminal.integrated.initialHint", "Controls if the first terminal without input will show a hint about available actions when it is focused."),
    type: "boolean",
    default: true
  }
};
export {
  TerminalInitialHintSettingId,
  terminalInitialHintConfiguration
};
//# sourceMappingURL=terminalInitialHintConfiguration.js.map
