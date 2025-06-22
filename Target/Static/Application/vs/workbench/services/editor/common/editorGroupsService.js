var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { isEditorInput } from "../../../common/editor.js";
const IEditorGroupsService = createDecorator("editorGroupsService");
var GroupDirection;
(function(GroupDirection2) {
  GroupDirection2[GroupDirection2["UP"] = 0] = "UP";
  GroupDirection2[GroupDirection2["DOWN"] = 1] = "DOWN";
  GroupDirection2[GroupDirection2["LEFT"] = 2] = "LEFT";
  GroupDirection2[GroupDirection2["RIGHT"] = 3] = "RIGHT";
})(GroupDirection || (GroupDirection = {}));
var GroupOrientation;
(function(GroupOrientation2) {
  GroupOrientation2[GroupOrientation2["HORIZONTAL"] = 0] = "HORIZONTAL";
  GroupOrientation2[GroupOrientation2["VERTICAL"] = 1] = "VERTICAL";
})(GroupOrientation || (GroupOrientation = {}));
var GroupLocation;
(function(GroupLocation2) {
  GroupLocation2[GroupLocation2["FIRST"] = 0] = "FIRST";
  GroupLocation2[GroupLocation2["LAST"] = 1] = "LAST";
  GroupLocation2[GroupLocation2["NEXT"] = 2] = "NEXT";
  GroupLocation2[GroupLocation2["PREVIOUS"] = 3] = "PREVIOUS";
})(GroupLocation || (GroupLocation = {}));
var GroupsArrangement;
(function(GroupsArrangement2) {
  GroupsArrangement2[GroupsArrangement2["MAXIMIZE"] = 0] = "MAXIMIZE";
  GroupsArrangement2[GroupsArrangement2["EXPAND"] = 1] = "EXPAND";
  GroupsArrangement2[GroupsArrangement2["EVEN"] = 2] = "EVEN";
})(GroupsArrangement || (GroupsArrangement = {}));
var MergeGroupMode;
(function(MergeGroupMode2) {
  MergeGroupMode2[MergeGroupMode2["COPY_EDITORS"] = 0] = "COPY_EDITORS";
  MergeGroupMode2[MergeGroupMode2["MOVE_EDITORS"] = 1] = "MOVE_EDITORS";
})(MergeGroupMode || (MergeGroupMode = {}));
function isEditorReplacement(replacement) {
  const candidate = replacement;
  return isEditorInput(candidate?.editor) && isEditorInput(candidate?.replacement);
}
__name(isEditorReplacement, "isEditorReplacement");
var GroupsOrder;
(function(GroupsOrder2) {
  GroupsOrder2[GroupsOrder2["CREATION_TIME"] = 0] = "CREATION_TIME";
  GroupsOrder2[GroupsOrder2["MOST_RECENTLY_ACTIVE"] = 1] = "MOST_RECENTLY_ACTIVE";
  GroupsOrder2[GroupsOrder2["GRID_APPEARANCE"] = 2] = "GRID_APPEARANCE";
})(GroupsOrder || (GroupsOrder = {}));
var OpenEditorContext;
(function(OpenEditorContext2) {
  OpenEditorContext2[OpenEditorContext2["NEW_EDITOR"] = 1] = "NEW_EDITOR";
  OpenEditorContext2[OpenEditorContext2["MOVE_EDITOR"] = 2] = "MOVE_EDITOR";
  OpenEditorContext2[OpenEditorContext2["COPY_EDITOR"] = 3] = "COPY_EDITOR";
})(OpenEditorContext || (OpenEditorContext = {}));
function isEditorGroup(obj) {
  const group = obj;
  return !!group && typeof group.id === "number" && Array.isArray(group.editors);
}
__name(isEditorGroup, "isEditorGroup");
function preferredSideBySideGroupDirection(configurationService) {
  const openSideBySideDirection = configurationService.getValue("workbench.editor.openSideBySideDirection");
  if (openSideBySideDirection === "down") {
    return 1;
  }
  return 3;
}
__name(preferredSideBySideGroupDirection, "preferredSideBySideGroupDirection");
export {
  GroupDirection,
  GroupLocation,
  GroupOrientation,
  GroupsArrangement,
  GroupsOrder,
  IEditorGroupsService,
  MergeGroupMode,
  OpenEditorContext,
  isEditorGroup,
  isEditorReplacement,
  preferredSideBySideGroupDirection
};
//# sourceMappingURL=editorGroupsService.js.map
