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
import * as dom from "../../../../../../base/browser/dom.js";
import { renderIcon } from "../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { raceCancellationError } from "../../../../../../base/common/async.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import * as nls from "../../../../../../nls.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../../platform/instantiation/common/serviceCollection.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { editorBackground, editorForeground, inputBackground } from "../../../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../../../browser/parts/editor/editorPane.js";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "../../../../../common/theme.js";
import { ChatContextKeys } from "../../../common/actions/chatContextKeys.js";
import { IChatService } from "../../../common/chatService/chatService.js";
import { IChatSessionsService, localChatSessionType } from "../../../common/chatSessionsService.js";
import { ChatAgentLocation, ChatModeKind } from "../../../common/constants.js";
import { clearChatEditor } from "../../actions/chatClear.js";
import { ChatEditorInput } from "./chatEditorInput.js";
import { ChatWidget } from "../../widget/chatWidget.js";
let ChatEditor = class ChatEditor2 extends EditorPane {
  static {
    __name(this, "ChatEditor");
  }
  get widget() {
    return this._widget;
  }
  get scopedContextKeyService() {
    return this._scopedContextKeyService;
  }
  constructor(group, telemetryService, themeService, instantiationService, storageService, chatSessionsService, contextKeyService, chatService) {
    super(ChatEditorInput.EditorID, group, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.chatSessionsService = chatSessionsService;
    this.contextKeyService = contextKeyService;
    this.chatService = chatService;
    this.dimension = new dom.Dimension(0, 0);
  }
  async clear() {
    if (this.input) {
      return this.instantiationService.invokeFunction(clearChatEditor, this.input);
    }
  }
  createEditor(parent) {
    this._editorContainer = parent;
    parent.classList.add("chat-editor-relative");
    this._scopedContextKeyService = this._register(this.contextKeyService.createScoped(parent));
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    ChatContextKeys.inChatEditor.bindTo(this._scopedContextKeyService).set(true);
    this._widget = this._register(scopedInstantiationService.createInstance(ChatWidget, ChatAgentLocation.Chat, void 0, {
      autoScroll: /* @__PURE__ */ __name((mode) => mode !== ChatModeKind.Ask, "autoScroll"),
      renderFollowups: true,
      supportsFileReferences: true,
      clear: /* @__PURE__ */ __name(() => this.clear(), "clear"),
      rendererOptions: {
        renderTextEditsAsSummary: /* @__PURE__ */ __name((uri) => {
          return true;
        }, "renderTextEditsAsSummary"),
        referencesExpandedWhenEmptyResponse: false,
        progressMessageAtBottomOfResponse: /* @__PURE__ */ __name((mode) => mode !== ChatModeKind.Ask, "progressMessageAtBottomOfResponse")
      },
      enableImplicitContext: true,
      enableWorkingSet: "explicit",
      supportsChangingModes: true
    }, {
      listForeground: editorForeground,
      listBackground: editorBackground,
      overlayBackground: EDITOR_DRAG_AND_DROP_BACKGROUND,
      inputEditorBackground: inputBackground,
      resultEditorBackground: editorBackground
    }));
    this._register(this.widget.onDidSubmitAgent(() => {
      this.group.pinEditor(this.input);
    }));
    this.widget.render(parent);
    this.widget.setVisible(true);
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    this.widget?.setVisible(visible);
    if (visible && this.widget) {
      this.widget.layout(this.dimension.height, this.dimension.width);
    }
  }
  focus() {
    super.focus();
    this.widget?.focusInput();
  }
  clearInput() {
    this.saveState();
    this.widget.setModel(void 0);
    super.clearInput();
  }
  showLoadingInChatWidget(message) {
    if (!this._editorContainer) {
      return;
    }
    if (this._loadingContainer) {
      const existingText = this._loadingContainer.querySelector(".chat-loading-content span");
      if (existingText) {
        existingText.textContent = message;
        return;
      }
      this.hideLoadingInChatWidget();
    }
    this._editorContainer.setAttribute("aria-busy", "true");
    this._loadingContainer = dom.append(this._editorContainer, dom.$(".chat-loading-overlay"));
    this._loadingContainer.setAttribute("role", "status");
    this._loadingContainer.setAttribute("aria-live", "polite");
    this._loadingContainer.tabIndex = -1;
    const loadingContent = dom.append(this._loadingContainer, dom.$(".chat-loading-content"));
    const spinner = renderIcon(ThemeIcon.modify(Codicon.loading, "spin"));
    spinner.setAttribute("aria-hidden", "true");
    loadingContent.appendChild(spinner);
    const text = dom.append(loadingContent, dom.$("span"));
    text.textContent = message;
  }
  hideLoadingInChatWidget() {
    if (this._loadingContainer) {
      this._loadingContainer.remove();
      this._loadingContainer = void 0;
    }
    if (this._editorContainer) {
      this._editorContainer.removeAttribute("aria-busy");
    }
  }
  async setInput(input, options, context, token) {
    let isContributedChatSession = false;
    const chatSessionType = input.getSessionType();
    if (chatSessionType !== localChatSessionType) {
      const loadingMessage = nls.localize("chatEditor.loadingSession", "Loading...");
      this.showLoadingInChatWidget(loadingMessage);
    }
    await super.setInput(input, options, context, token);
    if (token.isCancellationRequested) {
      this.hideLoadingInChatWidget();
      return;
    }
    if (!this.widget) {
      throw new Error("ChatEditor lifecycle issue: no editor widget");
    }
    if (chatSessionType !== localChatSessionType) {
      try {
        await raceCancellationError(this.chatSessionsService.canResolveChatSession(input.resource), token);
        const contributions = this.chatSessionsService.getAllChatSessionContributions();
        const contribution = contributions.find((c) => c.type === chatSessionType);
        if (contribution) {
          this.widget.lockToCodingAgent(contribution.name, contribution.displayName, contribution.type);
          isContributedChatSession = true;
        } else {
          this.widget.unlockFromCodingAgent();
        }
      } catch (error) {
        this.hideLoadingInChatWidget();
        throw error;
      }
    } else {
      this.widget.unlockFromCodingAgent();
    }
    try {
      const editorModel = await raceCancellationError(input.resolve(), token);
      if (!editorModel) {
        throw new Error(`Failed to get model for chat editor. resource: ${input.sessionResource}`);
      }
      if (chatSessionType !== localChatSessionType) {
        this.hideLoadingInChatWidget();
      }
      if (options?.modelInputState) {
        editorModel.model.inputModel.setState(options.modelInputState);
      }
      this.updateModel(editorModel.model);
      if (isContributedChatSession && options?.title?.preferred && input.sessionResource) {
        this.chatService.setChatSessionTitle(input.sessionResource, options.title.preferred);
      }
    } catch (error) {
      this.hideLoadingInChatWidget();
      throw error;
    }
  }
  updateModel(model) {
    this.widget.setModel(model);
  }
  layout(dimension, position) {
    this.dimension = dimension;
    if (this.widget) {
      this.widget.layout(dimension.height, dimension.width);
    }
  }
};
ChatEditor = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IInstantiationService),
  __param(4, IStorageService),
  __param(5, IChatSessionsService),
  __param(6, IContextKeyService),
  __param(7, IChatService)
], ChatEditor);
export {
  ChatEditor
};
//# sourceMappingURL=chatEditor.js.map
