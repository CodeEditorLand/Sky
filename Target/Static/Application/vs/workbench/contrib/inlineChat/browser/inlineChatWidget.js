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
import { $, getActiveElement, getTotalHeight, getWindow, h, reset, trackFocus } from "../../../../base/browser/dom.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../base/common/observable.js";
import { isEqual } from "../../../../base/common/resources.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../nls.js";
import { IAccessibleViewService } from "../../../../platform/accessibility/browser/accessibleView.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { MenuWorkbenchButtonBar } from "../../../../platform/actions/browser/buttonbar.js";
import { createActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { IMarkdownRendererService } from "../../../../platform/markdown/browser/markdownRenderer.js";
import product from "../../../../platform/product/common/product.js";
import { asCssVariable, asCssVariableName, editorBackground, inputBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "../../../common/theme.js";
import { IChatEntitlementService } from "../../../services/chat/common/chatEntitlementService.js";
import { MarkUnhelpfulActionId } from "../../chat/browser/actions/chatTitleActions.js";
import { ChatVoteDownButton } from "../../chat/browser/widget/chatListRenderer.js";
import { ChatWidget } from "../../chat/browser/widget/chatWidget.js";
import { chatRequestBackground } from "../../chat/common/widget/chatColors.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { ChatMode } from "../../chat/common/chatModes.js";
import { ChatAgentVoteDirection, IChatService } from "../../chat/common/chatService/chatService.js";
import { isResponseVM } from "../../chat/common/model/chatViewModel.js";
import { CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_RESPONSE_FOCUSED, inlineChatBackground, inlineChatForeground } from "../common/inlineChat.js";
import "./media/inlineChat.css";
let InlineChatWidget = class InlineChatWidget2 {
  static {
    __name(this, "InlineChatWidget");
  }
  constructor(location, _options, _instantiationService, _contextKeyService, _keybindingService, _accessibilityService, _configurationService, _accessibleViewService, _textModelResolverService, _chatService, _hoverService, _chatEntitlementService, _markdownRendererService) {
    this._options = _options;
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._keybindingService = _keybindingService;
    this._accessibilityService = _accessibilityService;
    this._configurationService = _configurationService;
    this._accessibleViewService = _accessibleViewService;
    this._textModelResolverService = _textModelResolverService;
    this._chatService = _chatService;
    this._hoverService = _hoverService;
    this._chatEntitlementService = _chatEntitlementService;
    this._markdownRendererService = _markdownRendererService;
    this._elements = h("div.inline-chat@root", [
      h("div.chat-widget@chatWidget"),
      h("div.accessibleViewer@accessibleViewer"),
      h("div.status@status", [
        h("div.label.info.hidden@infoLabel"),
        h("div.actions.hidden@toolbar1"),
        h("div.label.status.hidden@statusLabel"),
        h("div.actions.secondary.hidden@toolbar2"),
        h("div.label.disclaimer.hidden@disclaimerLabel")
      ])
    ]);
    this._store = new DisposableStore();
    this._onDidChangeHeight = this._store.add(new Emitter());
    this.onDidChangeHeight = Event.filter(this._onDidChangeHeight.event, (_) => !this._isLayouting);
    this._requestInProgress = observableValue(this, false);
    this.requestInProgress = this._requestInProgress;
    this._isLayouting = false;
    this.scopedContextKeyService = this._store.add(_contextKeyService.createScoped(this._elements.chatWidget));
    const scopedInstaService = _instantiationService.createChild(new ServiceCollection([
      IContextKeyService,
      this.scopedContextKeyService
    ]), this._store);
    this._chatWidget = scopedInstaService.createInstance(ChatWidget, location, { isInlineChat: true }, {
      autoScroll: true,
      defaultElementHeight: 32,
      renderStyle: "minimal",
      renderInputOnTop: false,
      renderFollowups: true,
      supportsFileReferences: true,
      filter: /* @__PURE__ */ __name((item) => {
        if (!isResponseVM(item) || item.errorDetails) {
          return true;
        }
        const emptyResponse = item.response.value.length === 0;
        if (emptyResponse) {
          return false;
        }
        if (item.response.value.every((item2) => item2.kind === "textEditGroup" && _options.chatWidgetViewOptions?.rendererOptions?.renderTextEditsAsSummary?.(item2.uri))) {
          return false;
        }
        return true;
      }, "filter"),
      dndContainer: this._elements.root,
      defaultMode: ChatMode.Ask,
      ..._options.chatWidgetViewOptions
    }, {
      listForeground: inlineChatForeground,
      listBackground: inlineChatBackground,
      overlayBackground: EDITOR_DRAG_AND_DROP_BACKGROUND,
      inputEditorBackground: inputBackground,
      resultEditorBackground: editorBackground
    });
    this._elements.root.classList.toggle("in-zone-widget", !!_options.inZoneWidget);
    this._chatWidget.render(this._elements.chatWidget);
    this._elements.chatWidget.style.setProperty(asCssVariableName(chatRequestBackground), asCssVariable(inlineChatBackground));
    this._chatWidget.setVisible(true);
    this._store.add(this._chatWidget);
    const ctxResponse = ChatContextKeys.isResponse.bindTo(this.scopedContextKeyService);
    const ctxResponseVote = ChatContextKeys.responseVote.bindTo(this.scopedContextKeyService);
    const ctxResponseSupportIssues = ChatContextKeys.responseSupportsIssueReporting.bindTo(this.scopedContextKeyService);
    const ctxResponseError = ChatContextKeys.responseHasError.bindTo(this.scopedContextKeyService);
    const ctxResponseErrorFiltered = ChatContextKeys.responseIsFiltered.bindTo(this.scopedContextKeyService);
    const viewModelStore = this._store.add(new DisposableStore());
    this._store.add(this._chatWidget.onDidChangeViewModel(() => {
      viewModelStore.clear();
      const viewModel = this._chatWidget.viewModel;
      if (!viewModel) {
        return;
      }
      viewModelStore.add(toDisposable(() => {
        toolbar2.context = void 0;
        ctxResponse.reset();
        ctxResponseVote.reset();
        ctxResponseError.reset();
        ctxResponseErrorFiltered.reset();
        ctxResponseSupportIssues.reset();
      }));
      viewModelStore.add(viewModel.onDidChange(() => {
        this._requestInProgress.set(viewModel.model.requestInProgress.get(), void 0);
        const last = viewModel.getItems().at(-1);
        toolbar2.context = last;
        ctxResponse.set(isResponseVM(last));
        ctxResponseVote.set(isResponseVM(last) ? last.vote === ChatAgentVoteDirection.Down ? "down" : last.vote === ChatAgentVoteDirection.Up ? "up" : "" : "");
        ctxResponseError.set(isResponseVM(last) && last.errorDetails !== void 0);
        ctxResponseErrorFiltered.set(!!(isResponseVM(last) && last.errorDetails?.responseIsFiltered));
        ctxResponseSupportIssues.set(isResponseVM(last) && (last.agent?.metadata.supportIssueReporting ?? false));
        this._onDidChangeHeight.fire();
      }));
      this._onDidChangeHeight.fire();
    }));
    this._store.add(this.chatWidget.onDidChangeContentHeight(() => {
      this._onDidChangeHeight.fire();
    }));
    this._ctxResponseFocused = CTX_INLINE_CHAT_RESPONSE_FOCUSED.bindTo(this._contextKeyService);
    const tracker = this._store.add(trackFocus(this.domNode));
    this._store.add(tracker.onDidBlur(() => this._ctxResponseFocused.set(false)));
    this._store.add(tracker.onDidFocus(() => this._ctxResponseFocused.set(true)));
    this._ctxInputEditorFocused = CTX_INLINE_CHAT_FOCUSED.bindTo(_contextKeyService);
    this._store.add(this._chatWidget.inputEditor.onDidFocusEditorWidget(() => this._ctxInputEditorFocused.set(true)));
    this._store.add(this._chatWidget.inputEditor.onDidBlurEditorWidget(() => this._ctxInputEditorFocused.set(false)));
    const statusMenuId = _options.statusMenuId instanceof MenuId ? _options.statusMenuId : _options.statusMenuId.menu;
    const statusMenuOptions = _options.statusMenuId instanceof MenuId ? void 0 : _options.statusMenuId.options;
    const statusButtonBar = scopedInstaService.createInstance(MenuWorkbenchButtonBar, this._elements.toolbar1, statusMenuId, {
      toolbarOptions: { primaryGroup: "0_main" },
      telemetrySource: _options.chatWidgetViewOptions?.menus?.telemetrySource,
      menuOptions: { renderShortTitle: true },
      ...statusMenuOptions
    });
    this._store.add(statusButtonBar.onDidChange(() => this._onDidChangeHeight.fire()));
    this._store.add(statusButtonBar);
    const toolbar2 = scopedInstaService.createInstance(MenuWorkbenchToolBar, this._elements.toolbar2, _options.secondaryMenuId ?? MenuId.for(""), {
      telemetrySource: _options.chatWidgetViewOptions?.menus?.telemetrySource,
      menuOptions: { renderShortTitle: true, shouldForwardArgs: true },
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof MenuItemAction && action.item.id === MarkUnhelpfulActionId) {
          return scopedInstaService.createInstance(ChatVoteDownButton, action, options);
        }
        return createActionViewItem(scopedInstaService, action, options);
      }, "actionViewItemProvider")
    });
    this._store.add(toolbar2.onDidChangeMenuItems(() => this._onDidChangeHeight.fire()));
    this._store.add(toolbar2);
    this._store.add(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(
        "accessibility.verbosity.inlineChat"
        /* AccessibilityVerbositySettingId.InlineChat */
      )) {
        this._updateAriaLabel();
      }
    }));
    this._elements.root.tabIndex = 0;
    this._elements.statusLabel.tabIndex = 0;
    this._updateAriaLabel();
    this._setupDisclaimer();
    this._store.add(this._hoverService.setupManagedHover(getDefaultHoverDelegate("element"), this._elements.statusLabel, () => {
      return this._elements.statusLabel.dataset["title"];
    }));
    this._store.add(this._chatService.onDidPerformUserAction((e) => {
      if (isEqual(e.sessionResource, this._chatWidget.viewModel?.model.sessionResource) && e.action.kind === "vote") {
        this.updateStatus(localize("feedbackThanks", "Thank you for your feedback!"), { resetAfter: 1250 });
      }
    }));
  }
  _updateAriaLabel() {
    this._elements.root.ariaLabel = this._accessibleViewService.getOpenAriaHint(
      "accessibility.verbosity.inlineChat"
      /* AccessibilityVerbositySettingId.InlineChat */
    );
    if (this._accessibilityService.isScreenReaderOptimized()) {
      let label = defaultAriaLabel;
      if (this._configurationService.getValue(
        "accessibility.verbosity.inlineChat"
        /* AccessibilityVerbositySettingId.InlineChat */
      )) {
        const kbLabel = this._keybindingService.lookupKeybinding(
          "editor.action.accessibilityHelp"
          /* AccessibilityCommandId.OpenAccessibilityHelp */
        )?.getLabel();
        label = kbLabel ? localize("inlineChat.accessibilityHelp", "Inline Chat Input, Use {0} for Inline Chat Accessibility Help.", kbLabel) : localize("inlineChat.accessibilityHelpNoKb", "Inline Chat Input, Run the Inline Chat Accessibility Help command for more information.");
      }
      this._chatWidget.inputEditor.updateOptions({ ariaLabel: label });
    }
  }
  _setupDisclaimer() {
    const disposables = this._store.add(new DisposableStore());
    this._store.add(autorun((reader) => {
      disposables.clear();
      reset(this._elements.disclaimerLabel);
      const sentiment = this._chatEntitlementService.sentimentObs.read(reader);
      const anonymous = this._chatEntitlementService.anonymousObs.read(reader);
      const requestInProgress = this._chatService.requestInProgressObs.read(reader);
      const showDisclaimer = !sentiment.installed && anonymous && !requestInProgress;
      this._elements.disclaimerLabel.classList.toggle("hidden", !showDisclaimer);
      if (showDisclaimer) {
        const renderedMarkdown = disposables.add(this._markdownRendererService.render(new MarkdownString(localize({ key: "termsDisclaimer", comment: ['{Locked="]({2})"}', '{Locked="]({3})"}'] }, "By continuing with {0} Copilot, you agree to {1}'s [Terms]({2}) and [Privacy Statement]({3})", product.defaultChatAgent?.provider?.default?.name ?? "", product.defaultChatAgent?.provider?.default?.name ?? "", product.defaultChatAgent?.termsStatementUrl ?? "", product.defaultChatAgent?.privacyStatementUrl ?? ""), { isTrusted: true })));
        this._elements.disclaimerLabel.appendChild(renderedMarkdown.element);
      }
      this._onDidChangeHeight.fire();
    }));
  }
  dispose() {
    this._store.dispose();
  }
  get domNode() {
    return this._elements.root;
  }
  get chatWidget() {
    return this._chatWidget;
  }
  saveState() {
    this._chatWidget.saveState();
  }
  layout(widgetDim) {
    const contentHeight = this.contentHeight;
    this._isLayouting = true;
    try {
      this._doLayout(widgetDim);
    } finally {
      this._isLayouting = false;
      if (this.contentHeight !== contentHeight) {
        this._onDidChangeHeight.fire();
      }
    }
  }
  _doLayout(dimension) {
    const extraHeight = this._getExtraHeight();
    const statusHeight = getTotalHeight(this._elements.status);
    this._elements.root.style.height = `${dimension.height - extraHeight}px`;
    this._elements.root.style.width = `${dimension.width}px`;
    this._chatWidget.layout(dimension.height - statusHeight - extraHeight, dimension.width);
  }
  /**
   * The content height of this widget is the size that would require no scrolling
   */
  get contentHeight() {
    const data = {
      chatWidgetContentHeight: this._chatWidget.contentHeight,
      statusHeight: getTotalHeight(this._elements.status),
      extraHeight: this._getExtraHeight()
    };
    const result = data.chatWidgetContentHeight + data.statusHeight + data.extraHeight;
    return result;
  }
  get minHeight() {
    let maxWidgetOutputHeight = 100;
    for (const item of this._chatWidget.viewModel?.getItems() ?? []) {
      if (isResponseVM(item) && item.response.value.some((r) => r.kind === "textEditGroup" && !r.state?.applied)) {
        maxWidgetOutputHeight = 270;
        break;
      }
    }
    let value = this.contentHeight;
    value -= this._chatWidget.contentHeight;
    value += Math.min(this._chatWidget.input.inputPartHeight.get() + maxWidgetOutputHeight, this._chatWidget.contentHeight);
    return value;
  }
  _getExtraHeight() {
    return this._options.inZoneWidget ? 1 : 2 + 4;
  }
  get value() {
    return this._chatWidget.getInput();
  }
  set value(value) {
    this._chatWidget.setInput(value);
  }
  selectAll() {
    this._chatWidget.inputEditor.setSelection(new Selection(1, 1, Number.MAX_SAFE_INTEGER, 1));
  }
  set placeholder(value) {
    this._chatWidget.setInputPlaceholder(value);
  }
  toggleStatus(show) {
    this._elements.toolbar1.classList.toggle("hidden", !show);
    this._elements.toolbar2.classList.toggle("hidden", !show);
    this._elements.status.classList.toggle("hidden", !show);
    this._elements.infoLabel.classList.toggle("hidden", !show);
    this._onDidChangeHeight.fire();
  }
  updateToolbar(show) {
    this._elements.root.classList.toggle("toolbar", show);
    this._elements.toolbar1.classList.toggle("hidden", !show);
    this._elements.toolbar2.classList.toggle("hidden", !show);
    this._elements.status.classList.toggle("actions", show);
    this._elements.infoLabel.classList.toggle("hidden", show);
    this._onDidChangeHeight.fire();
  }
  async getCodeBlockInfo(codeBlockIndex) {
    const { viewModel } = this._chatWidget;
    if (!viewModel) {
      return void 0;
    }
    const items = viewModel.getItems().filter((i) => isResponseVM(i));
    const item = items.at(-1);
    if (!item) {
      return;
    }
    return viewModel.codeBlockModelCollection.get(viewModel.sessionResource, item, codeBlockIndex)?.model;
  }
  get responseContent() {
    const requests = this._chatWidget.viewModel?.model.getRequests();
    return requests?.at(-1)?.response?.response.toString();
  }
  getChatModel() {
    return this._chatWidget.viewModel?.model;
  }
  setChatModel(chatModel) {
    chatModel.inputModel.setState({ inputText: "", selections: [] });
    this._chatWidget.setModel(chatModel);
  }
  updateInfo(message) {
    this._elements.infoLabel.classList.toggle("hidden", !message);
    const renderedMessage = renderLabelWithIcons(message);
    reset(this._elements.infoLabel, ...renderedMessage);
    this._onDidChangeHeight.fire();
  }
  updateStatus(message, ops = {}) {
    const isTempMessage = typeof ops.resetAfter === "number";
    if (isTempMessage && !this._elements.statusLabel.dataset["state"]) {
      const statusLabel = this._elements.statusLabel.innerText;
      const title = this._elements.statusLabel.dataset["title"];
      const classes = Array.from(this._elements.statusLabel.classList.values());
      setTimeout(() => {
        this.updateStatus(statusLabel, { classes, keepMessage: true, title });
      }, ops.resetAfter);
    }
    const renderedMessage = renderLabelWithIcons(message);
    reset(this._elements.statusLabel, ...renderedMessage);
    this._elements.statusLabel.className = `label status ${(ops.classes ?? []).join(" ")}`;
    this._elements.statusLabel.classList.toggle("hidden", !message);
    if (isTempMessage) {
      this._elements.statusLabel.dataset["state"] = "temp";
    } else {
      delete this._elements.statusLabel.dataset["state"];
    }
    if (ops.title) {
      this._elements.statusLabel.dataset["title"] = ops.title;
    } else {
      delete this._elements.statusLabel.dataset["title"];
    }
    this._onDidChangeHeight.fire();
  }
  reset() {
    this._chatWidget.attachmentModel.clear(true);
    this._chatWidget.saveState();
    reset(this._elements.statusLabel);
    this._elements.statusLabel.classList.toggle("hidden", true);
    this._elements.toolbar1.classList.add("hidden");
    this._elements.toolbar2.classList.add("hidden");
    this.updateInfo("");
    this._elements.accessibleViewer.classList.toggle("hidden", true);
    this._onDidChangeHeight.fire();
  }
  focus() {
    this._chatWidget.focusInput();
  }
  hasFocus() {
    return this.domNode.contains(getActiveElement());
  }
};
InlineChatWidget = __decorate([
  __param(2, IInstantiationService),
  __param(3, IContextKeyService),
  __param(4, IKeybindingService),
  __param(5, IAccessibilityService),
  __param(6, IConfigurationService),
  __param(7, IAccessibleViewService),
  __param(8, ITextModelService),
  __param(9, IChatService),
  __param(10, IHoverService),
  __param(11, IChatEntitlementService),
  __param(12, IMarkdownRendererService)
], InlineChatWidget);
const defaultAriaLabel = localize("aria-label", "Inline Chat Input");
let EditorBasedInlineChatWidget = class EditorBasedInlineChatWidget2 extends InlineChatWidget {
  static {
    __name(this, "EditorBasedInlineChatWidget");
  }
  constructor(location, parentEditor, options, contextKeyService, keybindingService, instantiationService, accessibilityService, configurationService, accessibleViewService, textModelResolverService, chatService, hoverService, layoutService, chatEntitlementService, markdownRendererService) {
    const overflowWidgetsNode = layoutService.getContainer(getWindow(parentEditor.getContainerDomNode())).appendChild($(".inline-chat-overflow.monaco-editor"));
    super(location, {
      ...options,
      chatWidgetViewOptions: {
        ...options.chatWidgetViewOptions,
        editorOverflowWidgetsDomNode: overflowWidgetsNode
      }
    }, instantiationService, contextKeyService, keybindingService, accessibilityService, configurationService, accessibleViewService, textModelResolverService, chatService, hoverService, chatEntitlementService, markdownRendererService);
    this._store.add(toDisposable(() => {
      overflowWidgetsNode.remove();
    }));
  }
  // --- layout
  _doLayout(dimension) {
    const newHeight = dimension.height;
    super._doLayout(dimension.with(void 0, newHeight));
    this._elements.root.style.height = `${dimension.height - this._getExtraHeight()}px`;
  }
  reset() {
    this.chatWidget.setInput();
    super.reset();
  }
};
EditorBasedInlineChatWidget = __decorate([
  __param(3, IContextKeyService),
  __param(4, IKeybindingService),
  __param(5, IInstantiationService),
  __param(6, IAccessibilityService),
  __param(7, IConfigurationService),
  __param(8, IAccessibleViewService),
  __param(9, ITextModelService),
  __param(10, IChatService),
  __param(11, IHoverService),
  __param(12, ILayoutService),
  __param(13, IChatEntitlementService),
  __param(14, IMarkdownRendererService)
], EditorBasedInlineChatWidget);
export {
  EditorBasedInlineChatWidget,
  InlineChatWidget
};
//# sourceMappingURL=inlineChatWidget.js.map
