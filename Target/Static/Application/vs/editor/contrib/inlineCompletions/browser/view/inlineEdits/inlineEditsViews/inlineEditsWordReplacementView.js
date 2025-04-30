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
import { getWindow, n } from "../../../../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../../../../base/browser/mouseEvent.js";
import { Emitter } from "../../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { constObservable, derived, observableValue } from "../../../../../../../base/common/observable.js";
import { editorBackground, editorHoverForeground } from "../../../../../../../platform/theme/common/colorRegistry.js";
import { asCssVariable } from "../../../../../../../platform/theme/common/colorUtils.js";
import { Point } from "../../../../../../browser/point.js";
import { Rect } from "../../../../../../browser/rect.js";
import { LineSource, renderLines, RenderOptions } from "../../../../../../browser/widget/diffEditor/components/diffEditorViewZones/renderLines.js";
import { SingleOffsetEdit } from "../../../../../../common/core/offsetEdit.js";
import { OffsetRange } from "../../../../../../common/core/offsetRange.js";
import { ILanguageService } from "../../../../../../common/languages/language.js";
import { LineTokens } from "../../../../../../common/tokens/lineTokens.js";
import { TokenArray } from "../../../../../../common/tokens/tokenArray.js";
import { getModifiedBorderColor, getOriginalBorderColor, modifiedChangedTextOverlayColor, originalChangedTextOverlayColor } from "../theme.js";
import { mapOutFalsy, rectToProps } from "../utils/utils.js";
let InlineEditsWordReplacementView = class InlineEditsWordReplacementView2 extends Disposable {
  static {
    __name(this, "InlineEditsWordReplacementView");
  }
  static {
    this.MAX_LENGTH = 100;
  }
  constructor(_editor, _edit, _tabAction, _languageService) {
    super();
    this._editor = _editor;
    this._edit = _edit;
    this._tabAction = _tabAction;
    this._languageService = _languageService;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this._start = this._editor.observePosition(constObservable(this._edit.range.getStartPosition()), this._store);
    this._end = this._editor.observePosition(constObservable(this._edit.range.getEndPosition()), this._store);
    this._line = document.createElement("div");
    this._hoverableElement = observableValue(this, null);
    this.isHovered = this._hoverableElement.map((e, reader) => e?.didMouseMoveDuringHover.read(reader) ?? false);
    this._renderTextEffect = derived((_reader) => {
      const tm = this._editor.model.get();
      const origLine = tm.getLineContent(this._edit.range.startLineNumber);
      const edit = SingleOffsetEdit.replace(new OffsetRange(this._edit.range.startColumn - 1, this._edit.range.endColumn - 1), this._edit.text);
      const lineToTokenize = edit.apply(origLine);
      const t = tm.tokenization.tokenizeLinesAt(this._edit.range.startLineNumber, [lineToTokenize])?.[0];
      let tokens;
      if (t) {
        tokens = TokenArray.fromLineTokens(t).slice(edit.getRangeAfterApply()).toLineTokens(this._edit.text, this._languageService.languageIdCodec);
      } else {
        tokens = LineTokens.createEmpty(this._edit.text, this._languageService.languageIdCodec);
      }
      const res = renderLines(new LineSource([tokens]), RenderOptions.fromEditor(this._editor.editor).withSetWidth(false).withScrollBeyondLastColumn(0), [], this._line, true);
      this._line.style.width = `${res.minWidthInPx}px`;
    });
    this._layout = derived(this, (reader) => {
      this._renderTextEffect.read(reader);
      const widgetStart = this._start.read(reader);
      const widgetEnd = this._end.read(reader);
      if (!widgetStart || !widgetEnd || widgetStart.x > widgetEnd.x || widgetStart.y > widgetEnd.y) {
        return void 0;
      }
      const lineHeight = this._editor.getOption(
        68
        /* EditorOption.lineHeight */
      ).read(reader);
      const scrollLeft = this._editor.scrollLeft.read(reader);
      const w = this._editor.getOption(
        52
        /* EditorOption.fontInfo */
      ).read(reader).typicalHalfwidthCharacterWidth;
      const modifiedLeftOffset = 3 * w;
      const modifiedTopOffset = 4;
      const modifiedOffset = new Point(modifiedLeftOffset, modifiedTopOffset);
      const originalLine = Rect.fromPoints(widgetStart, widgetEnd).withHeight(lineHeight).translateX(-scrollLeft);
      const modifiedLine = Rect.fromPointSize(originalLine.getLeftBottom().add(modifiedOffset), new Point(this._edit.text.length * w, originalLine.height));
      const lowerBackground = modifiedLine.withLeft(originalLine.left);
      return {
        originalLine,
        modifiedLine,
        lowerBackground,
        lineHeight
      };
    });
    this._root = n.div({
      class: "word-replacement"
    }, [
      derived((reader) => {
        const layout = mapOutFalsy(this._layout).read(reader);
        if (!layout) {
          return [];
        }
        const contentLeft = this._editor.layoutInfoContentLeft.read(reader);
        const borderWidth = 1;
        const originalBorderColor = getOriginalBorderColor(this._tabAction).map((c) => asCssVariable(c)).read(reader);
        const modifiedBorderColor = getModifiedBorderColor(this._tabAction).map((c) => asCssVariable(c)).read(reader);
        return [
          n.div({
            style: {
              position: "absolute",
              top: 0,
              left: contentLeft,
              width: this._editor.contentWidth,
              height: this._editor.editor.getContentHeight(),
              overflow: "hidden",
              pointerEvents: "none"
            }
          }, [
            n.div({
              style: {
                position: "absolute",
                ...rectToProps((reader2) => layout.read(reader2).lowerBackground.withMargin(borderWidth, 2 * borderWidth, borderWidth, 0)),
                background: asCssVariable(editorBackground),
                //boxShadow: `${asCssVariable(scrollbarShadow)} 0 6px 6px -6px`,
                cursor: "pointer",
                pointerEvents: "auto"
              },
              onmousedown: /* @__PURE__ */ __name((e) => {
                e.preventDefault();
              }, "onmousedown"),
              onmouseup: /* @__PURE__ */ __name((e) => this._onDidClick.fire(new StandardMouseEvent(getWindow(e), e)), "onmouseup"),
              obsRef: /* @__PURE__ */ __name((elem) => {
                this._hoverableElement.set(elem, void 0);
              }, "obsRef")
            }),
            n.div({
              style: {
                position: "absolute",
                ...rectToProps((reader2) => layout.read(reader2).modifiedLine.withMargin(1, 2)),
                fontFamily: this._editor.getOption(
                  51
                  /* EditorOption.fontFamily */
                ),
                fontSize: this._editor.getOption(
                  54
                  /* EditorOption.fontSize */
                ),
                fontWeight: this._editor.getOption(
                  55
                  /* EditorOption.fontWeight */
                ),
                pointerEvents: "none",
                boxSizing: "border-box",
                borderRadius: "4px",
                border: `${borderWidth}px solid ${modifiedBorderColor}`,
                background: asCssVariable(modifiedChangedTextOverlayColor),
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                outline: `2px solid ${asCssVariable(editorBackground)}`
              }
            }, [this._line]),
            n.div({
              style: {
                position: "absolute",
                ...rectToProps((reader2) => layout.read(reader2).originalLine.withMargin(1)),
                boxSizing: "border-box",
                borderRadius: "4px",
                border: `${borderWidth}px solid ${originalBorderColor}`,
                background: asCssVariable(originalChangedTextOverlayColor),
                pointerEvents: "none"
              }
            }, []),
            n.svg({
              width: 11,
              height: 14,
              viewBox: "0 0 11 14",
              fill: "none",
              style: {
                position: "absolute",
                left: layout.map((l) => l.modifiedLine.left - 16),
                top: layout.map((l) => l.modifiedLine.top + Math.round((l.lineHeight - 14 - 5) / 2))
              }
            }, [
              n.svgElem("path", {
                d: "M1 0C1 2.98966 1 5.92087 1 8.49952C1 9.60409 1.89543 10.5 3 10.5H10.5",
                stroke: asCssVariable(editorHoverForeground)
              }),
              n.svgElem("path", {
                d: "M6 7.5L9.99999 10.49998L6 13.5",
                stroke: asCssVariable(editorHoverForeground)
              })
            ])
          ])
        ];
      })
    ]).keepUpdated(this._store);
    this._register(this._editor.createOverlayWidget({
      domNode: this._root.element,
      minContentWidthInPx: constObservable(0),
      position: constObservable({ preference: { top: 0, left: 0 } }),
      allowEditorOverflow: false
    }));
  }
};
InlineEditsWordReplacementView = __decorate([
  __param(3, ILanguageService)
], InlineEditsWordReplacementView);
export {
  InlineEditsWordReplacementView
};
//# sourceMappingURL=inlineEditsWordReplacementView.js.map
