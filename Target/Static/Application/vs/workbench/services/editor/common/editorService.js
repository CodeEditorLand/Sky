var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { isEditorGroup } from "./editorGroupsService.js";
const IEditorService = createDecorator("editorService");
const ACTIVE_GROUP = -1;
const SIDE_GROUP = -2;
const AUX_WINDOW_GROUP = -3;
function isPreferredGroup(obj) {
  const candidate = obj;
  return typeof obj === "number" || isEditorGroup(candidate);
}
__name(isPreferredGroup, "isPreferredGroup");
export {
  ACTIVE_GROUP,
  AUX_WINDOW_GROUP,
  IEditorService,
  SIDE_GROUP,
  isPreferredGroup
};
//# sourceMappingURL=editorService.js.map
