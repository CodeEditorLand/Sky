var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ISearchTreeFileMatch } from "../searchTreeModel/searchTreeCommon.js";
import { Range } from "../../../../../editor/common/core/range.js";
function isSearchTreeAIFileMatch(obj) {
  return obj && obj.getFullRange && obj.getFullRange() instanceof Range;
}
__name(isSearchTreeAIFileMatch, "isSearchTreeAIFileMatch");
export {
  isSearchTreeAIFileMatch
};
//# sourceMappingURL=aiSearchModelBase.js.map
