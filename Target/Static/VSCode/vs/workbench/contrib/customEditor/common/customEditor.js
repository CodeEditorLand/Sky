var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { distinct } from "../../../../base/common/arrays.js";
import { Event } from "../../../../base/common/event.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { IDisposable, IReference } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IRevertOptions, ISaveOptions } from "../../../common/editor.js";
import { globMatchesResource, priorityToRank, RegisteredEditorPriority } from "../../../services/editor/common/editorResolverService.js";
const ICustomEditorService = createDecorator("customEditorService");
const CONTEXT_ACTIVE_CUSTOM_EDITOR_ID = new RawContextKey("activeCustomEditorId", "", {
  type: "string",
  description: nls.localize("context.customEditor", "The viewType of the currently active custom editor.")
});
const CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE = new RawContextKey("focusedCustomEditorIsEditable", false);
var CustomEditorPriority = /* @__PURE__ */ ((CustomEditorPriority2) => {
  CustomEditorPriority2["default"] = "default";
  CustomEditorPriority2["builtin"] = "builtin";
  CustomEditorPriority2["option"] = "option";
  return CustomEditorPriority2;
})(CustomEditorPriority || {});
class CustomEditorInfo {
  static {
    __name(this, "CustomEditorInfo");
  }
  id;
  displayName;
  providerDisplayName;
  priority;
  selector;
  constructor(descriptor) {
    this.id = descriptor.id;
    this.displayName = descriptor.displayName;
    this.providerDisplayName = descriptor.providerDisplayName;
    this.priority = descriptor.priority;
    this.selector = descriptor.selector;
  }
  matches(resource) {
    return this.selector.some((selector) => selector.filenamePattern && globMatchesResource(selector.filenamePattern, resource));
  }
}
class CustomEditorInfoCollection {
  static {
    __name(this, "CustomEditorInfoCollection");
  }
  allEditors;
  constructor(editors) {
    this.allEditors = distinct(editors, (editor) => editor.id);
  }
  get length() {
    return this.allEditors.length;
  }
  /**
   * Find the single default editor to use (if any) by looking at the editor's priority and the
   * other contributed editors.
   */
  get defaultEditor() {
    return this.allEditors.find((editor) => {
      switch (editor.priority) {
        case RegisteredEditorPriority.default:
        case RegisteredEditorPriority.builtin:
          return this.allEditors.every((otherEditor) => otherEditor === editor || isLowerPriority(otherEditor, editor));
        default:
          return false;
      }
    });
  }
  /**
   * Find the best available editor to use.
   *
   * Unlike the `defaultEditor`, a bestAvailableEditor can exist even if there are other editors with
   * the same priority.
   */
  get bestAvailableEditor() {
    const editors = Array.from(this.allEditors).sort((a, b) => {
      return priorityToRank(a.priority) - priorityToRank(b.priority);
    });
    return editors[0];
  }
}
function isLowerPriority(otherEditor, editor) {
  return priorityToRank(otherEditor.priority) < priorityToRank(editor.priority);
}
__name(isLowerPriority, "isLowerPriority");
export {
  CONTEXT_ACTIVE_CUSTOM_EDITOR_ID,
  CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE,
  CustomEditorInfo,
  CustomEditorInfoCollection,
  CustomEditorPriority,
  ICustomEditorService
};
//# sourceMappingURL=customEditor.js.map
