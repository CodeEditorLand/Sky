import { CancellationToken } from "../../../base/common/cancellation.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IWorkspaceFolder } from "./workspace.js";
const IEditSessionIdentityService = createDecorator("editSessionIdentityService");
var EditSessionIdentityMatch = /* @__PURE__ */ ((EditSessionIdentityMatch2) => {
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["Complete"] = 100] = "Complete";
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["Partial"] = 50] = "Partial";
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["None"] = 0] = "None";
  return EditSessionIdentityMatch2;
})(EditSessionIdentityMatch || {});
export {
  EditSessionIdentityMatch,
  IEditSessionIdentityService
};
//# sourceMappingURL=editSessions.js.map
