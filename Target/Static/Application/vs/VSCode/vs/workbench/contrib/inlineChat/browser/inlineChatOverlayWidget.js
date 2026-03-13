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
import "./media/inlineChatOverlayWidget.css";
import * as dom from "../../../../base/browser/dom.js";
import { DEFAULT_FONT_FAMILY } from "../../../../base/browser/fonts.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { renderAsPlaintext, renderMarkdown } from "../../../../base/browser/markdownRenderer.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, constObservable, derived, observableFromEvent, observableFromEventOpts, observableValue } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { EditorExtensionsRegistry } from "../../../../editor/browser/editorExtensions.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { localize } from "../../../../nls.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { getFlatActionBarActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ChatEditingAcceptRejectActionViewItem } from "../../chat/browser/chatEditing/chatEditingEditorOverlay.js";
import { CTX_INLINE_CHAT_INPUT_HAS_TEXT, CTX_INLINE_CHAT_INPUT_WIDGET_FOCUSED } from "../common/inlineChat.js";
import { StickyScrollController } from "../../../../editor/contrib/stickyScroll/browser/stickyScrollController.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { getSimpleEditorOptions } from "../../codeEditor/browser/simpleEditorOptions.js";
import { PlaceholderTextContribution } from "../../../../editor/contrib/placeholderText/browser/placeholderTextContribution.js";
import { assertType } from "../../../../base/common/types.js";
let InlineChatInputWidget = class InlineChatInputWidget2 extends Disposable {
  static {
    __name(this, "InlineChatInputWidget");
  }
  constructor(_editorObs, _contextKeyService, _menuService, instantiationService, modelService, configurationService) {
    super();
    this._editorObs = _editorObs;
    this._contextKeyService = _contextKeyService;
    this._menuService = _menuService;
    this._position = observableValue(this, null);
    this.position = this._position;
    this._showStore = this._store.add(new DisposableStore());
    this._anchorLineNumber = 0;
    this._anchorLeft = 0;
    this._anchorAbove = false;
    this._domNode = dom.$(".inline-chat-gutter-menu");
    this._container = dom.append(this._domNode, dom.$(".inline-chat-gutter-container"));
    this._inputContainer = dom.append(this._container, dom.$(".input"));
    this._toolbarContainer = dom.append(this._container, dom.$(".toolbar"));
    const actionsContainer = dom.append(this._domNode, dom.$(".inline-chat-gutter-actions"));
    const actionBar = this._store.add(new ActionBar(actionsContainer, {
      orientation: 1,
      preventLoopNavigation: true
    }));
    const actionsMenu = this._store.add(this._menuService.createMenu(MenuId.ChatEditorInlineMenu, this._contextKeyService));
    const updateActions = /* @__PURE__ */ __name(() => {
      const actions = getFlatActionBarActions(actionsMenu.getActions({ shouldForwardArgs: true }));
      actionBar.clear();
      actionBar.push(actions);
      dom.setVisibility(actions.length > 0, actionsContainer);
    }, "updateActions");
    this._store.add(actionsMenu.onDidChange(updateActions));
    updateActions();
    const options = getSimpleEditorOptions(configurationService);
    options.wordWrap = "off";
    options.wrappingStrategy = "advanced";
    options.lineNumbers = "off";
    options.glyphMargin = false;
    options.lineDecorationsWidth = 0;
    options.lineNumbersMinChars = 0;
    options.folding = false;
    options.minimap = { enabled: false };
    options.scrollbar = { vertical: "hidden", horizontal: "hidden", alwaysConsumeMouseWheel: true };
    options.renderLineHighlight = "none";
    options.fontFamily = DEFAULT_FONT_FAMILY;
    options.fontSize = 13;
    options.lineHeight = 20;
    options.cursorWidth = 1;
    options.padding = { top: 2, bottom: 2 };
    const codeEditorWidgetOptions = {
      isSimpleWidget: true,
      contributions: EditorExtensionsRegistry.getSomeEditorContributions([
        PlaceholderTextContribution.ID
      ])
    };
    this._input = this._store.add(instantiationService.createInstance(CodeEditorWidget, this._inputContainer, options, codeEditorWidgetOptions));
    const model = this._store.add(modelService.createModel("", null, URI.parse(`gutter-input:${Date.now()}`), true));
    this._input.setModel(model);
    const toolbar = this._store.add(instantiationService.createInstance(MenuWorkbenchToolBar, this._toolbarContainer, MenuId.InlineChatInput, {
      telemetrySource: "inlineChatInput.toolbar",
      hiddenItemStrategy: -1,
      toolbarOptions: {
        primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup")
      },
      menuOptions: { shouldForwardArgs: true }
    }));
    const stickyScrollController = StickyScrollController.get(this._editorObs.editor);
    this._stickyScrollHeight = stickyScrollController ? observableFromEvent(stickyScrollController.onDidChangeStickyScrollHeight, () => stickyScrollController.stickyScrollWidgetHeight) : constObservable(0);
    const toolbarWidth = observableValue(this, 0);
    const resizeObserver = new dom.DisposableResizeObserver(() => {
      toolbarWidth.set(dom.getTotalWidth(toolbar.getElement()), void 0);
    });
    this._store.add(resizeObserver);
    this._store.add(resizeObserver.observe(toolbar.getElement()));
    const contentWidth = observableFromEvent(this, this._input.onDidChangeModelContent, () => this._input.getContentWidth());
    const contentHeight = observableFromEvent(this, this._input.onDidContentSizeChange, () => this._input.getContentHeight());
    this._layoutData = derived((r) => {
      const editorPad = 6;
      const totalWidth = contentWidth.read(r) + editorPad + toolbarWidth.read(r);
      const minWidth = 220;
      const maxWidth = 600;
      const clampedWidth = this._input.getOption(
        149
        /* EditorOption.wordWrap */
      ) === "on" ? maxWidth : Math.max(minWidth, Math.min(totalWidth, maxWidth));
      const lineHeight = this._input.getOption(
        75
        /* EditorOption.lineHeight */
      );
      const clampedHeight = Math.min(contentHeight.read(r), 3 * lineHeight);
      if (totalWidth > clampedWidth) {
        this._input.updateOptions({ wordWrap: "on" });
      }
      return {
        editorPad,
        toolbarWidth: toolbarWidth.read(r),
        totalWidth: clampedWidth,
        height: clampedHeight
      };
    });
    this._store.add(autorun((r) => {
      const { editorPad, toolbarWidth: toolbarWidth2, totalWidth, height } = this._layoutData.read(r);
      const inputWidth = totalWidth - toolbarWidth2 - editorPad;
      this._container.style.width = `${totalWidth}px`;
      this._inputContainer.style.width = `${inputWidth}px`;
      this._input.layout({ width: inputWidth, height });
    }));
    this._store.add(this._input.onDidFocusEditorText(() => this._container.classList.add("focused")));
    this._store.add(this._input.onDidBlurEditorText(() => this._container.classList.remove("focused")));
    this._store.add(this._input.onDidScrollChange((e) => {
      this._toolbarContainer.classList.toggle("fake-scroll-decoration", e.scrollTop > 0);
    }));
    const inputHasText = CTX_INLINE_CHAT_INPUT_HAS_TEXT.bindTo(this._contextKeyService);
    this._store.add(this._input.onDidChangeModelContent(() => {
      inputHasText.set(this._input.getModel().getValue().trim().length > 0);
    }));
    this._store.add(toDisposable(() => inputHasText.reset()));
    const inputWidgetFocused = CTX_INLINE_CHAT_INPUT_WIDGET_FOCUSED.bindTo(this._contextKeyService);
    this._store.add(this._input.onDidFocusEditorText(() => inputWidgetFocused.set(true)));
    this._store.add(this._input.onDidBlurEditorText(() => inputWidgetFocused.set(false)));
    this._store.add(toDisposable(() => inputWidgetFocused.reset()));
    this._store.add(this._input.onKeyDown((e) => {
      if (e.keyCode === 18 && !actionBar.isEmpty()) {
        const model2 = this._input.getModel();
        const position = this._input.getPosition();
        if (position && position.lineNumber === model2.getLineCount()) {
          e.preventDefault();
          e.stopPropagation();
          actionBar.focus(0);
        }
      }
    }));
    this._store.add(dom.addDisposableListener(actionBar.domNode, "keydown", (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.keyCode === 9) {
        event.preventDefault();
        event.stopPropagation();
        this.hide();
      } else if (event.keyCode === 16) {
        const firstItem = actionBar.viewItems[0];
        if (firstItem?.element && dom.isAncestorOfActiveElement(firstItem.element)) {
          event.preventDefault();
          event.stopPropagation();
          this._input.focus();
        }
      }
    }, true));
    const focusTracker = this._store.add(dom.trackFocus(this._domNode));
    this._store.add(focusTracker.onDidBlur(() => this.hide()));
  }
  get value() {
    return this._input.getModel().getValue().trim();
  }
  /**
   * Show the widget at the specified line.
   * @param lineNumber The line number to anchor the widget to
   * @param left Left offset relative to editor
   * @param anchorAbove Whether to anchor above the position (widget grows upward)
   */
  show(lineNumber, left, anchorAbove, placeholder, value) {
    this._showStore.clear();
    this._input.updateOptions({ wordWrap: "off", placeholder });
    this._input.getModel().setValue(value ?? "");
    this._anchorLineNumber = lineNumber;
    this._anchorLeft = left;
    this._anchorAbove = anchorAbove;
    this._updatePosition();
    this._showStore.add(this._editorObs.createOverlayWidget({
      domNode: this._domNode,
      position: this._position,
      minContentWidthInPx: constObservable(0),
      allowEditorOverflow: true
    }));
    if (anchorAbove) {
      this._updatePosition();
    }
    this._showStore.add(this._editorObs.editor.onDidScrollChange(() => {
      const visibleRanges = this._editorObs.editor.getVisibleRanges();
      const isLineVisible = visibleRanges.some((range) => this._anchorLineNumber >= range.startLineNumber && this._anchorLineNumber <= range.endLineNumber);
      const hasContent = !!this._input.getModel().getValue();
      if (!isLineVisible && !hasContent) {
        this.hide();
      } else {
        this._updatePosition();
      }
    }));
    setTimeout(() => {
      this._input.focus();
      if (value) {
        this._input.setSelection(this._input.getModel().getFullModelRange());
      }
    }, 0);
  }
  _updatePosition() {
    const editor = this._editorObs.editor;
    const lineHeight = editor.getOption(
      75
      /* EditorOption.lineHeight */
    );
    const top = editor.getTopForLineNumber(this._anchorLineNumber) - editor.getScrollTop();
    let adjustedTop = top;
    if (this._anchorAbove) {
      const widgetHeight2 = this._domNode.offsetHeight;
      adjustedTop = top - widgetHeight2;
    } else {
      adjustedTop = top + lineHeight;
    }
    const stickyScrollHeight = this._stickyScrollHeight.get();
    const layoutInfo = editor.getLayoutInfo();
    const widgetHeight = this._domNode.offsetHeight;
    const minTop = stickyScrollHeight;
    const maxTop = layoutInfo.height - widgetHeight;
    const clampedTop = Math.max(minTop, Math.min(adjustedTop, maxTop));
    const isClamped = clampedTop !== adjustedTop;
    this._domNode.classList.toggle("clamped", isClamped);
    this._position.set({
      preference: { top: clampedTop, left: this._anchorLeft },
      stackOrdinal: 1e4
    }, void 0);
  }
  /**
   * Hide the widget (removes from editor but does not dispose).
   */
  hide() {
    const editorDomNode = this._editorObs.editor.getDomNode();
    if (editorDomNode && dom.isAncestorOfActiveElement(editorDomNode)) {
      this._editorObs.editor.focus();
    }
    this._position.set(null, void 0);
    this._input.getModel().setValue("");
    this._showStore.clear();
  }
};
InlineChatInputWidget = __decorate([
  __param(1, IContextKeyService),
  __param(2, IMenuService),
  __param(3, IInstantiationService),
  __param(4, IModelService),
  __param(5, IConfigurationService)
], InlineChatInputWidget);
let InlineChatSessionOverlayWidget = class InlineChatSessionOverlayWidget2 extends Disposable {
  static {
    __name(this, "InlineChatSessionOverlayWidget");
  }
  constructor(_editorObs, _instaService, _keybindingService, _logService) {
    super();
    this._editorObs = _editorObs;
    this._instaService = _instaService;
    this._keybindingService = _keybindingService;
    this._logService = _logService;
    this._domNode = document.createElement("div");
    this._showStore = this._store.add(new DisposableStore());
    this._position = observableValue(this, null);
    this._minContentWidthInPx = constObservable(0);
    this._domNode.classList.add("inline-chat-session-overlay-widget");
    this._container = document.createElement("div");
    this._domNode.appendChild(this._container);
    this._container.classList.add("inline-chat-session-overlay-container");
    this._markdownContainer = document.createElement("div");
    this._markdownContainer.classList.add("markdown-scroll-container");
    this._markdownMessage = document.createElement("div");
    this._markdownMessage.classList.add("markdown-message");
    this._markdownContainer.appendChild(this._markdownMessage);
    this._markdownScrollable = this._store.add(new DomScrollableElement(this._markdownContainer, {
      consumeMouseWheelIfScrollbarIsNeeded: true,
      horizontal: 2,
      vertical: 1
    }));
    this._container.appendChild(this._markdownScrollable.getDomNode());
    this._contentRow = document.createElement("div");
    this._contentRow.classList.add("content-row");
    this._container.appendChild(this._contentRow);
    this._statusNode = document.createElement("div");
    this._statusNode.classList.add("status");
    this._icon = dom.append(this._statusNode, dom.$("span"));
    this._message = dom.append(this._statusNode, dom.$("span.message"));
    this._contentRow.appendChild(this._statusNode);
    this._toolbarNode = document.createElement("div");
    this._toolbarNode.classList.add("toolbar");
    const stickyScrollController = StickyScrollController.get(this._editorObs.editor);
    this._stickyScrollHeight = stickyScrollController ? observableFromEvent(stickyScrollController.onDidChangeStickyScrollHeight, () => stickyScrollController.stickyScrollWidgetHeight) : constObservable(0);
  }
  show(session) {
    assertType(this._editorObs.editor.hasModel());
    this._showStore.clear();
    const entry = derived((r) => session.editingSession.readEntry(session.uri, r));
    const requestMessage = derived((r) => {
      const chatModel = session?.chatModel;
      if (!session || !chatModel) {
        return void 0;
      }
      const terminationState = session.terminationState.read(r);
      if (terminationState) {
        return {
          markdown: terminationState,
          icon: Codicon.info
        };
      }
      const response = chatModel.lastRequestObs.read(r)?.response;
      if (!response) {
        return { message: localize("working", "Working..."), icon: ThemeIcon.modify(Codicon.loading, "spin") };
      }
      if (response.isComplete) {
        const result = response.result;
        if (result?.errorDetails) {
          return {
            message: localize("error", "Sorry, your request failed"),
            icon: Codicon.error
          };
        }
        const changes = entry.read(r)?.changesCount.read(r) ?? 0;
        return {
          message: changes === 0 ? localize("done", "Done") : changes === 1 ? localize("done1", "Done, 1 change") : localize("doneN", "Done, {0} changes", changes),
          icon: Codicon.check
        };
      }
      const pendingConfirmation = response.isPendingConfirmation.read(r);
      if (pendingConfirmation) {
        return {
          message: localize("needsApproval", "Sorry, but an expected error happened"),
          icon: Codicon.error
        };
      }
      const lastPart = observableFromEventOpts({ equalsFn: /* @__PURE__ */ __name(() => false, "equalsFn") }, response.onDidChange, () => response.response.value).read(r).filter((part) => part.kind === "progressMessage" || part.kind === "toolInvocation").at(-1);
      if (lastPart?.kind === "toolInvocation") {
        return { message: lastPart.invocationMessage, icon: ThemeIcon.modify(Codicon.loading, "spin") };
      } else if (lastPart?.kind === "progressMessage") {
        return { message: lastPart.content, icon: ThemeIcon.modify(Codicon.loading, "spin") };
      } else {
        return { message: localize("working", "Working..."), icon: ThemeIcon.modify(Codicon.loading, "spin") };
      }
    });
    const markdownStore = this._showStore.add(new DisposableStore());
    this._showStore.add(autorun((r) => {
      const value = requestMessage.read(r);
      if (value) {
        if (value.message && value.icon) {
          this._message.innerText = renderAsPlaintext(value.message);
          this._icon.className = "";
          this._icon.classList.add(...ThemeIcon.asClassNameArray(value.icon));
          this._statusNode.classList.remove("hidden");
          this._contentRow.classList.remove("status-hidden");
        } else {
          this._message.innerText = "";
          this._icon.className = "";
          this._statusNode.classList.add("hidden");
          this._contentRow.classList.add("status-hidden");
        }
        markdownStore.clear();
        this._markdownMessage.replaceChildren();
        if (value.markdown) {
          this._markdownScrollable.getDomNode().classList.remove("hidden");
          const markdown = typeof value.markdown === "string" ? new MarkdownString(value.markdown) : value.markdown;
          const rendered = markdownStore.add(renderMarkdown(markdown));
          this._markdownMessage.appendChild(rendered.element);
          this._markdownScrollable.scanDomNode();
        } else {
          this._markdownScrollable.getDomNode().classList.add("hidden");
        }
      } else {
        this._message.innerText = "";
        this._icon.className = "";
        this._statusNode.classList.add("hidden");
        this._contentRow.classList.add("status-hidden");
        markdownStore.clear();
        this._markdownMessage.replaceChildren();
        this._markdownScrollable.getDomNode().classList.add("hidden");
      }
    }));
    this._showStore.add(autorun((r) => {
      const response = session.chatModel.lastRequestObs.read(r)?.response;
      const pending = response?.isPendingConfirmation.read(r);
      if (pending) {
        this._logService.info(`[InlineChat] UNEXPECTED approval needed: ${pending.detail ?? "unknown"}`);
      }
    }));
    this._contentRow.appendChild(this._toolbarNode);
    this._showStore.add(toDisposable(() => this._toolbarNode.remove()));
    const that = this;
    this._showStore.add(this._instaService.createInstance(MenuWorkbenchToolBar, this._toolbarNode, MenuId.ChatEditorInlineExecute, {
      telemetrySource: "inlineChatProgress.overlayToolbar",
      hiddenItemStrategy: 0,
      toolbarOptions: {
        primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup"),
        useSeparatorsInPrimaryActions: true
      },
      menuOptions: { renderShortTitle: true },
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        const primaryActions = ["inlineChat2.cancel", "inlineChat2.keep", "inlineChat2.rephrase"];
        const labeledActions = primaryActions.concat(["inlineChat2.undo"]);
        if (!labeledActions.includes(action.id)) {
          return void 0;
        }
        return new ChatEditingAcceptRejectActionViewItem(action, { ...options, keybinding: void 0 }, entry, void 0, that._keybindingService, primaryActions);
      }, "actionViewItemProvider")
    }));
    const lineHeight = this._editorObs.getOption(
      75
      /* EditorOption.lineHeight */
    );
    const widgetWidth = observableValue(this, 0);
    const resizeObserver = new dom.DisposableResizeObserver(() => {
      widgetWidth.set(this._domNode.offsetWidth, void 0);
    });
    this._showStore.add(resizeObserver);
    this._showStore.add(resizeObserver.observe(this._domNode));
    this._showStore.add(autorun((r) => {
      const layoutInfo = this._editorObs.layoutInfo.read(r);
      const stickyScrollHeight = this._stickyScrollHeight.read(r);
      const width = widgetWidth.read(r);
      const padding = Math.round(lineHeight.read(r) * 2 / 3);
      const maxWidth = Math.min(400, layoutInfo.contentWidth - 2 * padding);
      const maxHeight = Math.min(150, Math.floor(layoutInfo.height / 3));
      this._domNode.style.maxWidth = `${maxWidth}px`;
      this._markdownScrollable.getDomNode().style.maxHeight = `${maxHeight}px`;
      this._markdownContainer.style.maxHeight = `${maxHeight}px`;
      this._markdownScrollable.scanDomNode();
      const top = stickyScrollHeight + padding;
      const left = layoutInfo.width - width - layoutInfo.verticalScrollbarWidth - layoutInfo.minimap.minimapWidth - padding;
      this._position.set({
        preference: { top, left },
        stackOrdinal: 1e4
      }, void 0);
    }));
    this._showStore.add(this._editorObs.createOverlayWidget({
      domNode: this._domNode,
      position: this._position,
      minContentWidthInPx: this._minContentWidthInPx,
      allowEditorOverflow: false
    }));
  }
  hide() {
    this._position.set(null, void 0);
    this._showStore.clear();
  }
};
InlineChatSessionOverlayWidget = __decorate([
  __param(1, IInstantiationService),
  __param(2, IKeybindingService),
  __param(3, ILogService)
], InlineChatSessionOverlayWidget);
export {
  InlineChatInputWidget,
  InlineChatSessionOverlayWidget
};
//# sourceMappingURL=inlineChatOverlayWidget.js.map
