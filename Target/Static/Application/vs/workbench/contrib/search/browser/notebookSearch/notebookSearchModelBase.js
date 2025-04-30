var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isSearchTreeFileMatch } from "../searchTreeModel/searchTreeCommon.js";
function isNotebookFileMatch(obj) {
  return obj && typeof obj.bindNotebookEditorWidget === "function" && typeof obj.updateMatchesForEditorWidget === "function" && typeof obj.unbindNotebookEditorWidget === "function" && typeof obj.updateNotebookHighlights === "function" && isSearchTreeFileMatch(obj);
}
__name(isNotebookFileMatch, "isNotebookFileMatch");
function isIMatchInNotebook(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.parent === "function" && typeof obj.cellParent === "object" && typeof obj.isWebviewMatch === "function" && typeof obj.cellIndex === "number" && (typeof obj.webviewIndex === "number" || obj.webviewIndex === void 0) && (typeof obj.cell === "object" || obj.cell === void 0);
}
__name(isIMatchInNotebook, "isIMatchInNotebook");
export {
  isIMatchInNotebook,
  isNotebookFileMatch
};
//# sourceMappingURL=notebookSearchModelBase.js.map
