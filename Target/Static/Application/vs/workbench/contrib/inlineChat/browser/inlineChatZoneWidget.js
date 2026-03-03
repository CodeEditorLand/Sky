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
var InlineChatZoneWidget_1;
import { addDisposableListener, Dimension } from "../../../../base/browser/dom.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { isEqual } from "../../../../base/common/resources.js";
import { assertType } from "../../../../base/common/types.js";
import { StableEditorBottomScrollState } from "../../../../editor/browser/stableEditorScroll.js";
import { ZoneWidget } from "../../../../editor/contrib/zoneWidget/browser/zoneWidget.js";
import { localize } from "../../../../nls.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ChatMode } from "../../chat/common/chatModes.js";
import { ACTION_REGENERATE_RESPONSE, ACTION_REPORT_ISSUE, ACTION_TOGGLE_DIFF, CTX_INLINE_CHAT_OUTER_CURSOR_POSITION, MENU_INLINE_CHAT_SIDE, MENU_INLINE_CHAT_WIDGET_SECONDARY, MENU_INLINE_CHAT_WIDGET_STATUS } from "../common/inlineChat.js";
import { EditorBasedInlineChatWidget } from "./inlineChatWidget.js";
let InlineChatZoneWidget = class InlineChatZoneWidget2 extends ZoneWidget {
  static {
    __name(this, "InlineChatZoneWidget");
  }
  static {
    InlineChatZoneWidget_1 = this;
  }
  static {
    this._options = {
      showFrame: true,
      frameWidth: 1,
      // frameColor: 'var(--vscode-inlineChat-border)',
      isResizeable: true,
      showArrow: false,
      isAccessible: true,
      className: "inline-chat-widget",
      keepEditorSelection: true,
      showInHiddenAreas: true,
      ordinal: 5e4
    };
  }
  constructor(location, options, editors, clearDelegate, _instaService, _logService, contextKeyService) {
    super(editors.editor, InlineChatZoneWidget_1._options);
    this._instaService = _instaService;
    this._logService = _logService;
    this.notebookEditor = editors.notebookEditor;
    this._ctxCursorPosition = CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.bindTo(contextKeyService);
    this._disposables.add(toDisposable(() => {
      this._ctxCursorPosition.reset();
    }));
    this.widget = this._instaService.createInstance(EditorBasedInlineChatWidget, location, this.editor, {
      statusMenuId: {
        menu: MENU_INLINE_CHAT_WIDGET_STATUS,
        options: {
          buttonConfigProvider: /* @__PURE__ */ __name((action, index) => {
            const isSecondary = index > 0;
            if ((/* @__PURE__ */ new Set([ACTION_REGENERATE_RESPONSE, ACTION_TOGGLE_DIFF, ACTION_REPORT_ISSUE])).has(action.id)) {
              return { isSecondary, showIcon: true, showLabel: false };
            } else {
              return { isSecondary };
            }
          }, "buttonConfigProvider")
        }
      },
      secondaryMenuId: MENU_INLINE_CHAT_WIDGET_SECONDARY,
      inZoneWidget: true,
      chatWidgetViewOptions: {
        menus: {
          telemetrySource: "interactiveEditorWidget-toolbar",
          inputSideToolbar: MENU_INLINE_CHAT_SIDE
        },
        clear: clearDelegate,
        ...options,
        rendererOptions: {
          renderTextEditsAsSummary: /* @__PURE__ */ __name((uri) => {
            return isEqual(uri, editors.editor.getModel()?.uri);
          }, "renderTextEditsAsSummary"),
          renderDetectedCommandsWithRequest: true,
          ...options?.rendererOptions
        },
        defaultMode: ChatMode.Ask
      }
    });
    this._disposables.add(this.widget);
    let revealFn;
    this._disposables.add(this.widget.chatWidget.onWillMaybeChangeHeight(() => {
      if (this.position) {
        revealFn = this._createZoneAndScrollRestoreFn(this.position);
      }
    }));
    this._disposables.add(this.widget.onDidChangeHeight(() => {
      if (this.position && !this._usesResizeHeight) {
        revealFn ??= this._createZoneAndScrollRestoreFn(this.position);
        const height = this._computeHeight();
        this._relayout(height.linesValue);
        revealFn?.();
        revealFn = void 0;
      }
    }));
    this.create();
    this._disposables.add(autorun((r) => {
      const isBusy = this.widget.requestInProgress.read(r);
      this.domNode.firstElementChild?.classList.toggle("busy", isBusy);
    }));
    this._disposables.add(addDisposableListener(this.domNode, "click", (e) => {
      if (!this.editor.hasWidgetFocus() && !this.widget.hasFocus()) {
        this.editor.focus();
      }
    }, true));
    const updateCursorIsAboveContextKey = /* @__PURE__ */ __name(() => {
      if (!this.position || !this.editor.hasModel()) {
        this._ctxCursorPosition.reset();
      } else if (this.position.lineNumber === this.editor.getPosition().lineNumber) {
        this._ctxCursorPosition.set("above");
      } else if (this.position.lineNumber + 1 === this.editor.getPosition().lineNumber) {
        this._ctxCursorPosition.set("below");
      } else {
        this._ctxCursorPosition.reset();
      }
    }, "updateCursorIsAboveContextKey");
    this._disposables.add(this.editor.onDidChangeCursorPosition((e) => updateCursorIsAboveContextKey()));
    this._disposables.add(this.editor.onDidFocusEditorText((e) => updateCursorIsAboveContextKey()));
    updateCursorIsAboveContextKey();
  }
  _fillContainer(container) {
    container.style.setProperty("--vscode-inlineChat-background", "var(--vscode-editor-background)");
    container.appendChild(this.widget.domNode);
  }
  _doLayout(heightInPixel) {
    this._updatePadding();
    const info = this.editor.getLayoutInfo();
    const width = info.contentWidth - info.verticalScrollbarWidth;
    this._dimension = new Dimension(width, heightInPixel);
    this.widget.layout(this._dimension);
  }
  _computeHeight() {
    const chatContentHeight = this.widget.contentHeight;
    const editorHeight = this.notebookEditor?.getLayoutInfo().height ?? this.editor.getLayoutInfo().height;
    const contentHeight = this._decoratingElementsHeight() + Math.min(chatContentHeight, Math.max(this.widget.minHeight, editorHeight * 0.42));
    const heightInLines = contentHeight / this.editor.getOption(
      75
      /* EditorOption.lineHeight */
    );
    return { linesValue: heightInLines, pixelsValue: contentHeight };
  }
  _getResizeBounds() {
    const lineHeight = this.editor.getOption(
      75
      /* EditorOption.lineHeight */
    );
    const decoHeight = this._decoratingElementsHeight();
    const minHeightPx = decoHeight + this.widget.minHeight;
    const maxHeightPx = decoHeight + this.widget.contentHeight;
    return {
      minLines: minHeightPx / lineHeight,
      maxLines: maxHeightPx / lineHeight
    };
  }
  _onWidth(_widthInPixel) {
    if (this._dimension) {
      this._doLayout(this._dimension.height);
    }
  }
  show(position) {
    assertType(this.container);
    this._updatePadding();
    const revealZone = this._createZoneAndScrollRestoreFn(position);
    super.show(position, this._computeHeight().linesValue);
    this.widget.chatWidget.setVisible(true);
    this.widget.focus();
    revealZone();
  }
  _updatePadding() {
    assertType(this.container);
    const info = this.editor.getLayoutInfo();
    const marginWithoutIndentation = info.glyphMarginWidth + info.lineNumbersWidth + info.decorationsWidth;
    this.container.style.paddingLeft = `${marginWithoutIndentation}px`;
  }
  reveal(position) {
    const stickyScroll = this.editor.getOption(
      131
      /* EditorOption.stickyScroll */
    );
    const magicValue = stickyScroll.enabled ? stickyScroll.maxLineCount : 0;
    this.editor.revealLines(
      position.lineNumber + magicValue,
      position.lineNumber + magicValue,
      1
      /* ScrollType.Immediate */
    );
    this.updatePositionAndHeight(position);
  }
  updatePositionAndHeight(position) {
    const revealZone = this._createZoneAndScrollRestoreFn(position);
    super.updatePositionAndHeight(position, !this._usesResizeHeight ? this._computeHeight().linesValue : void 0);
    revealZone();
  }
  _createZoneAndScrollRestoreFn(position) {
    const scrollState = StableEditorBottomScrollState.capture(this.editor);
    const lineNumber = position.lineNumber <= 1 ? 1 : 1 + position.lineNumber;
    return () => {
      scrollState.restore(this.editor);
      const scrollTop = this.editor.getScrollTop();
      const lineTop = this.editor.getTopForLineNumber(lineNumber);
      const zoneTop = lineTop - this._computeHeight().pixelsValue;
      const editorHeight = this.editor.getLayoutInfo().height;
      const lineBottom = this.editor.getBottomForLineNumber(lineNumber);
      let newScrollTop = zoneTop;
      let forceScrollTop = false;
      if (lineBottom >= scrollTop + editorHeight) {
        newScrollTop = lineBottom - editorHeight;
        forceScrollTop = true;
      }
      if (newScrollTop < scrollTop || forceScrollTop) {
        this._logService.trace("[IE] REVEAL zone", { zoneTop, lineTop, lineBottom, scrollTop, newScrollTop, forceScrollTop });
        this.editor.setScrollTop(
          newScrollTop,
          1
          /* ScrollType.Immediate */
        );
      }
    };
  }
  revealRange(range, isLastLine) {
  }
  hide() {
    const scrollState = StableEditorBottomScrollState.capture(this.editor);
    this._ctxCursorPosition.reset();
    this.widget.chatWidget.setVisible(false);
    super.hide();
    aria.status(localize("inlineChatClosed", "Closed inline chat widget"));
    scrollState.restore(this.editor);
  }
};
InlineChatZoneWidget = InlineChatZoneWidget_1 = __decorate([
  __param(4, IInstantiationService),
  __param(5, ILogService),
  __param(6, IContextKeyService)
], InlineChatZoneWidget);
export {
  InlineChatZoneWidget
};
//# sourceMappingURL=inlineChatZoneWidget.js.map
