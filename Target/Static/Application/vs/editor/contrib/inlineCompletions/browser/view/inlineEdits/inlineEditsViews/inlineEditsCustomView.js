var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getWindow, n } from "../../../../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../../../../base/browser/mouseEvent.js";
import { Emitter } from "../../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { autorun, constObservable, derived, observableValue } from "../../../../../../../base/common/observable.js";
import { editorBackground } from "../../../../../../../platform/theme/common/colorRegistry.js";
import { asCssVariable } from "../../../../../../../platform/theme/common/colorUtils.js";
import { IThemeService } from "../../../../../../../platform/theme/common/themeService.js";
import { observableCodeEditor } from "../../../../../../browser/observableCodeEditor.js";
import { LineSource, renderLines, RenderOptions } from "../../../../../../browser/widget/diffEditor/components/diffEditorViewZones/renderLines.js";
import { Rect } from "../../../../../../common/core/2d/rect.js";
import { LineRange } from "../../../../../../common/core/ranges/lineRange.js";
import { ILanguageService } from "../../../../../../common/languages/language.js";
import { LineTokens, TokenArray } from "../../../../../../common/tokens/lineTokens.js";
import { InlineEditTabAction } from "../inlineEditsViewInterface.js";
import { getEditorBlendedColor, inlineEditIndicatorPrimaryBackground, inlineEditIndicatorSecondaryBackground, inlineEditIndicatorsuccessfulBackground } from "../theme.js";
import { maxContentWidthInRange, rectToProps } from "../utils/utils.js";
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
let InlineEditsCustomView = class InlineEditsCustomView2 extends Disposable {
  static {
    __name(this, "InlineEditsCustomView");
  }
  constructor(_editor, displayLocation, tabAction, themeService, _languageService) {
    super();
    this._editor = _editor;
    this._languageService = _languageService;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this._isHovered = observableValue(this, false);
    this.isHovered = this._isHovered;
    this._viewRef = n.ref();
    this._editorObs = observableCodeEditor(this._editor);
    const styles = tabAction.map((v, reader) => {
      let border;
      switch (v) {
        case InlineEditTabAction.Inactive:
          border = inlineEditIndicatorSecondaryBackground;
          break;
        case InlineEditTabAction.Jump:
          border = inlineEditIndicatorPrimaryBackground;
          break;
        case InlineEditTabAction.Accept:
          border = inlineEditIndicatorsuccessfulBackground;
          break;
      }
      return {
        border: getEditorBlendedColor(border, themeService).read(reader).toString(),
        background: asCssVariable(editorBackground)
      };
    });
    const state = displayLocation.map((dl) => dl ? this.getState(dl) : void 0);
    const view = state.map((s) => s ? this.getRendering(s, styles) : void 0);
    const overlay = n.div({
      class: "inline-edits-custom-view",
      style: {
        position: "absolute",
        overflow: "visible",
        top: "0px",
        left: "0px",
        display: "block"
      }
    }, [view]).keepUpdated(this._store);
    this._register(this._editorObs.createOverlayWidget({
      domNode: overlay.element,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: constObservable(0)
    }));
    this._register(autorun((reader) => {
      const v = view.read(reader);
      if (!v) {
        this._isHovered.set(false, void 0);
        return;
      }
      this._isHovered.set(overlay.isHovered.read(reader), void 0);
    }));
  }
  getState(displayLocation) {
    const contentState = derived((reader) => {
      const startLineNumber = displayLocation.range.startLineNumber;
      const endLineNumber = displayLocation.range.endLineNumber;
      const startColumn = displayLocation.range.startColumn;
      const endColumn = displayLocation.range.endColumn;
      const lineCount = this._editor.getModel()?.getLineCount() ?? 0;
      const lineWidth = maxContentWidthInRange(this._editorObs, new LineRange(startLineNumber, startLineNumber + 1), reader);
      const lineWidthBelow = startLineNumber + 1 <= lineCount ? maxContentWidthInRange(this._editorObs, new LineRange(startLineNumber + 1, startLineNumber + 2), reader) : void 0;
      const lineWidthAbove = startLineNumber - 1 >= 1 ? maxContentWidthInRange(this._editorObs, new LineRange(startLineNumber - 1, startLineNumber), reader) : void 0;
      const startContentLeftOffset = this._editor.getOffsetForColumn(startLineNumber, startColumn);
      const endContentLeftOffset = this._editor.getOffsetForColumn(endLineNumber, endColumn);
      return {
        lineWidth,
        lineWidthBelow,
        lineWidthAbove,
        startContentLeftOffset,
        endContentLeftOffset
      };
    });
    const minEndOfLinePadding = 14;
    const paddingVertically = 0;
    const paddingHorizontally = 4;
    const horizontalOffsetWhenAboveBelow = 4;
    const verticalOffsetWhenAboveBelow = 2;
    const rect = derived((reader) => {
      const w = this._editorObs.getOption(
        55
        /* EditorOption.fontInfo */
      ).read(reader).typicalHalfwidthCharacterWidth;
      const startLineNumber = displayLocation.range.startLineNumber;
      const endLineNumber = displayLocation.range.endLineNumber;
      const { lineWidth, lineWidthBelow, lineWidthAbove, startContentLeftOffset, endContentLeftOffset } = contentState.read(reader);
      const contentLeft = this._editorObs.layoutInfoContentLeft.read(reader);
      const lineHeight = this._editorObs.observeLineHeightForLine(startLineNumber).read(reader);
      const scrollTop = this._editorObs.scrollTop.read(reader);
      const scrollLeft = this._editorObs.scrollLeft.read(reader);
      let position;
      if (startLineNumber === endLineNumber && endContentLeftOffset + 5 * w >= lineWidth) {
        position = "end";
      } else if (lineWidthBelow !== void 0 && lineWidthBelow + minEndOfLinePadding - horizontalOffsetWhenAboveBelow - paddingHorizontally < startContentLeftOffset) {
        position = "below";
      } else if (lineWidthAbove !== void 0 && lineWidthAbove + minEndOfLinePadding - horizontalOffsetWhenAboveBelow - paddingHorizontally < startContentLeftOffset) {
        position = "above";
      } else {
        position = "end";
      }
      let topOfLine;
      let contentStartOffset;
      let deltaX = 0;
      let deltaY = 0;
      switch (position) {
        case "end": {
          topOfLine = this._editorObs.editor.getTopForLineNumber(startLineNumber);
          contentStartOffset = lineWidth;
          deltaX = paddingHorizontally + minEndOfLinePadding;
          break;
        }
        case "below": {
          topOfLine = this._editorObs.editor.getTopForLineNumber(startLineNumber + 1);
          contentStartOffset = startContentLeftOffset;
          deltaX = paddingHorizontally + horizontalOffsetWhenAboveBelow;
          deltaY = paddingVertically + verticalOffsetWhenAboveBelow;
          break;
        }
        case "above": {
          topOfLine = this._editorObs.editor.getTopForLineNumber(startLineNumber - 1);
          contentStartOffset = startContentLeftOffset;
          deltaX = paddingHorizontally + horizontalOffsetWhenAboveBelow;
          deltaY = -paddingVertically + verticalOffsetWhenAboveBelow;
          break;
        }
      }
      const textRect = Rect.fromLeftTopWidthHeight(contentLeft + contentStartOffset - scrollLeft, topOfLine - scrollTop, w * displayLocation.label.length, lineHeight);
      return textRect.withMargin(paddingVertically, paddingHorizontally).translateX(deltaX).translateY(deltaY);
    });
    return {
      rect,
      label: displayLocation.label
    };
  }
  getRendering(state, styles) {
    const line = document.createElement("div");
    const t = this._editor.getModel().tokenization.tokenizeLinesAt(1, [state.label])?.[0];
    let tokens;
    if (t) {
      tokens = TokenArray.fromLineTokens(t).toLineTokens(state.label, this._languageService.languageIdCodec);
    } else {
      tokens = LineTokens.createEmpty(state.label, this._languageService.languageIdCodec);
    }
    const result = renderLines(new LineSource([tokens]), RenderOptions.fromEditor(this._editor).withSetWidth(false).withScrollBeyondLastColumn(0), [], line, true);
    line.style.width = `${result.minWidthInPx}px`;
    const rect = state.rect.map((r) => r.withMargin(0, 4));
    return n.div({
      class: "collapsedView",
      ref: this._viewRef,
      style: {
        position: "absolute",
        ...rectToProps((reader) => rect.read(reader)),
        overflow: "hidden",
        boxSizing: "border-box",
        cursor: "pointer",
        border: styles.map((s) => `1px solid ${s.border}`),
        borderRadius: "4px",
        backgroundColor: styles.map((s) => s.background),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap"
      },
      onclick: /* @__PURE__ */ __name((e) => {
        this._onDidClick.fire(new StandardMouseEvent(getWindow(e), e));
      }, "onclick")
    }, [
      line
    ]);
  }
};
InlineEditsCustomView = __decorate([
  __param(3, IThemeService),
  __param(4, ILanguageService)
], InlineEditsCustomView);
export {
  InlineEditsCustomView
};
//# sourceMappingURL=inlineEditsCustomView.js.map
