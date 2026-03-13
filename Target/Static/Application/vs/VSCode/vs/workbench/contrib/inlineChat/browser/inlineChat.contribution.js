import "./inlineChatDefaultModel.js";
import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { InlineChatController } from "./inlineChatController.js";
import * as InlineChatActions from "./inlineChatActions.js";
import { CTX_INLINE_CHAT_EDITING, CTX_INLINE_CHAT_V1_ENABLED, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS, MENU_INLINE_CHAT_WIDGET_STATUS } from "../common/inlineChat.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { InlineChatNotebookContribution } from "./inlineChatNotebook.js";
import { registerWorkbenchContribution2, Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
import { InlineChatEnabler, InlineChatEscapeToolContribution, InlineChatSessionServiceImpl } from "./inlineChatSessionServiceImpl.js";
import { AccessibleViewRegistry } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { CancelAction, ChatSubmitAction } from "../../chat/browser/actions/chatExecuteActions.js";
import { localize } from "../../../../nls.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { InlineChatAccessibilityHelp } from "./inlineChatAccessibilityHelp.js";
registerEditorContribution(
  InlineChatController.ID,
  InlineChatController,
  0
  /* EditorContributionInstantiation.Eager */
);
registerAction2(InlineChatActions.KeepSessionAction2);
registerAction2(InlineChatActions.UndoSessionAction2);
registerAction2(InlineChatActions.UndoAndCloseSessionAction2);
registerAction2(InlineChatActions.CancelSessionAction);
registerAction2(InlineChatActions.ContinueInlineChatInChatViewAction);
registerAction2(InlineChatActions.RephraseInlineChatSessionAction);
registerSingleton(
  IInlineChatSessionService,
  InlineChatSessionServiceImpl,
  1
  /* InstantiationType.Delayed */
);
const editActionMenuItem = {
  group: "0_main",
  order: 0,
  command: {
    id: ChatSubmitAction.ID,
    title: localize("send.edit", "Edit Code")
  },
  when: ContextKeyExpr.and(ChatContextKeys.inputHasText, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.toNegated(), CTX_INLINE_CHAT_EDITING, CTX_INLINE_CHAT_V1_ENABLED)
};
const generateActionMenuItem = {
  group: "0_main",
  order: 0,
  command: {
    id: ChatSubmitAction.ID,
    title: localize("send.generate", "Generate")
  },
  when: ContextKeyExpr.and(ChatContextKeys.inputHasText, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.toNegated(), CTX_INLINE_CHAT_EDITING.toNegated(), CTX_INLINE_CHAT_V1_ENABLED)
};
MenuRegistry.appendMenuItem(MENU_INLINE_CHAT_WIDGET_STATUS, editActionMenuItem);
MenuRegistry.appendMenuItem(MENU_INLINE_CHAT_WIDGET_STATUS, generateActionMenuItem);
const cancelActionMenuItem = {
  group: "0_main",
  order: 0,
  command: {
    id: CancelAction.ID,
    title: localize("cancel", "Cancel Request"),
    shortTitle: localize("cancelShort", "Cancel")
  },
  when: ContextKeyExpr.and(CTX_INLINE_CHAT_REQUEST_IN_PROGRESS)
};
MenuRegistry.appendMenuItem(MENU_INLINE_CHAT_WIDGET_STATUS, cancelActionMenuItem);
registerAction2(InlineChatActions.StartSessionAction);
registerAction2(InlineChatActions.AskInChatAction);
registerAction2(InlineChatActions.FocusInlineChat);
registerAction2(InlineChatActions.SubmitInlineChatInputAction);
registerAction2(InlineChatActions.QueueInChatAction);
registerAction2(InlineChatActions.HideInlineChatInputAction);
registerAction2(InlineChatActions.FixDiagnosticsAction);
registerAction2(InlineChatActions.DismissEditorAffordanceAction);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(
  InlineChatNotebookContribution,
  3
  /* LifecyclePhase.Restored */
);
registerWorkbenchContribution2(
  InlineChatEnabler.Id,
  InlineChatEnabler,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  InlineChatEscapeToolContribution.Id,
  InlineChatEscapeToolContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
AccessibleViewRegistry.register(new InlineChatAccessibilityHelp());
//# sourceMappingURL=inlineChat.contribution.js.map
