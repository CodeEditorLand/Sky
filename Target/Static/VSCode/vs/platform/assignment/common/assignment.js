var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as platform from "../../../base/common/platform.js";
const ASSIGNMENT_STORAGE_KEY = "VSCode.ABExp.FeatureData";
const ASSIGNMENT_REFETCH_INTERVAL = 0;
var TargetPopulation = /* @__PURE__ */ ((TargetPopulation2) => {
  TargetPopulation2["Insiders"] = "insider";
  TargetPopulation2["Public"] = "public";
  TargetPopulation2["Exploration"] = "exploration";
  return TargetPopulation2;
})(TargetPopulation || {});
var Filters = /* @__PURE__ */ ((Filters2) => {
  Filters2["Market"] = "X-MSEdge-Market";
  Filters2["CorpNet"] = "X-FD-Corpnet";
  Filters2["ApplicationVersion"] = "X-VSCode-AppVersion";
  Filters2["Build"] = "X-VSCode-Build";
  Filters2["ClientId"] = "X-MSEdge-ClientId";
  Filters2["ExtensionName"] = "X-VSCode-ExtensionName";
  Filters2["ExtensionVersion"] = "X-VSCode-ExtensionVersion";
  Filters2["Language"] = "X-VSCode-Language";
  Filters2["TargetPopulation"] = "X-VSCode-TargetPopulation";
  return Filters2;
})(Filters || {});
class AssignmentFilterProvider {
  constructor(version, appName, machineId, targetPopulation) {
    this.version = version;
    this.appName = appName;
    this.machineId = machineId;
    this.targetPopulation = targetPopulation;
  }
  static {
    __name(this, "AssignmentFilterProvider");
  }
  /**
   * Returns a version string that can be parsed by the TAS client.
   * The tas client cannot handle suffixes lke "-insider"
   * Ref: https://github.com/microsoft/tas-client/blob/30340d5e1da37c2789049fcf45928b954680606f/vscode-tas-client/src/vscode-tas-client/VSCodeFilterProvider.ts#L35
   *
   * @param version Version string to be trimmed.
  */
  static trimVersionSuffix(version) {
    const regex = /\-[a-zA-Z0-9]+$/;
    const result = version.split(regex);
    return result[0];
  }
  getFilterValue(filter) {
    switch (filter) {
      case "X-VSCode-AppVersion" /* ApplicationVersion */:
        return AssignmentFilterProvider.trimVersionSuffix(this.version);
      // productService.version
      case "X-VSCode-Build" /* Build */:
        return this.appName;
      // productService.nameLong
      case "X-MSEdge-ClientId" /* ClientId */:
        return this.machineId;
      case "X-VSCode-Language" /* Language */:
        return platform.language;
      case "X-VSCode-ExtensionName" /* ExtensionName */:
        return "vscode-core";
      // always return vscode-core for exp service
      case "X-VSCode-ExtensionVersion" /* ExtensionVersion */:
        return "999999.0";
      // always return a very large number for cross-extension experimentation
      case "X-VSCode-TargetPopulation" /* TargetPopulation */:
        return this.targetPopulation;
      default:
        return "";
    }
  }
  getFilters() {
    const filters = /* @__PURE__ */ new Map();
    const filterValues = Object.values(Filters);
    for (const value of filterValues) {
      filters.set(value, this.getFilterValue(value));
    }
    return filters;
  }
}
export {
  ASSIGNMENT_REFETCH_INTERVAL,
  ASSIGNMENT_STORAGE_KEY,
  AssignmentFilterProvider,
  Filters,
  TargetPopulation
};
//# sourceMappingURL=assignment.js.map
