var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/notebookFind.css";
import { Schemas } from "../../../../../../base/common/network.js";
import { isEqual } from "../../../../../../base/common/resources.js";
import { ICodeEditorService } from "../../../../../../editor/browser/services/codeEditorService.js";
import { EditorContextKeys } from "../../../../../../editor/common/editorContextKeys.js";
import { getSelectionSearchString, NextMatchFindAction, PreviousMatchFindAction, StartFindAction, StartFindReplaceAction } from "../../../../../../editor/contrib/find/browser/findController.js";
import { localize2 } from "../../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../../platform/contextkey/common/contextkey.js";
import { NotebookFindContrib } from "./notebookFindWidget.js";
import { NotebookMultiCellAction } from "../../controller/coreActions.js";
import { getNotebookEditorFromEditorPane } from "../../notebookBrowser.js";
import { registerNotebookContribution } from "../../notebookEditorExtensions.js";
import { CellUri, NotebookFindScopeType } from "../../../common/notebookCommon.js";
import { INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR } from "../../../common/notebookContextKeys.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { CONTEXT_FIND_WIDGET_VISIBLE } from "../../../../../../editor/contrib/find/browser/findModel.js";
registerNotebookContribution(NotebookFindContrib.id, NotebookFindContrib);
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.hideFind",
      title: localize2("notebookActions.hideFind", "Hide Find in Notebook"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, CONTEXT_FIND_WIDGET_VISIBLE),
        primary: 9,
        weight: 100 + 5
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
        primary: 36 | 2048,
        weight: 200
        /* KeybindingWeight.WorkbenchContrib */
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
function isNotebookEditorValidForSearch(accessor, editor, codeEditor) {
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
      return true;
    } else {
      return false;
    }
  }
  return true;
}
__name(isNotebookEditorValidForSearch, "isNotebookEditorValidForSearch");
function openFindWidget(controller, editor, codeEditor, focusWidget = true) {
  if (!editor || !codeEditor || !controller) {
    return false;
  }
  if (!codeEditor.hasModel()) {
    return false;
  }
  const searchStringOptions = getSearchStringOptions(codeEditor, {
    forceRevealReplace: false,
    seedSearchStringFromSelection: codeEditor.getOption(
      50
      /* EditorOption.find */
    ).seedSearchStringFromSelection !== "never" ? "single" : "none",
    seedSearchStringFromNonEmptySelection: codeEditor.getOption(
      50
      /* EditorOption.find */
    ).seedSearchStringFromSelection === "selection",
    seedSearchStringFromGlobalClipboard: codeEditor.getOption(
      50
      /* EditorOption.find */
    ).globalFindClipboard,
    shouldFocus: 1,
    shouldAnimate: true,
    updateSearchScope: false,
    loop: codeEditor.getOption(
      50
      /* EditorOption.find */
    ).loop
  });
  let options = void 0;
  const uri = codeEditor.getModel().uri;
  const data = CellUri.parse(uri);
  if (searchStringOptions?.selection && data) {
    const cell = editor.getCellByHandle(data.handle);
    if (cell) {
      options = {
        searchStringSeededFrom: { cell, range: searchStringOptions.selection },
        focus: focusWidget
      };
    }
  } else {
    options = { focus: focusWidget };
  }
  controller.show(searchStringOptions?.searchString, options);
  return true;
}
__name(openFindWidget, "openFindWidget");
function findWidgetAction(accessor, codeEditor, next) {
  const editorService = accessor.get(IEditorService);
  const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  if (!isNotebookEditorValidForSearch(accessor, editor, codeEditor)) {
    return false;
  }
  const controller = editor?.getContribution(NotebookFindContrib.id);
  if (!controller) {
    return false;
  }
  if (controller.isVisible()) {
    next ? controller.findNext() : controller.findPrevious();
    return true;
  } else {
    return openFindWidget(controller, editor, codeEditor, false);
  }
}
__name(findWidgetAction, "findWidgetAction");
async function runFind(accessor, next) {
  const editorService = accessor.get(IEditorService);
  const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  if (!editor) {
    return;
  }
  const controller = editor.getContribution(NotebookFindContrib.id);
  if (controller && controller.isVisible()) {
    next ? controller.findNext() : controller.findPrevious();
  }
}
__name(runFind, "runFind");
StartFindAction.addImplementation(100, (accessor, codeEditor, args) => {
  const editorService = accessor.get(IEditorService);
  const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  if (!isNotebookEditorValidForSearch(accessor, editor, codeEditor)) {
    return false;
  }
  const controller = editor?.getContribution(NotebookFindContrib.id);
  return openFindWidget(controller, editor, codeEditor, true);
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
    seedSearchStringFromSelection: codeEditor.getOption(
      50
      /* EditorOption.find */
    ).seedSearchStringFromSelection !== "never" ? "single" : "none",
    seedSearchStringFromNonEmptySelection: codeEditor.getOption(
      50
      /* EditorOption.find */
    ).seedSearchStringFromSelection === "selection",
    seedSearchStringFromGlobalClipboard: codeEditor.getOption(
      50
      /* EditorOption.find */
    ).globalFindClipboard,
    shouldFocus: 1,
    shouldAnimate: true,
    updateSearchScope: false,
    loop: codeEditor.getOption(
      50
      /* EditorOption.find */
    ).loop
  });
  if (controller) {
    controller.replace(searchStringOptions?.searchString);
    return true;
  }
  return false;
});
NextMatchFindAction.addImplementation(100, (accessor, codeEditor, args) => {
  return findWidgetAction(accessor, codeEditor, true);
});
PreviousMatchFindAction.addImplementation(100, (accessor, codeEditor, args) => {
  return findWidgetAction(accessor, codeEditor, false);
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.findNext.fromWidget",
      title: localize2("notebook.findNext.fromWidget", "Find Next"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, CONTEXT_FIND_WIDGET_VISIBLE),
        primary: 61,
        mac: { primary: 2048 | 37, secondary: [
          61
          /* KeyCode.F3 */
        ] },
        weight: 200 + 1
      }
    });
  }
  async run(accessor) {
    return runFind(accessor, true);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.findPrevious.fromWidget",
      title: localize2("notebook.findPrevious.fromWidget", "Find Previous"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, CONTEXT_FIND_WIDGET_VISIBLE),
        primary: 1024 | 61,
        mac: { primary: 2048 | 1024 | 37, secondary: [
          1024 | 61
          /* KeyCode.F3 */
        ] },
        weight: 200 + 1
      }
    });
  }
  async run(accessor) {
    return runFind(accessor, false);
  }
});
//# sourceMappingURL=notebookFind.js.map
