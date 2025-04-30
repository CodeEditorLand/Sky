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
import { $, getWindow } from "../../../../base/browser/dom.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { editorBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ViewPane } from "../../../browser/parts/views/viewPane.js";
import { Memento } from "../../../common/memento.js";
import { SIDE_BAR_FOREGROUND } from "../../../common/theme.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IChatAgentService } from "../common/chatAgents.js";
import { ChatModelInitState } from "../common/chatModel.js";
import { CHAT_PROVIDER_ID } from "../common/chatParticipantContribTypes.js";
import { IChatService } from "../common/chatService.js";
import { ChatAgentLocation, ChatMode } from "../common/constants.js";
import { ChatWidget } from "./chatWidget.js";
import { ChatViewWelcomeController } from "./viewsWelcome/chatViewWelcomeController.js";
const CHAT_SIDEBAR_OLD_VIEW_PANEL_ID = "workbench.panel.chatSidebar";
const CHAT_SIDEBAR_PANEL_ID = "workbench.panel.chat";
let ChatViewPane = class ChatViewPane2 extends ViewPane {
  static {
    __name(this, "ChatViewPane");
  }
  get widget() {
    return this._widget;
  }
  constructor(chatOptions, options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, storageService, chatService, chatAgentService, logService, layoutService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.chatOptions = chatOptions;
    this.storageService = storageService;
    this.chatService = chatService;
    this.chatAgentService = chatAgentService;
    this.logService = logService;
    this.layoutService = layoutService;
    this.modelDisposables = this._register(new DisposableStore());
    this.defaultParticipantRegistrationFailed = false;
    this.didUnregisterProvider = false;
    this.memento = new Memento("interactive-session-view-" + CHAT_PROVIDER_ID, this.storageService);
    this.viewState = this.memento.getMemento(
      1,
      1
      /* StorageTarget.MACHINE */
    );
    if (this.chatOptions.location === ChatAgentLocation.Panel && !this.viewState.hasMigratedCurrentSession) {
      const editsMemento = new Memento("interactive-session-view-" + CHAT_PROVIDER_ID + `-edits`, this.storageService);
      const lastEditsState = editsMemento.getMemento(
        1,
        1
        /* StorageTarget.MACHINE */
      );
      if (lastEditsState.sessionId) {
        this.logService.trace(`ChatViewPane: last edits session was ${lastEditsState.sessionId}`);
        if (!this.chatService.isPersistedSessionEmpty(lastEditsState.sessionId)) {
          this.logService.info(`ChatViewPane: migrating ${lastEditsState.sessionId} to unified view`);
          this.viewState.sessionId = lastEditsState.sessionId;
          this.viewState.inputValue = lastEditsState.inputValue;
          this.viewState.inputState = {
            ...lastEditsState.inputState,
            chatMode: lastEditsState.inputState?.chatMode ?? ChatMode.Edit
          };
          this.viewState.hasMigratedCurrentSession = true;
        }
      }
    }
    this._register(this.chatAgentService.onDidChangeAgents(() => {
      if (this.chatAgentService.getDefaultAgent(this.chatOptions?.location)) {
        if (!this._widget?.viewModel && !this._restoringSession) {
          const info = this.getTransferredOrPersistedSessionInfo();
          this._restoringSession = (info.sessionId ? this.chatService.getOrRestoreSession(info.sessionId) : Promise.resolve(void 0)).then(async (model) => {
            if (!this._widget) {
              return;
            }
            const wasVisible = this._widget.visible;
            try {
              this._widget.setVisible(false);
              await this.updateModel(model, info.inputValue || info.mode ? { inputState: { chatMode: info.mode }, inputValue: info.inputValue } : void 0);
              this.defaultParticipantRegistrationFailed = false;
              this.didUnregisterProvider = false;
              this._onDidChangeViewWelcomeState.fire();
            } finally {
              this.widget.setVisible(wasVisible);
            }
          });
          this._restoringSession.finally(() => this._restoringSession = void 0);
        }
      } else if (this._widget?.viewModel?.initState === ChatModelInitState.Initialized) {
        this.didUnregisterProvider = true;
      }
      this._onDidChangeViewWelcomeState.fire();
    }));
  }
  getActionsContext() {
    return this.widget?.viewModel ? {
      sessionId: this.widget.viewModel.sessionId,
      $mid: 19
      /* MarshalledId.ChatViewContext */
    } : void 0;
  }
  async updateModel(model, viewState) {
    this.modelDisposables.clear();
    model = model ?? (this.chatService.transferredSessionData?.sessionId && this.chatService.transferredSessionData?.location === this.chatOptions.location ? await this.chatService.getOrRestoreSession(this.chatService.transferredSessionData.sessionId) : this.chatService.startSession(this.chatOptions.location, CancellationToken.None));
    if (!model) {
      throw new Error("Could not start chat session");
    }
    if (viewState) {
      this.updateViewState(viewState);
    }
    this.viewState.sessionId = model.sessionId;
    this._widget.setModel(model, { ...this.viewState });
    this.updateActions();
  }
  shouldShowWelcome() {
    const noPersistedSessions = !this.chatService.hasSessions();
    const hasCoreAgent = this.chatAgentService.getAgents().some((agent) => agent.isCore && agent.locations.includes(this.chatOptions.location));
    const shouldShow = !hasCoreAgent && (this.didUnregisterProvider || !this._widget?.viewModel && noPersistedSessions || this.defaultParticipantRegistrationFailed);
    this.logService.trace(`ChatViewPane#shouldShowWelcome(${this.chatOptions.location}) = ${shouldShow}: hasCoreAgent=${hasCoreAgent} didUnregister=${this.didUnregisterProvider} || noViewModel=${!this._widget?.viewModel} && noPersistedSessions=${noPersistedSessions} || defaultParticipantRegistrationFailed=${this.defaultParticipantRegistrationFailed}`);
    return !!shouldShow;
  }
  getTransferredOrPersistedSessionInfo() {
    if (this.chatService.transferredSessionData?.location === this.chatOptions.location) {
      const sessionId = this.chatService.transferredSessionData.sessionId;
      return {
        sessionId,
        inputValue: this.chatService.transferredSessionData.inputValue,
        mode: this.chatService.transferredSessionData.mode
      };
    } else {
      return { sessionId: this.viewState.sessionId };
    }
  }
  async renderBody(parent) {
    try {
      super.renderBody(parent);
      this._register(this.instantiationService.createInstance(ChatViewWelcomeController, parent, this, this.chatOptions.location));
      const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
      const locationBasedColors = this.getLocationBasedColors();
      const editorOverflowNode = this.layoutService.getContainer(getWindow(parent)).appendChild($(".chat-editor-overflow.monaco-editor"));
      this._register({ dispose: /* @__PURE__ */ __name(() => editorOverflowNode.remove(), "dispose") });
      this._widget = this._register(scopedInstantiationService.createInstance(ChatWidget, this.chatOptions.location, { viewId: this.id }, {
        autoScroll: /* @__PURE__ */ __name((mode) => mode !== ChatMode.Ask, "autoScroll"),
        renderFollowups: this.chatOptions.location === ChatAgentLocation.Panel,
        supportsFileReferences: true,
        rendererOptions: {
          renderTextEditsAsSummary: /* @__PURE__ */ __name((uri) => {
            return true;
          }, "renderTextEditsAsSummary"),
          referencesExpandedWhenEmptyResponse: false,
          progressMessageAtBottomOfResponse: /* @__PURE__ */ __name((mode) => mode !== ChatMode.Ask, "progressMessageAtBottomOfResponse")
        },
        editorOverflowWidgetsDomNode: editorOverflowNode,
        enableImplicitContext: this.chatOptions.location === ChatAgentLocation.Panel,
        enableWorkingSet: "explicit",
        supportsChangingModes: true
      }, {
        listForeground: SIDE_BAR_FOREGROUND,
        listBackground: locationBasedColors.background,
        overlayBackground: locationBasedColors.overlayBackground,
        inputEditorBackground: locationBasedColors.background,
        resultEditorBackground: editorBackground
      }));
      this._register(this.onDidChangeBodyVisibility((visible) => {
        this._widget.setVisible(visible);
      }));
      this._register(this._widget.onDidClear(() => this.clear()));
      this._widget.render(parent);
      const info = this.getTransferredOrPersistedSessionInfo();
      const disposeListener = this._register(this.chatService.onDidDisposeSession((e) => {
        if (e.reason === "initializationFailed") {
          this.defaultParticipantRegistrationFailed = true;
          disposeListener?.dispose();
          this._onDidChangeViewWelcomeState.fire();
        }
      }));
      const model = info.sessionId ? await this.chatService.getOrRestoreSession(info.sessionId) : void 0;
      await this.updateModel(model, info.inputValue || info.mode ? { inputState: { chatMode: info.mode }, inputValue: info.inputValue } : void 0);
    } catch (e) {
      this.logService.error(e);
      throw e;
    }
  }
  acceptInput(query) {
    this._widget.acceptInput(query);
  }
  async clear() {
    if (this.widget.viewModel) {
      await this.chatService.clearSession(this.widget.viewModel.sessionId);
    }
    this.updateViewState();
    await this.updateModel(void 0);
    this.updateActions();
  }
  async loadSession(sessionId, viewState) {
    if (this.widget.viewModel) {
      await this.chatService.clearSession(this.widget.viewModel.sessionId);
    }
    const newModel = await this.chatService.getOrRestoreSession(sessionId);
    await this.updateModel(newModel, viewState);
  }
  focusInput() {
    this._widget.focusInput();
  }
  focus() {
    super.focus();
    this._widget.focusInput();
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this._widget.layout(height, width);
  }
  saveState() {
    if (this._widget) {
      this._widget.saveState();
      this.updateViewState();
      this.memento.saveMemento();
    }
    super.saveState();
  }
  updateViewState(viewState) {
    const newViewState = viewState ?? this._widget.getViewState();
    for (const [key, value] of Object.entries(newViewState)) {
      this.viewState[key] = value;
    }
  }
};
ChatViewPane = __decorate([
  __param(2, IKeybindingService),
  __param(3, IContextMenuService),
  __param(4, IConfigurationService),
  __param(5, IContextKeyService),
  __param(6, IViewDescriptorService),
  __param(7, IInstantiationService),
  __param(8, IOpenerService),
  __param(9, IThemeService),
  __param(10, IHoverService),
  __param(11, IStorageService),
  __param(12, IChatService),
  __param(13, IChatAgentService),
  __param(14, ILogService),
  __param(15, ILayoutService)
], ChatViewPane);
export {
  CHAT_SIDEBAR_OLD_VIEW_PANEL_ID,
  CHAT_SIDEBAR_PANEL_ID,
  ChatViewPane
};
//# sourceMappingURL=chatViewPane.js.map
