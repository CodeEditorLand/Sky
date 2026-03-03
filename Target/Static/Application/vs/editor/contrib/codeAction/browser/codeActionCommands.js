var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { escapeRegExpCharacters } from "../../../../base/common/strings.js";
import { EditorAction, EditorAction2, EditorCommand } from "../../../browser/editorExtensions.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { autoFixCommandId, codeActionCommandId, fixAllCommandId, organizeImportsCommandId, quickFixCommandId, refactorCommandId, sourceActionCommandId } from "./codeAction.js";
import * as nls from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { CodeActionCommandArgs, CodeActionKind, CodeActionTriggerSource } from "../common/types.js";
import { CodeActionController } from "./codeActionController.js";
import { SUPPORTED_CODE_ACTIONS } from "./codeActionModel.js";
import { Codicon } from "../../../../base/common/codicons.js";
function contextKeyForSupportedActions(kind) {
  return ContextKeyExpr.regex(SUPPORTED_CODE_ACTIONS.keys()[0], new RegExp("(\\s|^)" + escapeRegExpCharacters(kind.value) + "\\b"));
}
__name(contextKeyForSupportedActions, "contextKeyForSupportedActions");
const argsSchema = {
  type: "object",
  defaultSnippets: [{ body: { kind: "" } }],
  properties: {
    "kind": {
      type: "string",
      description: nls.localize("args.schema.kind", "Kind of the code action to run.")
    },
    "apply": {
      type: "string",
      description: nls.localize("args.schema.apply", "Controls when the returned actions are applied."),
      default: "ifSingle",
      enum: [
        "first",
        "ifSingle",
        "never"
        /* CodeActionAutoApply.Never */
      ],
      enumDescriptions: [
        nls.localize("args.schema.apply.first", "Always apply the first returned code action."),
        nls.localize("args.schema.apply.ifSingle", "Apply the first returned code action if it is the only one."),
        nls.localize("args.schema.apply.never", "Do not apply the returned code actions.")
      ]
    },
    "preferred": {
      type: "boolean",
      default: false,
      description: nls.localize("args.schema.preferred", "Controls if only preferred code actions should be returned.")
    }
  }
};
function triggerCodeActionsForEditorSelection(editor, notAvailableMessage, filter, autoApply, triggerAction = CodeActionTriggerSource.Default) {
  if (editor.hasModel()) {
    const controller = CodeActionController.get(editor);
    controller?.manualTriggerAtCurrentPosition(notAvailableMessage, triggerAction, filter, autoApply);
  }
}
__name(triggerCodeActionsForEditorSelection, "triggerCodeActionsForEditorSelection");
class QuickFixAction extends EditorAction2 {
  static {
    __name(this, "QuickFixAction");
  }
  constructor() {
    super({
      id: quickFixCommandId,
      title: nls.localize2("quickfix.trigger.label", "Quick Fix..."),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
      icon: Codicon.lightBulb,
      f1: true,
      keybinding: {
        when: EditorContextKeys.textInputFocus,
        primary: 2048 | 89,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      menu: {
        id: MenuId.InlineChatEditorAffordance,
        group: "1_quickfix",
        order: 0,
        when: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider)
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    return triggerCodeActionsForEditorSelection(editor, nls.localize("editor.action.quickFix.noneMessage", "No code actions available"), void 0, void 0, CodeActionTriggerSource.QuickFix);
  }
}
class CodeActionCommand extends EditorCommand {
  static {
    __name(this, "CodeActionCommand");
  }
  constructor() {
    super({
      id: codeActionCommandId,
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
      metadata: {
        description: "Trigger a code action",
        args: [{ name: "args", schema: argsSchema }]
      }
    });
  }
  runEditorCommand(_accessor, editor, userArgs) {
    const args = CodeActionCommandArgs.fromUser(userArgs, {
      kind: HierarchicalKind.Empty,
      apply: "ifSingle"
    });
    return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === "string" ? args.preferred ? nls.localize("editor.action.codeAction.noneMessage.preferred.kind", "No preferred code actions for '{0}' available", userArgs.kind) : nls.localize("editor.action.codeAction.noneMessage.kind", "No code actions for '{0}' available", userArgs.kind) : args.preferred ? nls.localize("editor.action.codeAction.noneMessage.preferred", "No preferred code actions available") : nls.localize("editor.action.codeAction.noneMessage", "No code actions available"), {
      include: args.kind,
      includeSourceActions: true,
      onlyIncludePreferredActions: args.preferred
    }, args.apply);
  }
}
class RefactorAction extends EditorAction {
  static {
    __name(this, "RefactorAction");
  }
  constructor() {
    super({
      id: refactorCommandId,
      label: nls.localize2("refactor.label", "Refactor..."),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 | 1024 | 48,
        mac: {
          primary: 256 | 1024 | 48
          /* KeyCode.KeyR */
        },
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      contextMenuOpts: {
        group: "1_modification",
        order: 2,
        when: ContextKeyExpr.and(EditorContextKeys.writable, contextKeyForSupportedActions(CodeActionKind.Refactor))
      },
      metadata: {
        description: "Refactor...",
        args: [{ name: "args", schema: argsSchema }]
      }
    });
  }
  run(_accessor, editor, userArgs) {
    const args = CodeActionCommandArgs.fromUser(userArgs, {
      kind: CodeActionKind.Refactor,
      apply: "never"
      /* CodeActionAutoApply.Never */
    });
    return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === "string" ? args.preferred ? nls.localize("editor.action.refactor.noneMessage.preferred.kind", "No preferred refactorings for '{0}' available", userArgs.kind) : nls.localize("editor.action.refactor.noneMessage.kind", "No refactorings for '{0}' available", userArgs.kind) : args.preferred ? nls.localize("editor.action.refactor.noneMessage.preferred", "No preferred refactorings available") : nls.localize("editor.action.refactor.noneMessage", "No refactorings available"), {
      include: CodeActionKind.Refactor.contains(args.kind) ? args.kind : HierarchicalKind.None,
      onlyIncludePreferredActions: args.preferred
    }, args.apply, CodeActionTriggerSource.Refactor);
  }
}
class SourceAction extends EditorAction {
  static {
    __name(this, "SourceAction");
  }
  constructor() {
    super({
      id: sourceActionCommandId,
      label: nls.localize2("source.label", "Source Action..."),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
      contextMenuOpts: {
        group: "1_modification",
        order: 2.1,
        when: ContextKeyExpr.and(EditorContextKeys.writable, contextKeyForSupportedActions(CodeActionKind.Source))
      },
      metadata: {
        description: "Source Action...",
        args: [{ name: "args", schema: argsSchema }]
      }
    });
  }
  run(_accessor, editor, userArgs) {
    const args = CodeActionCommandArgs.fromUser(userArgs, {
      kind: CodeActionKind.Source,
      apply: "never"
      /* CodeActionAutoApply.Never */
    });
    return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === "string" ? args.preferred ? nls.localize("editor.action.source.noneMessage.preferred.kind", "No preferred source actions for '{0}' available", userArgs.kind) : nls.localize("editor.action.source.noneMessage.kind", "No source actions for '{0}' available", userArgs.kind) : args.preferred ? nls.localize("editor.action.source.noneMessage.preferred", "No preferred source actions available") : nls.localize("editor.action.source.noneMessage", "No source actions available"), {
      include: CodeActionKind.Source.contains(args.kind) ? args.kind : HierarchicalKind.None,
      includeSourceActions: true,
      onlyIncludePreferredActions: args.preferred
    }, args.apply, CodeActionTriggerSource.SourceAction);
  }
}
class OrganizeImportsAction extends EditorAction {
  static {
    __name(this, "OrganizeImportsAction");
  }
  constructor() {
    super({
      id: organizeImportsCommandId,
      label: nls.localize2("organizeImports.label", "Organize Imports"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, contextKeyForSupportedActions(CodeActionKind.SourceOrganizeImports)),
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 1024 | 512 | 45,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      metadata: {
        description: nls.localize2("organizeImports.description", "Organize imports in the current file. Also called 'Optimize Imports' by some tools")
      }
    });
  }
  run(_accessor, editor) {
    return triggerCodeActionsForEditorSelection(editor, nls.localize("editor.action.organize.noneMessage", "No organize imports action available"), { include: CodeActionKind.SourceOrganizeImports, includeSourceActions: true }, "ifSingle", CodeActionTriggerSource.OrganizeImports);
  }
}
class FixAllAction extends EditorAction {
  static {
    __name(this, "FixAllAction");
  }
  constructor() {
    super({
      id: fixAllCommandId,
      label: nls.localize2("fixAll.label", "Fix All"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, contextKeyForSupportedActions(CodeActionKind.SourceFixAll))
    });
  }
  run(_accessor, editor) {
    return triggerCodeActionsForEditorSelection(editor, nls.localize("fixAll.noneMessage", "No fix all action available"), { include: CodeActionKind.SourceFixAll, includeSourceActions: true }, "ifSingle", CodeActionTriggerSource.FixAll);
  }
}
class AutoFixAction extends EditorAction {
  static {
    __name(this, "AutoFixAction");
  }
  constructor() {
    super({
      id: autoFixCommandId,
      label: nls.localize2("autoFix.label", "Auto Fix..."),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, contextKeyForSupportedActions(CodeActionKind.QuickFix)),
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 512 | 1024 | 89,
        mac: {
          primary: 2048 | 512 | 89
          /* KeyCode.Period */
        },
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
  run(_accessor, editor) {
    return triggerCodeActionsForEditorSelection(editor, nls.localize("editor.action.autoFix.noneMessage", "No auto fixes available"), {
      include: CodeActionKind.QuickFix,
      onlyIncludePreferredActions: true
    }, "ifSingle", CodeActionTriggerSource.AutoFix);
  }
}
export {
  AutoFixAction,
  CodeActionCommand,
  FixAllAction,
  OrganizeImportsAction,
  QuickFixAction,
  RefactorAction,
  SourceAction
};
//# sourceMappingURL=codeActionCommands.js.map
