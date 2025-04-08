var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../../../nls.js";
import { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Action2, IAction2Options, MenuId, MenuRegistry, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { CHAT_CATEGORY } from "../actions/chatActions.js";
import { ctxHasEditorModification, ctxHasRequestInProgress, ctxReviewModeEnabled } from "./chatEditingEditorContextKeys.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { ACTIVE_GROUP, IEditorService } from "../../../../services/editor/common/editorService.js";
import { CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME, IChatEditingService, IChatEditingSession, IModifiedFileEntry, IModifiedFileEntryEditorIntegration, ModifiedFileEntryState } from "../../common/chatEditingService.js";
import { resolveCommandsContext } from "../../../../browser/parts/editor/editorCommandsContext.js";
import { IListService } from "../../../../../platform/list/browser/listService.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { MultiDiffEditorInput } from "../../../multiDiffEditor/browser/multiDiffEditorInput.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ActiveEditorContext } from "../../../../common/contextkeys.js";
import { EditorResourceAccessor, SideBySideEditor, TEXT_DIFF_EDITOR_ID } from "../../../../common/editor.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
class ChatEditingEditorAction extends Action2 {
  static {
    __name(this, "ChatEditingEditorAction");
  }
  constructor(desc) {
    super({
      category: CHAT_CATEGORY,
      ...desc
    });
  }
  async run(accessor, ...args) {
    const instaService = accessor.get(IInstantiationService);
    const chatEditingService = accessor.get(IChatEditingService);
    const editorService = accessor.get(IEditorService);
    const uri = EditorResourceAccessor.getOriginalUri(editorService.activeEditorPane?.input, { supportSideBySide: SideBySideEditor.PRIMARY });
    if (!uri || !editorService.activeEditorPane) {
      return;
    }
    const session = chatEditingService.editingSessionsObs.get().find((candidate) => candidate.getEntry(uri));
    if (!session) {
      return;
    }
    const entry = session.getEntry(uri);
    const ctrl = entry.getEditorIntegration(editorService.activeEditorPane);
    return instaService.invokeFunction(this.runChatEditingCommand.bind(this), session, entry, ctrl, ...args);
  }
}
class NavigateAction extends ChatEditingEditorAction {
  constructor(next) {
    super({
      id: next ? "chatEditor.action.navigateNext" : "chatEditor.action.navigatePrevious",
      title: next ? localize2("next", "Go to Next Chat Edit") : localize2("prev", "Go to Previous Chat Edit"),
      icon: next ? Codicon.arrowDown : Codicon.arrowUp,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ctxHasRequestInProgress.negate()),
      keybinding: {
        primary: next ? KeyMod.Alt | KeyCode.F5 : KeyMod.Alt | KeyMod.Shift | KeyCode.F5,
        weight: KeybindingWeight.WorkbenchContrib,
        when: ContextKeyExpr.and(
          ctxHasEditorModification,
          EditorContextKeys.focus
        )
      },
      f1: true,
      menu: {
        id: MenuId.ChatEditingEditorContent,
        group: "navigate",
        order: !next ? 2 : 3,
        when: ContextKeyExpr.and(ctxReviewModeEnabled, ctxHasRequestInProgress.negate())
      }
    });
    this.next = next;
  }
  static {
    __name(this, "NavigateAction");
  }
  async runChatEditingCommand(accessor, session, entry, ctrl) {
    const instaService = accessor.get(IInstantiationService);
    const done = this.next ? ctrl.next(false) : ctrl.previous(false);
    if (done) {
      return;
    }
    const didOpenNext = await instaService.invokeFunction(openNextOrPreviousChange, session, entry, this.next);
    if (didOpenNext) {
      return;
    }
    this.next ? ctrl.next(true) : ctrl.previous(true);
  }
}
async function openNextOrPreviousChange(accessor, session, entry, next) {
  const editorService = accessor.get(IEditorService);
  const entries = session.entries.get();
  let idx = entries.indexOf(entry);
  let newEntry;
  while (true) {
    idx = (idx + (next ? 1 : -1) + entries.length) % entries.length;
    newEntry = entries[idx];
    if (newEntry.state.get() === ModifiedFileEntryState.Modified) {
      break;
    } else if (newEntry === entry) {
      return false;
    }
  }
  const pane = await editorService.openEditor({
    resource: newEntry.modifiedURI,
    options: {
      revealIfOpened: false,
      revealIfVisible: false
    }
  }, ACTIVE_GROUP);
  if (!pane) {
    return false;
  }
  if (session.entries.get().includes(newEntry)) {
    newEntry.getEditorIntegration(pane).reveal(next);
  }
  return true;
}
__name(openNextOrPreviousChange, "openNextOrPreviousChange");
class AcceptDiscardAction extends ChatEditingEditorAction {
  constructor(id, accept) {
    super({
      id,
      title: accept ? localize2("accept", "Keep Chat Edits") : localize2("discard", "Undo Chat Edits"),
      shortTitle: accept ? localize2("accept2", "Keep") : localize2("discard2", "Undo"),
      tooltip: accept ? localize2("accept3", "Keep Chat Edits in this File") : localize2("discard3", "Undo Chat Edits in this File"),
      precondition: ContextKeyExpr.and(ctxHasEditorModification, ctxHasRequestInProgress.negate()),
      icon: accept ? Codicon.check : Codicon.discard,
      f1: true,
      keybinding: {
        when: EditorContextKeys.focus,
        weight: KeybindingWeight.WorkbenchContrib,
        primary: accept ? KeyMod.CtrlCmd | KeyCode.Enter : KeyMod.CtrlCmd | KeyCode.Backspace
      },
      menu: {
        id: MenuId.ChatEditingEditorContent,
        group: "a_resolve",
        order: accept ? 0 : 1,
        when: ContextKeyExpr.and(!accept ? ctxReviewModeEnabled : void 0, ctxHasRequestInProgress.negate())
      }
    });
    this.accept = accept;
  }
  static {
    __name(this, "AcceptDiscardAction");
  }
  async runChatEditingCommand(accessor, session, entry, _integration) {
    const instaService = accessor.get(IInstantiationService);
    if (this.accept) {
      session.accept(entry.modifiedURI);
    } else {
      session.reject(entry.modifiedURI);
    }
    await instaService.invokeFunction(openNextOrPreviousChange, session, entry, true);
  }
}
class AcceptAction extends AcceptDiscardAction {
  static {
    __name(this, "AcceptAction");
  }
  static ID = "chatEditor.action.accept";
  constructor() {
    super(AcceptAction.ID, true);
  }
}
class RejectAction extends AcceptDiscardAction {
  static {
    __name(this, "RejectAction");
  }
  static ID = "chatEditor.action.reject";
  constructor() {
    super(RejectAction.ID, false);
  }
}
class AcceptRejectHunkAction extends ChatEditingEditorAction {
  constructor(_accept) {
    super(
      {
        id: _accept ? "chatEditor.action.acceptHunk" : "chatEditor.action.undoHunk",
        title: _accept ? localize2("acceptHunk", "Keep this Change") : localize2("undo", "Undo this Change"),
        precondition: ContextKeyExpr.and(ctxHasEditorModification, ctxHasRequestInProgress.negate()),
        icon: _accept ? Codicon.check : Codicon.discard,
        f1: true,
        keybinding: {
          when: EditorContextKeys.focus,
          weight: KeybindingWeight.WorkbenchContrib,
          primary: _accept ? KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter : KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Backspace
        },
        menu: {
          id: MenuId.ChatEditingEditorHunk,
          order: 1
        }
      }
    );
    this._accept = _accept;
  }
  static {
    __name(this, "AcceptRejectHunkAction");
  }
  async runChatEditingCommand(_accessor, _session, _entry, ctrl, ...args) {
    if (this._accept) {
      await ctrl.acceptNearestChange(args[0]);
    } else {
      await ctrl.rejectNearestChange(args[0]);
    }
  }
}
class ToggleDiffAction extends ChatEditingEditorAction {
  static {
    __name(this, "ToggleDiffAction");
  }
  constructor() {
    super({
      id: "chatEditor.action.toggleDiff",
      title: localize2("diff", "Toggle Diff Editor"),
      category: CHAT_CATEGORY,
      toggled: {
        condition: ContextKeyExpr.or(EditorContextKeys.inDiffEditor, ActiveEditorContext.isEqualTo(TEXT_DIFF_EDITOR_ID)),
        icon: Codicon.goToFile
      },
      precondition: ContextKeyExpr.and(ctxHasEditorModification, ctxHasRequestInProgress.negate()),
      icon: Codicon.diffSingle,
      keybinding: {
        when: EditorContextKeys.focus,
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.Alt | KeyMod.Shift | KeyCode.F7
      },
      menu: [{
        id: MenuId.ChatEditingEditorHunk,
        order: 10
      }, {
        id: MenuId.ChatEditingEditorContent,
        group: "a_resolve",
        order: 2,
        when: ContextKeyExpr.and(ctxReviewModeEnabled, ctxHasRequestInProgress.negate())
      }]
    });
  }
  runChatEditingCommand(_accessor, _session, _entry, integration, ...args) {
    integration.toggleDiff(args[0]);
  }
}
class ToggleAccessibleDiffViewAction extends ChatEditingEditorAction {
  static {
    __name(this, "ToggleAccessibleDiffViewAction");
  }
  constructor() {
    super({
      id: "chatEditor.action.showAccessibleDiffView",
      title: localize2("accessibleDiff", "Show Accessible Diff View"),
      f1: true,
      precondition: ContextKeyExpr.and(ctxHasEditorModification, ctxHasRequestInProgress.negate()),
      keybinding: {
        when: EditorContextKeys.focus,
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyCode.F7
      }
    });
  }
  runChatEditingCommand(_accessor, _session, _entry, integration) {
    integration.enableAccessibleDiffView();
  }
}
class ReviewChangesAction extends ChatEditingEditorAction {
  static {
    __name(this, "ReviewChangesAction");
  }
  constructor() {
    super({
      id: "chatEditor.action.reviewChanges",
      title: localize2("review", "Review"),
      precondition: ContextKeyExpr.and(ctxHasEditorModification, ctxHasRequestInProgress.negate()),
      menu: [{
        id: MenuId.ChatEditingEditorContent,
        group: "a_resolve",
        order: 3,
        when: ContextKeyExpr.and(ctxReviewModeEnabled.negate(), ctxHasRequestInProgress.negate())
      }]
    });
  }
  runChatEditingCommand(_accessor, _session, entry, _integration, ..._args) {
    entry.enableReviewModeUntilSettled();
  }
}
class MultiDiffAcceptDiscardAction extends Action2 {
  constructor(accept) {
    super({
      id: accept ? "chatEditing.multidiff.acceptAllFiles" : "chatEditing.multidiff.discardAllFiles",
      title: accept ? localize("accept4", "Keep All Edits") : localize("discard4", "Undo All Edits"),
      icon: accept ? Codicon.check : Codicon.discard,
      menu: {
        when: ContextKeyExpr.equals("resourceScheme", CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME),
        id: MenuId.EditorTitle,
        order: accept ? 0 : 1,
        group: "navigation"
      }
    });
    this.accept = accept;
  }
  static {
    __name(this, "MultiDiffAcceptDiscardAction");
  }
  async run(accessor, ...args) {
    const chatEditingService = accessor.get(IChatEditingService);
    const editorService = accessor.get(IEditorService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const listService = accessor.get(IListService);
    const resolvedContext = resolveCommandsContext(args, editorService, editorGroupsService, listService);
    const groupContext = resolvedContext.groupedEditors[0];
    if (!groupContext) {
      return;
    }
    const editor = groupContext.editors[0];
    if (!(editor instanceof MultiDiffEditorInput) || !editor.resource) {
      return;
    }
    const session = chatEditingService.getEditingSession(editor.resource.authority);
    if (this.accept) {
      await session?.accept();
    } else {
      await session?.reject();
    }
  }
}
function registerChatEditorActions() {
  registerAction2(class NextAction extends NavigateAction {
    static {
      __name(this, "NextAction");
    }
    constructor() {
      super(true);
    }
  });
  registerAction2(class PrevAction extends NavigateAction {
    static {
      __name(this, "PrevAction");
    }
    constructor() {
      super(false);
    }
  });
  registerAction2(ReviewChangesAction);
  registerAction2(AcceptAction);
  registerAction2(RejectAction);
  registerAction2(class AcceptHunkAction extends AcceptRejectHunkAction {
    static {
      __name(this, "AcceptHunkAction");
    }
    constructor() {
      super(true);
    }
  });
  registerAction2(class AcceptHunkAction extends AcceptRejectHunkAction {
    static {
      __name(this, "AcceptHunkAction");
    }
    constructor() {
      super(false);
    }
  });
  registerAction2(ToggleDiffAction);
  registerAction2(ToggleAccessibleDiffViewAction);
  registerAction2(class extends MultiDiffAcceptDiscardAction {
    constructor() {
      super(true);
    }
  });
  registerAction2(class extends MultiDiffAcceptDiscardAction {
    constructor() {
      super(false);
    }
  });
  MenuRegistry.appendMenuItem(MenuId.ChatEditingEditorContent, {
    command: {
      id: navigationBearingFakeActionId,
      title: localize("label", "Navigation Status"),
      precondition: ContextKeyExpr.false()
    },
    group: "navigate",
    order: -1,
    when: ContextKeyExpr.and(ctxReviewModeEnabled, ctxHasRequestInProgress.negate())
  });
}
__name(registerChatEditorActions, "registerChatEditorActions");
const navigationBearingFakeActionId = "chatEditor.navigation.bearings";
export {
  AcceptAction,
  RejectAction,
  ReviewChangesAction,
  navigationBearingFakeActionId,
  registerChatEditorActions
};
//# sourceMappingURL=chatEditingEditorActions.js.map
