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
var ChatListItemRenderer_1;
import * as dom from "../../../../../base/browser/dom.js";
import { renderFormattedText } from "../../../../../base/browser/formattedTextRenderer.js";
import { StandardKeyboardEvent } from "../../../../../base/browser/keyboardEvent.js";
import { alert } from "../../../../../base/browser/ui/aria/aria.js";
import { DropdownMenuActionViewItem } from "../../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { getDefaultHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { CachedListVirtualDelegate } from "../../../../../base/browser/ui/list/list.js";
import { coalesce, distinct } from "../../../../../base/common/arrays.js";
import { findLast } from "../../../../../base/common/arraysFind.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { canceledName } from "../../../../../base/common/errors.js";
import { Emitter } from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Disposable, DisposableStore, dispose, thenIfNotDisposed, toDisposable } from "../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { FileAccess, Schemas } from "../../../../../base/common/network.js";
import { clamp } from "../../../../../base/common/numbers.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { MenuEntryActionViewItem, createActionViewItem } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuWorkbenchToolBar } from "../../../../../platform/actions/browser/toolbar.js";
import { MenuId, MenuItemAction } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { isDark } from "../../../../../platform/theme/common/theme.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IChatEntitlementService } from "../../../../services/chat/common/chatEntitlementService.js";
import { IWorkbenchIssueService } from "../../../issue/common/issue.js";
import { CodiconActionViewItem } from "../../../notebook/browser/view/cellParts/cellActionView.js";
import { annotateSpecialMarkdownContent, extractSubAgentInvocationIdFromText, hasCodeblockUriTag } from "../../common/widget/annotations.js";
import { checkModeOption } from "../../common/chat.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { chatSubcommandLeader } from "../../common/requestParser/chatParserTypes.js";
import { ChatAgentVoteDirection, ChatAgentVoteDownReason, ChatErrorLevel, IChatService, IChatToolInvocation, isChatFollowup } from "../../common/chatService/chatService.js";
import { ChatQuestionCarouselData } from "../../common/model/chatProgressTypes/chatQuestionCarouselData.js";
import { localChatSessionType } from "../../common/chatSessionsService.js";
import { getChatSessionType } from "../../common/model/chatUri.js";
import { isRequestVM, isResponseVM, isPendingDividerVM } from "../../common/model/chatViewModel.js";
import { getNWords } from "../../common/model/chatWordCounter.js";
import { CodeBlockModelCollection } from "../../common/widget/codeBlockModelCollection.js";
import { ChatAgentLocation, ChatConfiguration, ChatModeKind, CollapsedToolsDisplayMode, ThinkingDisplayMode } from "../../common/constants.js";
import { MarkHelpfulActionId, MarkUnhelpfulActionId } from "../actions/chatTitleActions.js";
import { IChatWidgetService } from "../chat.js";
import { ChatAgentHover, getChatAgentHoverOptions } from "./chatAgentHover.js";
import { ChatContentMarkdownRenderer } from "./chatContentMarkdownRenderer.js";
import { ChatAgentCommandContentPart } from "./chatContentParts/chatAgentCommandContentPart.js";
import { ChatAnonymousRateLimitedPart } from "./chatContentParts/chatAnonymousRateLimitedPart.js";
import { ChatAttachmentsContentPart } from "./chatContentParts/chatAttachmentsContentPart.js";
import { ChatCheckpointFileChangesSummaryContentPart } from "./chatContentParts/chatChangesSummaryPart.js";
import { ChatCodeCitationContentPart } from "./chatContentParts/chatCodeCitationContentPart.js";
import { ChatCommandButtonContentPart } from "./chatContentParts/chatCommandContentPart.js";
import { ChatConfirmationContentPart } from "./chatContentParts/chatConfirmationContentPart.js";
import { DiffEditorPool, EditorPool } from "./chatContentParts/chatContentCodePools.js";
import { ChatElicitationContentPart } from "./chatContentParts/chatElicitationContentPart.js";
import { ChatErrorConfirmationContentPart } from "./chatContentParts/chatErrorConfirmationPart.js";
import { ChatErrorContentPart } from "./chatContentParts/chatErrorContentPart.js";
import { ChatQuestionCarouselPart } from "./chatContentParts/chatQuestionCarouselPart.js";
import { ChatExtensionsContentPart } from "./chatContentParts/chatExtensionsContentPart.js";
import { ChatMarkdownContentPart, codeblockHasClosingBackticks } from "./chatContentParts/chatMarkdownContentPart.js";
import { ChatMcpServersInteractionContentPart } from "./chatContentParts/chatMcpServersInteractionContentPart.js";
import { ChatDisabledClaudeHooksContentPart } from "./chatContentParts/chatDisabledClaudeHooksContentPart.js";
import { ChatMultiDiffContentPart } from "./chatContentParts/chatMultiDiffContentPart.js";
import { ChatProgressContentPart, ChatWorkingProgressContentPart } from "./chatContentParts/chatProgressContentPart.js";
import { ChatPullRequestContentPart } from "./chatContentParts/chatPullRequestContentPart.js";
import { ChatQuotaExceededPart } from "./chatContentParts/chatQuotaExceededPart.js";
import { ChatUsedReferencesListContentPart, CollapsibleListPool } from "./chatContentParts/chatReferencesContentPart.js";
import { ChatTaskContentPart } from "./chatContentParts/chatTaskContentPart.js";
import { ChatTextEditContentPart } from "./chatContentParts/chatTextEditContentPart.js";
import { ChatThinkingContentPart } from "./chatContentParts/chatThinkingContentPart.js";
import { ChatSubagentContentPart } from "./chatContentParts/chatSubagentContentPart.js";
import { ChatTreeContentPart, TreePool } from "./chatContentParts/chatTreeContentPart.js";
import { ChatWorkspaceEditContentPart } from "./chatContentParts/chatWorkspaceEditContentPart.js";
import { ChatToolInvocationPart } from "./chatContentParts/toolInvocationParts/chatToolInvocationPart.js";
import { ChatMarkdownDecorationsRenderer } from "./chatContentParts/chatMarkdownDecorationsRenderer.js";
import { ChatCodeBlockContentProvider } from "./chatContentParts/codeBlockPart.js";
import { autorun, observableValue } from "../../../../../base/common/observable.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { ChatHookContentPart } from "./chatContentParts/chatHookContentPart.js";
import { HookType } from "../../common/promptSyntax/hookSchema.js";
import { ChatQuestionCarouselAutoReply } from "./chatQuestionCarouselAutoReply.js";
import { IWorkbenchEnvironmentService } from "../../../../services/environment/common/environmentService.js";
const $ = dom.$;
const COPILOT_USERNAME = "GitHub Copilot";
const forceVerboseLayoutTracing = false;
const mostRecentResponseClassName = "chat-most-recent-response";
function upvoteAnimationSettingToEnum(value) {
  switch (value) {
    case "confetti":
      return 1;
    case "floatingThumbs":
      return 2;
    case "pulseWave":
      return 3;
    case "radiantLines":
      return 4;
    default:
      return void 0;
  }
}
__name(upvoteAnimationSettingToEnum, "upvoteAnimationSettingToEnum");
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
  constructor(editorOptions, rendererOptions, delegate, codeBlockModelCollection, overflowWidgetsDomNode, viewModel, instantiationService, configService, logService, contextKeyService, themeService, commandService, hoverService, chatWidgetService, chatEntitlementService, chatService, accessibilitySignalService, accessibilityService, environmentService) {
    super();
    this.rendererOptions = rendererOptions;
    this.delegate = delegate;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.viewModel = viewModel;
    this.instantiationService = instantiationService;
    this.configService = configService;
    this.logService = logService;
    this.contextKeyService = contextKeyService;
    this.themeService = themeService;
    this.commandService = commandService;
    this.hoverService = hoverService;
    this.chatWidgetService = chatWidgetService;
    this.chatEntitlementService = chatEntitlementService;
    this.chatService = chatService;
    this.accessibilitySignalService = accessibilitySignalService;
    this.accessibilityService = accessibilityService;
    this.environmentService = environmentService;
    this.codeBlocksByResponseId = /* @__PURE__ */ new Map();
    this.codeBlocksByEditorUri = new ResourceMap();
    this.fileTreesByResponseId = /* @__PURE__ */ new Map();
    this.focusedFileTreesByResponseId = /* @__PURE__ */ new Map();
    this.templateDataByRequestId = /* @__PURE__ */ new Map();
    this.responseTemplateDataByRequestId = /* @__PURE__ */ new Map();
    this.pendingQuestionCarousels = new ResourceMap();
    this._autoRepliedQuestionCarousels = /* @__PURE__ */ new Set();
    this._notifiedQuestionCarousels = /* @__PURE__ */ new Set();
    this._onDidClickFollowup = this._register(new Emitter());
    this.onDidClickFollowup = this._onDidClickFollowup.event;
    this._onDidClickRerunWithAgentOrCommandDetection = this._register(new Emitter());
    this.onDidClickRerunWithAgentOrCommandDetection = this._onDidClickRerunWithAgentOrCommandDetection.event;
    this._onDidClickRequest = this._register(new Emitter());
    this.onDidClickRequest = this._onDidClickRequest.event;
    this._onDidRerender = this._register(new Emitter());
    this.onDidRerender = this._onDidRerender.event;
    this._onDidDispose = this._register(new Emitter());
    this.onDidDispose = this._onDidDispose.event;
    this._onDidFocusOutside = this._register(new Emitter());
    this.onDidFocusOutside = this._onDidFocusOutside.event;
    this._onDidChangeItemHeight = this._register(new Emitter());
    this.onDidChangeItemHeight = this._onDidChangeItemHeight.event;
    this._onDidUpdateViewModel = this._register(new Emitter());
    this._currentLayoutWidth = observableValue(this, 0);
    this._isVisible = true;
    this._onDidChangeVisibility = this._register(new Emitter());
    this._announcedToolProgressKeys = /* @__PURE__ */ new Set();
    this.chatContentMarkdownRenderer = this.instantiationService.createInstance(ChatContentMarkdownRenderer);
    this.markdownDecorationsRenderer = this.instantiationService.createInstance(ChatMarkdownDecorationsRenderer);
    this._editorPool = this._register(this.instantiationService.createInstance(EditorPool, editorOptions, delegate, overflowWidgetsDomNode, false));
    this._toolEditorPool = this._register(this.instantiationService.createInstance(EditorPool, editorOptions, delegate, overflowWidgetsDomNode, true));
    this._diffEditorPool = this._register(this.instantiationService.createInstance(DiffEditorPool, editorOptions, delegate, overflowWidgetsDomNode, false));
    this._treePool = this._register(this.instantiationService.createInstance(TreePool, this._onDidChangeVisibility.event));
    this._contentReferencesListPool = this._register(this.instantiationService.createInstance(CollapsibleListPool, this._onDidChangeVisibility.event, void 0, void 0));
    this._register(this.instantiationService.createInstance(ChatCodeBlockContentProvider));
    this._toolInvocationCodeBlockCollection = this._register(this.instantiationService.createInstance(CodeBlockModelCollection, "tools"));
    this._autoReply = this._register(this.instantiationService.createInstance(ChatQuestionCarouselAutoReply));
    this._register(this.chatService.onDidSubmitRequest((e) => {
      const carousels = this.pendingQuestionCarousels.get(e.chatSessionResource);
      if (carousels) {
        for (const carousel of carousels) {
          carousel.skip();
        }
        carousels.clear();
      }
    }));
  }
  set pendingDragController(controller) {
    this._pendingDragController = controller;
  }
  updateOptions(options) {
    this.rendererOptions = { ...this.rendererOptions, ...options };
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
  fireItemHeightChange(template, measuredHeight) {
    if (!template.currentElement || !template.rowContainer.isConnected) {
      return;
    }
    const height = measuredHeight ?? template.rowContainer.getBoundingClientRect().height;
    if (height === 0 || !height) {
      return;
    }
    const normalizedHeight = Math.ceil(height);
    template.currentElement.currentRenderedHeight = normalizedHeight;
    if (template.currentElement !== this._elementBeingRendered) {
      this._onDidChangeItemHeight.fire({ element: template.currentElement, height: normalizedHeight });
    }
  }
  /**
   * Compute a rate to render at in words/s.
   */
  getProgressiveRenderRate(element) {
    let Rate;
    (function(Rate2) {
      Rate2[Rate2["Min"] = 40] = "Min";
      Rate2[Rate2["Max"] = 2e3] = "Max";
    })(Rate || (Rate = {}));
    const minAfterComplete = 80;
    const rate = element.contentUpdateTimings?.impliedWordLoadRate;
    if (element.isComplete) {
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
        40,
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
  updateViewModel(viewModel) {
    this.viewModel = viewModel;
    this._announcedToolProgressKeys.clear();
    this._autoRepliedQuestionCarousels.clear();
    this._notifiedQuestionCarousels.clear();
    this.codeBlocksByEditorUri.clear();
    this.codeBlocksByResponseId.clear();
    this.fileTreesByResponseId.clear();
    this.focusedFileTreesByResponseId.clear();
    this.responseTemplateDataByRequestId.clear();
    this._editorPool.clear();
    this._toolEditorPool.clear();
    this._diffEditorPool.clear();
    this._treePool.clear();
    this._contentReferencesListPool.clear();
    this._onDidUpdateViewModel.fire();
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
  getTemplateDataForRequestId(requestId) {
    if (!requestId) {
      return void 0;
    }
    const templateData = this.templateDataByRequestId.get(requestId);
    if (templateData && templateData.currentElement?.id === requestId) {
      return templateData;
    }
    if (templateData) {
      this.templateDataByRequestId.delete(requestId);
    }
    return void 0;
  }
  setVisible(visible) {
    this._isVisible = visible;
    this._onDidChangeVisibility.fire(visible);
  }
  layout(width) {
    const newWidth = width - 40;
    if (newWidth !== this._currentLayoutWidth.get()) {
      this._currentLayoutWidth.set(newWidth, void 0);
      for (const editor of this._editorPool.inUse()) {
        editor.layout(newWidth);
      }
      for (const toolEditor of this._toolEditorPool.inUse()) {
        toolEditor.layout(newWidth);
      }
      for (const diffEditor of this._diffEditorPool.inUse()) {
        diffEditor.layout(newWidth);
      }
    }
  }
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    const disabledOverlay = dom.append(container, $(".chat-row-disabled-overlay"));
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
    this.hoverHidden(requestHover);
    const checkpointContainer = dom.append(rowContainer, $(".checkpoint-container"));
    dom.append(checkpointContainer, $(".checkpoint-line-left"));
    const checkpointToolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, checkpointContainer, MenuId.ChatMessageCheckpoint, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof MenuItemAction) {
          return this.instantiationService.createInstance(CodiconActionViewItem, action, { hoverDelegate: options.hoverDelegate });
        }
        return void 0;
      }, "actionViewItemProvider"),
      renderDropdownAsChildElement: true,
      menuOptions: {
        shouldForwardArgs: true
      },
      toolbarOptions: {
        shouldInlineSubmenu: /* @__PURE__ */ __name((submenu) => submenu.actions.length <= 1, "shouldInlineSubmenu")
      }
    }));
    dom.append(checkpointContainer, $(".checkpoint-line-right"));
    const user = dom.append(header, $(".user"));
    const avatarContainer = dom.append(user, $(".avatar-container"));
    const username = dom.append(user, $("h3.username"));
    username.tabIndex = 0;
    const detailContainer = dom.append(detailContainerParent ?? user, $("span.detail-container"));
    const detail = dom.append(detailContainer, $("span.detail"));
    dom.append(detailContainer, $("span.chat-animated-ellipsis"));
    const value = dom.append(valueParent, $(".value"));
    const elementDisposables = templateDisposables.add(new DisposableStore());
    const footerToolbarContainer = dom.append(rowContainer, $(".chat-footer-toolbar"));
    if (this.rendererOptions.noFooter) {
      footerToolbarContainer.classList.add("hidden");
    }
    const footerToolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, footerToolbarContainer, MenuId.ChatMessageFooter, {
      eventDebounceDelay: 0,
      menuOptions: { shouldForwardArgs: true, renderShortTitle: true },
      toolbarOptions: { shouldInlineSubmenu: /* @__PURE__ */ __name((submenu) => submenu.actions.length <= 1, "shouldInlineSubmenu") },
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof MenuItemAction && action.item.id === MarkUnhelpfulActionId) {
          return scopedInstantiationService.createInstance(ChatVoteDownButton, action, options);
        }
        if (action instanceof MenuItemAction && action.item.id === MarkHelpfulActionId) {
          const animation = upvoteAnimationSettingToEnum(this.configService.getValue("chat.upvoteAnimation"));
          return scopedInstantiationService.createInstance(MenuEntryActionViewItem, action, { ...options, onClickAnimation: animation });
        }
        return createActionViewItem(scopedInstantiationService, action, options);
      }, "actionViewItemProvider")
    }));
    const footerDetailsContainer = dom.append(footerToolbar.getElement(), $(".chat-footer-details"));
    footerDetailsContainer.tabIndex = 0;
    const checkpointRestoreContainer = dom.append(rowContainer, $(".checkpoint-restore-container"));
    dom.append(checkpointRestoreContainer, $(".checkpoint-line-left"));
    const label = dom.append(checkpointRestoreContainer, $("span.checkpoint-label-text"));
    label.textContent = localize("checkpointRestore", "Checkpoint Restored");
    const dot = dom.append(checkpointRestoreContainer, $("span.checkpoint-dot-separator"));
    dot.textContent = "\xB7";
    dot.setAttribute("aria-hidden", "true");
    const checkpointRestoreToolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, checkpointRestoreContainer, MenuId.ChatMessageRestoreCheckpoint, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof MenuItemAction) {
          return this.instantiationService.createInstance(CodiconActionViewItem, action, { hoverDelegate: options.hoverDelegate });
        }
        return void 0;
      }, "actionViewItemProvider"),
      renderDropdownAsChildElement: true,
      menuOptions: {
        shouldForwardArgs: true
      },
      toolbarOptions: {
        shouldInlineSubmenu: /* @__PURE__ */ __name((submenu) => submenu.actions.length <= 1, "shouldInlineSubmenu")
      }
    }));
    dom.append(checkpointRestoreContainer, $(".checkpoint-line-right"));
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
    const connectionObserver = document.createElement("connection-observer");
    dom.append(container, connectionObserver);
    const template = { header, avatarContainer, requestHover, username, detail, value, rowContainer, elementDisposables, templateDisposables, contextKeyService, instantiationService: scopedInstantiationService, agentHover, titleToolbar, footerToolbar, footerDetailsContainer, disabledOverlay, checkpointToolbar, checkpointRestoreToolbar, checkpointContainer, checkpointRestoreContainer };
    connectionObserver.onDidDisconnect = () => {
      template.renderedPartsMounted = false;
    };
    templateDisposables.add(this._onDidUpdateViewModel.event(() => {
      if (!template.currentElement || !this.viewModel?.sessionResource || !isEqual(template.currentElement.sessionResource, this.viewModel.sessionResource)) {
        this.clearRenderedParts(template);
      }
    }));
    templateDisposables.add(dom.addDisposableListener(disabledOverlay, dom.EventType.CLICK, (e) => {
      if (!this.viewModel?.editing) {
        return;
      }
      const current = template.currentElement;
      if (!current || current.id === this.viewModel.editing.id) {
        return;
      }
      if (disabledOverlay.classList.contains("disabled")) {
        e.preventDefault();
        e.stopPropagation();
        this._onDidFocusOutside.fire();
      }
    }));
    const resizeObserver = templateDisposables.add(new dom.DisposableResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        this.fireItemHeightChange(template, entry.borderBoxSize.at(0)?.blockSize);
      }
    }));
    templateDisposables.add(resizeObserver.observe(rowContainer));
    return template;
  }
  renderElement(node, index, templateData) {
    this._elementBeingRendered = node.element;
    try {
      this.renderChatTreeItem(node.element, index, templateData);
    } finally {
      this._elementBeingRendered = void 0;
    }
  }
  /**
   * Dispose the rendered parts in the template, which aren't done in disposeElement
   * so they can be reused when a new render is started.
   */
  clearRenderedParts(templateData) {
    if (templateData.renderedParts) {
      dispose(coalesce(templateData.renderedParts));
      templateData.renderedParts = void 0;
      dom.clearNode(templateData.value);
    }
    if (templateData.titleToolbar) {
      templateData.titleToolbar.context = void 0;
    }
    templateData.footerToolbar.context = void 0;
    templateData.checkpointToolbar.context = void 0;
    templateData.checkpointRestoreToolbar.context = void 0;
  }
  renderChatTreeItem(element, index, templateData) {
    if (templateData.currentElement && templateData.currentElement.id !== element.id) {
      this.traceLayout("renderChatTreeItem", `Rendering a different element into the template, index=${index}`);
      const mappedTemplateData = this.templateDataByRequestId.get(templateData.currentElement.id);
      if (mappedTemplateData && mappedTemplateData.currentElement?.id !== templateData.currentElement.id) {
        this.templateDataByRequestId.delete(templateData.currentElement.id);
      }
      this.clearRenderedParts(templateData);
    }
    templateData.currentElement = element;
    this.templateDataByRequestId.set(element.id, templateData);
    if (isPendingDividerVM(element)) {
      this.renderPendingDivider(element, templateData);
      return;
    }
    const kind = isRequestVM(element) ? "request" : isResponseVM(element) ? "response" : isPendingDividerVM(element) ? "pendingDivider" : "welcome";
    this.traceLayout("renderElement", `${kind}, index=${index}`);
    ChatContextKeys.isResponse.bindTo(templateData.contextKeyService).set(isResponseVM(element));
    ChatContextKeys.itemId.bindTo(templateData.contextKeyService).set(element.id);
    ChatContextKeys.isRequest.bindTo(templateData.contextKeyService).set(isRequestVM(element));
    ChatContextKeys.isPendingRequest.bindTo(templateData.contextKeyService).set(isRequestVM(element) && !!element.pendingKind);
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
    if (isResponseVM(element) && element.result?.details) {
      templateData.footerDetailsContainer.textContent = element.result.details;
      templateData.footerDetailsContainer.classList.remove("hidden");
    } else {
      templateData.footerDetailsContainer.classList.add("hidden");
    }
    ChatContextKeys.responseHasError.bindTo(templateData.contextKeyService).set(isResponseVM(element) && !!element.errorDetails);
    const isFiltered = !!(isResponseVM(element) && element.errorDetails?.responseIsFiltered);
    ChatContextKeys.responseIsFiltered.bindTo(templateData.contextKeyService).set(isFiltered);
    const location = this.chatWidgetService.getWidgetBySessionResource(element.sessionResource)?.location;
    templateData.rowContainer.classList.toggle("editing-session", location === ChatAgentLocation.Chat);
    templateData.rowContainer.classList.toggle("interactive-request", isRequestVM(element));
    templateData.rowContainer.classList.toggle("interactive-response", isResponseVM(element));
    templateData.rowContainer.classList.remove("pending-item", "pending-divider", "pending-request");
    templateData.dragHandle?.remove();
    templateData.dragHandle = void 0;
    delete templateData.rowContainer.dataset.pendingRequestId;
    delete templateData.rowContainer.dataset.pendingKind;
    const progressMessageAtBottomOfResponse = checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.progressMessageAtBottomOfResponse);
    templateData.rowContainer.classList.toggle("show-detail-progress", isResponseVM(element) && !element.isComplete && !element.progressMessages.length && !progressMessageAtBottomOfResponse);
    if (!this.rendererOptions.noHeader) {
      this.renderAvatar(element, templateData);
    }
    templateData.username.textContent = element.username;
    templateData.username.classList.toggle("hidden", element.username === COPILOT_USERNAME || this.environmentService.isSessionsWindow);
    templateData.avatarContainer.classList.toggle("hidden", element.username === COPILOT_USERNAME || this.environmentService.isSessionsWindow);
    this.hoverHidden(templateData.requestHover);
    dom.clearNode(templateData.detail);
    if (isResponseVM(element)) {
      this.renderDetail(element, templateData);
    }
    templateData.checkpointToolbar.context = element;
    const checkpointEnabled = this.configService.getValue(ChatConfiguration.CheckpointsEnabled) && (this.rendererOptions.restorable ?? true);
    const isPendingRequest = isRequestVM(element) && !!element.pendingKind;
    templateData.checkpointContainer.classList.toggle("hidden", isResponseVM(element) || isPendingRequest || !checkpointEnabled);
    if (isResponseVM(element)) {
      this.responseTemplateDataByRequestId.set(element.requestId, templateData);
      templateData.elementDisposables.add(toDisposable(() => this.responseTemplateDataByRequestId.delete(element.requestId)));
    }
    if (!isPendingRequest) {
      const setGroupHover = /* @__PURE__ */ __name((hovered) => {
        const requestId = isRequestVM(element) ? element.id : isResponseVM(element) ? element.requestId : void 0;
        if (!requestId) {
          return;
        }
        const reqData = this.templateDataByRequestId.get(requestId);
        const resData = this.responseTemplateDataByRequestId.get(requestId);
        reqData?.checkpointContainer.classList.toggle("group-hovered", hovered);
        resData?.rowContainer.classList.toggle("group-hovered", hovered);
      }, "setGroupHover");
      templateData.elementDisposables.add(dom.addDisposableListener(templateData.rowContainer, dom.EventType.MOUSE_ENTER, () => setGroupHover(true)));
      templateData.elementDisposables.add(dom.addDisposableListener(templateData.rowContainer, dom.EventType.MOUSE_LEAVE, () => setGroupHover(false)));
      templateData.elementDisposables.add(toDisposable(() => setGroupHover(false)));
    }
    const shouldShowRestore = this.viewModel?.model.checkpoint && !this.viewModel?.editing && index === this.delegate.getListLength() - 1 && !isPendingRequest;
    templateData.checkpointRestoreContainer.classList.toggle("hidden", !(shouldShowRestore && checkpointEnabled));
    const editing = element.id === this.viewModel?.editing?.id;
    const isInput = this.configService.getValue("chat.editRequests") === "input";
    templateData.elementDisposables.add(autorun((r) => {
      const shouldBeBlocked = element.shouldBeBlocked.read(r);
      templateData.disabledOverlay.classList.toggle("disabled", shouldBeBlocked && !editing && this.viewModel?.editing !== void 0);
    }));
    templateData.rowContainer.classList.toggle("editing", editing && !isInput);
    templateData.rowContainer.classList.toggle("editing-input", editing && isInput);
    templateData.requestHover.classList.toggle("editing", editing && isInput);
    templateData.requestHover.classList.toggle("hidden", !!this.viewModel?.editing && !editing || isResponseVM(element) || !this.rendererOptions.editable);
    templateData.requestHover.classList.toggle("expanded", this.configService.getValue("chat.editRequests") === "hover");
    templateData.requestHover.classList.toggle("checkpoints-enabled", checkpointEnabled);
    templateData.elementDisposables.add(dom.addStandardDisposableListener(templateData.rowContainer, dom.EventType.CLICK, (e) => {
      const current = templateData.currentElement;
      if (current && this.viewModel?.editing && current.id !== this.viewModel.editing.id) {
        e.stopPropagation();
        e.preventDefault();
        this._onDidFocusOutside.fire();
      }
    }));
    const rowRoot = templateData.rowContainer.parentElement?.parentElement?.parentElement;
    rowRoot?.classList.toggle("request", isRequestVM(element));
    rowRoot?.classList.toggle("response", isResponseVM(element));
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
    templateData.renderedPartsMounted = true;
  }
  renderPendingDivider(element, templateData) {
    templateData.rowContainer.classList.add("pending-item");
    templateData.rowContainer.classList.add("pending-divider");
    templateData.rowContainer.classList.remove("interactive-request", "interactive-response", "pending-request");
    templateData.avatarContainer.classList.add("hidden");
    templateData.username.classList.add("hidden");
    templateData.requestHover.classList.add("hidden");
    templateData.checkpointContainer.classList.add("hidden");
    templateData.checkpointRestoreContainer.classList.add("hidden");
    templateData.footerToolbar.getElement().classList.add("hidden");
    if (templateData.titleToolbar) {
      templateData.titleToolbar.getElement().classList.add("hidden");
    }
    dom.clearNode(templateData.value);
    dom.clearNode(templateData.detail);
    const dividerContent = dom.$(".pending-divider-content");
    const label = dom.append(dividerContent, dom.$("span.pending-divider-label"));
    if (element.dividerKind === "steering") {
      label.textContent = localize("steeringDivider", "Steering");
      label.title = localize("steeringDividerTooltip", "Steering message will be sent after the next tool call happens");
    } else {
      label.textContent = localize("queuedDivider", "Queued");
      label.title = localize("queuedDividerTooltip", "Queued messages will be sent after the current request completes");
    }
    templateData.value.appendChild(dividerContent);
  }
  renderDetail(element, templateData) {
    dom.clearNode(templateData.detail);
    if (element.agentOrSlashCommandDetected) {
      const msg = element.slashCommand ? localize("usedAgentSlashCommand", "used {0} [[(rerun without)]]", `${chatSubcommandLeader}${element.slashCommand.name}`) : localize("usedAgent", "[[(rerun without)]]");
      dom.reset(templateData.detail, renderFormattedText(msg, {
        actionHandler: {
          disposables: templateData.elementDisposables,
          callback: /* @__PURE__ */ __name((content) => {
            this._onDidClickRerunWithAgentOrCommandDetection.fire(element);
          }, "callback")
        }
      }, $("span.agentOrSlashCommandDetected")));
    } else if (this.rendererOptions.renderStyle !== "minimal" && !element.isComplete && !checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.progressMessageAtBottomOfResponse)) {
      templateData.detail.textContent = localize("working", "Working");
    }
  }
  renderConfirmationAction(element, templateData) {
    dom.clearNode(templateData.detail);
    if (element.confirmation) {
      dom.append(templateData.detail, $("span.codicon.codicon-check", { "aria-hidden": "true" }));
      dom.append(templateData.detail, $("span.confirmation-text", void 0, localize("chatConfirmationAction", 'Selected "{0}"', element.confirmation)));
      templateData.header?.classList.remove("header-disabled");
      templateData.header?.classList.add("partially-disabled");
    }
  }
  renderAvatar(element, templateData) {
    if (isPendingDividerVM(element)) {
      return;
    }
    let icon;
    if (isResponseVM(element)) {
      icon = this.getAgentIcon(element.agent?.metadata);
    } else if (isRequestVM(element)) {
      icon = element.avatarIcon ?? Codicon.account;
    } else {
      icon = Codicon.account;
    }
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
    } else if (agent?.iconDark && isDark(this.themeService.getColorTheme().type)) {
      return agent.iconDark;
    } else if (agent?.icon) {
      return agent.icon;
    } else {
      return Codicon.chatSparkle;
    }
  }
  renderChatResponseBasic(element, index, templateData) {
    templateData.rowContainer.classList.toggle("chat-response-loading", isResponseVM(element) && !element.isComplete);
    if (element.isComplete || element.isCanceled) {
      const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
      if (lastThinking?.domNode && lastThinking.getIsActive()) {
        lastThinking.finalizeTitleIfDefault();
        lastThinking.markAsInactive();
      }
      this.finalizeAllSubagentParts(templateData);
    }
    const content = [];
    const isFiltered = !!element.errorDetails?.responseIsFiltered;
    if (!isFiltered) {
      content.push({ kind: "references", references: element.contentReferences });
      content.push(...annotateSpecialMarkdownContent(element.response.value));
      if (element.codeCitations.length) {
        content.push({ kind: "codeCitations", citations: element.codeCitations });
      }
    }
    if (element.model.response === element.model.entireResponse && element.errorDetails?.message && element.errorDetails.message !== canceledName) {
      content.push({ kind: "errorDetails", errorDetails: element.errorDetails, isLast: index === this.delegate.getListLength() - 1 });
    }
    const fileChangesSummaryPart = this.getChatFileChangesSummaryPart(element);
    if (fileChangesSummaryPart) {
      content.push(fileChangesSummaryPart);
    }
    const diff = this.diff(templateData.renderedParts ?? [], content, element);
    this.renderChatContentDiff(diff, content, element, index, templateData);
  }
  shouldShowWorkingProgress(element, partsToRender, templateData) {
    if (element.agentOrSlashCommandDetected || this.rendererOptions.renderStyle === "minimal" || element.isComplete || !checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.progressMessageAtBottomOfResponse)) {
      return false;
    }
    if (partsToRender.some((part) => part.kind === "toolInvocation" && IChatToolInvocation.isStreaming(part))) {
      return false;
    }
    const lastPart = findLast(partsToRender, (part) => part.kind !== "markdownContent" || part.content.value.trim().length > 0);
    if (partsToRender.some((part) => part.kind === "thinking")) {
      return false;
    }
    const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
    if (lastThinking) {
      return false;
    }
    const collapsedToolsMode = this.configService.getValue("chat.agent.thinking.collapsedTools");
    if (collapsedToolsMode !== CollapsedToolsDisplayMode.Off && partsToRender.some((part) => (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && this.shouldPinPart(part, element))) {
      return false;
    }
    const hasRenderedThinkingPart = (templateData.renderedParts ?? []).some((part) => part instanceof ChatThinkingContentPart);
    const hasEditPillMarkdown = partsToRender.some((part) => part.kind === "markdownContent" && this.hasCodeblockUri(part));
    if (hasRenderedThinkingPart && hasEditPillMarkdown) {
      return false;
    }
    if (this.getSubagentPart(templateData.renderedParts)) {
      return false;
    }
    if (!lastPart || lastPart.kind === "references" || (lastPart.kind === "toolInvocation" || lastPart.kind === "toolInvocationSerialized") && (IChatToolInvocation.isComplete(lastPart) || lastPart.presentation === "hidden") || (lastPart.kind === "textEditGroup" || lastPart.kind === "notebookEditGroup") && lastPart.done && !partsToRender.some((part) => part.kind === "toolInvocation" && !IChatToolInvocation.isComplete(part)) || lastPart.kind === "progressTask" && lastPart.deferred.isSettled || lastPart.kind === "mcpServersStarting" || lastPart.kind === "disabledClaudeHooks" || lastPart.kind === "hook") {
      return true;
    }
    return false;
  }
  getChatFileChangesSummaryPart(element) {
    if (!this.shouldShowFileChangesSummary(element)) {
      return void 0;
    }
    if (!element.model.entireResponse.value.some((part) => part.kind === "textEditGroup" || part.kind === "notebookEditGroup")) {
      return void 0;
    }
    return { kind: "changesSummary", requestId: element.requestId, sessionResource: element.sessionResource };
  }
  renderChatRequest(element, index, templateData) {
    templateData.rowContainer.classList.toggle("chat-response-loading", false);
    templateData.rowContainer.classList.toggle("pending-request", !!element.pendingKind);
    if (element.pendingKind && this._pendingDragController) {
      templateData.rowContainer.dataset.pendingRequestId = element.id;
      templateData.rowContainer.dataset.pendingKind = element.pendingKind;
      const sameKindCount = (this.viewModel?.model.getPendingRequests() ?? []).filter((p) => p.kind === element.pendingKind).length;
      if (sameKindCount > 1) {
        const handle = dom.$(".chat-pending-drag-handle" + ThemeIcon.asCSSSelector(Codicon.gripper));
        templateData.rowContainer.prepend(handle);
        templateData.dragHandle = handle;
        this._pendingDragController.attachDragHandle(element, handle, templateData.rowContainer, templateData.elementDisposables);
      }
    }
    if (element.id === this.viewModel?.editing?.id) {
      this._onDidRerender.fire(templateData);
    }
    if (this.configService.getValue("chat.editRequests") !== "none" && this.rendererOptions.editable) {
      templateData.elementDisposables.add(dom.addDisposableListener(templateData.rowContainer, dom.EventType.KEY_DOWN, (e) => {
        const ev = new StandardKeyboardEvent(e);
        if (ev.equals(
          10
          /* KeyCode.Space */
        ) || ev.equals(
          3
          /* KeyCode.Enter */
        )) {
          if (this.viewModel?.editing?.id !== element.id) {
            ev.preventDefault();
            ev.stopPropagation();
            this._onDidClickRequest.fire(templateData);
          }
        }
      }));
    }
    let content = [];
    if (!element.confirmation) {
      const markdown = isChatFollowup(element.message) ? element.message.message : this.markdownDecorationsRenderer.convertParsedRequestToMarkdown(element.sessionResource, element.message);
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
        container: templateData.rowContainer,
        editorPool: this._editorPool,
        diffEditorPool: this._diffEditorPool,
        codeBlockModelCollection: this.codeBlockModelCollection,
        currentWidth: this._currentLayoutWidth,
        onDidChangeVisibility: this._onDidChangeVisibility.event,
        get codeBlockStartIndex() {
          return parts.reduce((acc, part) => acc + (part.codeblocks?.length ?? 0), 0);
        },
        get treeStartIndex() {
          return parts.filter((part) => part instanceof ChatTreeContentPart).length;
        }
      };
      const newPart = this.renderChatContentPart(data, templateData, context);
      if (newPart) {
        if (this.rendererOptions.renderDetectedCommandsWithRequest && !inlineSlashCommandRendered && element.agentOrSlashCommandDetected && element.slashCommand && data.kind === "markdownContent") {
          if (newPart.domNode) {
            newPart.domNode.style.display = "inline-flex";
          }
          const cmdPart = this.instantiationService.createInstance(ChatAgentCommandContentPart, element.slashCommand, () => this._onDidClickRerunWithAgentOrCommandDetection.fire({ sessionResource: element.sessionResource, requestId: element.id }));
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
    this.traceLayout("doNextProgressiveRender", `START progressive render, index=${index}`);
    const contentForThisTurn = this.getNextProgressiveRenderContent(element, templateData);
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
        return true;
      }
    }
    this.traceLayout("doNextProgressiveRender", `doing progressive render, ${partsToRender.length} parts to render`);
    this.renderChatContentDiff(partsToRender, contentForThisTurn.content, element, index, templateData);
    return false;
  }
  renderChatContentDiff(partsToRender, contentForThisTurn, element, elementIndex, templateData) {
    const renderedParts = templateData.renderedParts ?? [];
    templateData.renderedParts = renderedParts;
    const lastMarkdownIndex = partsToRender.findLastIndex((part) => part?.kind === "markdownContent");
    partsToRender.forEach((partToRender, contentIndex) => {
      const alreadyRenderedPart = templateData.renderedParts?.[contentIndex];
      const isFinalAnswerPart = partToRender?.kind === "markdownContent" && contentIndex === lastMarkdownIndex && element.isComplete;
      if (!partToRender) {
        if (!templateData.renderedPartsMounted) {
          alreadyRenderedPart?.onDidRemount?.();
        }
        return;
      }
      if (alreadyRenderedPart) {
        if (partToRender.kind === "thinking" && alreadyRenderedPart instanceof ChatThinkingContentPart) {
          if (!Array.isArray(partToRender.value)) {
            alreadyRenderedPart.updateThinking(partToRender);
          }
          renderedParts[contentIndex] = alreadyRenderedPart;
          return;
        } else if (alreadyRenderedPart instanceof ChatThinkingContentPart && this.shouldPinPart(partToRender, element) && !isFinalAnswerPart) {
          renderedParts[contentIndex] = alreadyRenderedPart;
          return;
        }
        alreadyRenderedPart.dispose();
        if (alreadyRenderedPart.domNode) {
          const thinkingToolWrapper = dom.findParentWithClass(alreadyRenderedPart.domNode, "chat-thinking-tool-wrapper");
          if (thinkingToolWrapper) {
            thinkingToolWrapper.replaceWith(alreadyRenderedPart.domNode);
          }
        }
      }
      const preceedingContentParts = renderedParts.slice(0, contentIndex);
      const context = {
        element,
        elementIndex,
        content: contentForThisTurn,
        contentIndex,
        container: templateData.rowContainer,
        editorPool: this._editorPool,
        diffEditorPool: this._diffEditorPool,
        codeBlockModelCollection: this.codeBlockModelCollection,
        currentWidth: this._currentLayoutWidth,
        onDidChangeVisibility: this._onDidChangeVisibility.event,
        get codeBlockStartIndex() {
          return preceedingContentParts.reduce((acc, part) => acc + (part.codeblocks?.length ?? 0), 0);
        },
        get treeStartIndex() {
          return preceedingContentParts.filter((part) => part instanceof ChatTreeContentPart).length;
        }
      };
      const lastThinking = this.getLastThinkingPart(renderedParts);
      if (lastThinking && (partToRender.kind === "toolInvocation" || partToRender.kind === "toolInvocationSerialized" || partToRender.kind === "markdownContent" || partToRender.kind === "textEditGroup" || partToRender.kind === "hook") && this.shouldPinPart(partToRender, element) && !isFinalAnswerPart) {
        const newPart2 = this.renderChatContentPart(partToRender, templateData, context);
        if (newPart2) {
          renderedParts[contentIndex] = newPart2;
          if (alreadyRenderedPart instanceof ChatWorkingProgressContentPart && alreadyRenderedPart?.domNode) {
            alreadyRenderedPart.domNode.remove();
          }
        }
        return;
      }
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
          } else if (newPart.domNode && !newPart.domNode.parentElement) {
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
  getNextProgressiveRenderContent(element, templateData) {
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
    if (this.shouldShowWorkingProgress(element, partsToRender, templateData)) {
      partsToRender.push({ kind: "working" });
    }
    const fileChangesSummaryPart = this.getChatFileChangesSummaryPart(element);
    if (fileChangesSummaryPart) {
      partsToRender.push(fileChangesSummaryPart);
    }
    return { content: partsToRender, moreContentAvailable };
  }
  shouldShowFileChangesSummary(element) {
    const isLocalSession = getChatSessionType(element.sessionResource) === localChatSessionType;
    return element.isComplete && isLocalSession && this.configService.getValue("chat.checkpoints.showFileChanges");
  }
  getDataForProgressiveRender(element) {
    const hasMarkdownParts = element.response.value.some((part) => part.kind === "markdownContent" && part.content.value.trim().length > 0);
    if (!element.isComplete && hasMarkdownParts && (element.contentUpdateTimings ? element.contentUpdateTimings.lastWordCount : 0) === 0) {
      return {
        numWordsToRender: Number.MAX_SAFE_INTEGER,
        rate: Number.MAX_SAFE_INTEGER
      };
    }
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
    const elementIsComplete = isResponseVM(element) && element.isComplete;
    const lastMarkdownContentIndex = contentToRender.findLastIndex((part) => part.kind === "markdownContent");
    for (let i = 0; i < contentToRender.length; i++) {
      const content = contentToRender[i];
      const renderedPart = renderedParts[i];
      const isFinalAnswerPart = content.kind === "markdownContent" && i === lastMarkdownContentIndex && elementIsComplete;
      if (isFinalAnswerPart && this.isRenderedPartInsideThinking(renderedPart)) {
        diff.push(content);
        continue;
      }
      if (!renderedPart || !renderedPart.hasSameContent(content, contentToRender.slice(i + 1), element)) {
        diff.push(content);
      } else {
        diff.push(null);
      }
    }
    return diff;
  }
  isRenderedPartInsideThinking(renderedPart) {
    if (!renderedPart?.domNode) {
      return false;
    }
    return !!dom.findParentWithClass(renderedPart.domNode, "chat-thinking-box");
  }
  hasCodeblockUri(part) {
    if (part.kind !== "markdownContent") {
      return false;
    }
    return hasCodeblockUriTag(part.content.value);
  }
  isCodeblockComplete(part, element) {
    if (part.kind !== "markdownContent") {
      return true;
    }
    return !isResponseVM(element) || element.isComplete || codeblockHasClosingBackticks(part.content.value);
  }
  // todo @justschen initially split up each of the checks to easily see what should be pinned/not pinned, we can probably consolidate this down by a lot once we're more confident in the logic.
  shouldPinPart(part, element) {
    const collapsedToolsMode = this.configService.getValue("chat.agent.thinking.collapsedTools");
    if (part.kind === "thinking" || part.kind === "working") {
      return true;
    }
    if (part.kind === "undoStop") {
      return true;
    }
    if (part.kind === "hook") {
      if (part.subAgentInvocationId) {
        return false;
      }
      return part.hookType === HookType.PreToolUse || part.hookType === HookType.PostToolUse;
    }
    if (collapsedToolsMode === CollapsedToolsDisplayMode.Off) {
      return false;
    }
    if (this.hasCodeblockUri(part) || part.kind === "textEditGroup") {
      return true;
    }
    const isMcpTool = (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && part.source?.type === "mcp";
    if (isMcpTool) {
      return false;
    }
    const isMermaidTool = (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && part.toolId.toLowerCase().includes("mermaid");
    if (isMermaidTool) {
      return false;
    }
    const isAskQuestionsTool = (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && (part.toolId === "copilot_askQuestions" || part.toolId === "vscode_askQuestions");
    if (isAskQuestionsTool) {
      return false;
    }
    if ((part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && isSubagentToolInvocation(part)) {
      return false;
    }
    const isTerminalTool = (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && part.toolSpecificData?.kind === "terminal";
    const isContributedTerminalToolInvocation = element && (element.sessionResource.scheme !== Schemas.vscodeChatInput && element.sessionResource.scheme !== Schemas.vscodeLocalChatSession) && part.kind === "toolInvocationSerialized" && part.toolSpecificData?.kind === "terminal";
    if (isTerminalTool && !isContributedTerminalToolInvocation) {
      if (part.kind === "toolInvocation" && IChatToolInvocation.getConfirmationMessages(part)) {
        return false;
      }
      const terminalToolsInThinking = this.configService.getValue(ChatConfiguration.TerminalToolsInThinking);
      return !!terminalToolsInThinking;
    }
    if (part.kind === "toolInvocation") {
      if (IChatToolInvocation.isStreaming(part)) {
        return true;
      }
      const state = part.state.get();
      if (state.type === 1 || state.type === 3) {
        return false;
      }
      return !IChatToolInvocation.getConfirmationMessages(part);
    }
    if (part.kind === "toolInvocationSerialized") {
      return true;
    }
    return false;
  }
  getLastThinkingPart(renderedParts) {
    if (!renderedParts || renderedParts.length === 0) {
      return void 0;
    }
    for (let i = renderedParts.length - 1; i >= 0; i--) {
      const part = renderedParts[i];
      if (part instanceof ChatThinkingContentPart && part.getIsActive()) {
        return part;
      }
    }
    return void 0;
  }
  /**
   * Determines if a thinking part at the given content index is "look-ahead complete".
   * A thinking part is look-ahead complete if there are subsequent parts that will NOT
   * be pinned to it, meaning we know this thinking part is already done even though
   * the overall response is still in progress.
   */
  isThinkingLookAheadComplete(context, element) {
    if (element?.isComplete) {
      return true;
    }
    for (let i = context.contentIndex + 1; i < context.content.length; i++) {
      const nextPart = context.content[i];
      if (!this.shouldPinPart(nextPart, element)) {
        return true;
      }
    }
    return false;
  }
  getSubagentPart(renderedParts, subAgentInvocationId) {
    if (!renderedParts || renderedParts.length === 0) {
      return void 0;
    }
    for (let i = renderedParts.length - 1; i >= 0; i--) {
      const part = renderedParts[i];
      if (part instanceof ChatSubagentContentPart) {
        if (subAgentInvocationId && part.subAgentInvocationId === subAgentInvocationId) {
          return part;
        }
        if (!subAgentInvocationId && part.getIsActive()) {
          return part;
        }
      }
    }
    return void 0;
  }
  finalizeAllSubagentParts(templateData) {
    if (!templateData.renderedParts) {
      return;
    }
    for (const part of templateData.renderedParts) {
      if (part instanceof ChatSubagentContentPart && part.getIsActive()) {
        part.markAsInactive();
      }
    }
  }
  handleSubagentToolGrouping(toolInvocation, subagentId, context, templateData, codeBlockStartIndex) {
    this.finalizeCurrentThinkingPart(context, templateData);
    const lastSubagent = this.getSubagentPart(templateData.renderedParts, subagentId);
    if (lastSubagent) {
      if (!isParentSubagentTool(toolInvocation)) {
        lastSubagent.appendToolInvocation(toolInvocation, codeBlockStartIndex);
      }
      return lastSubagent;
    }
    const subagentPart = this.instantiationService.createInstance(ChatSubagentContentPart, subagentId, toolInvocation, context, this.chatContentMarkdownRenderer, this._contentReferencesListPool, this._toolEditorPool, () => this._currentLayoutWidth.get(), this._toolInvocationCodeBlockCollection, this._announcedToolProgressKeys);
    if (!isParentSubagentTool(toolInvocation)) {
      subagentPart.appendToolInvocation(toolInvocation, codeBlockStartIndex);
    }
    return subagentPart;
  }
  finalizeCurrentThinkingPart(context, templateData) {
    const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
    if (!lastThinking) {
      return;
    }
    const style = this.configService.getValue("chat.agent.thinkingStyle");
    if (style === ThinkingDisplayMode.CollapsedPreview) {
      lastThinking.collapseContent();
    }
    lastThinking.finalizeTitleIfDefault();
    lastThinking.resetId();
    lastThinking.markAsInactive();
  }
  renderChatContentPart(content, templateData, context) {
    try {
      if (content.kind === "thinking" && (Array.isArray(content.value) ? content.value.length === 0 : content.value === "")) {
        const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
        lastThinking?.resetId();
        return this.renderNoContent((other) => content.kind === other.kind);
      }
      const isResponseElement = isResponseVM(context.element);
      const shouldPin = this.shouldPinPart(content, isResponseElement ? context.element : void 0);
      if (context.element.isComplete && !shouldPin) {
        for (const templateData2 of this.templateDataByRequestId.values()) {
          if (templateData2.renderedParts) {
            const lastThinking = this.getLastThinkingPart(templateData2.renderedParts);
            if (lastThinking?.getIsActive()) {
              this.finalizeCurrentThinkingPart(context, templateData2);
            }
          }
        }
      }
      const isSubagentContent = (content.kind === "toolInvocation" || content.kind === "toolInvocationSerialized") && isSubagentToolInvocation(content);
      if (context.element.isComplete && !isSubagentContent) {
        for (const templateData2 of this.templateDataByRequestId.values()) {
          this.finalizeAllSubagentParts(templateData2);
        }
      }
      if (content.kind === "treeData") {
        return this.renderTreeData(content, templateData, context);
      } else if (content.kind === "multiDiffData") {
        return this.renderMultiDiffData(content, templateData, context);
      } else if (content.kind === "progressMessage") {
        return this.instantiationService.createInstance(ChatProgressContentPart, content, this.chatContentMarkdownRenderer, context, void 0, void 0, void 0, void 0, content.shimmer);
      } else if (content.kind === "working") {
        return this.instantiationService.createInstance(ChatWorkingProgressContentPart, content, this.chatContentMarkdownRenderer, context);
      } else if (content.kind === "progressTask" || content.kind === "progressTaskSerialized") {
        return this.renderProgressTask(content, templateData, context);
      } else if (content.kind === "command") {
        return this.instantiationService.createInstance(ChatCommandButtonContentPart, content, context);
      } else if (content.kind === "textEditGroup") {
        return this.renderTextEdit(context, content, templateData);
      } else if (content.kind === "confirmation") {
        return this.renderConfirmation(context, content, templateData);
      } else if (content.kind === "warning") {
        return this.instantiationService.createInstance(ChatErrorContentPart, ChatErrorLevel.Warning, content.content, content, this.chatContentMarkdownRenderer);
      } else if (content.kind === "hook") {
        return this.renderHookPart(content, context, templateData);
      } else if (content.kind === "markdownContent") {
        return this.renderMarkdown(content, templateData, context);
      } else if (content.kind === "references") {
        if (isResponseVM(context.element) && context.element.model.request?.modeInfo?.modeId === ChatModeKind.Agent) {
          return this.renderNoContent((other) => other.kind === content.kind);
        }
        return this.renderContentReferencesListData(content, void 0, context, templateData);
      } else if (content.kind === "codeCitations") {
        return this.renderCodeCitations(content, context, templateData);
      } else if (content.kind === "toolInvocation" || content.kind === "toolInvocationSerialized") {
        return this.renderToolInvocation(content, context, templateData);
      } else if (content.kind === "extensions") {
        return this.renderExtensionsContent(content, context, templateData);
      } else if (content.kind === "pullRequest") {
        return this.renderPullRequestContent(content, context, templateData);
      } else if (content.kind === "undoStop") {
        return this.renderUndoStop(content);
      } else if (content.kind === "errorDetails") {
        return this.renderChatErrorDetails(context, content, templateData);
      } else if (content.kind === "elicitation2" || content.kind === "elicitationSerialized") {
        return this.renderElicitation(context, content, templateData);
      } else if (content.kind === "questionCarousel") {
        return this.renderQuestionCarousel(context, content, templateData);
      } else if (content.kind === "changesSummary") {
        return this.renderChangesSummary(content, context, templateData);
      } else if (content.kind === "mcpServersStarting") {
        return this.renderMcpServersInteractionRequired(content, context, templateData);
      } else if (content.kind === "disabledClaudeHooks") {
        return this.renderDisabledClaudeHooks(content, context);
      } else if (content.kind === "thinking") {
        return this.renderThinkingPart(content, context, templateData);
      } else if (content.kind === "workspaceEdit") {
        return this.instantiationService.createInstance(ChatWorkspaceEditContentPart, content, context, this.chatContentMarkdownRenderer);
      }
      return this.renderNoContent((other) => content.kind === other.kind);
    } catch (err) {
      alert(`Chat error: ${toErrorMessage(err, false)}`);
      this.logService.error("ChatListItemRenderer#renderChatContentPart: error rendering content", toErrorMessage(err, true));
      const errorPart = this.instantiationService.createInstance(ChatErrorContentPart, ChatErrorLevel.Error, new MarkdownString(localize("renderFailMsg", "Failed to render content") + `: ${toErrorMessage(err, false)}`), content, this.chatContentMarkdownRenderer);
      return {
        dispose: /* @__PURE__ */ __name(() => errorPart.dispose(), "dispose"),
        domNode: errorPart.domNode,
        hasSameContent: /* @__PURE__ */ __name(((other) => content.kind === other.kind), "hasSameContent")
      };
    }
  }
  dispose() {
    this._announcedToolProgressKeys.clear();
    super.dispose();
  }
  renderChatErrorDetails(context, content, templateData) {
    if (!isResponseVM(context.element)) {
      return this.renderNoContent((other) => content.kind === other.kind);
    }
    const isLast = context.elementIndex === this.delegate.getListLength() - 1;
    if (content.errorDetails.isQuotaExceeded) {
      const renderedError = this.instantiationService.createInstance(ChatQuotaExceededPart, context.element, content, this.chatContentMarkdownRenderer);
      return renderedError;
    } else if (content.errorDetails.isRateLimited && this.chatEntitlementService.anonymous) {
      const renderedError = this.instantiationService.createInstance(ChatAnonymousRateLimitedPart, content);
      return renderedError;
    } else if (content.errorDetails.confirmationButtons && isLast) {
      const level = content.errorDetails.level ?? ChatErrorLevel.Error;
      const errorConfirmation = this.instantiationService.createInstance(ChatErrorConfirmationContentPart, level, new MarkdownString(content.errorDetails.message), content, content.errorDetails.confirmationButtons, this.chatContentMarkdownRenderer, context);
      return errorConfirmation;
    } else {
      const level = content.errorDetails.level ?? ChatErrorLevel.Error;
      return this.instantiationService.createInstance(ChatErrorContentPart, level, new MarkdownString(content.errorDetails.message), content, this.chatContentMarkdownRenderer);
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
    const treePart = this.instantiationService.createInstance(ChatTreeContentPart, data, this._treePool);
    if (isResponseVM(context.element)) {
      const fileTreeFocusInfo = {
        treeDataId: data.uri.toString(),
        treeIndex: context.treeStartIndex,
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
  renderMultiDiffData(content, templateData, context) {
    const multiDiffPart = this.instantiationService.createInstance(ChatMultiDiffContentPart, content, context.element);
    return multiDiffPart;
  }
  renderContentReferencesListData(references, labelOverride, context, templateData) {
    const referencesPart = this.instantiationService.createInstance(ChatUsedReferencesListContentPart, references.references, labelOverride, context, this._contentReferencesListPool, { expandedWhenEmptyResponse: checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.referencesExpandedWhenEmptyResponse) });
    return referencesPart;
  }
  renderCodeCitations(citations, context, templateData) {
    const citationsPart = this.instantiationService.createInstance(ChatCodeCitationContentPart, citations, context);
    return citationsPart;
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
    if (this.configService.getValue("chat.agent.thinking.collapsedTools") === CollapsedToolsDisplayMode.Off) {
      this.finalizeCurrentThinkingPart(context, templateData);
    }
    const codeBlockStartIndex = context.codeBlockStartIndex;
    let lazilyCreatedPart = void 0;
    const createToolPart = /* @__PURE__ */ __name(() => {
      lazilyCreatedPart = this.instantiationService.createInstance(ChatToolInvocationPart, toolInvocation, context, this.chatContentMarkdownRenderer, this._contentReferencesListPool, this._toolEditorPool, () => this._currentLayoutWidth.get(), this._toolInvocationCodeBlockCollection, this._announcedToolProgressKeys, codeBlockStartIndex);
      this.handleRenderedCodeblocks(context.element, lazilyCreatedPart, codeBlockStartIndex);
      return { domNode: lazilyCreatedPart.domNode, part: lazilyCreatedPart };
    }, "createToolPart");
    const collapsedToolsMode = this.configService.getValue("chat.agent.thinking.collapsedTools");
    if (isResponseVM(context.element) && collapsedToolsMode !== CollapsedToolsDisplayMode.Off) {
      const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
      if (!lastThinking && toolInvocation.presentation !== "hidden" && this.shouldPinPart(toolInvocation, context.element) && collapsedToolsMode === CollapsedToolsDisplayMode.Always) {
        const thinkingPart = this.renderThinkingPart({
          kind: "thinking"
        }, context, templateData);
        if (thinkingPart instanceof ChatThinkingContentPart) {
          thinkingPart.appendItem(createToolPart, toolInvocation.toolId, toolInvocation, templateData.value);
          this.setupConfirmationTransitionWatcher(toolInvocation, thinkingPart, () => lazilyCreatedPart, createToolPart, context, templateData);
        }
        return thinkingPart;
      }
      if (this.shouldPinPart(toolInvocation, context.element)) {
        if (lastThinking && toolInvocation.presentation !== "hidden") {
          lastThinking.appendItem(createToolPart, toolInvocation.toolId, toolInvocation, templateData.value);
          this.setupConfirmationTransitionWatcher(toolInvocation, lastThinking, () => lazilyCreatedPart, createToolPart, context, templateData);
          return this.renderNoContent((other, followingContent, element) => lazilyCreatedPart ? lazilyCreatedPart.hasSameContent(other, followingContent, element) : toolInvocation.kind === other.kind);
        }
      } else {
        this.finalizeCurrentThinkingPart(context, templateData);
      }
    }
    const subagentId = getSubagentId(toolInvocation);
    if (subagentId && isResponseVM(context.element) && toolInvocation.presentation !== "hidden") {
      return this.handleSubagentToolGrouping(toolInvocation, subagentId, context, templateData, codeBlockStartIndex);
    }
    const { part } = createToolPart();
    return part;
  }
  // watch for confirmation part transition when tool invocation is streaming
  setupConfirmationTransitionWatcher(toolInvocation, thinkingPart, getCreatedPart, createToolPart, context, templateData) {
    if (toolInvocation.kind !== "toolInvocation") {
      return;
    }
    const removeConfirmationWidget = /* @__PURE__ */ __name(() => {
      const createdPart = getCreatedPart();
      if (createdPart?.domNode) {
        const wrapper = createdPart.domNode.parentElement;
        if (wrapper?.classList.contains("chat-thinking-tool-wrapper")) {
          wrapper.remove();
        }
        templateData.value.appendChild(createdPart.domNode);
      } else {
        thinkingPart.removeLazyItem(toolInvocation.toolId);
        const { domNode } = createToolPart();
        templateData.value.appendChild(domNode);
      }
      this.finalizeCurrentThinkingPart(context, templateData);
    }, "removeConfirmationWidget");
    const currentState = toolInvocation.state.get();
    if (currentState.type === 1 || currentState.type === 3) {
      removeConfirmationWidget();
      return;
    }
    const isWorkingState = /* @__PURE__ */ __name((type) => type === 0 || type === 2, "isWorkingState");
    if (!isWorkingState(currentState.type)) {
      return;
    }
    let didRemoveConfirmationWidget = false;
    const disposable = autorun((reader) => {
      const state = toolInvocation.state.read(reader);
      if (state.type === 1 || state.type === 3) {
        if (didRemoveConfirmationWidget) {
          return;
        }
        didRemoveConfirmationWidget = true;
        disposable.dispose();
        removeConfirmationWidget();
      }
    });
    thinkingPart.addDisposable(disposable);
  }
  renderExtensionsContent(extensionsContent, context, templateData) {
    const part = this.instantiationService.createInstance(ChatExtensionsContentPart, extensionsContent);
    return part;
  }
  renderHookPart(hookPart, context, templateData) {
    if (!(hookPart.stopReason || hookPart.systemMessage)) {
      return this.renderNoContent((other) => other.kind === "hook" && other.hookType === hookPart.hookType);
    }
    if (hookPart.subAgentInvocationId) {
      const subagentPart = this.getSubagentPart(templateData.renderedParts, hookPart.subAgentInvocationId);
      if (subagentPart) {
        subagentPart.appendHookItem(() => {
          const part2 = this.instantiationService.createInstance(ChatHookContentPart, hookPart, context);
          return { domNode: part2.domNode, disposable: part2 };
        }, hookPart);
        return this.renderNoContent((other) => other.kind === "hook" && other.hookType === hookPart.hookType && other.subAgentInvocationId === hookPart.subAgentInvocationId);
      }
    }
    const shouldPinToThinking = hookPart.hookType === HookType.PreToolUse || hookPart.hookType === HookType.PostToolUse;
    if (shouldPinToThinking) {
      const hookTitle = hookPart.stopReason ? hookPart.toolDisplayName ? localize("hook.thinking.blocked", "Blocked {0}", hookPart.toolDisplayName) : localize("hook.thinking.blockedGeneric", "Blocked by hook") : hookPart.toolDisplayName ? localize("hook.thinking.warning", "Used {0}, but received a warning", hookPart.toolDisplayName) : localize("hook.thinking.warningGeneric", "Tool call received a warning");
      let thinkingPart = this.getLastThinkingPart(templateData.renderedParts);
      if (!thinkingPart) {
        const newThinking = this.renderThinkingPart({ kind: "thinking" }, context, templateData);
        if (newThinking instanceof ChatThinkingContentPart) {
          thinkingPart = newThinking;
        }
      }
      if (thinkingPart) {
        thinkingPart.appendItem(() => {
          const part2 = this.instantiationService.createInstance(ChatHookContentPart, hookPart, context);
          return { domNode: part2.domNode, disposable: part2 };
        }, hookTitle, void 0, templateData.value);
        return thinkingPart;
      }
    }
    const part = this.instantiationService.createInstance(ChatHookContentPart, hookPart, context);
    return part;
  }
  renderPullRequestContent(pullRequestContent, context, templateData) {
    const part = this.instantiationService.createInstance(ChatPullRequestContentPart, pullRequestContent);
    return part;
  }
  renderProgressTask(task, templateData, context) {
    if (!isResponseVM(context.element)) {
      return;
    }
    const taskPart = this.instantiationService.createInstance(ChatTaskContentPart, task, this._contentReferencesListPool, this.chatContentMarkdownRenderer, context);
    return taskPart;
  }
  renderConfirmation(context, confirmation, templateData) {
    const part = this.instantiationService.createInstance(ChatConfirmationContentPart, confirmation, context);
    return part;
  }
  renderElicitation(context, elicitation, templateData) {
    if (elicitation.kind === "elicitationSerialized" ? elicitation.isHidden : elicitation.isHidden?.get()) {
      return this.renderNoContent((other) => elicitation.kind === other.kind);
    }
    this.finalizeCurrentThinkingPart(context, templateData);
    const part = this.instantiationService.createInstance(ChatElicitationContentPart, elicitation, context);
    return part;
  }
  renderQuestionCarousel(context, carousel, templateData) {
    this.finalizeCurrentThinkingPart(context, templateData);
    this._notifyOnQuestionCarousel(context, carousel);
    const widget = isResponseVM(context.element) ? this.chatWidgetService.getWidgetBySessionResource(context.element.sessionResource) : void 0;
    const shouldAutoFocus = widget ? widget.getInput() === "" : true;
    const modelName = widget?.input.currentLanguageModel;
    const responseId = isResponseVM(context.element) ? context.element.requestId : void 0;
    const requestMessageText = isResponseVM(context.element) ? this.getRequestMessageText(context.element) : void 0;
    const handleSubmit = /* @__PURE__ */ __name(async (answers, part2) => {
      const answersRecord = answers ? Object.fromEntries(answers) : void 0;
      if (answersRecord) {
        carousel.data = answersRecord;
      }
      carousel.isUsed = true;
      if (carousel instanceof ChatQuestionCarouselData) {
        carousel.completion.complete({ answers: answersRecord });
      }
      if (isResponseVM(context.element) && carousel.resolveId) {
        this.chatService.notifyQuestionCarouselAnswer(context.element.requestId, carousel.resolveId, answersRecord);
      }
      this.removeCarouselFromTracking(context, part2);
      widget?.input.clearQuestionCarousel();
    }, "handleSubmit");
    const responseIsComplete = isResponseVM(context.element) && context.element.isComplete;
    const inputPartHasCarousel = widget?.input.questionCarousel !== void 0;
    if (carousel.isUsed || responseIsComplete) {
      if (responseIsComplete && !carousel.isUsed && isResponseVM(context.element) && carousel.resolveId && carousel.data === void 0) {
        carousel.data = {};
        carousel.isUsed = true;
        if (carousel instanceof ChatQuestionCarouselData) {
          carousel.completion.complete({ answers: void 0 });
        }
        this.chatService.notifyQuestionCarouselAnswer(context.element.requestId, carousel.resolveId, void 0);
        this.pendingQuestionCarousels.get(context.element.sessionResource)?.clear();
      }
      if (responseIsComplete && inputPartHasCarousel && responseId) {
        widget?.input.clearQuestionCarousel(responseId);
      }
      const part2 = this.instantiationService.createInstance(ChatQuestionCarouselPart, carousel, context, {
        shouldAutoFocus: false,
        onSubmit: /* @__PURE__ */ __name(async (answers) => handleSubmit(answers, part2), "onSubmit")
      });
      return part2;
    }
    const isEditing = !!this.viewModel?.editing;
    const part = isEditing ? void 0 : widget?.input.renderQuestionCarousel(carousel, context, {
      shouldAutoFocus,
      onSubmit: /* @__PURE__ */ __name(async (answers) => handleSubmit(answers, part), "onSubmit")
    });
    if (!part) {
      const fallbackPart = this.instantiationService.createInstance(ChatQuestionCarouselPart, carousel, context, {
        shouldAutoFocus,
        onSubmit: /* @__PURE__ */ __name(async (answers) => handleSubmit(answers, fallbackPart), "onSubmit")
      });
      this.maybeAutoReplyToQuestionCarousel(context, carousel, fallbackPart, (answers) => handleSubmit(answers, fallbackPart), modelName, requestMessageText);
      return fallbackPart;
    }
    this.maybeAutoReplyToQuestionCarousel(context, carousel, part, (answers) => handleSubmit(answers, part), modelName, requestMessageText);
    if (isResponseVM(context.element) && carousel.allowSkip && !carousel.isUsed) {
      let carousels = this.pendingQuestionCarousels.get(context.element.sessionResource);
      if (!carousels) {
        carousels = /* @__PURE__ */ new Set();
        this.pendingQuestionCarousels.set(context.element.sessionResource, carousels);
      }
      if (!carousels.has(part)) {
        carousels.add(part);
        part.addDisposable({ dispose: /* @__PURE__ */ __name(() => this.removeCarouselFromTracking(context, part), "dispose") });
      }
    }
    return this.renderNoContent((other, _followingContent, element) => {
      if (carousel.isUsed || isResponseVM(element) && element.isComplete) {
        return false;
      }
      if (other.kind === "questionCarousel") {
        const otherCarousel = other;
        if (carousel.resolveId && otherCarousel.resolveId) {
          return carousel.resolveId === otherCarousel.resolveId;
        }
        return other === carousel;
      }
      return false;
    });
  }
  _getCarouselStableKey(context, carousel) {
    const requestId = isResponseVM(context.element) ? context.element.requestId : void 0;
    if (!requestId || !carousel.resolveId) {
      return void 0;
    }
    return `${requestId}::${carousel.resolveId}`;
  }
  _notifyOnQuestionCarousel(context, carousel) {
    if (carousel.isUsed) {
      return;
    }
    const stableKey = this._getCarouselStableKey(context, carousel);
    if (stableKey ? this._notifiedQuestionCarousels.has(stableKey) : false) {
      return;
    }
    const questionCount = carousel.questions.length;
    const question = carousel.questions.length > 0 && carousel.questions[0].message ? carousel.questions[0].message : localize("chat.questionCarouselNeedsInputSR", "Chat input required.");
    const stringQuestion = typeof question === "string" ? question : question.value;
    const alertMessage = questionCount === 1 ? localize("chat.questionCarouselAlertOne", "Chat input required (1 question): {0}", stringQuestion) : localize("chat.questionCarouselAlertMany", "Chat input required ({0} questions): {1}", questionCount, stringQuestion);
    this.accessibilityService.alert(alertMessage);
    if (stableKey) {
      this._notifiedQuestionCarousels.add(stableKey);
    }
    const signalMessage = questionCount === 1 ? localize("chat.questionCarouselSignalOne", "Chat needs your input (1 question).") : localize("chat.questionCarouselSignalMany", "Chat needs your input ({0} questions).", questionCount);
    this.accessibilitySignalService.playSignal(AccessibilitySignal.chatUserActionRequired, { allowManyInParallel: true, customAlertMessage: signalMessage });
  }
  maybeAutoReplyToQuestionCarousel(context, carousel, part, submit, modelName, requestMessageText) {
    if (carousel.isUsed) {
      return;
    }
    const stableKey = this._getCarouselStableKey(context, carousel);
    if (stableKey) {
      if (this._autoRepliedQuestionCarousels.has(stableKey)) {
        return;
      }
      this._autoRepliedQuestionCarousels.add(stableKey);
    }
    void this._autoReply.shouldAutoReply().then((shouldAutoReply) => {
      if (!shouldAutoReply) {
        if (stableKey) {
          this._autoRepliedQuestionCarousels.delete(stableKey);
        }
        return;
      }
      const cts = new CancellationTokenSource();
      part.addDisposable(toDisposable(() => {
        cts.cancel();
        cts.dispose();
      }));
      this._autoReply.autoReply(carousel, submit, modelName, requestMessageText, cts.token).catch((err) => {
        this.logService.debug("#ChatQuestionCarousel: Auto reply failed", toErrorMessage(err));
      });
    });
  }
  getRequestMessageText(response) {
    const requestId = response.requestId;
    const items = response.session.getItems();
    const request = items.find((item) => isRequestVM(item) && item.id === requestId);
    return request?.messageText;
  }
  removeCarouselFromTracking(context, part) {
    if (isResponseVM(context.element)) {
      const carousels = this.pendingQuestionCarousels.get(context.element.sessionResource);
      if (carousels) {
        carousels.delete(part);
      }
    }
  }
  renderChangesSummary(content, context, templateData) {
    const part = this.instantiationService.createInstance(ChatCheckpointFileChangesSummaryContentPart, content, context);
    return part;
  }
  renderAttachments(variables, contentReferences, templateData) {
    return this.instantiationService.createInstance(ChatAttachmentsContentPart, {
      variables,
      contentReferences,
      domNode: void 0
    });
  }
  renderTextEdit(context, chatTextEdit, templateData) {
    const textEditPart = this.instantiationService.createInstance(ChatTextEditContentPart, chatTextEdit, context, this.rendererOptions, this._diffEditorPool, this._currentLayoutWidth.get());
    return textEditPart;
  }
  renderMarkdown(markdown, templateData, context) {
    const element = context.element;
    const isFinalRenderPass = isResponseVM(element) && element.isComplete && !element.renderData;
    const lastPinnedPartIndex = isFinalRenderPass ? context.content.findLastIndex((c) => c.kind === "thinking" || c.kind === "toolInvocation" || c.kind === "toolInvocationSerialized") : -1;
    const isFinalAnswerPart = isFinalRenderPass && context.contentIndex > lastPinnedPartIndex;
    if (!this.hasCodeblockUri(markdown) || isFinalAnswerPart) {
      this.finalizeCurrentThinkingPart(context, templateData);
    }
    const fillInIncompleteTokens = isResponseVM(element) && (!element.isComplete || element.isCanceled || element.errorDetails?.responseIsFiltered || element.errorDetails?.responseIsIncomplete || !!element.renderData);
    const codeBlockStartIndex = context.codeBlockStartIndex;
    const markdownPart = templateData.instantiationService.createInstance(ChatMarkdownContentPart, markdown, context, this._editorPool, fillInIncompleteTokens, codeBlockStartIndex, this.chatContentMarkdownRenderer, void 0, this._currentLayoutWidth.get(), this.codeBlockModelCollection, {});
    markdownPart.addDisposable(markdownPart.onDidChangeHeight(() => this.fireItemHeightChange(templateData)));
    if (isRequestVM(element)) {
      markdownPart.domNode.tabIndex = 0;
      if (this.configService.getValue("chat.editRequests") === "inline" && this.rendererOptions.editable) {
        markdownPart.domNode.classList.add("clickable");
        markdownPart.addDisposable(dom.addDisposableListener(markdownPart.domNode, dom.EventType.CLICK, (e) => {
          if (this.viewModel?.editing?.id === element.id) {
            return;
          }
          const clickedElement = e.target;
          if (clickedElement.tagName === "A") {
            return;
          }
          const selection = dom.getWindow(templateData.rowContainer).getSelection();
          if (selection && !selection.isCollapsed && selection.toString().length > 0) {
            return;
          }
          const monacoEditor = dom.findParentWithClass(clickedElement, "monaco-editor");
          if (monacoEditor) {
            const editorPart = Array.from(this.editorsInUse()).find((editor) => editor.element.contains(monacoEditor));
            if (editorPart?.editor.getSelection()?.isEmpty() === false) {
              return;
            }
          }
          e.preventDefault();
          e.stopPropagation();
          this._onDidClickRequest.fire(templateData);
        }));
        markdownPart.addDisposable(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), markdownPart.domNode, localize("requestMarkdownPartTitle", "Click to Edit"), { trapFocus: true }));
      }
      markdownPart.addDisposable(dom.addDisposableListener(markdownPart.domNode, dom.EventType.FOCUS, () => {
        this.hoverVisible(templateData.requestHover);
      }));
      markdownPart.addDisposable(dom.addDisposableListener(markdownPart.domNode, dom.EventType.BLUR, () => {
        this.hoverHidden(templateData.requestHover);
      }));
    }
    this.handleRenderedCodeblocks(element, markdownPart, codeBlockStartIndex);
    const collapsedToolsMode = this.configService.getValue("chat.agent.thinking.collapsedTools");
    if (isResponseVM(context.element) && collapsedToolsMode !== CollapsedToolsDisplayMode.Off && !isFinalAnswerPart) {
      const isComplete = this.isCodeblockComplete(markdown, context.element);
      const subAgentInvocationId = extractSubAgentInvocationIdFromText(markdown.content.value);
      if (subAgentInvocationId) {
        const subagentPart = this.getSubagentPart(templateData.renderedParts, subAgentInvocationId);
        if (subagentPart && markdownPart?.domNode && isComplete) {
          subagentPart.appendMarkdownItem(() => ({ domNode: markdownPart.domNode, disposable: markdownPart }), markdownPart.codeblocksPartId, markdown, templateData.value);
          return subagentPart;
        }
      }
      const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
      if (!lastThinking && markdownPart?.domNode && this.shouldPinPart(markdown, context.element) && collapsedToolsMode === CollapsedToolsDisplayMode.Always && isComplete) {
        const thinkingPart = this.renderThinkingPart({
          kind: "thinking"
        }, context, templateData);
        if (thinkingPart instanceof ChatThinkingContentPart) {
          thinkingPart.appendItem(() => ({ domNode: markdownPart.domNode, disposable: markdownPart }), markdownPart.codeblocksPartId, markdown, templateData.value);
        }
        return thinkingPart;
      }
      if (this.shouldPinPart(markdown, context.element) && isComplete) {
        if (lastThinking && markdownPart?.domNode) {
          lastThinking.appendItem(() => ({ domNode: markdownPart.domNode, disposable: markdownPart }), markdownPart.codeblocksPartId, markdown, templateData.value);
        }
      } else if (!this.shouldPinPart(markdown, context.element)) {
        this.finalizeCurrentThinkingPart(context, templateData);
      }
    }
    return markdownPart;
  }
  renderThinkingPart(content, context, templateData) {
    if (!content.id) {
      content.id = Date.now().toString();
    }
    const element = isResponseVM(context.element) ? context.element : void 0;
    const streamingCompleted = this.isThinkingLookAheadComplete(context, element);
    if (Array.isArray(content.value)) {
      if (content.value.length < 1) {
        const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
        lastThinking?.finalizeTitleIfDefault();
        return this.renderNoContent((other) => content.kind === other.kind);
      }
      let lastPart;
      for (const item of content.value) {
        if (item) {
          const lastThinkingPart = lastPart instanceof ChatThinkingContentPart && lastPart.getIsActive() ? lastPart : void 0;
          if (lastThinkingPart) {
            lastThinkingPart.setupThinkingContainer({ ...content, value: item });
          } else {
            const itemContent = { ...content, value: item };
            const itemPart = templateData.instantiationService.createInstance(ChatThinkingContentPart, itemContent, context, this.chatContentMarkdownRenderer, streamingCompleted);
            lastPart = itemPart;
          }
        }
      }
      return lastPart ?? this.renderNoContent((other) => content.kind === other.kind);
    } else {
      const lastActiveThinking = this.getLastThinkingPart(templateData.renderedParts);
      if (lastActiveThinking) {
        lastActiveThinking.setupThinkingContainer(content);
        return lastActiveThinking;
      } else {
        const part = templateData.instantiationService.createInstance(ChatThinkingContentPart, content, context, this.chatContentMarkdownRenderer, streamingCompleted);
        return part;
      }
    }
  }
  disposeElement(node, index, templateData, details) {
    this.traceLayout("disposeElement", `Disposing element, index=${index}`);
    templateData.elementDisposables.clear();
    if (templateData.currentElement && !this.viewModel?.editing) {
      this.templateDataByRequestId.delete(templateData.currentElement.id);
    }
    if (isRequestVM(node.element) && node.element.id === this.viewModel?.editing?.id && details?.onScroll) {
      this._onDidDispose.fire(templateData);
    }
    if (templateData.titleToolbar) {
      templateData.titleToolbar.context = void 0;
    }
    templateData.footerToolbar.context = void 0;
    templateData.checkpointToolbar.context = void 0;
    templateData.checkpointRestoreToolbar.context = void 0;
  }
  renderMcpServersInteractionRequired(content, context, templateData) {
    return this.instantiationService.createInstance(ChatMcpServersInteractionContentPart, content, context);
  }
  renderDisabledClaudeHooks(content, context) {
    return this.instantiationService.createInstance(ChatDisabledClaudeHooksContentPart, context);
  }
  disposeTemplate(templateData) {
    this.clearRenderedParts(templateData);
    templateData.templateDisposables.dispose();
  }
  hoverVisible(requestHover) {
    requestHover.style.opacity = "1";
  }
  hoverHidden(requestHover) {
    requestHover.style.opacity = "0";
  }
};
ChatListItemRenderer = ChatListItemRenderer_1 = __decorate([
  __param(6, IInstantiationService),
  __param(7, IConfigurationService),
  __param(8, ILogService),
  __param(9, IContextKeyService),
  __param(10, IThemeService),
  __param(11, ICommandService),
  __param(12, IHoverService),
  __param(13, IChatWidgetService),
  __param(14, IChatEntitlementService),
  __param(15, IChatService),
  __param(16, IAccessibilitySignalService),
  __param(17, IAccessibilityService),
  __param(18, IWorkbenchEnvironmentService)
], ChatListItemRenderer);
class ChatListDelegate extends CachedListVirtualDelegate {
  static {
    __name(this, "ChatListDelegate");
  }
  constructor(defaultElementHeight) {
    super();
    this.defaultElementHeight = defaultElementHeight;
  }
  estimateHeight(element) {
    return element.currentRenderedHeight ?? this.defaultElementHeight;
  }
  getTemplateId(element) {
    return ChatListItemRenderer.ID;
  }
  hasDynamicHeight(element) {
    return true;
  }
}
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
function isParentSubagentTool(invocation) {
  return invocation.toolSpecificData?.kind === "subagent" && !invocation.subAgentInvocationId;
}
__name(isParentSubagentTool, "isParentSubagentTool");
function getSubagentId(invocation) {
  if (isParentSubagentTool(invocation)) {
    return invocation.toolCallId;
  }
  return invocation.subAgentInvocationId;
}
__name(getSubagentId, "getSubagentId");
function isSubagentToolInvocation(invocation) {
  return !!getSubagentId(invocation);
}
__name(isSubagentToolInvocation, "isSubagentToolInvocation");
export {
  ChatListDelegate,
  ChatListItemRenderer,
  ChatVoteDownButton
};
//# sourceMappingURL=chatListRenderer.js.map
