var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isEqual } from "../../../../../base/common/resources.js";
import { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { findDiffEditorContainingCodeEditor } from "../../../../../editor/browser/widget/diffEditor/commands.js";
import { ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { IModifiedFileEntry } from "../../common/chatEditingService.js";
function isTextDiffEditorForEntry(accessor, entry, editor) {
  const diffEditor = findDiffEditorContainingCodeEditor(accessor, editor);
  if (!diffEditor) {
    return false;
  }
  const originalModel = diffEditor.getOriginalEditor().getModel();
  const modifiedModel = diffEditor.getModifiedEditor().getModel();
  return isEqual(originalModel?.uri, entry.originalURI) && isEqual(modifiedModel?.uri, entry.modifiedURI);
}
__name(isTextDiffEditorForEntry, "isTextDiffEditorForEntry");
export {
  isTextDiffEditorForEntry
};
//# sourceMappingURL=chatEditing.js.map
