import { localize } from "../../nls.js";
const LINUX_SYSTEM_POLICY_FILE_PATH = "/etc/vscode/policy.json";
var PolicyCategory;
(function(PolicyCategory2) {
  PolicyCategory2["Extensions"] = "Extensions";
  PolicyCategory2["IntegratedTerminal"] = "IntegratedTerminal";
  PolicyCategory2["InteractiveSession"] = "InteractiveSession";
  PolicyCategory2["Telemetry"] = "Telemetry";
  PolicyCategory2["Update"] = "Update";
})(PolicyCategory || (PolicyCategory = {}));
const PolicyCategoryData = {
  [PolicyCategory.Extensions]: {
    name: {
      key: "extensionsConfigurationTitle",
      value: localize("extensionsConfigurationTitle", "Extensions")
    }
  },
  [PolicyCategory.IntegratedTerminal]: {
    name: {
      key: "terminalIntegratedConfigurationTitle",
      value: localize("terminalIntegratedConfigurationTitle", "Integrated Terminal")
    }
  },
  [PolicyCategory.InteractiveSession]: {
    name: {
      key: "interactiveSessionConfigurationTitle",
      value: localize("interactiveSessionConfigurationTitle", "Chat")
    }
  },
  [PolicyCategory.Telemetry]: {
    name: {
      key: "telemetryConfigurationTitle",
      value: localize("telemetryConfigurationTitle", "Telemetry")
    }
  },
  [PolicyCategory.Update]: {
    name: {
      key: "updateConfigurationTitle",
      value: localize("updateConfigurationTitle", "Update")
    }
  }
};
export {
  LINUX_SYSTEM_POLICY_FILE_PATH,
  PolicyCategory,
  PolicyCategoryData
};
//# sourceMappingURL=policy.js.map
