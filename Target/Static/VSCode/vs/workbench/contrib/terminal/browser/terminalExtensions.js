var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BrandedService, IConstructorSignature } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IDetachedTerminalInstance, ITerminalContribution, ITerminalInstance } from "./terminal.js";
import { TerminalWidgetManager } from "./widgets/widgetManager.js";
import { ITerminalProcessInfo, ITerminalProcessManager } from "../common/terminal.js";
function registerTerminalContribution(id, ctor, canRunInDetachedTerminals = false) {
  TerminalContributionRegistry.INSTANCE.registerTerminalContribution({ id, ctor, canRunInDetachedTerminals });
}
__name(registerTerminalContribution, "registerTerminalContribution");
var TerminalExtensionsRegistry;
((TerminalExtensionsRegistry2) => {
  function getTerminalContributions() {
    return TerminalContributionRegistry.INSTANCE.getTerminalContributions();
  }
  TerminalExtensionsRegistry2.getTerminalContributions = getTerminalContributions;
  __name(getTerminalContributions, "getTerminalContributions");
})(TerminalExtensionsRegistry || (TerminalExtensionsRegistry = {}));
class TerminalContributionRegistry {
  static {
    __name(this, "TerminalContributionRegistry");
  }
  static INSTANCE = new TerminalContributionRegistry();
  _terminalContributions = [];
  constructor() {
  }
  registerTerminalContribution(description) {
    this._terminalContributions.push(description);
  }
  getTerminalContributions() {
    return this._terminalContributions.slice(0);
  }
}
var Extensions = /* @__PURE__ */ ((Extensions2) => {
  Extensions2["TerminalContributions"] = "terminal.contributions";
  return Extensions2;
})(Extensions || {});
Registry.add("terminal.contributions" /* TerminalContributions */, TerminalContributionRegistry.INSTANCE);
export {
  TerminalExtensionsRegistry,
  registerTerminalContribution
};
//# sourceMappingURL=terminalExtensions.js.map
