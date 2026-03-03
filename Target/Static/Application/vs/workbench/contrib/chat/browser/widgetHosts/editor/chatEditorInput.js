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
var ChatEditorInput_1;
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Disposable, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { revive } from "../../../../../../base/common/marshalling.js";
import { Schemas } from "../../../../../../base/common/network.js";
import { isEqual } from "../../../../../../base/common/resources.js";
import { truncate } from "../../../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { URI } from "../../../../../../base/common/uri.js";
import * as nls from "../../../../../../nls.js";
import { IDialogService } from "../../../../../../platform/dialogs/common/dialogs.js";
import { registerIcon } from "../../../../../../platform/theme/common/iconRegistry.js";
import { EditorInput } from "../../../../../common/editor/editorInput.js";
import { IChatService } from "../../../common/chatService/chatService.js";
import { IChatSessionsService, localChatSessionType } from "../../../common/chatSessionsService.js";
import { ChatAgentLocation, ChatEditorTitleMaxLength } from "../../../common/constants.js";
import { LocalChatSessionUri, getChatSessionType } from "../../../common/model/chatUri.js";
const ChatEditorIcon = registerIcon("chat-editor-label-icon", Codicon.chatSparkle, nls.localize("chatEditorLabelIcon", "Icon of the chat editor label."));
let ChatEditorInput = class ChatEditorInput2 extends EditorInput {
  static {
    __name(this, "ChatEditorInput");
  }
  static {
    ChatEditorInput_1 = this;
  }
  static {
    this.TypeID = "workbench.input.chatSession";
  }
  static {
    this.EditorID = "workbench.editor.chatSession";
  }
  /**
   * Get the uri of the session this editor input is associated with.
   *
   * This should be preferred over using `resource` directly, as it handles cases where a chat editor becomes a session
   */
  get sessionResource() {
    return this._sessionResource;
  }
  get model() {
    return this.modelRef.value?.object;
  }
  static getNewEditorUri() {
    return ChatEditorUri.getNewEditorUri();
  }
  constructor(resource, options, chatService, dialogService, chatSessionsService) {
    super();
    this.resource = resource;
    this.options = options;
    this.chatService = chatService;
    this.dialogService = dialogService;
    this.chatSessionsService = chatSessionsService;
    this.didTransferOutEditingSession = false;
    this.modelRef = this._register(new MutableDisposable());
    this.closeHandler = this;
    if (resource.scheme === Schemas.vscodeChatEditor) {
      const parsed = ChatEditorUri.parse(resource);
      if (!parsed || typeof parsed !== "number") {
        throw new Error("Invalid chat URI");
      }
    } else if (resource.scheme === Schemas.vscodeLocalChatSession) {
      const localSessionId = LocalChatSessionUri.parseLocalSessionId(resource);
      if (!localSessionId) {
        throw new Error("Invalid local chat session URI");
      }
      this._sessionResource = resource;
    } else {
      this._sessionResource = resource;
    }
  }
  showConfirm() {
    return !!(this.model && shouldShowClearEditingSessionConfirmation(this.model));
  }
  transferOutEditingSession() {
    this.didTransferOutEditingSession = true;
    return this.model?.editingSession;
  }
  async confirm(editors) {
    if (!this.model?.editingSession || this.didTransferOutEditingSession || this.getSessionType() !== localChatSessionType) {
      return 0;
    }
    const titleOverride = nls.localize("chatEditorConfirmTitle", "Close Chat Editor");
    const messageOverride = nls.localize("chat.startEditing.confirmation.pending.message.default", "Closing the chat editor will end your current edit session.");
    const result = await showClearEditingSessionConfirmation(this.model, this.dialogService, { titleOverride, messageOverride });
    return result ? 0 : 2;
  }
  get editorId() {
    return ChatEditorInput_1.EditorID;
  }
  get capabilities() {
    return super.capabilities | 8 | 128;
  }
  matches(otherInput) {
    if (!(otherInput instanceof ChatEditorInput_1)) {
      return false;
    }
    return isEqual(this.sessionResource, otherInput.sessionResource);
  }
  get typeId() {
    return ChatEditorInput_1.TypeID;
  }
  getName() {
    if (this.model?.title) {
      return this.model.hasCustomTitle ? this.model.title : truncate(this.model.title, ChatEditorTitleMaxLength);
    }
    if (this._sessionResource) {
      const existingSession = this.chatService.getSession(this._sessionResource);
      if (existingSession?.title) {
        return existingSession.title;
      }
      const persistedTitle = this.chatService.getSessionTitle(this._sessionResource);
      if (persistedTitle && persistedTitle.trim()) {
        return persistedTitle;
      }
    }
    if (this.options.title?.preferred) {
      return this.options.title.preferred;
    }
    return this.options.title?.fallback ?? nls.localize("chatEditorName", "Chat");
  }
  getTitle(verbosity) {
    const name = this.getName();
    if (verbosity === 2) {
      const sessionTypeDisplayName = this.getSessionTypeDisplayName();
      if (sessionTypeDisplayName) {
        return `${name} | ${sessionTypeDisplayName}`;
      }
    }
    return name;
  }
  getSessionTypeDisplayName() {
    const sessionType = this.getSessionType();
    if (sessionType === localChatSessionType) {
      return;
    }
    const contributions = this.chatSessionsService.getAllChatSessionContributions();
    const contribution = contributions.find((c) => c.type === sessionType);
    return contribution?.displayName;
  }
  getIcon() {
    const resolvedIcon = this.resolveIcon();
    if (resolvedIcon) {
      this.cachedIcon = resolvedIcon;
      return resolvedIcon;
    }
    return ChatEditorIcon;
  }
  resolveIcon() {
    const sessionType = this.getSessionType();
    if (sessionType !== localChatSessionType) {
      const typeIcon = this.chatSessionsService.getIconForSessionType(sessionType);
      if (typeIcon) {
        return typeIcon;
      }
    }
    return void 0;
  }
  /**
   * Returns chat session type from a URI, or {@linkcode localChatSessionType} if not specified or cannot be determined.
   */
  getSessionType() {
    return getChatSessionType(this.resource);
  }
  async resolve() {
    const searchParams = new URLSearchParams(this.resource.query);
    const chatSessionType = searchParams.get("chatSessionType");
    const inputType = chatSessionType ?? this.resource.authority;
    if (this._sessionResource) {
      this.modelRef.value = await this.chatService.acquireOrLoadSession(this._sessionResource, ChatAgentLocation.Chat, CancellationToken.None);
      if (!this.model && LocalChatSessionUri.parseLocalSessionId(this._sessionResource)) {
        this.modelRef.value = this.chatService.startNewLocalSession(ChatAgentLocation.Chat, { canUseTools: true });
      }
    } else if (!this.options.target) {
      this.modelRef.value = this.chatService.startNewLocalSession(ChatAgentLocation.Chat, { canUseTools: !inputType });
    } else if (this.options.target.data) {
      this.modelRef.value = this.chatService.loadSessionFromData(this.options.target.data);
    }
    if (!this.model || this.isDisposed()) {
      return null;
    }
    this._sessionResource = this.model.sessionResource;
    this._register(this.model.onDidChange((e) => {
      this.cachedIcon = void 0;
      this._onDidChangeLabel.fire();
    }));
    const newIcon = this.resolveIcon();
    if (newIcon && (!this.cachedIcon || !this.iconsEqual(this.cachedIcon, newIcon))) {
      this.cachedIcon = newIcon;
    }
    this._onDidChangeLabel.fire();
    return this._register(new ChatEditorModel(this.model));
  }
  iconsEqual(a, b) {
    if (ThemeIcon.isThemeIcon(a) && ThemeIcon.isThemeIcon(b)) {
      return a.id === b.id;
    }
    if (a instanceof URI && b instanceof URI) {
      return a.toString() === b.toString();
    }
    return false;
  }
};
ChatEditorInput = ChatEditorInput_1 = __decorate([
  __param(2, IChatService),
  __param(3, IDialogService),
  __param(4, IChatSessionsService)
], ChatEditorInput);
class ChatEditorModel extends Disposable {
  static {
    __name(this, "ChatEditorModel");
  }
  constructor(model) {
    super();
    this.model = model;
    this._isResolved = false;
  }
  async resolve() {
    this._isResolved = true;
  }
  isResolved() {
    return this._isResolved;
  }
  isDisposed() {
    return this._store.isDisposed;
  }
}
var ChatEditorUri;
(function(ChatEditorUri2) {
  const scheme = Schemas.vscodeChatEditor;
  function getNewEditorUri() {
    const handle = Math.floor(Math.random() * 1e9);
    return URI.from({ scheme, path: `chat-${handle}` });
  }
  __name(getNewEditorUri, "getNewEditorUri");
  ChatEditorUri2.getNewEditorUri = getNewEditorUri;
  function parse(resource) {
    if (resource.scheme !== scheme) {
      return void 0;
    }
    const match = resource.path.match(/chat-(\d+)/);
    const handleStr = match?.[1];
    if (typeof handleStr !== "string") {
      return void 0;
    }
    const handle = parseInt(handleStr);
    if (isNaN(handle)) {
      return void 0;
    }
    return handle;
  }
  __name(parse, "parse");
  ChatEditorUri2.parse = parse;
})(ChatEditorUri || (ChatEditorUri = {}));
class ChatEditorInputSerializer {
  static {
    __name(this, "ChatEditorInputSerializer");
  }
  canSerialize(input) {
    return input instanceof ChatEditorInput && !!input.sessionResource;
  }
  serialize(input) {
    if (!this.canSerialize(input)) {
      return void 0;
    }
    const obj = {
      options: input.options,
      sessionResource: input.sessionResource,
      resource: input.resource
    };
    return JSON.stringify(obj);
  }
  deserialize(instantiationService, serializedEditor) {
    try {
      const parsed = revive(JSON.parse(serializedEditor));
      if (parsed.sessionResource) {
        const sessionResource = URI.revive(parsed.sessionResource);
        return instantiationService.createInstance(ChatEditorInput, sessionResource, parsed.options);
      }
      let resource = URI.revive(parsed.resource);
      if (resource.scheme === Schemas.vscodeChatEditor && parsed.sessionId) {
        resource = LocalChatSessionUri.forSession(parsed.sessionId);
      }
      return instantiationService.createInstance(ChatEditorInput, resource, parsed.options);
    } catch (err) {
      return void 0;
    }
  }
}
async function showClearEditingSessionConfirmation(model, dialogService, options) {
  const undecidedEdits = shouldShowClearEditingSessionConfirmation(model, options);
  if (!undecidedEdits) {
    return true;
  }
  const defaultPhrase = nls.localize("chat.startEditing.confirmation.pending.message.default1", "Starting a new chat will end your current edit session.");
  const defaultTitle = nls.localize("chat.startEditing.confirmation.title", "Start new chat?");
  const phrase = options?.messageOverride ?? defaultPhrase;
  const title = options?.titleOverride ?? defaultTitle;
  const { result } = await dialogService.prompt({
    title,
    message: phrase + " " + nls.localize("chat.startEditing.confirmation.pending.message.2", "Do you want to keep pending edits to {0} files?", undecidedEdits),
    type: "info",
    cancelButton: true,
    buttons: [
      {
        label: nls.localize("chat.startEditing.confirmation.acceptEdits", "Keep & Continue"),
        run: /* @__PURE__ */ __name(async () => {
          await model.editingSession.accept();
          return true;
        }, "run")
      },
      {
        label: nls.localize("chat.startEditing.confirmation.discardEdits", "Undo & Continue"),
        run: /* @__PURE__ */ __name(async () => {
          await model.editingSession.reject();
          return true;
        }, "run")
      }
    ]
  });
  return Boolean(result);
}
__name(showClearEditingSessionConfirmation, "showClearEditingSessionConfirmation");
function shouldShowClearEditingSessionConfirmation(model, options) {
  if (!model.editingSession || model.willKeepAlive && !options?.isArchiveAction) {
    return 0;
  }
  const currentEdits = model.editingSession.entries.get();
  const undecidedEdits = currentEdits.filter(
    (edit) => edit.state.get() === 0
    /* ModifiedFileEntryState.Modified */
  );
  return undecidedEdits.length;
}
__name(shouldShowClearEditingSessionConfirmation, "shouldShowClearEditingSessionConfirmation");
export {
  ChatEditorInput,
  ChatEditorInputSerializer,
  ChatEditorModel,
  shouldShowClearEditingSessionConfirmation,
  showClearEditingSessionConfirmation
};
//# sourceMappingURL=chatEditorInput.js.map
