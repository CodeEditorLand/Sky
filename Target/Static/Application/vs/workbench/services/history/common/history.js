import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IHistoryService = createDecorator("historyService");
var GoFilter;
(function(GoFilter2) {
  GoFilter2[GoFilter2["NONE"] = 0] = "NONE";
  GoFilter2[GoFilter2["EDITS"] = 1] = "EDITS";
  GoFilter2[GoFilter2["NAVIGATION"] = 2] = "NAVIGATION";
})(GoFilter || (GoFilter = {}));
var GoScope;
(function(GoScope2) {
  GoScope2[GoScope2["DEFAULT"] = 0] = "DEFAULT";
  GoScope2[GoScope2["EDITOR_GROUP"] = 1] = "EDITOR_GROUP";
  GoScope2[GoScope2["EDITOR"] = 2] = "EDITOR";
})(GoScope || (GoScope = {}));
export {
  GoFilter,
  GoScope,
  IHistoryService
};
//# sourceMappingURL=history.js.map
