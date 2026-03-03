import { createDecorator } from "../../instantiation/common/instantiation.js";
var WorkspaceTrustScope;
(function(WorkspaceTrustScope2) {
  WorkspaceTrustScope2[WorkspaceTrustScope2["Local"] = 0] = "Local";
  WorkspaceTrustScope2[WorkspaceTrustScope2["Remote"] = 1] = "Remote";
})(WorkspaceTrustScope || (WorkspaceTrustScope = {}));
const IWorkspaceTrustEnablementService = createDecorator("workspaceTrustEnablementService");
const IWorkspaceTrustManagementService = createDecorator("workspaceTrustManagementService");
var WorkspaceTrustUriResponse;
(function(WorkspaceTrustUriResponse2) {
  WorkspaceTrustUriResponse2[WorkspaceTrustUriResponse2["Open"] = 1] = "Open";
  WorkspaceTrustUriResponse2[WorkspaceTrustUriResponse2["OpenInNewWindow"] = 2] = "OpenInNewWindow";
  WorkspaceTrustUriResponse2[WorkspaceTrustUriResponse2["Cancel"] = 3] = "Cancel";
})(WorkspaceTrustUriResponse || (WorkspaceTrustUriResponse = {}));
const IWorkspaceTrustRequestService = createDecorator("workspaceTrustRequestService");
export {
  IWorkspaceTrustEnablementService,
  IWorkspaceTrustManagementService,
  IWorkspaceTrustRequestService,
  WorkspaceTrustScope,
  WorkspaceTrustUriResponse
};
//# sourceMappingURL=workspaceTrust.js.map
