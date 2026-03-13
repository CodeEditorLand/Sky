var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as platform from "../../../base/common/platform.js";
const ASSIGNMENT_STORAGE_KEY = "VSCode.ABExp.FeatureData";
const ASSIGNMENT_REFETCH_INTERVAL = 60 * 60 * 1e3;
var TargetPopulation;
(function(TargetPopulation2) {
  TargetPopulation2["Insiders"] = "insider";
  TargetPopulation2["Public"] = "public";
  TargetPopulation2["Exploration"] = "exploration";
})(TargetPopulation || (TargetPopulation = {}));
var Filters;
(function(Filters2) {
  Filters2["Market"] = "X-MSEdge-Market";
  Filters2["CorpNet"] = "X-FD-Corpnet";
  Filters2["ApplicationVersion"] = "X-VSCode-AppVersion";
  Filters2["Build"] = "X-VSCode-Build";
  Filters2["ClientId"] = "X-MSEdge-ClientId";
  Filters2["DeveloperDeviceId"] = "X-VSCode-DevDeviceId";
  Filters2["ExtensionName"] = "X-VSCode-ExtensionName";
  Filters2["ExtensionVersion"] = "X-VSCode-ExtensionVersion";
  Filters2["Language"] = "X-VSCode-Language";
  Filters2["TargetPopulation"] = "X-VSCode-TargetPopulation";
  Filters2["Platform"] = "X-VSCode-Platform";
  Filters2["ReleaseDate"] = "X-VSCode-ReleaseDate";
})(Filters || (Filters = {}));
class AssignmentFilterProvider {
  static {
    __name(this, "AssignmentFilterProvider");
  }
  constructor(version, appName, machineId, devDeviceId, targetPopulation, releaseDate) {
    this.version = version;
    this.appName = appName;
    this.machineId = machineId;
    this.devDeviceId = devDeviceId;
    this.targetPopulation = targetPopulation;
    this.releaseDate = releaseDate;
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
      case Filters.ApplicationVersion:
        return AssignmentFilterProvider.trimVersionSuffix(this.version);
      // productService.version
      case Filters.Build:
        return this.appName;
      // productService.nameLong
      case Filters.ClientId:
        return this.machineId;
      case Filters.DeveloperDeviceId:
        return this.devDeviceId;
      case Filters.Language:
        return platform.language;
      case Filters.ExtensionName:
        return "vscode-core";
      // always return vscode-core for exp service
      case Filters.ExtensionVersion:
        return "999999.0";
      // always return a very large number for cross-extension experimentation
      case Filters.TargetPopulation:
        return this.targetPopulation;
      case Filters.Platform:
        return platform.PlatformToString(platform.platform);
      case Filters.ReleaseDate:
        return AssignmentFilterProvider.formatReleaseDate(this.releaseDate);
      default:
        return "";
    }
  }
  static formatReleaseDate(iso) {
    if (!iso) {
      return "";
    }
    const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2})/.exec(iso);
    if (!match) {
      return "";
    }
    return match.slice(1, 5).join("");
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
function getInternalOrg(organisations) {
  const isVSCodeInternal = organisations?.includes("Visual-Studio-Code");
  const isGitHubInternal = organisations?.includes("github");
  const isMicrosoftInternal = organisations?.includes("microsoft") || organisations?.includes("ms-copilot") || organisations?.includes("MicrosoftCopilot");
  return isVSCodeInternal ? "vscode" : isGitHubInternal ? "github" : isMicrosoftInternal ? "microsoft" : void 0;
}
__name(getInternalOrg, "getInternalOrg");
export {
  ASSIGNMENT_REFETCH_INTERVAL,
  ASSIGNMENT_STORAGE_KEY,
  AssignmentFilterProvider,
  Filters,
  TargetPopulation,
  getInternalOrg
};
//# sourceMappingURL=assignment.js.map
