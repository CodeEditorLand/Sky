var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/notebookFind.css";
import { KeyCode, KeyMod } from "../../../../../../base/common/keyCodes.js";
import { Schemas } from "../../../../../../base/common/network.js";
import { isEqual } from "../../../../../../base/common/resources.js";
import { URI } from "../../../../../../base/common/uri.js";
import { ICodeEditor } from "../../../../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../../../../editor/browser/services/codeEditorService.js";
import { EditorOption } from "../../../../../../editor/common/config/editorOptions.js";
import { EditorContextKeys } from "../../../../../../editor/common/editorContextKeys.js";
import { ITextModel } from "../../../../../../editor/common/model.js";
import { FindStartFocusAction, getSelectionSearchString, IFindStartOptions, StartFindAction, StartFindReplaceAction } from "../../../../../../editor/contrib/find/browser/findController.js";
import { localize2 } from "../../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../../platform/contextkey/common/contextkey.js";
import { ServicesAccessor } from "../../../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IShowNotebookFindWidgetOptions, NotebookFindContrib } from "./notebookFindWidget.js";
import { INotebookCommandContext, NotebookMultiCellAction } from "../../controller/coreActions.js";
import { getNotebookEditorFromEditorPane } from "../../notebookBrowser.js";
import { registerNotebookContribution } from "../../notebookEditorExtensions.js";
import { CellUri, NotebookFindScopeType } from "../../../common/notebookCommon.js";
import { INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR, KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR } from "../../../common/notebookContextKeys.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
registerNotebookContribution(NotebookFindContrib.id, NotebookFindContrib);
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.hideFind",
      title: localize2("notebookActions.hideFind", "Hide Find in Notebook"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED),
        primary: KeyCode.Escape,
        weight: KeybindingWeight.WorkbenchContrib
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    const controller = editor.getContribution(NotebookFindContrib.id);
    controller.hide();
    editor.focus();
  }
});
registerAction2(class extends NotebookMultiCellAction {
  constructor() {
    super({
      id: "notebook.find",
      title: localize2("notebookActions.findInNotebook", "Find in Notebook"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.or(NOTEBOOK_IS_ACTIVE_EDITOR, INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR), EditorContextKeys.focus.toNegated()),
        primary: KeyCode.KeyF | KeyMod.CtrlCmd,
        weight: KeybindingWeight.WorkbenchContrib
      }
    });
  }
  async runWithContext(accessor, context) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    const controller = editor.getContribution(NotebookFindContrib.id);
    controller.show(void 0, { findScope: { findScopeType: NotebookFindScopeType.None } });
  }
});
function notebookContainsTextModel(uri, textModel) {
  if (textModel.uri.scheme === Schemas.vscodeNotebookCell) {
    const cellUri = CellUri.parse(textModel.uri);
    if (cellUri && isEqual(cellUri.notebook, uri)) {
      return true;
    }
  }
  return false;
}
__name(notebookContainsTextModel, "notebookContainsTextModel");
function getSearchStringOptions(editor, opts) {
  if (opts.seedSearchStringFromSelection === "single") {
    const selectionSearchString = getSelectionSearchString(editor, opts.seedSearchStringFromSelection, opts.seedSearchStringFromNonEmptySelection);
    if (selectionSearchString) {
      return {
        searchString: selectionSearchString,
        selection: editor.getSelection()
      };
    }
  } else if (opts.seedSearchStringFromSelection === "multiple" && !opts.updateSearchScope) {
    const selectionSearchString = getSelectionSearchString(editor, opts.seedSearchStringFromSelection);
    if (selectionSearchString) {
      return {
        searchString: selectionSearchString,
        selection: editor.getSelection()
      };
    }
  }
  return void 0;
}
__name(getSearchStringOptions, "getSearchStringOptions");
StartFindAction.addImplementation(100, (accessor, codeEditor, args) => {
  const editorService = accessor.get(IEditorService);
  const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  if (!editor) {
    return false;
  }
  if (!codeEditor.hasModel()) {
    return false;
  }
  if (!editor.hasEditorFocus() && !editor.hasWebviewFocus()) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const textEditor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
    if (editor.hasModel() && textEditor && textEditor.hasModel() && notebookContainsTextModel(editor.textModel.uri, textEditor.getModel())) {
    } else {
      return false;
    }
  }
  const controller = editor.getContribution(NotebookFindContrib.id);
  const searchStringOptions = getSearchStringOptions(codeEditor, {
    forceRevealReplace: false,
    seedSearchStringFromSelection: codeEditor.getOption(EditorOption.find).seedSearchStringFromSelection !== "never" ? "single" : "none",
    seedSearchStringFromNonEmptySelection: codeEditor.getOption(EditorOption.find).seedSearchStringFromSelection === "selection",
    seedSearchStringFromGlobalClipboard: codeEditor.getOption(EditorOption.find).globalFindClipboard,
    shouldFocus: FindStartFocusAction.FocusFindInput,
    shouldAnimate: true,
    updateSearchScope: false,
    loop: codeEditor.getOption(EditorOption.find).loop
  });
  let options = void 0;
  const uri = codeEditor.getModel().uri;
  const data = CellUri.parse(uri);
  if (searchStringOptions?.selection && data) {
    const cell = editor.getCellByHandle(data.handle);
    if (cell) {
      options = {
        searchStringSeededFrom: { cell, range: searchStringOptions.selection }
      };
    }
  }
  controller.show(searchStringOptions?.searchString, options);
  return true;
});
StartFindReplaceAction.addImplementation(100, (accessor, codeEditor, args) => {
  const editorService = accessor.get(IEditorService);
  const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  if (!editor) {
    return false;
  }
  if (!codeEditor.hasModel()) {
    return false;
  }
  const controller = editor.getContribution(NotebookFindContrib.id);
  const searchStringOptions = getSearchStringOptions(codeEditor, {
    forceRevealReplace: false,
    seedSearchStringFromSelection: codeEditor.getOption(EditorOption.find).seedSearchStringFromSelection !== "never" ? "single" : "none",
    seedSearchStringFromNonEmptySelection: codeEditor.getOption(EditorOption.find).seedSearchStringFromSelection === "selection",
    seedSearchStringFromGlobalClipboard: codeEditor.getOption(EditorOption.find).globalFindClipboard,
    shouldFocus: FindStartFocusAction.FocusFindInput,
    shouldAnimate: true,
    updateSearchScope: false,
    loop: codeEditor.getOption(EditorOption.find).loop
  });
  if (controller) {
    controller.replace(searchStringOptions?.searchString);
    return true;
  }
  return false;
});
//# sourceMappingURL=notebookFind.js.map
