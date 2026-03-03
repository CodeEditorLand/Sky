var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var InlineChatEscapeToolContribution_1;
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, dispose, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { autorun, observableFromEvent } from "../../../../base/common/observable.js";
import { isEqual } from "../../../../base/common/resources.js";
import { isCodeEditor, isCompositeEditor, isDiffEditor } from "../../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IChatAgentService } from "../../chat/common/participants/chatAgents.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { IChatService } from "../../chat/common/chatService/chatService.js";
import { ChatAgentLocation } from "../../chat/common/constants.js";
import { ILanguageModelToolsService, ToolDataSource } from "../../chat/common/tools/languageModelToolsService.js";
import { CTX_INLINE_CHAT_HAS_AGENT2, CTX_INLINE_CHAT_HAS_NOTEBOOK_AGENT, CTX_INLINE_CHAT_POSSIBLE } from "../common/inlineChat.js";
import { askInPanelChat, IInlineChatSessionService } from "./inlineChatSessionService.js";
class InlineChatError extends Error {
  static {
    __name(this, "InlineChatError");
  }
  static {
    this.code = "InlineChatError";
  }
  constructor(message) {
    super(message);
    this.name = InlineChatError.code;
  }
}
let InlineChatSessionServiceImpl = class InlineChatSessionServiceImpl2 {
  static {
    __name(this, "InlineChatSessionServiceImpl");
  }
  constructor(_chatService, chatAgentService) {
    this._chatService = _chatService;
    this._store = new DisposableStore();
    this._sessions = new ResourceMap();
    this._onWillStartSession = this._store.add(new Emitter());
    this.onWillStartSession = this._onWillStartSession.event;
    this._onDidChangeSessions = this._store.add(new Emitter());
    this.onDidChangeSessions = this._onDidChangeSessions.event;
    const agentObs = observableFromEvent(this, chatAgentService.onDidChangeAgents, () => chatAgentService.getDefaultAgent(ChatAgentLocation.EditorInline));
    this._store.add(autorun((r) => {
      const agent = agentObs.read(r);
      if (!agent) {
        dispose(this._sessions.values());
        this._sessions.clear();
      }
    }));
  }
  dispose() {
    this._store.dispose();
  }
  createSession(editor) {
    const uri = editor.getModel().uri;
    if (this._sessions.has(uri)) {
      throw new Error("Session already exists");
    }
    this._onWillStartSession.fire(editor);
    const chatModelRef = this._chatService.startNewLocalSession(ChatAgentLocation.EditorInline, {
      canUseTools: false
      /* SEE https://github.com/microsoft/vscode/issues/279946 */
    });
    const chatModel = chatModelRef.object;
    chatModel.startEditingSession(false);
    const store = new DisposableStore();
    store.add(toDisposable(() => {
      this._chatService.cancelCurrentRequestForSession(chatModel.sessionResource, "inlineChatSession");
      chatModel.editingSession?.reject();
      this._sessions.delete(uri);
      this._onDidChangeSessions.fire(this);
    }));
    store.add(chatModelRef);
    store.add(autorun((r) => {
      const entries = chatModel.editingSession?.entries.read(r);
      if (!entries?.length) {
        return;
      }
      const state = entries.find((entry) => isEqual(entry.modifiedURI, uri))?.state.read(r);
      if (state === 1 || state === 2) {
        const response = chatModel.getRequests().at(-1)?.response;
        if (response) {
          this._chatService.notifyUserAction({
            sessionResource: response.session.sessionResource,
            requestId: response.requestId,
            agentId: response.agent?.id,
            command: response.slashCommand?.name,
            result: response.result,
            action: {
              kind: "inlineChat",
              action: state === 1 ? "accepted" : "discarded"
            }
          });
        }
      }
      const allSettled = entries.every((entry) => {
        const state2 = entry.state.read(r);
        return (state2 === 1 || state2 === 2) && !entry.isCurrentlyBeingModifiedBy.read(r);
      });
      if (allSettled && !chatModel.requestInProgress.read(void 0)) {
        store.dispose();
      }
    }));
    const result = {
      uri,
      initialPosition: editor.getSelection().getStartPosition().delta(-1),
      /* one line above selection start */
      initialSelection: editor.getSelection(),
      chatModel,
      editingSession: chatModel.editingSession,
      dispose: store.dispose.bind(store)
    };
    this._sessions.set(uri, result);
    this._onDidChangeSessions.fire(this);
    return result;
  }
  getSessionByTextModel(uri) {
    let result = this._sessions.get(uri);
    if (!result) {
      for (const [_, candidate] of this._sessions) {
        const entry = candidate.editingSession.getEntry(uri);
        if (entry) {
          result = candidate;
          break;
        }
      }
    }
    return result;
  }
  getSessionBySessionUri(sessionResource) {
    for (const session of this._sessions.values()) {
      if (isEqual(session.chatModel.sessionResource, sessionResource)) {
        return session;
      }
    }
    return void 0;
  }
};
InlineChatSessionServiceImpl = __decorate([
  __param(0, IChatService),
  __param(1, IChatAgentService)
], InlineChatSessionServiceImpl);
let InlineChatEnabler = class InlineChatEnabler2 {
  static {
    __name(this, "InlineChatEnabler");
  }
  static {
    this.Id = "inlineChat.enabler";
  }
  constructor(contextKeyService, chatAgentService, editorService, configService) {
    this._store = new DisposableStore();
    this._ctxHasProvider2 = CTX_INLINE_CHAT_HAS_AGENT2.bindTo(contextKeyService);
    this._ctxHasNotebookProvider = CTX_INLINE_CHAT_HAS_NOTEBOOK_AGENT.bindTo(contextKeyService);
    this._ctxPossible = CTX_INLINE_CHAT_POSSIBLE.bindTo(contextKeyService);
    const agentObs = observableFromEvent(this, chatAgentService.onDidChangeAgents, () => chatAgentService.getDefaultAgent(ChatAgentLocation.EditorInline));
    const notebookAgentObs = observableFromEvent(this, chatAgentService.onDidChangeAgents, () => chatAgentService.getDefaultAgent(ChatAgentLocation.Notebook));
    const notebookAgentConfigObs = observableConfigValue("inlineChat.notebookAgent", false, configService);
    this._store.add(autorun((r) => {
      const agent = agentObs.read(r);
      if (!agent) {
        this._ctxHasProvider2.reset();
      } else {
        this._ctxHasProvider2.set(true);
      }
    }));
    this._store.add(autorun((r) => {
      this._ctxHasNotebookProvider.set(notebookAgentConfigObs.read(r) && !!notebookAgentObs.read(r));
    }));
    const updateEditor = /* @__PURE__ */ __name(() => {
      const ctrl = editorService.activeEditorPane?.getControl();
      const isCodeEditorLike = isCodeEditor(ctrl) || isDiffEditor(ctrl) || isCompositeEditor(ctrl);
      this._ctxPossible.set(isCodeEditorLike);
    }, "updateEditor");
    this._store.add(editorService.onDidActiveEditorChange(updateEditor));
    updateEditor();
  }
  dispose() {
    this._ctxPossible.reset();
    this._ctxHasProvider2.reset();
    this._store.dispose();
  }
};
InlineChatEnabler = __decorate([
  __param(0, IContextKeyService),
  __param(1, IChatAgentService),
  __param(2, IEditorService),
  __param(3, IConfigurationService)
], InlineChatEnabler);
let InlineChatEscapeToolContribution = class InlineChatEscapeToolContribution2 extends Disposable {
  static {
    __name(this, "InlineChatEscapeToolContribution");
  }
  static {
    InlineChatEscapeToolContribution_1 = this;
  }
  static {
    this.Id = "inlineChat.escapeTool";
  }
  static {
    this.DONT_ASK_AGAIN_KEY = "inlineChat.dontAskMoveToPanelChat";
  }
  static {
    this._data = {
      id: "inline_chat_exit",
      source: ToolDataSource.Internal,
      canBeReferencedInPrompt: false,
      alwaysDisplayInputOutput: false,
      displayName: localize("name", "Inline Chat to Panel Chat"),
      modelDescription: "Moves the inline chat session to the richer panel chat which supports edits across files, creating and deleting files, multi-turn conversations between the user and the assistant, and access to more IDE tools, like retrieve problems, interact with source control, run terminal commands etc."
    };
  }
  constructor(lmTools, inlineChatSessionService, dialogService, codeEditorService, chatService, logService, storageService, instaService) {
    super();
    this._store.add(lmTools.registerTool(InlineChatEscapeToolContribution_1._data, {
      invoke: /* @__PURE__ */ __name(async (invocation, _tokenCountFn, _progress, _token) => {
        const sessionResource = invocation.context?.sessionResource;
        if (!sessionResource) {
          logService.warn("InlineChatEscapeToolContribution: no sessionId in tool invocation context");
          return { content: [{ kind: "text", value: "Cancel" }] };
        }
        const session = inlineChatSessionService.getSessionBySessionUri(sessionResource);
        if (!session) {
          logService.warn(`InlineChatEscapeToolContribution: no session found for id ${sessionResource}`);
          return { content: [{ kind: "text", value: "Cancel" }] };
        }
        const dontAskAgain = storageService.getBoolean(
          InlineChatEscapeToolContribution_1.DONT_ASK_AGAIN_KEY,
          0
          /* StorageScope.PROFILE */
        );
        let result;
        if (dontAskAgain !== void 0) {
          result = { confirmed: dontAskAgain, checkboxChecked: false };
        } else {
          result = await dialogService.confirm({
            type: "question",
            title: localize("confirm.title", "Do you want to continue in Chat view?"),
            message: localize("confirm", "Do you want to continue in Chat view?"),
            detail: localize("confirm.detail", "Inline chat is designed for making single-file code changes. Continue your request in the Chat view or rephrase it for inline chat."),
            primaryButton: localize("confirm.yes", "Continue in Chat view"),
            cancelButton: localize("confirm.cancel", "Cancel"),
            checkbox: { label: localize("chat.remove.confirmation.checkbox", "Don't ask again"), checked: false }
          });
        }
        const editor = codeEditorService.getFocusedCodeEditor();
        if (!editor || result.confirmed) {
          logService.trace("InlineChatEscapeToolContribution: moving session to panel chat");
          await instaService.invokeFunction(askInPanelChat, session.chatModel.getRequests().at(-1), session.chatModel.inputModel.state.get());
          session.dispose();
        } else {
          logService.trace("InlineChatEscapeToolContribution: rephrase prompt");
          const lastRequest = session.chatModel.getRequests().at(-1);
          chatService.removeRequest(session.chatModel.sessionResource, lastRequest.id);
          session.chatModel.inputModel.setState({ inputText: lastRequest.message.text });
        }
        if (result.checkboxChecked) {
          storageService.store(
            InlineChatEscapeToolContribution_1.DONT_ASK_AGAIN_KEY,
            result.confirmed,
            0,
            0
            /* StorageTarget.USER */
          );
          logService.trace("InlineChatEscapeToolContribution: stored don't ask again preference");
        }
        return { content: [{ kind: "text", value: "Success" }] };
      }, "invoke")
    }));
  }
};
InlineChatEscapeToolContribution = InlineChatEscapeToolContribution_1 = __decorate([
  __param(0, ILanguageModelToolsService),
  __param(1, IInlineChatSessionService),
  __param(2, IDialogService),
  __param(3, ICodeEditorService),
  __param(4, IChatService),
  __param(5, ILogService),
  __param(6, IStorageService),
  __param(7, IInstantiationService)
], InlineChatEscapeToolContribution);
registerAction2(class ResetMoveToPanelChatChoice extends Action2 {
  static {
    __name(this, "ResetMoveToPanelChatChoice");
  }
  constructor() {
    super({
      id: "inlineChat.resetMoveToPanelChatChoice",
      precondition: ChatContextKeys.Setup.hidden.negate(),
      title: localize2("resetChoice.label", "Reset Choice for 'Move Inline Chat to Panel Chat'"),
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IStorageService).remove(
      InlineChatEscapeToolContribution.DONT_ASK_AGAIN_KEY,
      0
      /* StorageScope.PROFILE */
    );
  }
});
export {
  InlineChatEnabler,
  InlineChatError,
  InlineChatEscapeToolContribution,
  InlineChatSessionServiceImpl
};
//# sourceMappingURL=inlineChatSessionServiceImpl.js.map
