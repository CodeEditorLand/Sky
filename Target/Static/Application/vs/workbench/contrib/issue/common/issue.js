import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
var IssueType;
(function(IssueType2) {
  IssueType2[IssueType2["Bug"] = 0] = "Bug";
  IssueType2[IssueType2["PerformanceIssue"] = 1] = "PerformanceIssue";
  IssueType2[IssueType2["FeatureRequest"] = 2] = "FeatureRequest";
})(IssueType || (IssueType = {}));
var IssueSource;
(function(IssueSource2) {
  IssueSource2["VSCode"] = "vscode";
  IssueSource2["Extension"] = "extension";
  IssueSource2["Marketplace"] = "marketplace";
})(IssueSource || (IssueSource = {}));
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
