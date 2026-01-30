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
var AgentSessionsWelcomePage_1;
import "./media/agentSessionsWelcome.css";
import { $, addDisposableListener, append, clearNode, getWindow, scheduleAtNextAnimationFrame } from "../../../../base/browser/dom.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { Toggle } from "../../../../base/browser/ui/toggle/toggle.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { Emitter } from "../../../../base/common/event.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { editorBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { defaultToggleStyles, getListStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { SIDE_BAR_FOREGROUND } from "../../../common/theme.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { ChatAgentLocation, ChatModeKind } from "../../chat/common/constants.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { ChatWidget } from "../../chat/browser/widget/chatWidget.js";
import { IAgentSessionsService } from "../../chat/browser/agentSessions/agentSessionsService.js";
import { AgentSessionProviders } from "../../chat/browser/agentSessions/agentSessions.js";
import { AgentSessionsWelcomeInput } from "./agentSessionsWelcomeInput.js";
import { IChatService } from "../../chat/common/chatService/chatService.js";
import { AgentSessionsControl } from "../../chat/browser/agentSessions/agentSessionsControl.js";
import { IWalkthroughsService } from "../../welcomeGettingStarted/browser/gettingStartedService.js";
const configurationKey = "workbench.startupEditor";
const MAX_SESSIONS = 6;
let AgentSessionsWelcomePage = class AgentSessionsWelcomePage2 extends EditorPane {
  static {
    __name(this, "AgentSessionsWelcomePage");
  }
  static {
    AgentSessionsWelcomePage_1 = this;
  }
  static {
    this.ID = "agentSessionsWelcomePage";
  }
  constructor(group, telemetryService, themeService, storageService, instantiationService, contextKeyService, layoutService, commandService, agentSessionsService, configurationService, productService, walkthroughsService, chatService) {
    super(AgentSessionsWelcomePage_1.ID, group, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.layoutService = layoutService;
    this.commandService = commandService;
    this.agentSessionsService = agentSessionsService;
    this.configurationService = configurationService;
    this.productService = productService;
    this.walkthroughsService = walkthroughsService;
    this.chatService = chatService;
    this.sessionsControlDisposables = this._register(new DisposableStore());
    this.contentDisposables = this._register(new DisposableStore());
    this.walkthroughs = [];
    this._selectedSessionProvider = AgentSessionProviders.Local;
    this.container = $(".agentSessionsWelcome", {
      role: "document",
      tabindex: 0,
      "aria-label": localize("agentSessionsWelcomeAriaLabel", "Overview of agent sessions and how to get started.")
    });
    this.contextService = this._register(contextKeyService.createScoped(this.container));
    ChatContextKeys.inAgentSessionsWelcome.bindTo(this.contextService).set(true);
  }
  createEditor(parent) {
    parent.appendChild(this.container);
    this.contentContainer = $(".agentSessionsWelcome-content");
    this.scrollableElement = this._register(new DomScrollableElement(this.contentContainer, {
      className: "agentSessionsWelcome-scrollable",
      vertical: 1
      /* ScrollbarVisibility.Auto */
    }));
    this.container.appendChild(this.scrollableElement.getDomNode());
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    await this.buildContent();
  }
  async buildContent() {
    this.contentDisposables.clear();
    this.sessionsControlDisposables.clear();
    this.sessionsControl = void 0;
    clearNode(this.contentContainer);
    this.walkthroughs = this.walkthroughsService.getWalkthroughs();
    const header = append(this.contentContainer, $(".agentSessionsWelcome-header"));
    append(header, $("h1.product-name", {}, this.productService.nameLong));
    const startEntries = append(header, $(".agentSessionsWelcome-startEntries"));
    this.buildStartEntries(startEntries);
    const chatSection = append(this.contentContainer, $(".agentSessionsWelcome-chatSection"));
    this.buildChatWidget(chatSection);
    const sessions = this.agentSessionsService.model.sessions;
    const sessionsSection = append(this.contentContainer, $(".agentSessionsWelcome-sessionsSection"));
    if (sessions.length > 0) {
      this.buildSessionsGrid(sessionsSection, sessions);
    } else {
      const walkthroughsSection = append(this.contentContainer, $(".agentSessionsWelcome-walkthroughsSection"));
      this.buildWalkthroughs(walkthroughsSection);
    }
    const footer = append(this.contentContainer, $(".agentSessionsWelcome-footer"));
    this.buildFooter(footer);
    this.contentDisposables.add(this.agentSessionsService.model.onDidChangeSessions(() => {
      clearNode(sessionsSection);
      this.buildSessionsOrPrompts(sessionsSection);
    }));
    this.scrollableElement?.scanDomNode();
  }
  buildStartEntries(container) {
    const entries = [
      { icon: Codicon.folderOpened, label: localize("openRecent", "Open Recent..."), command: "workbench.action.openRecent" },
      { icon: Codicon.newFile, label: localize("newFile", "New file..."), command: "workbench.action.files.newUntitledFile" },
      { icon: Codicon.repoClone, label: localize("cloneRepo", "Clone Git Repository..."), command: "git.clone" }
    ];
    for (const entry of entries) {
      const button = append(container, $("button.agentSessionsWelcome-startEntry"));
      button.appendChild(renderIcon(entry.icon));
      button.appendChild(document.createTextNode(entry.label));
      button.onclick = () => this.commandService.executeCommand(entry.command);
    }
  }
  buildChatWidget(container) {
    const chatWidgetContainer = append(container, $(".agentSessionsWelcome-chatWidget"));
    const editorOverflowWidgetsDomNode = this.layoutService.getContainer(getWindow(chatWidgetContainer)).appendChild($(".chat-editor-overflow.monaco-editor"));
    this.contentDisposables.add(toDisposable(() => editorOverflowWidgetsDomNode.remove()));
    const scopedContextKeyService = this.contentDisposables.add(this.contextService.createScoped(chatWidgetContainer));
    const scopedInstantiationService = this.contentDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService])));
    const onDidChangeActiveSessionProvider = this.contentDisposables.add(new Emitter());
    const sessionTypePickerDelegate = {
      getActiveSessionProvider: /* @__PURE__ */ __name(() => this._selectedSessionProvider, "getActiveSessionProvider"),
      setActiveSessionProvider: /* @__PURE__ */ __name((provider) => {
        this._selectedSessionProvider = provider;
        onDidChangeActiveSessionProvider.fire(provider);
      }, "setActiveSessionProvider"),
      onDidChangeActiveSessionProvider: onDidChangeActiveSessionProvider.event
    };
    this.chatWidget = this.contentDisposables.add(scopedInstantiationService.createInstance(
      ChatWidget,
      ChatAgentLocation.Chat,
      // TODO: @osortega should we have a completely different ID and check that context instead in chatInputPart?
      {},
      // Empty resource view context
      {
        autoScroll: /* @__PURE__ */ __name((mode) => mode !== ChatModeKind.Ask, "autoScroll"),
        renderFollowups: false,
        supportsFileReferences: true,
        renderInputOnTop: true,
        rendererOptions: {
          renderTextEditsAsSummary: /* @__PURE__ */ __name(() => true, "renderTextEditsAsSummary"),
          referencesExpandedWhenEmptyResponse: false,
          progressMessageAtBottomOfResponse: /* @__PURE__ */ __name((mode) => mode !== ChatModeKind.Ask, "progressMessageAtBottomOfResponse")
        },
        editorOverflowWidgetsDomNode,
        enableImplicitContext: true,
        enableWorkingSet: "explicit",
        supportsChangingModes: true,
        sessionTypePickerDelegate
      },
      {
        listForeground: SIDE_BAR_FOREGROUND,
        listBackground: editorBackground,
        overlayBackground: editorBackground,
        inputEditorBackground: editorBackground,
        resultEditorBackground: editorBackground
      }
    ));
    this.chatWidget.render(chatWidgetContainer);
    this.chatWidget.setVisible(true);
    this.contentDisposables.add(scheduleAtNextAnimationFrame(getWindow(chatWidgetContainer), () => {
      this.layoutChatWidget();
    }));
    this.chatModelRef = this.chatService.startSession(ChatAgentLocation.Chat);
    this.contentDisposables.add(this.chatModelRef);
    if (this.chatModelRef.object) {
      this.chatWidget.setModel(this.chatModelRef.object);
    }
    this.contentDisposables.add(addDisposableListener(chatWidgetContainer, "mousedown", () => {
      this.chatWidget?.focusInput();
    }));
  }
  buildSessionsOrPrompts(container) {
    this.sessionsControlDisposables.clear();
    this.sessionsControl = void 0;
    const sessions = this.agentSessionsService.model.sessions;
    if (sessions.length > 0) {
      this.buildSessionsGrid(container, sessions);
    }
  }
  buildSessionsGrid(container, _sessions) {
    this.sessionsControlContainer = append(container, $(".agentSessionsWelcome-sessionsGrid"));
    const onDidChangeEmitter = this.sessionsControlDisposables.add(new Emitter());
    const filter = {
      onDidChange: onDidChangeEmitter.event,
      limitResults: /* @__PURE__ */ __name(() => MAX_SESSIONS, "limitResults"),
      groupResults: /* @__PURE__ */ __name(() => false, "groupResults"),
      exclude: /* @__PURE__ */ __name((session) => session.isArchived(), "exclude"),
      getExcludes: /* @__PURE__ */ __name(() => ({
        providers: [],
        states: [],
        archived: true,
        read: false
      }), "getExcludes")
    };
    const options = {
      overrideStyles: getListStyles({
        listBackground: editorBackground
      }),
      filter,
      getHoverPosition: /* @__PURE__ */ __name(() => 2, "getHoverPosition"),
      trackActiveEditorSession: /* @__PURE__ */ __name(() => false, "trackActiveEditorSession"),
      source: "welcomeView"
    };
    this.sessionsControl = this.sessionsControlDisposables.add(this.instantiationService.createInstance(AgentSessionsControl, this.sessionsControlContainer, options));
    this.sessionsControlDisposables.add(scheduleAtNextAnimationFrame(getWindow(this.sessionsControlContainer), () => {
      this.layoutSessionsControl();
    }));
    const openButton = append(container, $("button.agentSessionsWelcome-openSessionsButton"));
    openButton.textContent = localize("openAgentSessions", "Open Agent Sessions");
    openButton.onclick = () => {
      this.commandService.executeCommand("workbench.action.chat.open");
      if (!this.layoutService.isAuxiliaryBarMaximized()) {
        this.layoutService.toggleMaximizedAuxiliaryBar();
      }
    };
  }
  buildWalkthroughs(container) {
    const activeWalkthroughs = this.walkthroughs.filter((w) => !w.when || this.contextService.contextMatchesRules(w.when)).slice(0, 3);
    if (activeWalkthroughs.length === 0) {
      return;
    }
    for (const walkthrough of activeWalkthroughs) {
      const card = append(container, $(".agentSessionsWelcome-walkthroughCard"));
      card.onclick = () => {
        this.commandService.executeCommand("workbench.action.openWalkthrough", walkthrough.id);
      };
      const iconContainer = append(card, $(".agentSessionsWelcome-walkthroughCard-icon"));
      if (walkthrough.icon.type === "icon") {
        iconContainer.appendChild(renderIcon(walkthrough.icon.icon));
      }
      const content = append(card, $(".agentSessionsWelcome-walkthroughCard-content"));
      const title = append(content, $(".agentSessionsWelcome-walkthroughCard-title"));
      title.textContent = walkthrough.title;
      if (walkthrough.description) {
        const desc = append(content, $(".agentSessionsWelcome-walkthroughCard-description"));
        desc.textContent = walkthrough.description;
      }
      const navContainer = append(card, $(".agentSessionsWelcome-walkthroughCard-nav"));
      const prevButton = append(navContainer, $("button.nav-button"));
      prevButton.appendChild(renderIcon(Codicon.chevronLeft));
      prevButton.onclick = (e) => {
        e.stopPropagation();
      };
      const nextButton = append(navContainer, $("button.nav-button"));
      nextButton.appendChild(renderIcon(Codicon.chevronRight));
      nextButton.onclick = (e) => {
        e.stopPropagation();
      };
    }
  }
  buildFooter(container) {
    const learningLink = append(container, $("button.agentSessionsWelcome-footerLink"));
    learningLink.appendChild(renderIcon(Codicon.mortarBoard));
    learningLink.appendChild(document.createTextNode(localize("exploreHelp", "Explore Learning & Help Resources")));
    learningLink.onclick = () => this.commandService.executeCommand("workbench.action.openWalkthrough");
    const showOnStartupContainer = append(container, $(".agentSessionsWelcome-showOnStartup"));
    const showOnStartupCheckbox = this.contentDisposables.add(new Toggle({
      icon: Codicon.check,
      actionClassName: "agentSessionsWelcome-checkbox",
      isChecked: this.configurationService.getValue(configurationKey) === "agentSessionsWelcomePage",
      title: localize("checkboxTitle", "When checked, this page will be shown on startup."),
      ...defaultToggleStyles
    }));
    showOnStartupCheckbox.domNode.id = "showOnStartup";
    const showOnStartupLabel = $("label.caption", { for: "showOnStartup" }, localize("showOnStartup", "Show welcome page on startup"));
    const onShowOnStartupChanged = /* @__PURE__ */ __name(() => {
      if (showOnStartupCheckbox.checked) {
        this.configurationService.updateValue(configurationKey, "agentSessionsWelcomePage");
      } else {
        this.configurationService.updateValue(configurationKey, "none");
      }
    }, "onShowOnStartupChanged");
    this.contentDisposables.add(showOnStartupCheckbox.onChange(() => onShowOnStartupChanged()));
    this.contentDisposables.add(addDisposableListener(showOnStartupLabel, "click", () => {
      showOnStartupCheckbox.checked = !showOnStartupCheckbox.checked;
      onShowOnStartupChanged();
    }));
    showOnStartupContainer.appendChild(showOnStartupCheckbox.domNode);
    showOnStartupContainer.appendChild(showOnStartupLabel);
  }
  layout(dimension) {
    this.lastDimension = dimension;
    this.container.style.height = `${dimension.height}px`;
    this.container.style.width = `${dimension.width}px`;
    this.layoutChatWidget();
    this.layoutSessionsControl();
    this.scrollableElement?.scanDomNode();
  }
  layoutChatWidget() {
    if (!this.chatWidget || !this.lastDimension) {
      return;
    }
    const chatWidth = Math.min(800, this.lastDimension.width - 80);
    const inputHeight = 150;
    this.chatWidget.layout(inputHeight, chatWidth);
  }
  layoutSessionsControl() {
    if (!this.sessionsControl || !this.sessionsControlContainer || !this.lastDimension) {
      return;
    }
    const sessionsWidth = Math.min(800, this.lastDimension.width - 80);
    const visibleSessions = Math.min(this.agentSessionsService.model.sessions.filter((s) => !s.isArchived()).length, MAX_SESSIONS);
    const sessionsHeight = visibleSessions * 52;
    this.sessionsControl.layout(sessionsHeight, sessionsWidth);
    const marginOffset = Math.floor(visibleSessions / 2) * 52;
    this.sessionsControl.setGridMarginOffset(marginOffset);
  }
  focus() {
    super.focus();
    this.chatWidget?.focusInput();
  }
};
AgentSessionsWelcomePage = AgentSessionsWelcomePage_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, IInstantiationService),
  __param(5, IContextKeyService),
  __param(6, IWorkbenchLayoutService),
  __param(7, ICommandService),
  __param(8, IAgentSessionsService),
  __param(9, IConfigurationService),
  __param(10, IProductService),
  __param(11, IWalkthroughsService),
  __param(12, IChatService)
], AgentSessionsWelcomePage);
class AgentSessionsWelcomeInputSerializer {
  static {
    __name(this, "AgentSessionsWelcomeInputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return JSON.stringify({});
  }
  deserialize(instantiationService, serializedEditorInput) {
    return new AgentSessionsWelcomeInput({});
  }
}
export {
  AgentSessionsWelcomeInputSerializer,
  AgentSessionsWelcomePage
};
//# sourceMappingURL=agentSessionsWelcome.js.map
