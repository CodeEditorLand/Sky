import { UriComponents } from "../../../../base/common/uri.js";
import { ISandboxConfiguration } from "../../../../base/parts/sandbox/common/sandboxTypes.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
var IssueType = /* @__PURE__ */ ((IssueType2) => {
  IssueType2[IssueType2["Bug"] = 0] = "Bug";
  IssueType2[IssueType2["PerformanceIssue"] = 1] = "PerformanceIssue";
  IssueType2[IssueType2["FeatureRequest"] = 2] = "FeatureRequest";
  return IssueType2;
})(IssueType || {});
var IssueSource = /* @__PURE__ */ ((IssueSource2) => {
  IssueSource2["VSCode"] = "vscode";
  IssueSource2["Extension"] = "extension";
  IssueSource2["Marketplace"] = "marketplace";
  return IssueSource2;
})(IssueSource || {});
const IIssueFormService = createDecorator("issueFormService");
const IWorkbenchIssueService = createDecorator("workbenchIssueService");
const IWorkbenchProcessService = createDecorator("workbenchProcessService");
export {
  IIssueFormService,
  IWorkbenchIssueService,
  IWorkbenchProcessService,
  IssueSource,
  IssueType
};
//# sourceMappingURL=issue.js.map
