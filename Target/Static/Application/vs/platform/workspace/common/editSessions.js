import { createDecorator } from "../../instantiation/common/instantiation.js";
const IEditSessionIdentityService = createDecorator("editSessionIdentityService");
var EditSessionIdentityMatch;
(function(EditSessionIdentityMatch2) {
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["Complete"] = 100] = "Complete";
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["Partial"] = 50] = "Partial";
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["None"] = 0] = "None";
})(EditSessionIdentityMatch || (EditSessionIdentityMatch = {}));
export {
  EditSessionIdentityMatch,
  IEditSessionIdentityService
};
//# sourceMappingURL=editSessions.js.map
