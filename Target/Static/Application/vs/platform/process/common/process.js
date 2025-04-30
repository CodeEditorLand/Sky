import { createDecorator } from "../../instantiation/common/instantiation.js";
var IssueSource;
(function(IssueSource2) {
  IssueSource2["VSCode"] = "vscode";
  IssueSource2["Extension"] = "extension";
  IssueSource2["Marketplace"] = "marketplace";
})(IssueSource || (IssueSource = {}));
const IProcessMainService = createDecorator("processService");
export {
  IProcessMainService,
  IssueSource
};
//# sourceMappingURL=process.js.map
