var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { localize } from "../../nls.js";
import { ContextKeyExpr, RawContextKey } from "../../platform/contextkey/common/contextkey.js";
import { ICommandHandler } from "../../platform/commands/common/commands.js";
import { IKeybindingService } from "../../platform/keybinding/common/keybinding.js";
import { IQuickInputService } from "../../platform/quickinput/common/quickInput.js";
import { Disposable } from "../../base/common/lifecycle.js";
import { getIEditor } from "../../editor/browser/editorBrowser.js";
import { ICodeEditorViewState, IDiffEditorViewState } from "../../editor/common/editorCommon.js";
import { IResourceEditorInput, ITextResourceEditorInput } from "../../platform/editor/common/editor.js";
import { EditorInput } from "../common/editor/editorInput.js";
import { IEditorGroup, IEditorGroupsService } from "../services/editor/common/editorGroupsService.js";
import { ACTIVE_GROUP_TYPE, AUX_WINDOW_GROUP_TYPE, IEditorService, SIDE_GROUP_TYPE } from "../services/editor/common/editorService.js";
import { IUntitledTextResourceEditorInput, IUntypedEditorInput, GroupIdentifier, IEditorPane } from "../common/editor.js";
const inQuickPickContextKeyValue = "inQuickOpen";
const InQuickPickContextKey = new RawContextKey(inQuickPickContextKeyValue, false, localize("inQuickOpen", "Whether keyboard focus is inside the quick open control"));
const inQuickPickContext = ContextKeyExpr.has(inQuickPickContextKeyValue);
const defaultQuickAccessContextKeyValue = "inFilesPicker";
const defaultQuickAccessContext = ContextKeyExpr.and(inQuickPickContext, ContextKeyExpr.has(defaultQuickAccessContextKeyValue));
function getQuickNavigateHandler(id, next) {
  return (accessor) => {
    const keybindingService = accessor.get(IKeybindingService);
    const quickInputService = accessor.get(IQuickInputService);
    const keys = keybindingService.lookupKeybindings(id);
    const quickNavigate = { keybindings: keys };
    quickInputService.navigate(!!next, quickNavigate);
  };
}
__name(getQuickNavigateHandler, "getQuickNavigateHandler");
let PickerEditorState = class extends Disposable {
  // editors that were opened between set and restore
  constructor(editorService, editorGroupsService) {
    super();
    this.editorService = editorService;
    this.editorGroupsService = editorGroupsService;
  }
  static {
    __name(this, "PickerEditorState");
  }
  _editorViewState = void 0;
  openedTransientEditors = /* @__PURE__ */ new Set();
  set() {
    if (this._editorViewState) {
      return;
    }
    const activeEditorPane = this.editorService.activeEditorPane;
    if (activeEditorPane) {
      this._editorViewState = {
        group: activeEditorPane.group,
        editor: activeEditorPane.input,
        state: getIEditor(activeEditorPane.getControl())?.saveViewState() ?? void 0
      };
    }
  }
  /**
   * Open a transient editor such that it may be closed when the state is restored.
   * Note that, when the state is restored, if the editor is no longer transient, it will not be closed.
   */
  async openTransientEditor(editor, group) {
    editor.options = { ...editor.options, transient: true };
    const editorPane = await this.editorService.openEditor(editor, group);
    if (editorPane?.input && editorPane.input !== this._editorViewState?.editor && editorPane.group.isTransient(editorPane.input)) {
      this.openedTransientEditors.add(editorPane.input);
    }
    return editorPane;
  }
  async restore() {
    if (this._editorViewState) {
      for (const editor of this.openedTransientEditors) {
        if (editor.isDirty()) {
          continue;
        }
        for (const group of this.editorGroupsService.groups) {
          if (group.isTransient(editor)) {
            await group.closeEditor(editor, { preserveFocus: true });
          }
        }
      }
      await this._editorViewState.group.openEditor(this._editorViewState.editor, {
        viewState: this._editorViewState.state,
        preserveFocus: true
        // important to not close the picker as a result
      });
      this.reset();
    }
  }
  reset() {
    this._editorViewState = void 0;
    this.openedTransientEditors.clear();
  }
  dispose() {
    super.dispose();
    this.reset();
  }
};
PickerEditorState = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IEditorGroupsService)
], PickerEditorState);
export {
  InQuickPickContextKey,
  PickerEditorState,
  defaultQuickAccessContext,
  defaultQuickAccessContextKeyValue,
  getQuickNavigateHandler,
  inQuickPickContext,
  inQuickPickContextKeyValue
};
//# sourceMappingURL=quickaccess.js.map
