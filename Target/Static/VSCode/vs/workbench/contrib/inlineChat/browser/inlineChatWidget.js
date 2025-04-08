var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { $, Dimension, getActiveElement, getTotalHeight, getWindow, h, reset, trackFocus } from "../../../../base/browser/dom.js";
import { IActionViewItemOptions } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { IAction } from "../../../../base/common/actions.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { constObservable, derived, IObservable, ISettableObservable, observableValue } from "../../../../base/common/observable.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { AccessibleDiffViewer, IAccessibleDiffViewerModel } from "../../../../editor/browser/widget/diffEditor/components/accessibleDiffViewer.js";
import { EditorOption, IComputedEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { LineRange } from "../../../../editor/common/core/lineRange.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { DetailedLineRangeMapping, RangeMapping } from "../../../../editor/common/diff/rangeMapping.js";
import { ICodeEditorViewState, ScrollType } from "../../../../editor/common/editorCommon.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../nls.js";
import { IAccessibleViewService } from "../../../../platform/accessibility/browser/accessibleView.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { IWorkbenchButtonBarOptions, MenuWorkbenchButtonBar } from "../../../../platform/actions/browser/buttonbar.js";
import { createActionViewItem, IMenuEntryActionViewItemOptions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { asCssVariable, asCssVariableName, editorBackground, inputBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "../../../common/theme.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { AccessibilityCommandId } from "../../accessibility/common/accessibilityCommands.js";
import { MarkUnhelpfulActionId } from "../../chat/browser/actions/chatTitleActions.js";
import { IChatWidgetViewOptions } from "../../chat/browser/chat.js";
import { ChatVoteDownButton } from "../../chat/browser/chatListRenderer.js";
import { ChatWidget, IChatViewState, IChatWidgetLocationOptions } from "../../chat/browser/chatWidget.js";
import { chatRequestBackground } from "../../chat/common/chatColors.js";
import { ChatContextKeys } from "../../chat/common/chatContextKeys.js";
import { IChatModel } from "../../chat/common/chatModel.js";
import { ChatAgentVoteDirection, IChatService } from "../../chat/common/chatService.js";
import { isResponseVM } from "../../chat/common/chatViewModel.js";
import { CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_RESPONSE_FOCUSED, inlineChatBackground, inlineChatForeground } from "../common/inlineChat.js";
import { HunkInformation, Session } from "./inlineChatSession.js";
import "./media/inlineChat.css";
let InlineChatWidget = class {
  constructor(location, _options, _instantiationService, _contextKeyService, _keybindingService, _accessibilityService, _configurationService, _accessibleViewService, _textModelResolverService, _chatService, _hoverService) {
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
    this.scopedContextKeyService = this._store.add(_contextKeyService.createScoped(this._elements.chatWidget));
    const scopedInstaService = _instantiationService.createChild(
      new ServiceCollection([
        IContextKeyService,
        this.scopedContextKeyService
      ]),
      this._store
    );
    this._chatWidget = scopedInstaService.createInstance(
      ChatWidget,
      location,
      void 0,
      {
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
        ..._options.chatWidgetViewOptions
      },
      {
        listForeground: inlineChatForeground,
        listBackground: inlineChatBackground,
        overlayBackground: EDITOR_DRAG_AND_DROP_BACKGROUND,
        inputEditorBackground: inputBackground,
        resultEditorBackground: editorBackground
      }
    );
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
        this._requestInProgress.set(viewModel.requestInProgress, void 0);
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
      if (e.affectsConfiguration(AccessibilityVerbositySettingId.InlineChat)) {
        this._updateAriaLabel();
      }
    }));
    this._elements.root.tabIndex = 0;
    this._elements.statusLabel.tabIndex = 0;
    this._updateAriaLabel();
    this._store.add(this._hoverService.setupManagedHover(getDefaultHoverDelegate("element"), this._elements.statusLabel, () => {
      return this._elements.statusLabel.dataset["title"];
    }));
    this._store.add(this._chatService.onDidPerformUserAction((e) => {
      if (e.sessionId === this._chatWidget.viewModel?.model.sessionId && e.action.kind === "vote") {
        this.updateStatus("Thank you for your feedback!", { resetAfter: 1250 });
      }
    }));
  }
  static {
    __name(this, "InlineChatWidget");
  }
  _elements = h(
    "div.inline-chat@root",
    [
      h("div.chat-widget@chatWidget"),
      h("div.accessibleViewer@accessibleViewer"),
      h("div.status@status", [
        h("div.label.info.hidden@infoLabel"),
        h("div.actions.hidden@toolbar1"),
        h("div.label.status.hidden@statusLabel"),
        h("div.actions.secondary.hidden@toolbar2")
      ])
    ]
  );
  _store = new DisposableStore();
  _ctxInputEditorFocused;
  _ctxResponseFocused;
  _chatWidget;
  _onDidChangeHeight = this._store.add(new Emitter());
  onDidChangeHeight = Event.filter(this._onDidChangeHeight.event, (_) => !this._isLayouting);
  _requestInProgress = observableValue(this, false);
  requestInProgress = this._requestInProgress;
  _isLayouting = false;
  scopedContextKeyService;
  _updateAriaLabel() {
    this._elements.root.ariaLabel = this._accessibleViewService.getOpenAriaHint(AccessibilityVerbositySettingId.InlineChat);
    if (this._accessibilityService.isScreenReaderOptimized()) {
      let label = defaultAriaLabel;
      if (this._configurationService.getValue(AccessibilityVerbositySettingId.InlineChat)) {
        const kbLabel = this._keybindingService.lookupKeybinding(AccessibilityCommandId.OpenAccessibilityHelp)?.getLabel();
        label = kbLabel ? localize("inlineChat.accessibilityHelp", "Inline Chat Input, Use {0} for Inline Chat Accessibility Help.", kbLabel) : localize("inlineChat.accessibilityHelpNoKb", "Inline Chat Input, Run the Inline Chat Accessibility Help command for more information.");
      }
      this._chatWidget.inputEditor.updateOptions({ ariaLabel: label });
    }
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
    this._chatWidget.layout(
      dimension.height - statusHeight - extraHeight,
      dimension.width
    );
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
    value += Math.min(this._chatWidget.input.contentHeight + maxWidgetOutputHeight, this._chatWidget.contentHeight);
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
    return viewModel.codeBlockModelCollection.get(viewModel.sessionId, item, codeBlockIndex)?.model;
  }
  get responseContent() {
    const requests = this._chatWidget.viewModel?.model.getRequests();
    return requests?.at(-1)?.response?.response.toString();
  }
  getChatModel() {
    return this._chatWidget.viewModel?.model;
  }
  setChatModel(chatModel, state) {
    this._chatWidget.setModel(chatModel, { ...state, inputValue: void 0 });
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
    this._chatWidget.attachmentModel.clear();
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
InlineChatWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IAccessibilityService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IAccessibleViewService),
  __decorateParam(8, ITextModelService),
  __decorateParam(9, IChatService),
  __decorateParam(10, IHoverService)
], InlineChatWidget);
const defaultAriaLabel = localize("aria-label", "Inline Chat Input");
let EditorBasedInlineChatWidget = class extends InlineChatWidget {
  constructor(location, _parentEditor, options, contextKeyService, keybindingService, instantiationService, accessibilityService, configurationService, accessibleViewService, textModelResolverService, chatService, hoverService, layoutService) {
    const overflowWidgetsNode = layoutService.getContainer(getWindow(_parentEditor.getContainerDomNode())).appendChild($(".inline-chat-overflow.monaco-editor"));
    super(location, {
      ...options,
      chatWidgetViewOptions: {
        ...options.chatWidgetViewOptions,
        editorOverflowWidgetsDomNode: overflowWidgetsNode
      }
    }, instantiationService, contextKeyService, keybindingService, accessibilityService, configurationService, accessibleViewService, textModelResolverService, chatService, hoverService);
    this._parentEditor = _parentEditor;
    this._store.add(toDisposable(() => {
      overflowWidgetsNode.remove();
    }));
  }
  static {
    __name(this, "EditorBasedInlineChatWidget");
  }
  _accessibleViewer = this._store.add(new MutableDisposable());
  // --- layout
  get contentHeight() {
    let result = super.contentHeight;
    if (this._accessibleViewer.value) {
      result += this._accessibleViewer.value.height + 8;
    }
    return result;
  }
  _doLayout(dimension) {
    let newHeight = dimension.height;
    if (this._accessibleViewer.value) {
      this._accessibleViewer.value.width = dimension.width - 12;
      newHeight -= this._accessibleViewer.value.height + 8;
    }
    super._doLayout(dimension.with(void 0, newHeight));
    this._elements.root.style.height = `${dimension.height - this._getExtraHeight()}px`;
  }
  reset() {
    this._accessibleViewer.clear();
    super.reset();
  }
  // --- accessible viewer
  showAccessibleHunk(session, hunkData) {
    this._elements.accessibleViewer.classList.remove("hidden");
    this._accessibleViewer.clear();
    this._accessibleViewer.value = this._instantiationService.createInstance(
      HunkAccessibleDiffViewer,
      this._elements.accessibleViewer,
      session,
      hunkData,
      new AccessibleHunk(this._parentEditor, session, hunkData)
    );
    this._onDidChangeHeight.fire();
  }
};
EditorBasedInlineChatWidget = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IAccessibilityService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IAccessibleViewService),
  __decorateParam(9, ITextModelService),
  __decorateParam(10, IChatService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, ILayoutService)
], EditorBasedInlineChatWidget);
let HunkAccessibleDiffViewer = class extends AccessibleDiffViewer {
  static {
    __name(this, "HunkAccessibleDiffViewer");
  }
  height;
  set width(value) {
    this._width2.set(value, void 0);
  }
  _width2;
  constructor(parentNode, session, hunk, models, instantiationService) {
    const width = observableValue("width", 0);
    const diff = observableValue("diff", HunkAccessibleDiffViewer._asMapping(hunk));
    const diffs = derived((r) => [diff.read(r)]);
    const lines = Math.min(10, 8 + diff.get().changedLineCount);
    const height = models.getModifiedOptions().get(EditorOption.lineHeight) * lines;
    super(parentNode, constObservable(true), () => {
    }, constObservable(false), width, constObservable(height), diffs, models, instantiationService);
    this.height = height;
    this._width2 = width;
    this._store.add(session.textModelN.onDidChangeContent(() => {
      diff.set(HunkAccessibleDiffViewer._asMapping(hunk), void 0);
    }));
  }
  static _asMapping(hunk) {
    const ranges0 = hunk.getRanges0();
    const rangesN = hunk.getRangesN();
    const originalLineRange = LineRange.fromRangeInclusive(ranges0[0]);
    const modifiedLineRange = LineRange.fromRangeInclusive(rangesN[0]);
    const innerChanges = [];
    for (let i = 1; i < ranges0.length; i++) {
      innerChanges.push(new RangeMapping(ranges0[i], rangesN[i]));
    }
    return new DetailedLineRangeMapping(originalLineRange, modifiedLineRange, innerChanges);
  }
};
HunkAccessibleDiffViewer = __decorateClass([
  __decorateParam(4, IInstantiationService)
], HunkAccessibleDiffViewer);
class AccessibleHunk {
  constructor(_editor, _session, _hunk) {
    this._editor = _editor;
    this._session = _session;
    this._hunk = _hunk;
  }
  static {
    __name(this, "AccessibleHunk");
  }
  getOriginalModel() {
    return this._session.textModel0;
  }
  getModifiedModel() {
    return this._session.textModelN;
  }
  getOriginalOptions() {
    return this._editor.getOptions();
  }
  getModifiedOptions() {
    return this._editor.getOptions();
  }
  originalReveal(range) {
  }
  modifiedReveal(range) {
    this._editor.revealRangeInCenterIfOutsideViewport(range || this._hunk.getRangesN()[0], ScrollType.Smooth);
  }
  modifiedSetSelection(range) {
  }
  modifiedFocus() {
    this._editor.focus();
  }
  getModifiedPosition() {
    return this._hunk.getRangesN()[0].getStartPosition();
  }
}
export {
  EditorBasedInlineChatWidget,
  InlineChatWidget
};
//# sourceMappingURL=inlineChatWidget.js.map
