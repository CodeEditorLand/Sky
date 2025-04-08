var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { GroupIdentifier } from "../../../common/editor.js";
import { IEditorGroupsService, GroupsOrder, IEditorGroup, preferredSideBySideGroupDirection } from "./editorGroupsService.js";
import { ACTIVE_GROUP, ACTIVE_GROUP_TYPE, SIDE_GROUP, SIDE_GROUP_TYPE } from "./editorService.js";
function columnToEditorGroup(editorGroupService, configurationService, column = ACTIVE_GROUP) {
  if (column === ACTIVE_GROUP || column === SIDE_GROUP) {
    return column;
  }
  let groupInColumn = editorGroupService.getGroups(GroupsOrder.GRID_APPEARANCE)[column];
  if (!groupInColumn && column < 9) {
    for (let i = 0; i <= column; i++) {
      const editorGroups = editorGroupService.getGroups(GroupsOrder.GRID_APPEARANCE);
      if (!editorGroups[i]) {
        editorGroupService.addGroup(editorGroups[i - 1], preferredSideBySideGroupDirection(configurationService));
      }
    }
    groupInColumn = editorGroupService.getGroups(GroupsOrder.GRID_APPEARANCE)[column];
  }
  return groupInColumn?.id ?? SIDE_GROUP;
}
__name(columnToEditorGroup, "columnToEditorGroup");
function editorGroupToColumn(editorGroupService, editorGroup) {
  const group = typeof editorGroup === "number" ? editorGroupService.getGroup(editorGroup) : editorGroup;
  return editorGroupService.getGroups(GroupsOrder.GRID_APPEARANCE).indexOf(group ?? editorGroupService.activeGroup);
}
__name(editorGroupToColumn, "editorGroupToColumn");
export {
  columnToEditorGroup,
  editorGroupToColumn
};
//# sourceMappingURL=editorGroupColumn.js.map
