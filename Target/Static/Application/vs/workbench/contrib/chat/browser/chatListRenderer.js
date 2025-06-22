var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../base/browser/dom.js";
import { renderFormattedText } from "../../../../base/browser/formattedTextRenderer.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { DropdownMenuActionViewItem } from "../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { coalesce, distinct } from "../../../../base/common/arrays.js";
import { findLast } from "../../../../base/common/arraysFind.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { Emitter } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable, DisposableStore, dispose, thenIfNotDisposed, toDisposable } from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { FileAccess } from "../../../../base/common/network.js";
import { clamp } from "../../../../base/common/numbers.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { createActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ColorScheme } from "../../../../platform/theme/common/theme.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkbenchIssueService } from "../../issue/common/issue.js";
import { annotateSpecialMarkdownContent } from "../common/annotations.js";
import { checkModeOption } from "../common/chat.js";
import { ChatContextKeys } from "../common/chatContextKeys.js";
import { chatSubcommandLeader } from "../common/chatParserTypes.js";
import { ChatAgentVoteDirection, ChatAgentVoteDownReason, ChatErrorLevel } from "../common/chatService.js";
import { isRequestVM, isResponseVM } from "../common/chatViewModel.js";
import { getNWords } from "../common/chatWordCounter.js";
import { CodeBlockModelCollection } from "../common/codeBlockModelCollection.js";
import { ChatAgentLocation } from "../common/constants.js";
import { MarkUnhelpfulActionId } from "./actions/chatTitleActions.js";
import { IChatWidgetService } from "./chat.js";
import { ChatAgentHover, getChatAgentHoverOptions } from "./chatAgentHover.js";
import { ChatAgentCommandContentPart } from "./chatContentParts/chatAgentCommandContentPart.js";
import { ChatAttachmentsContentPart } from "./chatContentParts/chatAttachmentsContentPart.js";
import { ChatCodeCitationContentPart } from "./chatContentParts/chatCodeCitationContentPart.js";
import { ChatCommandButtonContentPart } from "./chatContentParts/chatCommandContentPart.js";
import { ChatConfirmationContentPart } from "./chatContentParts/chatConfirmationContentPart.js";
import { ChatErrorConfirmationContentPart } from "./chatContentParts/chatErrorConfirmationPart.js";
import { ChatExtensionsContentPart } from "./chatContentParts/chatExtensionsContentPart.js";
import { ChatMarkdownContentPart, EditorPool } from "./chatContentParts/chatMarkdownContentPart.js";
import { ChatProgressContentPart, ChatWorkingProgressContentPart } from "./chatContentParts/chatProgressContentPart.js";
import { ChatQuotaExceededPart } from "./chatContentParts/chatQuotaExceededPart.js";
import { ChatUsedReferencesListContentPart, CollapsibleListPool } from "./chatContentParts/chatReferencesContentPart.js";
import { ChatTaskContentPart } from "./chatContentParts/chatTaskContentPart.js";
import { ChatTextEditContentPart, DiffEditorPool } from "./chatContentParts/chatTextEditContentPart.js";
import { ChatTreeContentPart, TreePool } from "./chatContentParts/chatTreeContentPart.js";
import { ChatErrorContentPart } from "./chatContentParts/chatErrorContentPart.js";
import { ChatToolInvocationPart } from "./chatContentParts/toolInvocationParts/chatToolInvocationPart.js";
import { ChatMarkdownDecorationsRenderer } from "./chatMarkdownDecorationsRenderer.js";
import { ChatMarkdownRenderer } from "./chatMarkdownRenderer.js";
import { ChatCodeBlockContentProvider } from "./codeBlockPart.js";
import { canceledName } from "../../../../base/common/errors.js";
import { ChatElicitationContentPart } from "./chatContentParts/chatElicitationContentPart.js";
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
var ChatListItemRenderer_1;
const $ = dom.$;
const COPILOT_USERNAME = "GitHub Copilot";
const forceVerboseLayoutTracing = false;
const mostRecentResponseClassName = "chat-most-recent-response";
let ChatListItemRenderer = class ChatListItemRenderer2 extends Disposable {
  static {
    __name(this, "ChatListItemRenderer");
  }
  static {
    ChatListItemRenderer_1 = this;
  }
  static {
    this.ID = "item";
  }
  constructor(editorOptions, rendererOptions, delegate, codeBlockModelCollection, overflowWidgetsDomNode, instantiationService, configService, logService, contextKeyService, themeService, commandService, hoverService, chatWidgetService) {
    super();
    this.rendererOptions = rendererOptions;
    this.delegate = delegate;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.instantiationService = instantiationService;
    this.configService = configService;
    this.logService = logService;
    this.contextKeyService = contextKeyService;
    this.themeService = themeService;
    this.commandService = commandService;
    this.hoverService = hoverService;
    this.chatWidgetService = chatWidgetService;
    this.codeBlocksByResponseId = /* @__PURE__ */ new Map();
    this.codeBlocksByEditorUri = new ResourceMap();
    this.fileTreesByResponseId = /* @__PURE__ */ new Map();
    this.focusedFileTreesByResponseId = /* @__PURE__ */ new Map();
    this._onDidClickFollowup = this._register(new Emitter());
    this.onDidClickFollowup = this._onDidClickFollowup.event;
    this._onDidClickRerunWithAgentOrCommandDetection = new Emitter();
    this.onDidClickRerunWithAgentOrCommandDetection = this._onDidClickRerunWithAgentOrCommandDetection.event;
    this._onDidChangeItemHeight = this._register(new Emitter());
    this.onDidChangeItemHeight = this._onDidChangeItemHeight.event;
    this._currentLayoutWidth = 0;
    this._isVisible = true;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.renderer = this.instantiationService.createInstance(ChatMarkdownRenderer, void 0);
    this.markdownDecorationsRenderer = this.instantiationService.createInstance(ChatMarkdownDecorationsRenderer);
    this._editorPool = this._register(this.instantiationService.createInstance(EditorPool, editorOptions, delegate, overflowWidgetsDomNode));
    this._toolEditorPool = this._register(this.instantiationService.createInstance(EditorPool, editorOptions, delegate, overflowWidgetsDomNode));
    this._diffEditorPool = this._register(this.instantiationService.createInstance(DiffEditorPool, editorOptions, delegate, overflowWidgetsDomNode));
    this._treePool = this._register(this.instantiationService.createInstance(TreePool, this._onDidChangeVisibility.event));
    this._contentReferencesListPool = this._register(this.instantiationService.createInstance(CollapsibleListPool, this._onDidChangeVisibility.event, void 0, void 0));
    this._register(this.instantiationService.createInstance(ChatCodeBlockContentProvider));
    this._toolInvocationCodeBlockCollection = this._register(this.instantiationService.createInstance(CodeBlockModelCollection, "tools"));
  }
  get templateId() {
    return ChatListItemRenderer_1.ID;
  }
  editorsInUse() {
    return Iterable.concat(this._editorPool.inUse(), this._toolEditorPool.inUse());
  }
  traceLayout(method, message) {
    if (forceVerboseLayoutTracing) {
      this.logService.info(`ChatListItemRenderer#${method}: ${message}`);
    } else {
      this.logService.trace(`ChatListItemRenderer#${method}: ${message}`);
    }
  }
  /**
   * Compute a rate to render at in words/s.
   */
  getProgressiveRenderRate(element) {
    let Rate;
    (function(Rate2) {
      Rate2[Rate2["Min"] = 5] = "Min";
      Rate2[Rate2["Max"] = 2e3] = "Max";
    })(Rate || (Rate = {}));
    const minAfterComplete = 80;
    const rate = element.contentUpdateTimings?.impliedWordLoadRate;
    if (element.isComplete || element.isPaused.get()) {
      if (typeof rate === "number") {
        return clamp(
          rate,
          minAfterComplete,
          2e3
          /* Rate.Max */
        );
      } else {
        return minAfterComplete;
      }
    }
    if (typeof rate === "number") {
      return clamp(
        rate,
        5,
        2e3
        /* Rate.Max */
      );
    }
    return 8;
  }
  getCodeBlockInfosForResponse(response) {
    const codeBlocks = this.codeBlocksByResponseId.get(response.id);
    return codeBlocks ?? [];
  }
  getCodeBlockInfoForEditor(uri) {
    return this.codeBlocksByEditorUri.get(uri);
  }
  getFileTreeInfosForResponse(response) {
    const fileTrees = this.fileTreesByResponseId.get(response.id);
    return fileTrees ?? [];
  }
  getLastFocusedFileTreeForResponse(response) {
    const fileTrees = this.fileTreesByResponseId.get(response.id);
    const lastFocusedFileTreeIndex = this.focusedFileTreesByResponseId.get(response.id);
    if (fileTrees?.length && lastFocusedFileTreeIndex !== void 0 && lastFocusedFileTreeIndex < fileTrees.length) {
      return fileTrees[lastFocusedFileTreeIndex];
    }
    return void 0;
  }
  setVisible(visible) {
    this._isVisible = visible;
    this._onDidChangeVisibility.fire(visible);
  }
  layout(width) {
    const newWidth = width - 40;
    if (newWidth !== this._currentLayoutWidth) {
      this._currentLayoutWidth = newWidth;
      for (const editor of this._editorPool.inUse()) {
        editor.layout(this._currentLayoutWidth);
      }
      for (const toolEditor of this._toolEditorPool.inUse()) {
        toolEditor.layout(this._currentLayoutWidth);
      }
      for (const diffEditor of this._diffEditorPool.inUse()) {
        diffEditor.layout(this._currentLayoutWidth);
      }
    }
  }
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    const rowContainer = dom.append(container, $(".interactive-item-container"));
    if (this.rendererOptions.renderStyle === "compact") {
      rowContainer.classList.add("interactive-item-compact");
    }
    let headerParent = rowContainer;
    let valueParent = rowContainer;
    let detailContainerParent;
    if (this.rendererOptions.renderStyle === "minimal") {
      rowContainer.classList.add("interactive-item-compact");
      rowContainer.classList.add("minimal");
      const lhsContainer = dom.append(rowContainer, $(".column.left"));
      const rhsContainer = dom.append(rowContainer, $(".column.right"));
      headerParent = lhsContainer;
      detailContainerParent = rhsContainer;
      valueParent = rhsContainer;
    }
    const header = dom.append(headerParent, $(".header"));
    const contextKeyService = templateDisposables.add(this.contextKeyService.createScoped(rowContainer));
    const scopedInstantiationService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
    const requestHover = dom.append(rowContainer, $(".request-hover"));
    let titleToolbar;
    if (this.rendererOptions.noHeader) {
      header.classList.add("hidden");
    } else {
      titleToolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, requestHover, MenuId.ChatMessageTitle, {
        menuOptions: {
          shouldForwardArgs: true
        },
        toolbarOptions: {
          shouldInlineSubmenu: /* @__PURE__ */ __name((submenu) => submenu.actions.length <= 1, "shouldInlineSubmenu")
        }
      }));
    }
    templateDisposables.add(dom.addDisposableListener(rowContainer, "mouseenter", () => {
      if (isRequestVM(template.currentElement)) {
        dom.show(requestHover);
      }
    }));
    templateDisposables.add(dom.addDisposableListener(rowContainer, "mouseleave", () => {
      if (isRequestVM(template.currentElement)) {
        dom.hide(requestHover);
      }
    }));
    dom.hide(requestHover);
    const user = dom.append(header, $(".user"));
    const avatarContainer = dom.append(user, $(".avatar-container"));
    const username = dom.append(user, $("h3.username"));
    username.tabIndex = 0;
    const detailContainer = dom.append(detailContainerParent ?? user, $("span.detail-container"));
    const detail = dom.append(detailContainer, $("span.detail"));
    dom.append(detailContainer, $("span.chat-animated-ellipsis"));
    const value = dom.append(valueParent, $(".value"));
    const elementDisposables = new DisposableStore();
    const footerToolbarContainer = dom.append(rowContainer, $(".chat-footer-toolbar"));
    const footerToolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, footerToolbarContainer, MenuId.ChatMessageFooter, {
      eventDebounceDelay: 0,
      menuOptions: { shouldForwardArgs: true, renderShortTitle: true },
      toolbarOptions: { shouldInlineSubmenu: /* @__PURE__ */ __name((submenu) => submenu.actions.length <= 1, "shouldInlineSubmenu") },
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof MenuItemAction && action.item.id === MarkUnhelpfulActionId) {
          return scopedInstantiationService.createInstance(ChatVoteDownButton, action, options);
        }
        return createActionViewItem(scopedInstantiationService, action, options);
      }, "actionViewItemProvider")
    }));
    const agentHover = templateDisposables.add(this.instantiationService.createInstance(ChatAgentHover));
    const hoverContent = /* @__PURE__ */ __name(() => {
      if (isResponseVM(template.currentElement) && template.currentElement.agent && !template.currentElement.agent.isDefault) {
        agentHover.setAgent(template.currentElement.agent.id);
        return agentHover.domNode;
      }
      return void 0;
    }, "hoverContent");
    const hoverOptions = getChatAgentHoverOptions(() => isResponseVM(template.currentElement) ? template.currentElement.agent : void 0, this.commandService);
    templateDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), user, hoverContent, hoverOptions));
    templateDisposables.add(dom.addDisposableListener(user, dom.EventType.KEY_DOWN, (e) => {
      const ev = new StandardKeyboardEvent(e);
      if (ev.equals(
        10
        /* KeyCode.Space */
      ) || ev.equals(
        3
        /* KeyCode.Enter */
      )) {
        const content = hoverContent();
        if (content) {
          this.hoverService.showInstantHover({ content, target: user, trapFocus: true, actions: hoverOptions.actions }, true);
        }
      } else if (ev.equals(
        9
        /* KeyCode.Escape */
      )) {
        this.hoverService.hideHover();
      }
    }));
    const template = { header, avatarContainer, requestHover, username, detail, value, rowContainer, elementDisposables, templateDisposables, contextKeyService, instantiationService: scopedInstantiationService, agentHover, titleToolbar, footerToolbar };
    return template;
  }
  renderElement(node, index, templateData) {
    this.renderChatTreeItem(node.element, index, templateData);
  }
  clearRenderedParts(templateData) {
    if (templateData.renderedParts) {
      dispose(coalesce(templateData.renderedParts));
      templateData.renderedParts = void 0;
      dom.clearNode(templateData.value);
    }
  }
  renderChatTreeItem(element, index, templateData) {
    if (templateData.currentElement && templateData.currentElement.id !== element.id) {
      this.traceLayout("renderChatTreeItem", `Rendering a different element into the template, index=${index}`);
      this.clearRenderedParts(templateData);
    }
    templateData.currentElement = element;
    const kind = isRequestVM(element) ? "request" : isResponseVM(element) ? "response" : "welcome";
    this.traceLayout("renderElement", `${kind}, index=${index}`);
    ChatContextKeys.isResponse.bindTo(templateData.contextKeyService).set(isResponseVM(element));
    ChatContextKeys.itemId.bindTo(templateData.contextKeyService).set(element.id);
    ChatContextKeys.isRequest.bindTo(templateData.contextKeyService).set(isRequestVM(element));
    ChatContextKeys.responseDetectedAgentCommand.bindTo(templateData.contextKeyService).set(isResponseVM(element) && element.agentOrSlashCommandDetected);
    if (isResponseVM(element)) {
      ChatContextKeys.responseSupportsIssueReporting.bindTo(templateData.contextKeyService).set(!!element.agent?.metadata.supportIssueReporting);
      ChatContextKeys.responseVote.bindTo(templateData.contextKeyService).set(element.vote === ChatAgentVoteDirection.Up ? "up" : element.vote === ChatAgentVoteDirection.Down ? "down" : "");
    } else {
      ChatContextKeys.responseVote.bindTo(templateData.contextKeyService).set("");
    }
    if (templateData.titleToolbar) {
      templateData.titleToolbar.context = element;
    }
    templateData.footerToolbar.context = element;
    ChatContextKeys.responseHasError.bindTo(templateData.contextKeyService).set(isResponseVM(element) && !!element.errorDetails);
    const isFiltered = !!(isResponseVM(element) && element.errorDetails?.responseIsFiltered);
    ChatContextKeys.responseIsFiltered.bindTo(templateData.contextKeyService).set(isFiltered);
    const location = this.chatWidgetService.getWidgetBySessionId(element.sessionId)?.location;
    templateData.rowContainer.classList.toggle("editing-session", location === ChatAgentLocation.Panel);
    templateData.rowContainer.classList.toggle("interactive-request", isRequestVM(element));
    templateData.rowContainer.classList.toggle("interactive-response", isResponseVM(element));
    const progressMessageAtBottomOfResponse = checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.progressMessageAtBottomOfResponse);
    templateData.rowContainer.classList.toggle("show-detail-progress", isResponseVM(element) && !element.isComplete && !element.progressMessages.length && !element.model.isPaused.get() && !progressMessageAtBottomOfResponse);
    templateData.username.textContent = element.username;
    if (!this.rendererOptions.noHeader) {
      this.renderAvatar(element, templateData);
    }
    templateData.username.textContent = element.username;
    templateData.username.classList.toggle("hidden", element.username === COPILOT_USERNAME);
    templateData.avatarContainer.classList.toggle("hidden", element.username === COPILOT_USERNAME);
    dom.hide(templateData.requestHover);
    dom.clearNode(templateData.detail);
    if (isResponseVM(element)) {
      this.renderDetail(element, templateData);
    }
    templateData.rowContainer.parentElement?.parentElement?.parentElement?.classList.toggle("request", isRequestVM(element));
    templateData.rowContainer.classList.toggle(mostRecentResponseClassName, index === this.delegate.getListLength() - 1);
    templateData.rowContainer.classList.toggle("confirmation-message", isRequestVM(element) && !!element.confirmation);
    const shouldShowHeader = isResponseVM(element) && !this.rendererOptions.noHeader;
    templateData.header?.classList.toggle("header-disabled", !shouldShowHeader);
    if (isRequestVM(element) && element.confirmation) {
      this.renderConfirmationAction(element, templateData);
    }
    if (isResponseVM(element) && index === this.delegate.getListLength() - 1 && (!element.isComplete || element.renderData)) {
      this.traceLayout("renderElement", `start progressive render, index=${index}`);
      const timer = templateData.elementDisposables.add(new dom.WindowIntervalTimer());
      const runProgressiveRender = /* @__PURE__ */ __name((initial) => {
        try {
          if (this.doNextProgressiveRender(element, index, templateData, !!initial)) {
            timer.cancel();
          }
        } catch (err) {
          timer.cancel();
          this.logService.error(err);
        }
      }, "runProgressiveRender");
      timer.cancelAndSet(runProgressiveRender, 50, dom.getWindow(templateData.rowContainer));
      runProgressiveRender(true);
    } else {
      if (isResponseVM(element)) {
        this.renderChatResponseBasic(element, index, templateData);
      } else if (isRequestVM(element)) {
        this.renderChatRequest(element, index, templateData);
      }
    }
  }
  renderDetail(element, templateData) {
    dom.clearNode(templateData.detail);
    if (element.agentOrSlashCommandDetected) {
      const msg = element.slashCommand ? localize("usedAgentSlashCommand", "used {0} [[(rerun without)]]", `${chatSubcommandLeader}${element.slashCommand.name}`) : localize("usedAgent", "[[(rerun without)]]");
      dom.reset(templateData.detail, renderFormattedText(msg, {
        className: "agentOrSlashCommandDetected",
        inline: true,
        actionHandler: {
          disposables: templateData.elementDisposables,
          callback: /* @__PURE__ */ __name((content) => {
            this._onDidClickRerunWithAgentOrCommandDetection.fire(element);
          }, "callback")
        }
      }));
    } else if (this.rendererOptions.renderStyle !== "minimal" && !element.isComplete && !checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.progressMessageAtBottomOfResponse)) {
      if (element.model.isPaused.get()) {
        templateData.detail.textContent = localize("paused", "Paused");
      } else {
        templateData.detail.textContent = localize("working", "Working");
      }
    }
  }
  renderConfirmationAction(element, templateData) {
    dom.clearNode(templateData.detail);
    if (element.confirmation) {
      templateData.detail.textContent = localize("chatConfirmationAction", 'selected "{0}"', element.confirmation);
      templateData.header?.classList.remove("header-disabled");
    }
  }
  renderAvatar(element, templateData) {
    const icon = isResponseVM(element) ? this.getAgentIcon(element.agent?.metadata) : element.avatarIcon ?? Codicon.account;
    if (icon instanceof URI) {
      const avatarIcon = dom.$("img.icon");
      avatarIcon.src = FileAccess.uriToBrowserUri(icon).toString(true);
      templateData.avatarContainer.replaceChildren(dom.$(".avatar", void 0, avatarIcon));
    } else {
      const avatarIcon = dom.$(ThemeIcon.asCSSSelector(icon));
      templateData.avatarContainer.replaceChildren(dom.$(".avatar.codicon-avatar", void 0, avatarIcon));
    }
  }
  getAgentIcon(agent) {
    if (agent?.themeIcon) {
      return agent.themeIcon;
    } else if (agent?.iconDark && this.themeService.getColorTheme().type === ColorScheme.DARK) {
      return agent.iconDark;
    } else if (agent?.icon) {
      return agent.icon;
    } else {
      return Codicon.copilot;
    }
  }
  renderChatResponseBasic(element, index, templateData) {
    templateData.rowContainer.classList.toggle("chat-response-loading", isResponseVM(element) && !element.isComplete);
    const content = [];
    content.push({ kind: "references", references: element.contentReferences });
    content.push(...annotateSpecialMarkdownContent(element.response.value));
    if (element.codeCitations.length) {
      content.push({ kind: "codeCitations", citations: element.codeCitations });
    }
    if (element.errorDetails?.message && element.errorDetails.message !== canceledName) {
      content.push({ kind: "errorDetails", errorDetails: element.errorDetails, isLast: index === this.delegate.getListLength() - 1 });
    }
    const isFiltered = !!element.errorDetails?.responseIsFiltered;
    if (!isFiltered) {
      const diff = this.diff(templateData.renderedParts ?? [], content, element);
      this.renderChatContentDiff(diff, content, element, index, templateData);
    } else {
      dom.clearNode(templateData.value);
      if (templateData.renderedParts) {
        dispose(templateData.renderedParts);
      }
      templateData.renderedParts = [];
    }
    this.updateItemHeightOnRender(element, templateData);
  }
  renderChatRequest(element, index, templateData) {
    templateData.rowContainer.classList.toggle("chat-response-loading", false);
    let content = [];
    if (!element.confirmation) {
      const markdown = "message" in element.message ? element.message.message : this.markdownDecorationsRenderer.convertParsedRequestToMarkdown(element.message);
      content = [{ content: new MarkdownString(markdown), kind: "markdownContent" }];
      if (this.rendererOptions.renderStyle === "minimal" && !element.isComplete) {
        templateData.value.classList.add("inline-progress");
        templateData.elementDisposables.add(toDisposable(() => templateData.value.classList.remove("inline-progress")));
        content.push({ content: new MarkdownString("<span></span>", { supportHtml: true }), kind: "markdownContent" });
      } else {
        templateData.value.classList.remove("inline-progress");
      }
    }
    dom.clearNode(templateData.value);
    const parts = [];
    let inlineSlashCommandRendered = false;
    content.forEach((data, contentIndex) => {
      const context = {
        element,
        elementIndex: index,
        contentIndex,
        content,
        preceedingContentParts: parts,
        container: templateData.rowContainer
      };
      const newPart = this.renderChatContentPart(data, templateData, context);
      if (newPart) {
        if (this.rendererOptions.renderDetectedCommandsWithRequest && !inlineSlashCommandRendered && element.agentOrSlashCommandDetected && element.slashCommand && data.kind === "markdownContent") {
          if (newPart.domNode) {
            newPart.domNode.style.display = "inline-flex";
          }
          const cmdPart = this.instantiationService.createInstance(ChatAgentCommandContentPart, element.slashCommand, () => this._onDidClickRerunWithAgentOrCommandDetection.fire({ sessionId: element.sessionId, requestId: element.id }));
          templateData.value.appendChild(cmdPart.domNode);
          parts.push(cmdPart);
          inlineSlashCommandRendered = true;
        }
        if (newPart.domNode) {
          templateData.value.appendChild(newPart.domNode);
        }
        parts.push(newPart);
      }
    });
    if (templateData.renderedParts) {
      dispose(templateData.renderedParts);
    }
    templateData.renderedParts = parts;
    if (element.variables.length) {
      const newPart = this.renderAttachments(element.variables, element.contentReferences, templateData);
      if (newPart.domNode) {
        templateData.value.appendChild(newPart.domNode);
      }
      templateData.elementDisposables.add(newPart);
    }
    this.updateItemHeightOnRender(element, templateData);
  }
  updateItemHeightOnRender(element, templateData) {
    const newHeight = templateData.rowContainer.offsetHeight;
    const fireEvent = !element.currentRenderedHeight || element.currentRenderedHeight !== newHeight;
    element.currentRenderedHeight = newHeight;
    if (fireEvent) {
      const disposable = templateData.elementDisposables.add(dom.scheduleAtNextAnimationFrame(dom.getWindow(templateData.value), () => {
        element.currentRenderedHeight = templateData.rowContainer.offsetHeight;
        disposable.dispose();
        this._onDidChangeItemHeight.fire({ element, height: element.currentRenderedHeight });
      }));
    }
  }
  updateItemHeight(templateData) {
    if (!templateData.currentElement) {
      return;
    }
    const newHeight = Math.max(templateData.rowContainer.offsetHeight, 1);
    templateData.currentElement.currentRenderedHeight = newHeight;
    this._onDidChangeItemHeight.fire({ element: templateData.currentElement, height: newHeight });
  }
  /**
   *	@returns true if progressive rendering should be considered complete- the element's data is fully rendered or the view is not visible
   */
  doNextProgressiveRender(element, index, templateData, isInRenderElement) {
    if (!this._isVisible) {
      return true;
    }
    if (element.isCanceled) {
      this.traceLayout("doNextProgressiveRender", `canceled, index=${index}`);
      element.renderData = void 0;
      this.renderChatResponseBasic(element, index, templateData);
      return true;
    }
    templateData.rowContainer.classList.toggle("chat-response-loading", true);
    this.traceLayout("doNextProgressiveRender", `START progressive render, index=${index}, renderData=${JSON.stringify(element.renderData)}`);
    const contentForThisTurn = this.getNextProgressiveRenderContent(element);
    const partsToRender = this.diff(templateData.renderedParts ?? [], contentForThisTurn.content, element);
    const contentIsAlreadyRendered = partsToRender.every((part) => part === null);
    if (contentIsAlreadyRendered) {
      if (contentForThisTurn.moreContentAvailable) {
        this.traceLayout("doNextProgressiveRender", "not rendering any new content this tick, but more available");
        return false;
      } else if (element.isComplete) {
        this.traceLayout("doNextProgressiveRender", `END progressive render, index=${index} and clearing renderData, response is complete`);
        element.renderData = void 0;
        this.renderChatResponseBasic(element, index, templateData);
        return true;
      } else {
        this.traceLayout("doNextProgressiveRender", "caught up with the stream- no new content to render");
        if (!templateData.renderedParts) {
          const height2 = templateData.rowContainer.offsetHeight;
          element.currentRenderedHeight = height2;
        }
        return true;
      }
    }
    this.traceLayout("doNextProgressiveRender", `doing progressive render, ${partsToRender.length} parts to render`);
    this.renderChatContentDiff(partsToRender, contentForThisTurn.content, element, index, templateData);
    const height = templateData.rowContainer.offsetHeight;
    element.currentRenderedHeight = height;
    if (!isInRenderElement) {
      this._onDidChangeItemHeight.fire({ element, height });
    }
    return false;
  }
  renderChatContentDiff(partsToRender, contentForThisTurn, element, elementIndex, templateData) {
    const renderedParts = templateData.renderedParts ?? [];
    templateData.renderedParts = renderedParts;
    partsToRender.forEach((partToRender, contentIndex) => {
      if (!partToRender) {
        return;
      }
      const alreadyRenderedPart = templateData.renderedParts?.[contentIndex];
      if (alreadyRenderedPart) {
        alreadyRenderedPart.dispose();
      }
      const preceedingContentParts = renderedParts.slice(0, contentIndex);
      const context = {
        element,
        elementIndex,
        content: contentForThisTurn,
        preceedingContentParts,
        contentIndex,
        container: templateData.rowContainer
      };
      const newPart = this.renderChatContentPart(partToRender, templateData, context);
      if (newPart) {
        renderedParts[contentIndex] = newPart;
        try {
          if (alreadyRenderedPart?.domNode) {
            if (newPart.domNode) {
              alreadyRenderedPart.domNode.replaceWith(newPart.domNode);
            } else {
              alreadyRenderedPart.domNode.remove();
            }
          } else if (newPart.domNode) {
            templateData.value.appendChild(newPart.domNode);
          }
        } catch (err) {
          this.logService.error("ChatListItemRenderer#renderChatContentDiff: error replacing part", err);
        }
      } else {
        alreadyRenderedPart?.domNode?.remove();
      }
    });
    for (let i = partsToRender.length; i < renderedParts.length; i++) {
      const part = renderedParts[i];
      if (part) {
        part.dispose();
        part.domNode?.remove();
        delete renderedParts[i];
      }
    }
  }
  /**
   * Returns all content parts that should be rendered, and trimmed markdown content. We will diff this with the current rendered set.
   */
  getNextProgressiveRenderContent(element) {
    const data = this.getDataForProgressiveRender(element);
    const renderImmediately = this.configService.getValue("chat.experimental.renderMarkdownImmediately") === true;
    const renderableResponse = annotateSpecialMarkdownContent(element.response.value);
    this.traceLayout("getNextProgressiveRenderContent", `Want to render ${data.numWordsToRender} at ${data.rate} words/s, counting...`);
    let numNeededWords = data.numWordsToRender;
    const partsToRender = [];
    partsToRender.push({ kind: "references", references: element.contentReferences });
    let moreContentAvailable = false;
    for (let i = 0; i < renderableResponse.length; i++) {
      const part = renderableResponse[i];
      if (part.kind === "markdownContent" && !renderImmediately) {
        const wordCountResult = getNWords(part.content.value, numNeededWords);
        this.traceLayout("getNextProgressiveRenderContent", `  Chunk ${i}: Want to render ${numNeededWords} words and found ${wordCountResult.returnedWordCount} words. Total words in chunk: ${wordCountResult.totalWordCount}`);
        numNeededWords -= wordCountResult.returnedWordCount;
        if (wordCountResult.isFullString) {
          partsToRender.push(part);
          for (const nextPart of renderableResponse.slice(i + 1)) {
            if (nextPart.kind !== "markdownContent") {
              i++;
              partsToRender.push(nextPart);
            } else {
              break;
            }
          }
        } else {
          moreContentAvailable = true;
          partsToRender.push({ ...part, content: new MarkdownString(wordCountResult.value, part.content) });
        }
        if (numNeededWords <= 0) {
          if (renderableResponse.slice(i + 1).some((part2) => part2.kind === "markdownContent")) {
            moreContentAvailable = true;
          }
          break;
        }
      } else {
        partsToRender.push(part);
      }
    }
    const lastWordCount = element.contentUpdateTimings?.lastWordCount ?? 0;
    const newRenderedWordCount = data.numWordsToRender - numNeededWords;
    const bufferWords = lastWordCount - newRenderedWordCount;
    this.traceLayout("getNextProgressiveRenderContent", `Want to render ${data.numWordsToRender} words. Rendering ${newRenderedWordCount} words. Buffer: ${bufferWords} words`);
    if (newRenderedWordCount > 0 && newRenderedWordCount !== element.renderData?.renderedWordCount) {
      element.renderData = { lastRenderTime: Date.now(), renderedWordCount: newRenderedWordCount, renderedParts: partsToRender };
    }
    if (this.shouldShowWorkingProgress(element, partsToRender)) {
      const isPaused = element.model.isPaused.get();
      partsToRender.push({ kind: "working", isPaused, setPaused: /* @__PURE__ */ __name((p) => element.model.setPaused(p), "setPaused") });
    }
    return { content: partsToRender, moreContentAvailable };
  }
  shouldShowWorkingProgress(element, partsToRender) {
    if (element.agentOrSlashCommandDetected || this.rendererOptions.renderStyle === "minimal" || element.isComplete || !checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.progressMessageAtBottomOfResponse)) {
      return false;
    }
    if (element.model.isPaused.get()) {
      return true;
    }
    const lastPart = findLast(partsToRender, (part) => part.kind !== "markdownContent" || part.content.value.trim().length > 0);
    if (!lastPart || lastPart.kind === "references" || lastPart.kind === "toolInvocation" && (lastPart.isComplete || lastPart.presentation === "hidden") || (lastPart.kind === "textEditGroup" || lastPart.kind === "notebookEditGroup") && lastPart.done && !partsToRender.some((part) => part.kind === "toolInvocation" && !part.isComplete) || lastPart.kind === "progressTask" && lastPart.deferred.isSettled || lastPart.kind === "prepareToolInvocation") {
      return true;
    }
    return false;
  }
  getDataForProgressiveRender(element) {
    const renderData = element.renderData ?? { lastRenderTime: 0, renderedWordCount: 0 };
    const rate = this.getProgressiveRenderRate(element);
    const numWordsToRender = renderData.lastRenderTime === 0 ? 1 : renderData.renderedWordCount + // Additional words to render beyond what's already rendered
    Math.floor((Date.now() - renderData.lastRenderTime) / 1e3 * rate);
    return {
      numWordsToRender,
      rate
    };
  }
  diff(renderedParts, contentToRender, element) {
    const diff = [];
    for (let i = 0; i < contentToRender.length; i++) {
      const content = contentToRender[i];
      const renderedPart = renderedParts[i];
      if (!renderedPart || !renderedPart.hasSameContent(content, contentToRender.slice(i + 1), element)) {
        diff.push(content);
      } else {
        diff.push(null);
      }
    }
    return diff;
  }
  renderChatContentPart(content, templateData, context) {
    try {
      if (content.kind === "treeData") {
        return this.renderTreeData(content, templateData, context);
      } else if (content.kind === "progressMessage") {
        return this.instantiationService.createInstance(ChatProgressContentPart, content, this.renderer, context, void 0, void 0, void 0);
      } else if (content.kind === "progressTask" || content.kind === "progressTaskSerialized") {
        return this.renderProgressTask(content, templateData, context);
      } else if (content.kind === "command") {
        return this.instantiationService.createInstance(ChatCommandButtonContentPart, content, context);
      } else if (content.kind === "textEditGroup") {
        return this.renderTextEdit(context, content, templateData);
      } else if (content.kind === "confirmation") {
        return this.renderConfirmation(context, content, templateData);
      } else if (content.kind === "warning") {
        return this.instantiationService.createInstance(ChatErrorContentPart, ChatErrorLevel.Warning, content.content, content, this.renderer);
      } else if (content.kind === "markdownContent") {
        return this.renderMarkdown(content, templateData, context);
      } else if (content.kind === "references") {
        return this.renderContentReferencesListData(content, void 0, context, templateData);
      } else if (content.kind === "codeCitations") {
        return this.renderCodeCitations(content, context, templateData);
      } else if (content.kind === "toolInvocation" || content.kind === "toolInvocationSerialized") {
        return this.renderToolInvocation(content, context, templateData);
      } else if (content.kind === "extensions") {
        return this.renderExtensionsContent(content, context, templateData);
      } else if (content.kind === "working") {
        return this.renderWorkingProgress(content, context);
      } else if (content.kind === "undoStop") {
        return this.renderUndoStop(content);
      } else if (content.kind === "errorDetails") {
        return this.renderChatErrorDetails(context, content, templateData);
      } else if (content.kind === "elicitation") {
        return this.renderElicitation(context, content, templateData);
      }
      return this.renderNoContent((other) => content.kind === other.kind);
    } catch (err) {
      this.logService.error("ChatListItemRenderer#renderChatContentPart: error rendering content", toErrorMessage(err, true));
      const errorPart = this.instantiationService.createInstance(ChatErrorContentPart, ChatErrorLevel.Error, new MarkdownString(localize("renderFailMsg", "Failed to render content") + `: ${toErrorMessage(err, false)}`), content, this.renderer);
      return {
        dispose: /* @__PURE__ */ __name(() => errorPart.dispose(), "dispose"),
        domNode: errorPart.domNode,
        hasSameContent: /* @__PURE__ */ __name((other) => content.kind === other.kind, "hasSameContent")
      };
    }
  }
  renderChatErrorDetails(context, content, templateData) {
    if (!isResponseVM(context.element)) {
      return this.renderNoContent((other) => content.kind === other.kind);
    }
    const isLast = context.elementIndex === this.delegate.getListLength() - 1;
    if (content.errorDetails.isQuotaExceeded) {
      const renderedError = this.instantiationService.createInstance(ChatQuotaExceededPart, context.element, content, this.renderer);
      renderedError.addDisposable(renderedError.onDidChangeHeight(() => this.updateItemHeight(templateData)));
      return renderedError;
    } else if (content.errorDetails.confirmationButtons && isLast) {
      const errorConfirmation = this.instantiationService.createInstance(ChatErrorConfirmationContentPart, ChatErrorLevel.Error, new MarkdownString(content.errorDetails.message), content, content.errorDetails.confirmationButtons, this.renderer, context);
      errorConfirmation.addDisposable(errorConfirmation.onDidChangeHeight(() => this.updateItemHeight(templateData)));
      return errorConfirmation;
    } else {
      const level = content.errorDetails.level ?? (content.errorDetails.responseIsFiltered ? ChatErrorLevel.Info : ChatErrorLevel.Error);
      return this.instantiationService.createInstance(ChatErrorContentPart, level, new MarkdownString(content.errorDetails.message), content, this.renderer);
    }
  }
  renderUndoStop(content) {
    return this.renderNoContent((other) => other.kind === content.kind && other.id === content.id);
  }
  renderNoContent(equals) {
    return {
      dispose: /* @__PURE__ */ __name(() => {
      }, "dispose"),
      domNode: void 0,
      hasSameContent: equals
    };
  }
  renderTreeData(content, templateData, context) {
    const data = content.treeData;
    const treeDataIndex = context.preceedingContentParts.filter((part) => part instanceof ChatTreeContentPart).length;
    const treePart = this.instantiationService.createInstance(ChatTreeContentPart, data, context.element, this._treePool, treeDataIndex);
    treePart.addDisposable(treePart.onDidChangeHeight(() => {
      this.updateItemHeight(templateData);
    }));
    if (isResponseVM(context.element)) {
      const fileTreeFocusInfo = {
        treeDataId: data.uri.toString(),
        treeIndex: treeDataIndex,
        focus() {
          treePart.domFocus();
        }
      };
      treePart.addDisposable(treePart.onDidFocus(() => {
        this.focusedFileTreesByResponseId.set(context.element.id, fileTreeFocusInfo.treeIndex);
      }));
      const fileTrees = this.fileTreesByResponseId.get(context.element.id) ?? [];
      fileTrees.push(fileTreeFocusInfo);
      this.fileTreesByResponseId.set(context.element.id, distinct(fileTrees, (v) => v.treeDataId));
      treePart.addDisposable(toDisposable(() => this.fileTreesByResponseId.set(context.element.id, fileTrees.filter((v) => v.treeDataId !== data.uri.toString()))));
    }
    return treePart;
  }
  renderContentReferencesListData(references, labelOverride, context, templateData) {
    const referencesPart = this.instantiationService.createInstance(ChatUsedReferencesListContentPart, references.references, labelOverride, context, this._contentReferencesListPool, { expandedWhenEmptyResponse: checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.referencesExpandedWhenEmptyResponse) });
    referencesPart.addDisposable(referencesPart.onDidChangeHeight(() => {
      this.updateItemHeight(templateData);
    }));
    return referencesPart;
  }
  renderCodeCitations(citations, context, templateData) {
    const citationsPart = this.instantiationService.createInstance(ChatCodeCitationContentPart, citations, context);
    return citationsPart;
  }
  getCodeBlockStartIndex(context) {
    return context.preceedingContentParts.reduce((acc, part) => acc + (part.codeblocks?.length ?? 0), 0);
  }
  handleRenderedCodeblocks(element, part, codeBlockStartIndex) {
    if (!part.addDisposable || part.codeblocksPartId === void 0) {
      return;
    }
    const codeBlocksByResponseId = this.codeBlocksByResponseId.get(element.id) ?? [];
    this.codeBlocksByResponseId.set(element.id, codeBlocksByResponseId);
    part.addDisposable(toDisposable(() => {
      const codeBlocksByResponseId2 = this.codeBlocksByResponseId.get(element.id);
      if (codeBlocksByResponseId2) {
        part.codeblocks?.forEach((info, i) => {
          const codeblock = codeBlocksByResponseId2[codeBlockStartIndex + i];
          if (codeblock?.ownerMarkdownPartId === part.codeblocksPartId) {
            delete codeBlocksByResponseId2[codeBlockStartIndex + i];
          }
        });
      }
    }));
    part.codeblocks?.forEach((info, i) => {
      codeBlocksByResponseId[codeBlockStartIndex + i] = info;
      part.addDisposable(thenIfNotDisposed(info.uriPromise, (uri) => {
        if (!uri) {
          return;
        }
        this.codeBlocksByEditorUri.set(uri, info);
        part.addDisposable(toDisposable(() => {
          const codeblock = this.codeBlocksByEditorUri.get(uri);
          if (codeblock?.ownerMarkdownPartId === part.codeblocksPartId) {
            this.codeBlocksByEditorUri.delete(uri);
          }
        }));
      }));
    });
  }
  renderToolInvocation(toolInvocation, context, templateData) {
    const codeBlockStartIndex = this.getCodeBlockStartIndex(context);
    const part = this.instantiationService.createInstance(ChatToolInvocationPart, toolInvocation, context, this.renderer, this._contentReferencesListPool, this._toolEditorPool, () => this._currentLayoutWidth, this._toolInvocationCodeBlockCollection, codeBlockStartIndex);
    part.addDisposable(part.onDidChangeHeight(() => {
      this.updateItemHeight(templateData);
    }));
    this.handleRenderedCodeblocks(context.element, part, codeBlockStartIndex);
    return part;
  }
  renderExtensionsContent(extensionsContent, context, templateData) {
    const part = this.instantiationService.createInstance(ChatExtensionsContentPart, extensionsContent);
    part.addDisposable(part.onDidChangeHeight(() => this.updateItemHeight(templateData)));
    return part;
  }
  renderProgressTask(task, templateData, context) {
    if (!isResponseVM(context.element)) {
      return;
    }
    const taskPart = this.instantiationService.createInstance(ChatTaskContentPart, task, this._contentReferencesListPool, this.renderer, context);
    taskPart.addDisposable(taskPart.onDidChangeHeight(() => {
      this.updateItemHeight(templateData);
    }));
    return taskPart;
  }
  renderWorkingProgress(workingProgress, context) {
    return this.instantiationService.createInstance(ChatWorkingProgressContentPart, workingProgress, this.renderer, context);
  }
  renderConfirmation(context, confirmation, templateData) {
    const part = this.instantiationService.createInstance(ChatConfirmationContentPart, confirmation, context);
    part.addDisposable(part.onDidChangeHeight(() => this.updateItemHeight(templateData)));
    return part;
  }
  renderElicitation(context, elicitation, templateData) {
    const part = this.instantiationService.createInstance(ChatElicitationContentPart, elicitation, context);
    part.addDisposable(part.onDidChangeHeight(() => this.updateItemHeight(templateData)));
    return part;
  }
  renderAttachments(variables, contentReferences, templateData) {
    return this.instantiationService.createInstance(ChatAttachmentsContentPart, variables, contentReferences, void 0);
  }
  renderTextEdit(context, chatTextEdit, templateData) {
    const textEditPart = this.instantiationService.createInstance(ChatTextEditContentPart, chatTextEdit, context, this.rendererOptions, this._diffEditorPool, this._currentLayoutWidth);
    textEditPart.addDisposable(textEditPart.onDidChangeHeight(() => {
      textEditPart.layout(this._currentLayoutWidth);
      this.updateItemHeight(templateData);
    }));
    return textEditPart;
  }
  renderMarkdown(markdown, templateData, context) {
    const element = context.element;
    const fillInIncompleteTokens = isResponseVM(element) && (!element.isComplete || element.isCanceled || element.errorDetails?.responseIsFiltered || element.errorDetails?.responseIsIncomplete || !!element.renderData);
    const codeBlockStartIndex = this.getCodeBlockStartIndex(context);
    const markdownPart = templateData.instantiationService.createInstance(ChatMarkdownContentPart, markdown, context, this._editorPool, fillInIncompleteTokens, codeBlockStartIndex, this.renderer, this._currentLayoutWidth, this.codeBlockModelCollection, {});
    if (isRequestVM(element)) {
      markdownPart.domNode.tabIndex = 0;
      markdownPart.addDisposable(dom.addDisposableListener(markdownPart.domNode, "focus", () => {
        dom.show(templateData.requestHover);
      }));
      markdownPart.addDisposable(dom.addDisposableListener(markdownPart.domNode, "blur", () => {
        dom.hide(templateData.requestHover);
      }));
    }
    markdownPart.addDisposable(markdownPart.onDidChangeHeight(() => {
      markdownPart.layout(this._currentLayoutWidth);
      this.updateItemHeight(templateData);
    }));
    this.handleRenderedCodeblocks(element, markdownPart, codeBlockStartIndex);
    return markdownPart;
  }
  disposeElement(node, index, templateData) {
    this.traceLayout("disposeElement", `Disposing element, index=${index}`);
    templateData.elementDisposables.clear();
    if (templateData.titleToolbar) {
      templateData.titleToolbar.context = void 0;
    }
    templateData.footerToolbar.context = void 0;
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};
ChatListItemRenderer = ChatListItemRenderer_1 = __decorate([
  __param(5, IInstantiationService),
  __param(6, IConfigurationService),
  __param(7, ILogService),
  __param(8, IContextKeyService),
  __param(9, IThemeService),
  __param(10, ICommandService),
  __param(11, IHoverService),
  __param(12, IChatWidgetService)
], ChatListItemRenderer);
let ChatListDelegate = class ChatListDelegate2 {
  static {
    __name(this, "ChatListDelegate");
  }
  constructor(defaultElementHeight, logService) {
    this.defaultElementHeight = defaultElementHeight;
    this.logService = logService;
  }
  _traceLayout(method, message) {
    if (forceVerboseLayoutTracing) {
      this.logService.info(`ChatListDelegate#${method}: ${message}`);
    } else {
      this.logService.trace(`ChatListDelegate#${method}: ${message}`);
    }
  }
  getHeight(element) {
    const kind = isRequestVM(element) ? "request" : "response";
    const height = ("currentRenderedHeight" in element ? element.currentRenderedHeight : void 0) ?? this.defaultElementHeight;
    this._traceLayout("getHeight", `${kind}, height=${height}`);
    return height;
  }
  getTemplateId(element) {
    return ChatListItemRenderer.ID;
  }
  hasDynamicHeight(element) {
    return true;
  }
};
ChatListDelegate = __decorate([
  __param(1, ILogService)
], ChatListDelegate);
const voteDownDetailLabels = {
  [ChatAgentVoteDownReason.IncorrectCode]: localize("incorrectCode", "Suggested incorrect code"),
  [ChatAgentVoteDownReason.DidNotFollowInstructions]: localize("didNotFollowInstructions", "Didn't follow instructions"),
  [ChatAgentVoteDownReason.MissingContext]: localize("missingContext", "Missing context"),
  [ChatAgentVoteDownReason.OffensiveOrUnsafe]: localize("offensiveOrUnsafe", "Offensive or unsafe"),
  [ChatAgentVoteDownReason.PoorlyWrittenOrFormatted]: localize("poorlyWrittenOrFormatted", "Poorly written or formatted"),
  [ChatAgentVoteDownReason.RefusedAValidRequest]: localize("refusedAValidRequest", "Refused a valid request"),
  [ChatAgentVoteDownReason.IncompleteCode]: localize("incompleteCode", "Incomplete code"),
  [ChatAgentVoteDownReason.WillReportIssue]: localize("reportIssue", "Report an issue"),
  [ChatAgentVoteDownReason.Other]: localize("other", "Other")
};
let ChatVoteDownButton = class ChatVoteDownButton2 extends DropdownMenuActionViewItem {
  static {
    __name(this, "ChatVoteDownButton");
  }
  constructor(action, options, commandService, issueService, logService, contextMenuService) {
    super(action, { getActions: /* @__PURE__ */ __name(() => this.getActions(), "getActions") }, contextMenuService, {
      ...options,
      classNames: ThemeIcon.asClassNameArray(Codicon.thumbsdown)
    });
    this.commandService = commandService;
    this.issueService = issueService;
    this.logService = logService;
  }
  getActions() {
    return [
      this.getVoteDownDetailAction(ChatAgentVoteDownReason.IncorrectCode),
      this.getVoteDownDetailAction(ChatAgentVoteDownReason.DidNotFollowInstructions),
      this.getVoteDownDetailAction(ChatAgentVoteDownReason.IncompleteCode),
      this.getVoteDownDetailAction(ChatAgentVoteDownReason.MissingContext),
      this.getVoteDownDetailAction(ChatAgentVoteDownReason.PoorlyWrittenOrFormatted),
      this.getVoteDownDetailAction(ChatAgentVoteDownReason.RefusedAValidRequest),
      this.getVoteDownDetailAction(ChatAgentVoteDownReason.OffensiveOrUnsafe),
      this.getVoteDownDetailAction(ChatAgentVoteDownReason.Other),
      {
        id: "reportIssue",
        label: voteDownDetailLabels[ChatAgentVoteDownReason.WillReportIssue],
        tooltip: "",
        enabled: true,
        class: void 0,
        run: /* @__PURE__ */ __name(async (context) => {
          if (!isResponseVM(context)) {
            this.logService.error("ChatVoteDownButton#run: invalid context");
            return;
          }
          await this.commandService.executeCommand(MarkUnhelpfulActionId, context, ChatAgentVoteDownReason.WillReportIssue);
          await this.issueService.openReporter({ extensionId: context.agent?.extensionId.value });
        }, "run")
      }
    ];
  }
  render(container) {
    super.render(container);
    this.element?.classList.toggle("checked", this.action.checked);
  }
  getVoteDownDetailAction(reason) {
    const label = voteDownDetailLabels[reason];
    return {
      id: MarkUnhelpfulActionId,
      label,
      tooltip: "",
      enabled: true,
      checked: this._context.voteDownReason === reason,
      class: void 0,
      run: /* @__PURE__ */ __name(async (context) => {
        if (!isResponseVM(context)) {
          this.logService.error("ChatVoteDownButton#getVoteDownDetailAction: invalid context");
          return;
        }
        await this.commandService.executeCommand(MarkUnhelpfulActionId, context, reason);
      }, "run")
    };
  }
};
ChatVoteDownButton = __decorate([
  __param(2, ICommandService),
  __param(3, IWorkbenchIssueService),
  __param(4, ILogService),
  __param(5, IContextMenuService)
], ChatVoteDownButton);
export {
  ChatListDelegate,
  ChatListItemRenderer,
  ChatVoteDownButton
};
//# sourceMappingURL=chatListRenderer.js.map
