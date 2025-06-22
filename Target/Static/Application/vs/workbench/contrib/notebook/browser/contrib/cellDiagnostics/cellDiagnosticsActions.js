import { Range } from "../../../../../../editor/common/core/range.js";
import { CodeActionController } from "../../../../../../editor/contrib/codeAction/browser/codeActionController.js";
import { CodeActionKind, CodeActionTriggerSource } from "../../../../../../editor/contrib/codeAction/common/types.js";
import { localize, localize2 } from "../../../../../../nls.js";
import { registerAction2 } from "../../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../../platform/contextkey/common/contextkey.js";
import { NotebookCellAction, findTargetCellEditor } from "../../controller/coreActions.js";
import { CodeCellViewModel } from "../../viewModel/codeCellViewModel.js";
import { NOTEBOOK_CELL_EDITOR_FOCUSED, NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS } from "../../../common/notebookContextKeys.js";
import { InlineChatController } from "../../../../inlineChat/browser/inlineChatController.js";
import { showChatView } from "../../../../chat/browser/chat.js";
import { IViewsService } from "../../../../../services/views/common/viewsService.js";
const OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID = "notebook.cell.openFailureActions";
const FIX_CELL_ERROR_COMMAND_ID = "notebook.cell.chat.fixError";
const EXPLAIN_CELL_ERROR_COMMAND_ID = "notebook.cell.chat.explainError";
registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID,
      title: localize2("notebookActions.cellFailureActions", "Show Cell Failure Actions"),
      precondition: ContextKeyExpr.and(NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS, NOTEBOOK_CELL_EDITOR_FOCUSED.toNegated()),
      f1: true,
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS, NOTEBOOK_CELL_EDITOR_FOCUSED.toNegated()),
        primary: 2048 | 89,
        weight: 200
        /* KeybindingWeight.WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context) {
    if (context.cell instanceof CodeCellViewModel) {
      const error = context.cell.executionErrorDiagnostic.get();
      if (error?.location) {
        const location = Range.lift({
          startLineNumber: error.location.startLineNumber + 1,
          startColumn: error.location.startColumn + 1,
          endLineNumber: error.location.endLineNumber + 1,
          endColumn: error.location.endColumn + 1
        });
        context.notebookEditor.setCellEditorSelection(context.cell, Range.lift(location));
        const editor = findTargetCellEditor(context, context.cell);
        if (editor) {
          const controller = CodeActionController.get(editor);
          controller?.manualTriggerAtCurrentPosition(localize("cellCommands.quickFix.noneMessage", "No code actions available"), CodeActionTriggerSource.Default, { include: CodeActionKind.QuickFix });
        }
      }
    }
  }
});
registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: FIX_CELL_ERROR_COMMAND_ID,
      title: localize2("notebookActions.chatFixCellError", "Fix Cell Error"),
      precondition: ContextKeyExpr.and(NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS, NOTEBOOK_CELL_EDITOR_FOCUSED.toNegated()),
      f1: true
    });
  }
  async runWithContext(accessor, context) {
    if (context.cell instanceof CodeCellViewModel) {
      const error = context.cell.executionErrorDiagnostic.get();
      if (error?.location) {
        const location = Range.lift({
          startLineNumber: error.location.startLineNumber + 1,
          startColumn: error.location.startColumn + 1,
          endLineNumber: error.location.endLineNumber + 1,
          endColumn: error.location.endColumn + 1
        });
        context.notebookEditor.setCellEditorSelection(context.cell, Range.lift(location));
        const editor = findTargetCellEditor(context, context.cell);
        if (editor) {
          const controller = InlineChatController.get(editor);
          const message = error.name ? `${error.name}: ${error.message}` : error.message;
          if (controller) {
            await controller.run({ message: "/fix " + message, initialRange: location, autoSend: true });
          }
        }
      }
    }
  }
});
registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: EXPLAIN_CELL_ERROR_COMMAND_ID,
      title: localize2("notebookActions.chatExplainCellError", "Explain Cell Error"),
      precondition: ContextKeyExpr.and(NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS, NOTEBOOK_CELL_EDITOR_FOCUSED.toNegated()),
      f1: true
    });
  }
  async runWithContext(accessor, context) {
    if (context.cell instanceof CodeCellViewModel) {
      const error = context.cell.executionErrorDiagnostic.get();
      if (error?.message) {
        const viewsService = accessor.get(IViewsService);
        const chatWidget = await showChatView(viewsService);
        const message = error.name ? `${error.name}: ${error.message}` : error.message;
        chatWidget?.acceptInput("@workspace /explain " + message);
      }
    }
  }
});
export {
  EXPLAIN_CELL_ERROR_COMMAND_ID,
  FIX_CELL_ERROR_COMMAND_ID,
  OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID
};
//# sourceMappingURL=cellDiagnosticsActions.js.map
