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
import { renderAsPlaintext } from "../../../../base/browser/markdownRenderer.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { Separator } from "../../../../base/common/actions.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, constObservable, derived, observableFromEvent, observableFromEventOpts, observableValue } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { EditorExtensionsRegistry } from "../../../../editor/browser/editorExtensions.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { localize } from "../../../../nls.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { IMenuService, MenuId } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ChatEditingAcceptRejectActionViewItem } from "../../chat/browser/chatEditing/chatEditingEditorOverlay.js";
import { ACTION_START } from "../common/inlineChat.js";
import { StickyScrollController } from "../../../../editor/contrib/stickyScroll/browser/stickyScrollController.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { getFlatActionBarActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { getSimpleEditorOptions } from "../../codeEditor/browser/simpleEditorOptions.js";
import { PlaceholderTextContribution } from "../../../../editor/contrib/placeholderText/browser/placeholderTextContribution.js";
import { Position } from "../../../../editor/common/core/position.js";
import { CancelChatActionId } from "../../chat/browser/actions/chatExecuteActions.js";
import { assertType } from "../../../../base/common/types.js";
let InlineChatInputWidget = class InlineChatInputWidget2 extends Disposable {
  static {
    __name(this, "InlineChatInputWidget");
  }
  constructor(_editorObs, _keybindingService, _menuService, _contextKeyService, instantiationService, modelService, configurationService) {
    super();
    this._editorObs = _editorObs;
    this._keybindingService = _keybindingService;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this._position = observableValue(this, null);
    this.position = this._position;
    this._showStore = this._store.add(new DisposableStore());
    this._anchorLineNumber = 0;
    this._anchorLeft = 0;
    this._anchorAbove = false;
    this._domNode = dom.$(".inline-chat-gutter-menu");
    this._inputContainer = dom.append(this._domNode, dom.$(".input"));
    this._inputContainer.style.width = "200px";
    this._inputContainer.style.height = "26px";
    this._inputContainer.style.display = "flex";
    this._inputContainer.style.alignItems = "center";
    this._inputContainer.style.justifyContent = "center";
    const options = getSimpleEditorOptions(configurationService);
    options.wordWrap = "on";
    options.lineNumbers = "off";
    options.glyphMargin = false;
    options.lineDecorationsWidth = 0;
    options.lineNumbersMinChars = 0;
    options.folding = false;
    options.minimap = { enabled: false };
    options.scrollbar = { vertical: "auto", horizontal: "hidden", alwaysConsumeMouseWheel: true, verticalSliderSize: 6 };
    options.renderLineHighlight = "none";
    const codeEditorWidgetOptions = {
      isSimpleWidget: true,
      contributions: EditorExtensionsRegistry.getSomeEditorContributions([
        PlaceholderTextContribution.ID
      ])
    };
    this._input = this._store.add(instantiationService.createInstance(CodeEditorWidget, this._inputContainer, options, codeEditorWidgetOptions));
    const model = this._store.add(modelService.createModel("", null, URI.parse(`gutter-input:${Date.now()}`), true));
    this._input.setModel(model);
    const stickyScrollController = StickyScrollController.get(this._editorObs.editor);
    this._stickyScrollHeight = stickyScrollController ? observableFromEvent(stickyScrollController.onDidChangeStickyScrollHeight, () => stickyScrollController.stickyScrollWidgetHeight) : constObservable(0);
    this._store.add(autorun((r) => {
      const selection = this._editorObs.cursorSelection.read(r);
      const hasSelection = selection && !selection.isEmpty();
      const placeholderText = hasSelection ? localize("placeholderWithSelection", "Modify selected code") : localize("placeholderNoSelection", "Generate code");
      this._input.updateOptions({ placeholder: this._keybindingService.appendKeybinding(placeholderText, ACTION_START) });
    }));
    this._store.add(this._input.onDidContentSizeChange((e) => {
      if (e.contentHeightChanged) {
        this._updateInputHeight(e.contentHeight);
      }
    }));
    this._store.add(this._input.onKeyDown((e) => {
      if (e.keyCode === 3 && !e.shiftKey) {
        const value = this._input.getModel().getValue() ?? "";
        if (this._inlineStartAction && value) {
          e.preventDefault();
          e.stopPropagation();
          this._actionBar.actionRunner.run(this._inlineStartAction, { message: value, autoSend: true });
        }
      } else if (e.keyCode === 9) {
        const value = this._input.getModel().getValue() ?? "";
        if (!value) {
          e.preventDefault();
          e.stopPropagation();
          this._hide();
        }
      } else if (e.keyCode === 18) {
        const inputModel = this._input.getModel();
        const position = this._input.getPosition();
        const lastLineNumber = inputModel.getLineCount();
        const lastLineMaxColumn = inputModel.getLineMaxColumn(lastLineNumber);
        if (Position.equals(position, new Position(lastLineNumber, lastLineMaxColumn))) {
          e.preventDefault();
          e.stopPropagation();
          this._actionBar.focus();
        }
      }
    }));
    this._actionBar = this._store.add(new ActionBar(this._domNode, {
      orientation: 1,
      preventLoopNavigation: true
    }));
    this._store.add(dom.addDisposableListener(this._actionBar.domNode, "keydown", (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(
        16
        /* KeyCode.UpArrow */
      ) && this._actionBar.isFocused(this._actionBar.viewItems.findIndex((item) => item.action.id !== Separator.ID))) {
        event.preventDefault();
        event.stopPropagation();
        this._input.focus();
      }
    }, true));
    const focusTracker = this._store.add(dom.trackFocus(this._domNode));
    this._store.add(focusTracker.onDidBlur(() => this._hide()));
    this._store.add(this._actionBar.onDidCancel(() => this._hide()));
    this._store.add(this._actionBar.onWillRun(() => this._hide()));
  }
  /**
   * Show the widget at the specified line.
   * @param lineNumber The line number to anchor the widget to
   * @param left Left offset relative to editor
   * @param anchorAbove Whether to anchor above the position (widget grows upward)
   */
  show(lineNumber, left, anchorAbove) {
    this._showStore.clear();
    this._input.getModel().setValue("");
    this._updateInputHeight(this._input.getContentHeight());
    this._refreshActions();
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
        this._hide();
      } else {
        this._updatePosition();
      }
    }));
    setTimeout(() => this._input.focus(), 0);
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
  _hide() {
    const editorDomNode = this._editorObs.editor.getDomNode();
    if (editorDomNode && dom.isAncestorOfActiveElement(editorDomNode)) {
      this._editorObs.editor.focus();
    }
    this._position.set(null, void 0);
    this._showStore.clear();
  }
  _refreshActions() {
    this._actionBar.clear();
    this._inlineStartAction = void 0;
    const actions = getFlatActionBarActions(this._menuService.getMenuActions(MenuId.ChatEditorInlineGutter, this._contextKeyService, { shouldForwardArgs: true }));
    for (const action of actions) {
      if (action.id === ACTION_START) {
        this._inlineStartAction = action;
        continue;
      }
      const keybinding = this._keybindingService.lookupKeybinding(action.id)?.getLabel();
      this._actionBar.push(action, { icon: false, label: true, keybinding });
    }
  }
  _updateInputHeight(contentHeight) {
    const lineHeight = this._input.getOption(
      75
      /* EditorOption.lineHeight */
    );
    const maxHeight = 3 * lineHeight;
    const clampedHeight = Math.min(contentHeight, maxHeight);
    const containerPadding = 8;
    this._inputContainer.style.height = `${clampedHeight + containerPadding}px`;
    this._input.layout({ width: 200, height: clampedHeight });
  }
};
InlineChatInputWidget = __decorate([
  __param(1, IKeybindingService),
  __param(2, IMenuService),
  __param(3, IContextKeyService),
  __param(4, IInstantiationService),
  __param(5, IModelService),
  __param(6, IConfigurationService)
], InlineChatInputWidget);
let InlineChatSessionOverlayWidget = class InlineChatSessionOverlayWidget2 extends Disposable {
  static {
    __name(this, "InlineChatSessionOverlayWidget");
  }
  constructor(_editorObs, _instaService, _keybindingService) {
    super();
    this._editorObs = _editorObs;
    this._instaService = _instaService;
    this._keybindingService = _keybindingService;
    this._domNode = document.createElement("div");
    this._showStore = this._store.add(new DisposableStore());
    this._position = observableValue(this, null);
    this._minContentWidthInPx = constObservable(0);
    this._domNode.classList.add("inline-chat-session-overlay-widget");
    this._container = document.createElement("div");
    this._domNode.appendChild(this._container);
    this._container.classList.add("inline-chat-session-overlay-container");
    this._statusNode = document.createElement("div");
    this._statusNode.classList.add("status");
    this._icon = dom.append(this._statusNode, dom.$("span"));
    this._message = dom.append(this._statusNode, dom.$("span.message"));
    this._container.appendChild(this._statusNode);
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
      const lastPart = observableFromEventOpts({ equalsFn: /* @__PURE__ */ __name(() => false, "equalsFn") }, response.onDidChange, () => response.response.value).read(r).filter((part) => part.kind === "progressMessage" || part.kind === "toolInvocation").at(-1);
      if (lastPart?.kind === "toolInvocation") {
        return { message: lastPart.invocationMessage, icon: ThemeIcon.modify(Codicon.loading, "spin") };
      } else if (lastPart?.kind === "progressMessage") {
        return { message: lastPart.content, icon: ThemeIcon.modify(Codicon.loading, "spin") };
      } else {
        return { message: localize("working", "Working..."), icon: ThemeIcon.modify(Codicon.loading, "spin") };
      }
    });
    this._showStore.add(autorun((r) => {
      const value = requestMessage.read(r);
      if (value) {
        this._message.innerText = renderAsPlaintext(value.message);
        this._icon.className = "";
        this._icon.classList.add(...ThemeIcon.asClassNameArray(value.icon));
      } else {
        this._message.innerText = "";
        this._icon.className = "";
      }
    }));
    this._container.appendChild(this._toolbarNode);
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
        const primaryActions = [CancelChatActionId, "inlineChat2.keep"];
        const labeledActions = primaryActions.concat(["inlineChat2.undo"]);
        if (!labeledActions.includes(action.id)) {
          return void 0;
        }
        return new ChatEditingAcceptRejectActionViewItem(action, options, entry, void 0, that._keybindingService, primaryActions);
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
      const maxWidth = layoutInfo.contentWidth - 2 * padding;
      this._domNode.style.maxWidth = `${maxWidth}px`;
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
  __param(2, IKeybindingService)
], InlineChatSessionOverlayWidget);
export {
  InlineChatInputWidget,
  InlineChatSessionOverlayWidget
};
//# sourceMappingURL=inlineChatOverlayWidget.js.map
