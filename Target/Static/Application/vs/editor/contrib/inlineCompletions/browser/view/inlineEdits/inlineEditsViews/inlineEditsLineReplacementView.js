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
import { $, getWindow, n } from "../../../../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../../../../base/browser/mouseEvent.js";
import { Emitter } from "../../../../../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../../../../../base/common/lifecycle.js";
import { autorun, autorunDelta, constObservable, derived } from "../../../../../../../base/common/observable.js";
import { editorBackground, scrollbarShadow } from "../../../../../../../platform/theme/common/colorRegistry.js";
import { asCssVariable } from "../../../../../../../platform/theme/common/colorUtils.js";
import { IThemeService } from "../../../../../../../platform/theme/common/themeService.js";
import { EditorMouseEvent } from "../../../../../../browser/editorDom.js";
import { Point } from "../../../../../../browser/point.js";
import { Rect } from "../../../../../../browser/rect.js";
import { LineSource, renderLines, RenderOptions } from "../../../../../../browser/widget/diffEditor/components/diffEditorViewZones/renderLines.js";
import { OffsetRange } from "../../../../../../common/core/offsetRange.js";
import { Range } from "../../../../../../common/core/range.js";
import { ILanguageService } from "../../../../../../common/languages/language.js";
import { LineTokens } from "../../../../../../common/tokens/lineTokens.js";
import { TokenArray } from "../../../../../../common/tokens/tokenArray.js";
import { InlineDecoration } from "../../../../../../common/viewModel.js";
import { getEditorBlendedColor, getModifiedBorderColor, getOriginalBorderColor, modifiedChangedLineBackgroundColor, originalBackgroundColor } from "../theme.js";
import { getPrefixTrim, mapOutFalsy, rectToProps } from "../utils/utils.js";
let InlineEditsLineReplacementView = class InlineEditsLineReplacementView2 extends Disposable {
  static {
    __name(this, "InlineEditsLineReplacementView");
  }
  constructor(_editor, _edit, _tabAction, _languageService, _themeService) {
    super();
    this._editor = _editor;
    this._edit = _edit;
    this._tabAction = _tabAction;
    this._languageService = _languageService;
    this._themeService = _themeService;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this._originalBubblesDecorationCollection = this._editor.editor.createDecorationsCollection();
    this._originalBubblesDecorationOptions = {
      description: "inlineCompletions-original-bubble",
      className: "inlineCompletions-original-bubble",
      stickiness: 1
      /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
    };
    this._maxPrefixTrim = this._edit.map((e) => e ? getPrefixTrim(e.replacements.flatMap((r) => [r.originalRange, r.modifiedRange]), e.originalRange, e.modifiedLines, this._editor.editor) : void 0);
    this._modifiedLineElements = derived((reader) => {
      const lines = [];
      let requiredWidth = 0;
      const prefixTrim = this._maxPrefixTrim.read(reader);
      const edit = this._edit.read(reader);
      if (!edit || !prefixTrim) {
        return void 0;
      }
      const maxPrefixTrim = prefixTrim.prefixTrim;
      const modifiedBubbles = rangesToBubbleRanges(edit.replacements.map((r) => r.modifiedRange)).map((r) => new Range(r.startLineNumber, r.startColumn - maxPrefixTrim, r.endLineNumber, r.endColumn - maxPrefixTrim));
      const textModel = this._editor.model.get();
      const startLineNumber = edit.modifiedRange.startLineNumber;
      for (let i = 0; i < edit.modifiedRange.length; i++) {
        const line = document.createElement("div");
        const lineNumber = startLineNumber + i;
        const modLine = edit.modifiedLines[i].slice(maxPrefixTrim);
        const t = textModel.tokenization.tokenizeLinesAt(lineNumber, [modLine])?.[0];
        let tokens;
        if (t) {
          tokens = TokenArray.fromLineTokens(t).toLineTokens(modLine, this._languageService.languageIdCodec);
        } else {
          tokens = LineTokens.createEmpty(modLine, this._languageService.languageIdCodec);
        }
        const decorations = [];
        for (const modified of modifiedBubbles.filter((b) => b.startLineNumber === lineNumber)) {
          const validatedEndColumn = Math.min(modified.endColumn, modLine.length + 1);
          decorations.push(new InlineDecoration(
            new Range(1, modified.startColumn, 1, validatedEndColumn),
            "inlineCompletions-modified-bubble",
            0
            /* InlineDecorationType.Regular */
          ));
          decorations.push(new InlineDecoration(
            new Range(1, modified.startColumn, 1, modified.startColumn + 1),
            "start",
            0
            /* InlineDecorationType.Regular */
          ));
          decorations.push(new InlineDecoration(
            new Range(1, validatedEndColumn - 1, 1, validatedEndColumn),
            "end",
            0
            /* InlineDecorationType.Regular */
          ));
        }
        const result = renderLines(new LineSource([tokens]), RenderOptions.fromEditor(this._editor.editor).withSetWidth(false).withScrollBeyondLastColumn(0), decorations, line, true);
        this._editor.getOption(
          52
          /* EditorOption.fontInfo */
        ).read(reader);
        requiredWidth = Math.max(requiredWidth, result.minWidthInPx);
        lines.push(line);
      }
      return { lines, requiredWidth };
    });
    this._layout = derived(this, (reader) => {
      const modifiedLines = this._modifiedLineElements.read(reader);
      const maxPrefixTrim = this._maxPrefixTrim.read(reader);
      const edit = this._edit.read(reader);
      if (!modifiedLines || !maxPrefixTrim || !edit) {
        return void 0;
      }
      const { prefixLeftOffset } = maxPrefixTrim;
      const { requiredWidth } = modifiedLines;
      const lineHeight = this._editor.getOption(
        68
        /* EditorOption.lineHeight */
      ).read(reader);
      const contentLeft = this._editor.layoutInfoContentLeft.read(reader);
      const verticalScrollbarWidth = this._editor.layoutInfoVerticalScrollbarWidth.read(reader);
      const scrollLeft = this._editor.scrollLeft.read(reader);
      const scrollTop = this._editor.scrollTop.read(reader);
      const editorLeftOffset = contentLeft - scrollLeft;
      const textModel = this._editor.editor.getModel();
      const originalLineWidths = edit.originalRange.mapToLineArray((line) => this._editor.editor.getOffsetForColumn(line, textModel.getLineMaxColumn(line)) - prefixLeftOffset);
      const maxLineWidth = Math.max(...originalLineWidths, requiredWidth);
      const startLineNumber = edit.originalRange.startLineNumber;
      const endLineNumber = edit.originalRange.endLineNumberExclusive - 1;
      const topOfOriginalLines = this._editor.editor.getTopForLineNumber(startLineNumber) - scrollTop;
      const bottomOfOriginalLines = this._editor.editor.getBottomForLineNumber(endLineNumber) - scrollTop;
      const originalLinesOverlay = Rect.fromLeftTopWidthHeight(editorLeftOffset + prefixLeftOffset, topOfOriginalLines, maxLineWidth, bottomOfOriginalLines - topOfOriginalLines);
      const modifiedLinesOverlay = Rect.fromLeftTopWidthHeight(originalLinesOverlay.left, originalLinesOverlay.bottom, originalLinesOverlay.width, edit.modifiedRange.length * lineHeight);
      const background = Rect.hull([originalLinesOverlay, modifiedLinesOverlay]);
      const lowerBackground = background.intersectVertical(new OffsetRange(originalLinesOverlay.bottom, Number.MAX_SAFE_INTEGER));
      const lowerText = new Rect(lowerBackground.left, lowerBackground.top, lowerBackground.right, lowerBackground.bottom);
      return {
        originalLinesOverlay,
        modifiedLinesOverlay,
        background,
        lowerBackground,
        lowerText,
        minContentWidthRequired: prefixLeftOffset + maxLineWidth + verticalScrollbarWidth
      };
    });
    this._viewZoneInfo = derived((reader) => {
      const shouldShowViewZone = this._editor.getOption(
        64
        /* EditorOption.inlineSuggest */
      ).map((o) => o.edits.allowCodeShifting === "always").read(reader);
      if (!shouldShowViewZone) {
        return void 0;
      }
      const layout = this._layout.read(reader);
      const edit = this._edit.read(reader);
      if (!layout || !edit) {
        return void 0;
      }
      const viewZoneHeight = layout.lowerBackground.height;
      const viewZoneLineNumber = edit.originalRange.endLineNumberExclusive;
      return { height: viewZoneHeight, lineNumber: viewZoneLineNumber };
    });
    this._div = n.div({
      class: "line-replacement"
    }, [
      derived((reader) => {
        const layout = mapOutFalsy(this._layout).read(reader);
        const modifiedLineElements = this._modifiedLineElements.read(reader);
        if (!layout || !modifiedLineElements) {
          return [];
        }
        const layoutProps = layout.read(reader);
        const contentLeft = this._editor.layoutInfoContentLeft.read(reader);
        const contentWidth = this._editor.contentWidth.read(reader);
        const contentHeight = this._editor.editor.getContentHeight();
        const lineHeight = this._editor.getOption(
          68
          /* EditorOption.lineHeight */
        ).read(reader);
        modifiedLineElements.lines.forEach((l) => {
          l.style.width = `${layoutProps.lowerText.width}px`;
          l.style.height = `${lineHeight}px`;
          l.style.position = "relative";
        });
        const modifiedBorderColor = getModifiedBorderColor(this._tabAction).read(reader);
        const originalBorderColor = getOriginalBorderColor(this._tabAction).read(reader);
        return [
          n.div({
            style: {
              position: "absolute",
              top: 0,
              left: contentLeft,
              width: contentWidth,
              height: contentHeight,
              overflow: "hidden",
              pointerEvents: "none"
            }
          }, [
            n.div({
              class: "originalOverlayLineReplacement",
              style: {
                position: "absolute",
                ...rectToProps((reader2) => layout.read(reader2).background.translateX(-contentLeft)),
                borderRadius: "4px",
                border: getEditorBlendedColor(originalBorderColor, this._themeService).map((c) => `1px solid ${c.toString()}`),
                pointerEvents: "none",
                boxSizing: "border-box",
                background: asCssVariable(originalBackgroundColor)
              }
            }),
            n.div({
              class: "modifiedOverlayLineReplacement",
              style: {
                position: "absolute",
                ...rectToProps((reader2) => layout.read(reader2).lowerBackground.translateX(-contentLeft)),
                borderRadius: "0 0 4px 4px",
                background: asCssVariable(editorBackground),
                boxShadow: `${asCssVariable(scrollbarShadow)} 0 6px 6px -6px`,
                border: `1px solid ${asCssVariable(modifiedBorderColor)}`,
                boxSizing: "border-box",
                overflow: "hidden",
                cursor: "pointer",
                pointerEvents: "auto"
              },
              onmousedown: /* @__PURE__ */ __name((e) => {
                e.preventDefault();
              }, "onmousedown"),
              onclick: /* @__PURE__ */ __name((e) => this._onDidClick.fire(new StandardMouseEvent(getWindow(e), e)), "onclick")
            }, [
              n.div({
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: asCssVariable(modifiedChangedLineBackgroundColor)
                }
              })
            ]),
            n.div({
              class: "modifiedLinesLineReplacement",
              style: {
                position: "absolute",
                boxSizing: "border-box",
                ...rectToProps((reader2) => layout.read(reader2).lowerText.translateX(-contentLeft)),
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
                whiteSpace: "nowrap",
                borderRadius: "0 0 4px 4px",
                overflow: "hidden"
              }
            }, [...modifiedLineElements.lines])
          ])
        ];
      })
    ]).keepUpdated(this._store);
    this.isHovered = this._editor.isTargetHovered((e) => this._isMouseOverWidget(e), this._store);
    this._previousViewZoneInfo = void 0;
    this._register(toDisposable(() => this._originalBubblesDecorationCollection.clear()));
    this._register(toDisposable(() => this._editor.editor.changeViewZones((accessor) => this.removePreviousViewZone(accessor))));
    this._register(autorunDelta(this._viewZoneInfo, ({ lastValue, newValue }) => {
      if (lastValue === newValue || lastValue?.height === newValue?.height && lastValue?.lineNumber === newValue?.lineNumber) {
        return;
      }
      this._editor.editor.changeViewZones((changeAccessor) => {
        this.removePreviousViewZone(changeAccessor);
        if (!newValue) {
          return;
        }
        this.addViewZone(newValue, changeAccessor);
      });
    }));
    this._register(autorun((reader) => {
      const edit = this._edit.read(reader);
      const originalBubbles = [];
      if (edit) {
        originalBubbles.push(...rangesToBubbleRanges(edit.replacements.map((r) => r.originalRange)));
      }
      this._originalBubblesDecorationCollection.set(originalBubbles.map((r) => ({ range: r, options: this._originalBubblesDecorationOptions })));
    }));
    this._register(this._editor.createOverlayWidget({
      domNode: this._div.element,
      minContentWidthInPx: derived((reader) => {
        return this._layout.read(reader)?.minContentWidthRequired ?? 0;
      }),
      position: constObservable({ preference: { top: 0, left: 0 } }),
      allowEditorOverflow: false
    }));
  }
  _isMouseOverWidget(e) {
    const layout = this._layout.get();
    if (!layout || !(e.event instanceof EditorMouseEvent)) {
      return false;
    }
    return layout.lowerBackground.containsPoint(new Point(e.event.relativePos.x, e.event.relativePos.y));
  }
  removePreviousViewZone(changeAccessor) {
    if (!this._previousViewZoneInfo) {
      return;
    }
    changeAccessor.removeZone(this._previousViewZoneInfo.id);
    const cursorLineNumber = this._editor.cursorLineNumber.get();
    if (cursorLineNumber !== null && cursorLineNumber >= this._previousViewZoneInfo.lineNumber) {
      this._editor.editor.setScrollTop(this._editor.scrollTop.get() - this._previousViewZoneInfo.height);
    }
    this._previousViewZoneInfo = void 0;
  }
  addViewZone(viewZoneInfo, changeAccessor) {
    const activeViewZone = changeAccessor.addZone({
      afterLineNumber: viewZoneInfo.lineNumber - 1,
      heightInPx: viewZoneInfo.height,
      // move computation to layout?
      domNode: $("div")
    });
    this._previousViewZoneInfo = { height: viewZoneInfo.height, lineNumber: viewZoneInfo.lineNumber, id: activeViewZone };
    const cursorLineNumber = this._editor.cursorLineNumber.get();
    if (cursorLineNumber !== null && cursorLineNumber >= viewZoneInfo.lineNumber) {
      this._editor.editor.setScrollTop(this._editor.scrollTop.get() + viewZoneInfo.height);
    }
  }
};
InlineEditsLineReplacementView = __decorate([
  __param(3, ILanguageService),
  __param(4, IThemeService)
], InlineEditsLineReplacementView);
function rangesToBubbleRanges(ranges) {
  const result = [];
  while (ranges.length) {
    let range = ranges.shift();
    if (range.startLineNumber !== range.endLineNumber) {
      ranges.push(new Range(range.startLineNumber + 1, 1, range.endLineNumber, range.endColumn));
      range = new Range(range.startLineNumber, range.startColumn, range.startLineNumber, Number.MAX_SAFE_INTEGER);
    }
    result.push(range);
  }
  return result;
}
__name(rangesToBubbleRanges, "rangesToBubbleRanges");
export {
  InlineEditsLineReplacementView
};
//# sourceMappingURL=inlineEditsLineReplacementView.js.map
