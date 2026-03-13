var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../../base/common/uri.js";
function isChatViewTitleActionContext(obj) {
  return !!obj && URI.isUri(obj.sessionResource) && obj.$mid === 19;
}
__name(isChatViewTitleActionContext, "isChatViewTitleActionContext");
export {
  isChatViewTitleActionContext
};
//# sourceMappingURL=chatActions.js.map
