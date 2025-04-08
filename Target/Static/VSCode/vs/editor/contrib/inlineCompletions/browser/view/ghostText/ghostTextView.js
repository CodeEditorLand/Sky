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
import { createTrustedTypesPolicy } from "../../../../../../base/browser/trustedTypes.js";
import { renderIcon } from "../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Emitter, Event } from "../../../../../../base/common/event.js";
import { createHotClass } from "../../../../../../base/common/hotReloadHelpers.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../../../base/common/lifecycle.js";
import { IObservable, autorun, autorunWithStore, constObservable, derived, observableSignalFromEvent, observableValue } from "../../../../../../base/common/observable.js";
import * as strings from "../../../../../../base/common/strings.js";
import { applyFontInfo } from "../../../../../browser/config/domFontInfo.js";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidgetPosition, IViewZoneChangeAccessor, MouseTargetType } from "../../../../../browser/editorBrowser.js";
import { observableCodeEditor } from "../../../../../browser/observableCodeEditor.js";
import { EditorFontLigatures, EditorOption, IComputedEditorOptions } from "../../../../../common/config/editorOptions.js";
import { OffsetEdit, SingleOffsetEdit } from "../../../../../common/core/offsetEdit.js";
import { Position } from "../../../../../common/core/position.js";
import { Range } from "../../../../../common/core/range.js";
import { StringBuilder } from "../../../../../common/core/stringBuilder.js";
import { IconPath } from "../../../../../common/languages.js";
import { ILanguageService } from "../../../../../common/languages/language.js";
import { IModelDeltaDecoration, ITextModel, InjectedTextCursorStops, PositionAffinity } from "../../../../../common/model.js";
import { LineTokens } from "../../../../../common/tokens/lineTokens.js";
import { LineDecoration } from "../../../../../common/viewLayout/lineDecorations.js";
import { RenderLineInput, renderViewLine } from "../../../../../common/viewLayout/viewLineRenderer.js";
import { InlineDecorationType } from "../../../../../common/viewModel.js";
import { GhostText, GhostTextReplacement, IGhostTextLine } from "../../model/ghostText.js";
import { RangeSingleLine } from "../../../../../common/core/rangeSingleLine.js";
import { ColumnRange } from "../../../../../common/core/columnRange.js";
import { addDisposableListener, getWindow, isHTMLElement, n } from "../../../../../../base/browser/dom.js";
import "./ghostTextView.css";
import { IMouseEvent, StandardMouseEvent } from "../../../../../../base/browser/mouseEvent.js";
import { CodeEditorWidget } from "../../../../../browser/widget/codeEditor/codeEditorWidget.js";
import { TokenWithTextArray } from "../../../../../common/tokens/tokenWithTextArray.js";
const USE_SQUIGGLES_FOR_WARNING = true;
const GHOST_TEXT_CLASS_NAME = "ghost-text";
let GhostTextView = class extends Disposable {
  constructor(_editor, _model, _options, _shouldKeepCursorStable, _isClickable, _languageService) {
    super();
    this._editor = _editor;
    this._model = _model;
    this._options = _options;
    this._shouldKeepCursorStable = _shouldKeepCursorStable;
    this._isClickable = _isClickable;
    this._languageService = _languageService;
    this._register(toDisposable(() => {
      this._isDisposed.set(true, void 0);
    }));
    this._register(this._editorObs.setDecorations(this.decorations));
    if (this._isClickable) {
      this._register(this._additionalLinesWidget.onDidClick((e) => this._onDidClick.fire(e)));
      this._register(this._editor.onMouseUp((e) => {
        if (e.target.type !== MouseTargetType.CONTENT_TEXT) {
          return;
        }
        const a = e.target.detail.injectedText?.options.attachedData;
        if (a instanceof GhostTextAttachedData && a.owner === this) {
          this._onDidClick.fire(e.event);
        }
      }));
    }
    this._register(autorunWithStore((reader, store) => {
      if (USE_SQUIGGLES_FOR_WARNING) {
        return;
      }
      const state = this._warningState.read(reader);
      if (!state) {
        return;
      }
      const lineHeight = this._editorObs.getOption(EditorOption.lineHeight);
      store.add(this._editorObs.createContentWidget({
        position: constObservable({
          position: new Position(state.lineNumber, Number.MAX_SAFE_INTEGER),
          preference: [ContentWidgetPositionPreference.EXACT],
          positionAffinity: PositionAffinity.Right
        }),
        allowEditorOverflow: false,
        domNode: n.div({
          class: "ghost-text-view-warning-widget",
          style: {
            width: lineHeight,
            height: lineHeight,
            marginLeft: 4,
            color: "orange"
          },
          ref: /* @__PURE__ */ __name((dom) => {
            dom.ghostTextViewWarningWidgetData = { range: Range.fromPositions(state.position) };
          }, "ref")
        }, [
          n.div({
            class: "ghost-text-view-warning-widget-icon",
            style: {
              width: "100%",
              height: "100%",
              display: "flex",
              alignContent: "center",
              alignItems: "center"
            }
          }, [
            renderIcon(state.icon && "id" in state.icon ? state.icon : Codicon.warning)
          ])
        ]).keepUpdated(store).element
      }));
    }));
  }
  static {
    __name(this, "GhostTextView");
  }
  _isDisposed = observableValue(this, false);
  _editorObs = observableCodeEditor(this._editor);
  static hot = createHotClass(GhostTextView);
  _warningState = derived((reader) => {
    const gt = this._model.ghostText.read(reader);
    if (!gt) {
      return void 0;
    }
    const warning = this._model.warning.read(reader);
    if (!warning) {
      return void 0;
    }
    return { lineNumber: gt.lineNumber, position: new Position(gt.lineNumber, gt.parts[0].column), icon: warning.icon };
  });
  _onDidClick = this._register(new Emitter());
  onDidClick = this._onDidClick.event;
  static getWarningWidgetContext(domNode) {
    const data = domNode.ghostTextViewWarningWidgetData;
    if (data) {
      return data;
    } else if (domNode.parentElement) {
      return this.getWarningWidgetContext(domNode.parentElement);
    }
    return void 0;
  }
  _useSyntaxHighlighting = this._options.map((o) => o.syntaxHighlightingEnabled);
  _extraClassNames = derived(this, (reader) => {
    const extraClasses = [...this._options.read(reader).extraClasses ?? []];
    if (this._useSyntaxHighlighting.read(reader)) {
      extraClasses.push("syntax-highlighted");
    }
    if (USE_SQUIGGLES_FOR_WARNING && this._warningState.read(reader)) {
      extraClasses.push("warning");
    }
    const extraClassNames = extraClasses.map((c) => ` ${c}`).join("");
    return extraClassNames;
  });
  uiState = derived(this, (reader) => {
    if (this._isDisposed.read(reader)) {
      return void 0;
    }
    const textModel = this._editorObs.model.read(reader);
    if (textModel !== this._model.targetTextModel.read(reader)) {
      return void 0;
    }
    const ghostText = this._model.ghostText.read(reader);
    if (!ghostText) {
      return void 0;
    }
    const replacedRange = ghostText instanceof GhostTextReplacement ? ghostText.columnRange : void 0;
    const syntaxHighlightingEnabled = this._useSyntaxHighlighting.read(reader);
    const extraClassNames = this._extraClassNames.read(reader);
    const { inlineTexts, additionalLines, hiddenRange, additionalLinesOriginalSuffix } = computeGhostTextViewData(ghostText, textModel, GHOST_TEXT_CLASS_NAME + extraClassNames);
    const currentLine = textModel.getLineContent(ghostText.lineNumber);
    const edit = new OffsetEdit(inlineTexts.map((t) => SingleOffsetEdit.insert(t.column - 1, t.text)));
    const tokens = syntaxHighlightingEnabled ? textModel.tokenization.tokenizeLinesAt(ghostText.lineNumber, [edit.apply(currentLine), ...additionalLines.map((l) => l.content)]) : void 0;
    const newRanges = edit.getNewTextRanges();
    const inlineTextsWithTokens = inlineTexts.map((t, idx) => ({ ...t, tokens: tokens?.[0]?.getTokensInRange(newRanges[idx]) }));
    const tokenizedAdditionalLines = additionalLines.map((l, idx) => {
      let content = tokens?.[idx + 1] ?? LineTokens.createEmpty(l.content, this._languageService.languageIdCodec);
      if (idx === additionalLines.length - 1 && additionalLinesOriginalSuffix) {
        const t = TokenWithTextArray.fromLineTokens(textModel.tokenization.getLineTokens(additionalLinesOriginalSuffix.lineNumber));
        const existingContent = t.slice(additionalLinesOriginalSuffix.columnRange.toZeroBasedOffsetRange());
        content = TokenWithTextArray.fromLineTokens(content).append(existingContent).toLineTokens(content.languageIdCodec);
      }
      return {
        content,
        decorations: l.decorations
      };
    });
    return {
      replacedRange,
      inlineTexts: inlineTextsWithTokens,
      additionalLines: tokenizedAdditionalLines,
      hiddenRange,
      lineNumber: ghostText.lineNumber,
      additionalReservedLineCount: this._model.minReservedLineCount.read(reader),
      targetTextModel: textModel,
      syntaxHighlightingEnabled
    };
  });
  decorations = derived(this, (reader) => {
    const uiState = this.uiState.read(reader);
    if (!uiState) {
      return [];
    }
    const decorations = [];
    const extraClassNames = this._extraClassNames.read(reader);
    if (uiState.replacedRange) {
      decorations.push({
        range: uiState.replacedRange.toRange(uiState.lineNumber),
        options: { inlineClassName: "inline-completion-text-to-replace" + extraClassNames, description: "GhostTextReplacement" }
      });
    }
    if (uiState.hiddenRange) {
      decorations.push({
        range: uiState.hiddenRange.toRange(uiState.lineNumber),
        options: { inlineClassName: "ghost-text-hidden", description: "ghost-text-hidden" }
      });
    }
    for (const p of uiState.inlineTexts) {
      decorations.push({
        range: Range.fromPositions(new Position(uiState.lineNumber, p.column)),
        options: {
          description: "ghost-text-decoration",
          after: {
            content: p.text,
            tokens: p.tokens,
            inlineClassName: (p.preview ? "ghost-text-decoration-preview" : "ghost-text-decoration") + (this._isClickable ? " clickable" : "") + extraClassNames + p.lineDecorations.map((d) => " " + d.className).join(" "),
            // TODO: take the ranges into account for line decorations
            cursorStops: InjectedTextCursorStops.Left,
            attachedData: new GhostTextAttachedData(this)
          },
          showIfCollapsed: true
        }
      });
    }
    return decorations;
  });
  _additionalLinesWidget = this._register(
    new AdditionalLinesWidget(
      this._editor,
      derived((reader) => {
        const uiState = this.uiState.read(reader);
        return uiState ? {
          lineNumber: uiState.lineNumber,
          additionalLines: uiState.additionalLines,
          minReservedLineCount: uiState.additionalReservedLineCount,
          targetTextModel: uiState.targetTextModel
        } : void 0;
      }),
      this._shouldKeepCursorStable,
      this._isClickable
    )
  );
  _isInlineTextHovered = this._editorObs.isTargetHovered(
    (p) => p.target.type === MouseTargetType.CONTENT_TEXT && p.target.detail.injectedText?.options.attachedData instanceof GhostTextAttachedData && p.target.detail.injectedText.options.attachedData.owner === this,
    this._store
  );
  isHovered = derived(this, (reader) => {
    if (this._isDisposed.read(reader)) {
      return false;
    }
    return this._isInlineTextHovered.read(reader) || this._additionalLinesWidget.isHovered.read(reader);
  });
  height = derived(this, (reader) => {
    const lineHeight = this._editorObs.getOption(EditorOption.lineHeight).read(reader);
    return lineHeight + (this._additionalLinesWidget.viewZoneHeight.read(reader) ?? 0);
  });
  ownsViewZone(viewZoneId) {
    return this._additionalLinesWidget.viewZoneId === viewZoneId;
  }
};
GhostTextView = __decorateClass([
  __decorateParam(5, ILanguageService)
], GhostTextView);
class GhostTextAttachedData {
  constructor(owner) {
    this.owner = owner;
  }
  static {
    __name(this, "GhostTextAttachedData");
  }
}
function computeGhostTextViewData(ghostText, textModel, ghostTextClassName) {
  const inlineTexts = [];
  const additionalLines = [];
  function addToAdditionalLines(ghLines, className) {
    if (additionalLines.length > 0) {
      const lastLine = additionalLines[additionalLines.length - 1];
      if (className) {
        lastLine.decorations.push(new LineDecoration(
          lastLine.content.length + 1,
          lastLine.content.length + 1 + ghLines[0].line.length,
          className,
          InlineDecorationType.Regular
        ));
      }
      lastLine.content += ghLines[0].line;
      ghLines = ghLines.slice(1);
    }
    for (const ghLine of ghLines) {
      additionalLines.push({
        content: ghLine.line,
        decorations: className ? [new LineDecoration(
          1,
          ghLine.line.length + 1,
          className,
          InlineDecorationType.Regular
        ), ...ghLine.lineDecorations] : [...ghLine.lineDecorations]
      });
    }
  }
  __name(addToAdditionalLines, "addToAdditionalLines");
  const textBufferLine = textModel.getLineContent(ghostText.lineNumber);
  let hiddenTextStartColumn = void 0;
  let lastIdx = 0;
  for (const part of ghostText.parts) {
    let ghLines = part.lines;
    if (hiddenTextStartColumn === void 0) {
      inlineTexts.push({ column: part.column, text: ghLines[0].line, preview: part.preview, lineDecorations: ghLines[0].lineDecorations });
      ghLines = ghLines.slice(1);
    } else {
      addToAdditionalLines([{ line: textBufferLine.substring(lastIdx, part.column - 1), lineDecorations: [] }], void 0);
    }
    if (ghLines.length > 0) {
      addToAdditionalLines(ghLines, ghostTextClassName);
      if (hiddenTextStartColumn === void 0 && part.column <= textBufferLine.length) {
        hiddenTextStartColumn = part.column;
      }
    }
    lastIdx = part.column - 1;
  }
  let additionalLinesOriginalSuffix = void 0;
  if (hiddenTextStartColumn !== void 0) {
    additionalLinesOriginalSuffix = new RangeSingleLine(ghostText.lineNumber, new ColumnRange(lastIdx + 1, textBufferLine.length + 1));
  }
  const hiddenRange = hiddenTextStartColumn !== void 0 ? new ColumnRange(hiddenTextStartColumn, textBufferLine.length + 1) : void 0;
  return {
    inlineTexts,
    additionalLines,
    hiddenRange,
    additionalLinesOriginalSuffix
  };
}
__name(computeGhostTextViewData, "computeGhostTextViewData");
class AdditionalLinesWidget extends Disposable {
  constructor(_editor, _lines, _shouldKeepCursorStable, _isClickable) {
    super();
    this._editor = _editor;
    this._lines = _lines;
    this._shouldKeepCursorStable = _shouldKeepCursorStable;
    this._isClickable = _isClickable;
    if (this._editor instanceof CodeEditorWidget && this._shouldKeepCursorStable) {
      this._register(this._editor.onBeforeExecuteEdit((e) => this.hasBeenAccepted = e.source === "inlineSuggestion.accept"));
    }
    this._register(autorun((reader) => {
      const lines = this._lines.read(reader);
      this.editorOptionsChanged.read(reader);
      if (lines) {
        this.hasBeenAccepted = false;
        this.updateLines(lines.lineNumber, lines.additionalLines, lines.minReservedLineCount);
      } else {
        this.clear();
      }
    }));
  }
  static {
    __name(this, "AdditionalLinesWidget");
  }
  _viewZoneInfo;
  get viewZoneId() {
    return this._viewZoneInfo?.viewZoneId;
  }
  _viewZoneHeight = observableValue("viewZoneHeight", void 0);
  get viewZoneHeight() {
    return this._viewZoneHeight;
  }
  editorOptionsChanged = observableSignalFromEvent("editorOptionChanged", Event.filter(
    this._editor.onDidChangeConfiguration,
    (e) => e.hasChanged(EditorOption.disableMonospaceOptimizations) || e.hasChanged(EditorOption.stopRenderingLineAfter) || e.hasChanged(EditorOption.renderWhitespace) || e.hasChanged(EditorOption.renderControlCharacters) || e.hasChanged(EditorOption.fontLigatures) || e.hasChanged(EditorOption.fontInfo) || e.hasChanged(EditorOption.lineHeight)
  ));
  _onDidClick = this._register(new Emitter());
  onDidClick = this._onDidClick.event;
  _viewZoneListener = this._register(new MutableDisposable());
  isHovered = observableCodeEditor(this._editor).isTargetHovered(
    (p) => isTargetGhostText(p.target.element),
    this._store
  );
  hasBeenAccepted = false;
  dispose() {
    super.dispose();
    this.clear();
  }
  clear() {
    this._viewZoneListener.clear();
    this._editor.changeViewZones((changeAccessor) => {
      this.removeActiveViewZone(changeAccessor);
    });
  }
  updateLines(lineNumber, additionalLines, minReservedLineCount) {
    const textModel = this._editor.getModel();
    if (!textModel) {
      return;
    }
    const { tabSize } = textModel.getOptions();
    this._editor.changeViewZones((changeAccessor) => {
      const store = new DisposableStore();
      this.removeActiveViewZone(changeAccessor);
      const heightInLines = Math.max(additionalLines.length, minReservedLineCount);
      if (heightInLines > 0) {
        const domNode = document.createElement("div");
        renderLines(domNode, tabSize, additionalLines, this._editor.getOptions(), this._isClickable);
        if (this._isClickable) {
          store.add(addDisposableListener(domNode, "mousedown", (e) => {
            e.preventDefault();
          }));
          store.add(addDisposableListener(domNode, "click", (e) => {
            if (isTargetGhostText(e.target)) {
              this._onDidClick.fire(new StandardMouseEvent(getWindow(e), e));
            }
          }));
        }
        this.addViewZone(changeAccessor, lineNumber, heightInLines, domNode);
      }
      this._viewZoneListener.value = store;
    });
  }
  addViewZone(changeAccessor, afterLineNumber, heightInLines, domNode) {
    const id = changeAccessor.addZone({
      afterLineNumber,
      heightInLines,
      domNode,
      afterColumnAffinity: PositionAffinity.Right,
      onComputedHeight: /* @__PURE__ */ __name((height) => {
        this._viewZoneHeight.set(height, void 0);
      }, "onComputedHeight")
    });
    this.keepCursorStable(afterLineNumber, heightInLines);
    this._viewZoneInfo = { viewZoneId: id, heightInLines, lineNumber: afterLineNumber };
  }
  removeActiveViewZone(changeAccessor) {
    if (this._viewZoneInfo) {
      changeAccessor.removeZone(this._viewZoneInfo.viewZoneId);
      if (!this.hasBeenAccepted) {
        this.keepCursorStable(this._viewZoneInfo.lineNumber, -this._viewZoneInfo.heightInLines);
      }
      this._viewZoneInfo = void 0;
      this._viewZoneHeight.set(void 0, void 0);
    }
  }
  keepCursorStable(lineNumber, heightInLines) {
    if (!this._shouldKeepCursorStable) {
      return;
    }
    const cursorLineNumber = this._editor.getSelection()?.getStartPosition()?.lineNumber;
    if (cursorLineNumber !== void 0 && lineNumber < cursorLineNumber) {
      this._editor.setScrollTop(this._editor.getScrollTop() + heightInLines * this._editor.getOption(EditorOption.lineHeight));
    }
  }
}
function isTargetGhostText(target) {
  return isHTMLElement(target) && target.classList.contains(GHOST_TEXT_CLASS_NAME);
}
__name(isTargetGhostText, "isTargetGhostText");
function renderLines(domNode, tabSize, lines, opts, isClickable) {
  const disableMonospaceOptimizations = opts.get(EditorOption.disableMonospaceOptimizations);
  const stopRenderingLineAfter = opts.get(EditorOption.stopRenderingLineAfter);
  const renderWhitespace = "none";
  const renderControlCharacters = opts.get(EditorOption.renderControlCharacters);
  const fontLigatures = opts.get(EditorOption.fontLigatures);
  const fontInfo = opts.get(EditorOption.fontInfo);
  const lineHeight = opts.get(EditorOption.lineHeight);
  let classNames = "suggest-preview-text";
  if (isClickable) {
    classNames += " clickable";
  }
  const sb = new StringBuilder(1e4);
  sb.appendString(`<div class="${classNames}">`);
  for (let i = 0, len = lines.length; i < len; i++) {
    const lineData = lines[i];
    const lineTokens = lineData.content;
    sb.appendString('<div class="view-line');
    sb.appendString('" style="top:');
    sb.appendString(String(i * lineHeight));
    sb.appendString('px;width:1000000px;">');
    const line = lineTokens.getLineContent();
    const isBasicASCII = strings.isBasicASCII(line);
    const containsRTL = strings.containsRTL(line);
    renderViewLine(new RenderLineInput(
      fontInfo.isMonospace && !disableMonospaceOptimizations,
      fontInfo.canUseHalfwidthRightwardsArrow,
      line,
      false,
      isBasicASCII,
      containsRTL,
      0,
      lineTokens,
      lineData.decorations,
      tabSize,
      0,
      fontInfo.spaceWidth,
      fontInfo.middotWidth,
      fontInfo.wsmiddotWidth,
      stopRenderingLineAfter,
      renderWhitespace,
      renderControlCharacters,
      fontLigatures !== EditorFontLigatures.OFF,
      null
    ), sb);
    sb.appendString("</div>");
  }
  sb.appendString("</div>");
  applyFontInfo(domNode, fontInfo);
  const html = sb.build();
  const trustedhtml = ttPolicy ? ttPolicy.createHTML(html) : html;
  domNode.innerHTML = trustedhtml;
}
__name(renderLines, "renderLines");
const ttPolicy = createTrustedTypesPolicy("editorGhostText", { createHTML: /* @__PURE__ */ __name((value) => value, "createHTML") });
export {
  AdditionalLinesWidget,
  GhostTextView,
  ttPolicy
};
//# sourceMappingURL=ghostTextView.js.map
