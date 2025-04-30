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
import "./nativeEditContext.css";
import { isFirefox } from "../../../../../base/browser/browser.js";
import { addDisposableListener, getActiveWindow, getWindow, getWindowId } from "../../../../../base/browser/dom.js";
import { FastDomNode } from "../../../../../base/browser/fastDomNode.js";
import { StandardKeyboardEvent } from "../../../../../base/browser/keyboardEvent.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ClipboardEventUtils, getDataToCopy, InMemoryClipboardMetadataManager } from "../clipboardUtils.js";
import { AbstractEditContext } from "../editContext.js";
import { editContextAddDisposableListener, FocusTracker } from "./nativeEditContextUtils.js";
import { ScreenReaderSupport } from "./screenReaderSupport.js";
import { Range } from "../../../../common/core/range.js";
import { Selection } from "../../../../common/core/selection.js";
import { Position } from "../../../../common/core/position.js";
import { PositionOffsetTransformer } from "../../../../common/core/positionToOffset.js";
import { MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { EditContext } from "./editContextFactory.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { NativeEditContextRegistry } from "./nativeEditContextRegistry.js";
import { isHighSurrogate, isLowSurrogate } from "../../../../../base/common/strings.js";
import { IME } from "../../../../../base/common/ime.js";
var CompositionClassName;
(function(CompositionClassName2) {
  CompositionClassName2["NONE"] = "edit-context-composition-none";
  CompositionClassName2["SECONDARY"] = "edit-context-composition-secondary";
  CompositionClassName2["PRIMARY"] = "edit-context-composition-primary";
})(CompositionClassName || (CompositionClassName = {}));
let NativeEditContext = class NativeEditContext2 extends AbstractEditContext {
  static {
    __name(this, "NativeEditContext");
  }
  constructor(ownerID, context, overflowGuardContainer, _viewController, _visibleRangeProvider, instantiationService, _accessibilityService) {
    super(context);
    this._viewController = _viewController;
    this._visibleRangeProvider = _visibleRangeProvider;
    this._accessibilityService = _accessibilityService;
    this._editContextPrimarySelection = new Selection(1, 1, 1, 1);
    this._decorations = [];
    this._primarySelection = new Selection(1, 1, 1, 1);
    this._targetWindowId = -1;
    this._scrollTop = 0;
    this._scrollLeft = 0;
    this.domNode = new FastDomNode(document.createElement("div"));
    this.domNode.setClassName(`native-edit-context`);
    this._imeTextArea = new FastDomNode(document.createElement("textarea"));
    this._imeTextArea.setClassName(`ime-text-area`);
    this._imeTextArea.setAttribute("readonly", "true");
    this.domNode.setAttribute("autocorrect", "off");
    this.domNode.setAttribute("autocapitalize", "off");
    this.domNode.setAttribute("autocomplete", "off");
    this.domNode.setAttribute("spellcheck", "false");
    this._updateDomAttributes();
    overflowGuardContainer.appendChild(this.domNode);
    overflowGuardContainer.appendChild(this._imeTextArea);
    this._parent = overflowGuardContainer.domNode;
    this._selectionChangeListener = this._register(new MutableDisposable());
    this._focusTracker = this._register(new FocusTracker(this.domNode.domNode, (newFocusValue) => {
      if (newFocusValue) {
        this._selectionChangeListener.value = this._setSelectionChangeListener(this._viewController);
        this._screenReaderSupport.setIgnoreSelectionChangeTime("onFocus");
      } else {
        this._selectionChangeListener.value = void 0;
      }
      this._context.viewModel.setHasFocus(newFocusValue);
    }));
    const window = getWindow(this.domNode.domNode);
    this._editContext = EditContext.create(window);
    this.setEditContextOnDomNode();
    this._screenReaderSupport = instantiationService.createInstance(ScreenReaderSupport, this.domNode, context);
    this._register(addDisposableListener(this.domNode.domNode, "copy", (e) => this._ensureClipboardGetsEditorSelection(e)));
    this._register(addDisposableListener(this.domNode.domNode, "cut", (e) => {
      this._screenReaderSupport.setIgnoreSelectionChangeTime("onCut");
      this._ensureClipboardGetsEditorSelection(e);
      this._viewController.cut();
    }));
    this._register(addDisposableListener(this.domNode.domNode, "keyup", (e) => this._onKeyUp(e)));
    this._register(addDisposableListener(this.domNode.domNode, "keydown", async (e) => this._onKeyDown(e)));
    this._register(addDisposableListener(this._imeTextArea.domNode, "keyup", (e) => this._onKeyUp(e)));
    this._register(addDisposableListener(this._imeTextArea.domNode, "keydown", async (e) => this._onKeyDown(e)));
    this._register(addDisposableListener(this.domNode.domNode, "beforeinput", async (e) => {
      if (e.inputType === "insertParagraph" || e.inputType === "insertLineBreak") {
        this._onType(this._viewController, { text: "\n", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 });
      }
    }));
    this._register(addDisposableListener(this.domNode.domNode, "paste", (e) => {
      e.preventDefault();
      if (!e.clipboardData) {
        return;
      }
      let [text, metadata] = ClipboardEventUtils.getTextData(e.clipboardData);
      if (!text) {
        return;
      }
      metadata = metadata || InMemoryClipboardMetadataManager.INSTANCE.get(text);
      let pasteOnNewLine = false;
      let multicursorText = null;
      let mode = null;
      if (metadata) {
        const options = this._context.configuration.options;
        const emptySelectionClipboard = options.get(
          38
          /* EditorOption.emptySelectionClipboard */
        );
        pasteOnNewLine = emptySelectionClipboard && !!metadata.isFromEmptySelection;
        multicursorText = typeof metadata.multicursorText !== "undefined" ? metadata.multicursorText : null;
        mode = metadata.mode;
      }
      this._viewController.paste(text, pasteOnNewLine, multicursorText, mode);
    }));
    this._register(editContextAddDisposableListener(this._editContext, "textformatupdate", (e) => this._handleTextFormatUpdate(e)));
    this._register(editContextAddDisposableListener(this._editContext, "characterboundsupdate", (e) => this._updateCharacterBounds(e)));
    let highSurrogateCharacter;
    this._register(editContextAddDisposableListener(this._editContext, "textupdate", (e) => {
      const text = e.text;
      if (text.length === 1) {
        const charCode = text.charCodeAt(0);
        if (isHighSurrogate(charCode)) {
          highSurrogateCharacter = text;
          return;
        }
        if (isLowSurrogate(charCode) && highSurrogateCharacter) {
          const textUpdateEvent = {
            text: highSurrogateCharacter + text,
            selectionEnd: e.selectionEnd,
            selectionStart: e.selectionStart,
            updateRangeStart: e.updateRangeStart - 1,
            updateRangeEnd: e.updateRangeEnd - 1
          };
          highSurrogateCharacter = void 0;
          this._emitTypeEvent(this._viewController, textUpdateEvent);
          return;
        }
      }
      this._emitTypeEvent(this._viewController, e);
    }));
    this._register(editContextAddDisposableListener(this._editContext, "compositionstart", (e) => {
      this._viewController.compositionStart();
      this._context.viewModel.onCompositionStart();
    }));
    this._register(editContextAddDisposableListener(this._editContext, "compositionend", (e) => {
      this._viewController.compositionEnd();
      this._context.viewModel.onCompositionEnd();
    }));
    let reenableTracking = false;
    this._register(IME.onDidChange(() => {
      if (IME.enabled && reenableTracking) {
        this.domNode.focus();
        this._focusTracker.resume();
        reenableTracking = false;
      }
      if (!IME.enabled && this.isFocused()) {
        this._focusTracker.pause();
        this._imeTextArea.focus();
        reenableTracking = true;
      }
    }));
    this._register(NativeEditContextRegistry.register(ownerID, this));
  }
  // --- Public methods ---
  dispose() {
    this.domNode.domNode.blur();
    this.domNode.domNode.remove();
    this._imeTextArea.domNode.remove();
    super.dispose();
  }
  setAriaOptions(options) {
    this._screenReaderSupport.setAriaOptions(options);
  }
  /* Last rendered data needed for correct hit-testing and determining the mouse position.
   * Without this, the selection will blink as incorrect mouse position is calculated */
  getLastRenderData() {
    return this._primarySelection.getPosition();
  }
  prepareRender(ctx) {
    this._screenReaderSupport.prepareRender(ctx);
    this._updateEditContext();
    this._updateSelectionAndControlBounds(ctx);
  }
  render(ctx) {
    this._screenReaderSupport.render(ctx);
  }
  onCursorStateChanged(e) {
    this._primarySelection = e.modelSelections[0] ?? new Selection(1, 1, 1, 1);
    this._screenReaderSupport.onCursorStateChanged(e);
    this._updateEditContext();
    return true;
  }
  onConfigurationChanged(e) {
    this._screenReaderSupport.onConfigurationChanged(e);
    this._updateDomAttributes();
    return true;
  }
  onDecorationsChanged(e) {
    return true;
  }
  onFlushed(e) {
    return true;
  }
  onLinesChanged(e) {
    return true;
  }
  onLinesDeleted(e) {
    return true;
  }
  onLinesInserted(e) {
    return true;
  }
  onScrollChanged(e) {
    this._scrollLeft = e.scrollLeft;
    this._scrollTop = e.scrollTop;
    return true;
  }
  onZonesChanged(e) {
    return true;
  }
  onWillPaste() {
    this._onWillPaste();
  }
  _onWillPaste() {
    this._screenReaderSupport.setIgnoreSelectionChangeTime("onWillPaste");
  }
  writeScreenReaderContent() {
    this._screenReaderSupport.writeScreenReaderContent();
  }
  isFocused() {
    return this._focusTracker.isFocused;
  }
  focus() {
    this._focusTracker.focus();
    this.refreshFocusState();
  }
  refreshFocusState() {
    this._focusTracker.refreshFocusState();
  }
  // TODO: added as a workaround fix for https://github.com/microsoft/vscode/issues/229825
  // When this issue will be fixed the following should be removed.
  setEditContextOnDomNode() {
    const targetWindow = getWindow(this.domNode.domNode);
    const targetWindowId = getWindowId(targetWindow);
    if (this._targetWindowId !== targetWindowId) {
      this.domNode.domNode.editContext = this._editContext;
      this._targetWindowId = targetWindowId;
    }
  }
  // --- Private methods ---
  _onKeyUp(e) {
    this._viewController.emitKeyUp(new StandardKeyboardEvent(e));
  }
  _onKeyDown(e) {
    const standardKeyboardEvent = new StandardKeyboardEvent(e);
    if (standardKeyboardEvent.keyCode === 114) {
      standardKeyboardEvent.stopPropagation();
    }
    this._viewController.emitKeyDown(standardKeyboardEvent);
  }
  _updateDomAttributes() {
    const options = this._context.configuration.options;
    this.domNode.domNode.setAttribute("tabindex", String(options.get(
      129
      /* EditorOption.tabIndex */
    )));
  }
  _updateEditContext() {
    const editContextState = this._getNewEditContextState();
    if (!editContextState) {
      return;
    }
    this._editContext.updateText(0, Number.MAX_SAFE_INTEGER, editContextState.text ?? " ");
    this._editContext.updateSelection(editContextState.selectionStartOffset, editContextState.selectionEndOffset);
    this._editContextPrimarySelection = editContextState.editContextPrimarySelection;
  }
  _emitTypeEvent(viewController, e) {
    if (!this._editContext) {
      return;
    }
    if (!this._editContextPrimarySelection.equalsSelection(this._primarySelection)) {
      return;
    }
    const model = this._context.viewModel.model;
    const startPositionOfEditContext = this._editContextStartPosition();
    const offsetOfStartOfText = model.getOffsetAt(startPositionOfEditContext);
    const offsetOfSelectionEnd = model.getOffsetAt(this._primarySelection.getEndPosition());
    const offsetOfSelectionStart = model.getOffsetAt(this._primarySelection.getStartPosition());
    const selectionEndOffset = offsetOfSelectionEnd - offsetOfStartOfText;
    const selectionStartOffset = offsetOfSelectionStart - offsetOfStartOfText;
    let replaceNextCharCnt = 0;
    let replacePrevCharCnt = 0;
    if (e.updateRangeEnd > selectionEndOffset) {
      replaceNextCharCnt = e.updateRangeEnd - selectionEndOffset;
    }
    if (e.updateRangeStart < selectionStartOffset) {
      replacePrevCharCnt = selectionStartOffset - e.updateRangeStart;
    }
    let text = "";
    if (selectionStartOffset < e.updateRangeStart) {
      text += this._editContext.text.substring(selectionStartOffset, e.updateRangeStart);
    }
    text += e.text;
    if (selectionEndOffset > e.updateRangeEnd) {
      text += this._editContext.text.substring(e.updateRangeEnd, selectionEndOffset);
    }
    let positionDelta = 0;
    if (e.selectionStart === e.selectionEnd && selectionStartOffset === selectionEndOffset) {
      positionDelta = e.selectionStart - (e.updateRangeStart + e.text.length);
    }
    const typeInput = {
      text,
      replacePrevCharCnt,
      replaceNextCharCnt,
      positionDelta
    };
    this._onType(viewController, typeInput);
    this._updateEditContext();
  }
  _onType(viewController, typeInput) {
    if (typeInput.replacePrevCharCnt || typeInput.replaceNextCharCnt || typeInput.positionDelta) {
      viewController.compositionType(typeInput.text, typeInput.replacePrevCharCnt, typeInput.replaceNextCharCnt, typeInput.positionDelta);
    } else {
      viewController.type(typeInput.text);
    }
  }
  _getNewEditContextState() {
    const editContextPrimarySelection = this._primarySelection;
    const model = this._context.viewModel.model;
    if (!model.isValidRange(editContextPrimarySelection)) {
      return;
    }
    const primarySelectionStartLine = editContextPrimarySelection.startLineNumber;
    const primarySelectionEndLine = editContextPrimarySelection.endLineNumber;
    const endColumnOfEndLineNumber = model.getLineMaxColumn(primarySelectionEndLine);
    const rangeOfText = new Range(primarySelectionStartLine, 1, primarySelectionEndLine, endColumnOfEndLineNumber);
    const text = model.getValueInRange(
      rangeOfText,
      0
      /* EndOfLinePreference.TextDefined */
    );
    const selectionStartOffset = editContextPrimarySelection.startColumn - 1;
    const selectionEndOffset = text.length + editContextPrimarySelection.endColumn - endColumnOfEndLineNumber;
    return {
      text,
      selectionStartOffset,
      selectionEndOffset,
      editContextPrimarySelection
    };
  }
  _editContextStartPosition() {
    return new Position(this._editContextPrimarySelection.startLineNumber, 1);
  }
  _handleTextFormatUpdate(e) {
    if (!this._editContext) {
      return;
    }
    const formats = e.getTextFormats();
    const editContextStartPosition = this._editContextStartPosition();
    const decorations = [];
    formats.forEach((f) => {
      const textModel = this._context.viewModel.model;
      const offsetOfEditContextText = textModel.getOffsetAt(editContextStartPosition);
      const startPositionOfDecoration = textModel.getPositionAt(offsetOfEditContextText + f.rangeStart);
      const endPositionOfDecoration = textModel.getPositionAt(offsetOfEditContextText + f.rangeEnd);
      const decorationRange = Range.fromPositions(startPositionOfDecoration, endPositionOfDecoration);
      const thickness = f.underlineThickness.toLowerCase();
      let decorationClassName = CompositionClassName.NONE;
      switch (thickness) {
        case "thin":
          decorationClassName = CompositionClassName.SECONDARY;
          break;
        case "thick":
          decorationClassName = CompositionClassName.PRIMARY;
          break;
      }
      decorations.push({
        range: decorationRange,
        options: {
          description: "textFormatDecoration",
          inlineClassName: decorationClassName
        }
      });
    });
    this._decorations = this._context.viewModel.model.deltaDecorations(this._decorations, decorations);
  }
  _updateSelectionAndControlBounds(ctx) {
    if (!this._parent) {
      return;
    }
    const options = this._context.configuration.options;
    const contentLeft = options.get(
      151
      /* EditorOption.layoutInfo */
    ).contentLeft;
    const parentBounds = this._parent.getBoundingClientRect();
    const viewSelection = this._context.viewModel.coordinatesConverter.convertModelRangeToViewRange(this._primarySelection);
    const verticalOffsetStart = this._context.viewLayout.getVerticalOffsetForLineNumber(viewSelection.startLineNumber);
    const top = parentBounds.top + verticalOffsetStart - this._scrollTop;
    const verticalOffsetEnd = this._context.viewLayout.getVerticalOffsetAfterLineNumber(viewSelection.endLineNumber);
    const height = verticalOffsetEnd - verticalOffsetStart;
    let left = parentBounds.left + contentLeft - this._scrollLeft;
    let width;
    if (this._primarySelection.isEmpty()) {
      const linesVisibleRanges = ctx.visibleRangeForPosition(viewSelection.getStartPosition());
      if (linesVisibleRanges) {
        left += linesVisibleRanges.left;
      }
      width = 0;
    } else {
      width = parentBounds.width - contentLeft;
    }
    const selectionBounds = new DOMRect(left, top, width, height);
    this._editContext.updateSelectionBounds(selectionBounds);
    this._editContext.updateControlBounds(selectionBounds);
  }
  _updateCharacterBounds(e) {
    if (!this._parent) {
      return;
    }
    const options = this._context.configuration.options;
    const typicalHalfWidthCharacterWidth = options.get(
      52
      /* EditorOption.fontInfo */
    ).typicalHalfwidthCharacterWidth;
    const contentLeft = options.get(
      151
      /* EditorOption.layoutInfo */
    ).contentLeft;
    const parentBounds = this._parent.getBoundingClientRect();
    const characterBounds = [];
    const offsetTransformer = new PositionOffsetTransformer(this._editContext.text);
    for (let offset = e.rangeStart; offset < e.rangeEnd; offset++) {
      const editContextStartPosition = offsetTransformer.getPosition(offset);
      const textStartLineOffsetWithinEditor = this._editContextPrimarySelection.startLineNumber - 1;
      const characterStartPosition = new Position(textStartLineOffsetWithinEditor + editContextStartPosition.lineNumber, editContextStartPosition.column);
      const characterEndPosition = characterStartPosition.delta(0, 1);
      const characterModelRange = Range.fromPositions(characterStartPosition, characterEndPosition);
      const characterViewRange = this._context.viewModel.coordinatesConverter.convertModelRangeToViewRange(characterModelRange);
      const characterLinesVisibleRanges = this._visibleRangeProvider.linesVisibleRangesForRange(characterViewRange, true) ?? [];
      const lineNumber = characterViewRange.startLineNumber;
      const characterVerticalOffset = this._context.viewLayout.getVerticalOffsetForLineNumber(lineNumber);
      const top = parentBounds.top + characterVerticalOffset - this._scrollTop;
      let left = 0;
      let width = typicalHalfWidthCharacterWidth;
      if (characterLinesVisibleRanges.length > 0) {
        for (const visibleRange of characterLinesVisibleRanges[0].ranges) {
          left = visibleRange.left;
          width = visibleRange.width;
          break;
        }
      }
      const lineHeight = this._context.viewLayout.getLineHeightForLineNumber(lineNumber);
      characterBounds.push(new DOMRect(parentBounds.left + contentLeft + left - this._scrollLeft, top, width, lineHeight));
    }
    this._editContext.updateCharacterBounds(e.rangeStart, characterBounds);
  }
  _ensureClipboardGetsEditorSelection(e) {
    const options = this._context.configuration.options;
    const emptySelectionClipboard = options.get(
      38
      /* EditorOption.emptySelectionClipboard */
    );
    const copyWithSyntaxHighlighting = options.get(
      25
      /* EditorOption.copyWithSyntaxHighlighting */
    );
    const selections = this._context.viewModel.getCursorStates().map((cursorState) => cursorState.modelState.selection);
    const dataToCopy = getDataToCopy(this._context.viewModel, selections, emptySelectionClipboard, copyWithSyntaxHighlighting);
    const storedMetadata = {
      version: 1,
      isFromEmptySelection: dataToCopy.isFromEmptySelection,
      multicursorText: dataToCopy.multicursorText,
      mode: dataToCopy.mode
    };
    InMemoryClipboardMetadataManager.INSTANCE.set(
      // When writing "LINE\r\n" to the clipboard and then pasting,
      // Firefox pastes "LINE\n", so let's work around this quirk
      isFirefox ? dataToCopy.text.replace(/\r\n/g, "\n") : dataToCopy.text,
      storedMetadata
    );
    e.preventDefault();
    if (e.clipboardData) {
      ClipboardEventUtils.setTextData(e.clipboardData, dataToCopy.text, dataToCopy.html, storedMetadata);
    }
  }
  _setSelectionChangeListener(viewController) {
    let previousSelectionChangeEventTime = 0;
    return addDisposableListener(this.domNode.domNode.ownerDocument, "selectionchange", () => {
      const isScreenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
      if (!this.isFocused() || !isScreenReaderOptimized || !IME.enabled) {
        return;
      }
      const screenReaderContentState = this._screenReaderSupport.screenReaderContentState;
      if (!screenReaderContentState) {
        return;
      }
      const now = Date.now();
      const delta1 = now - previousSelectionChangeEventTime;
      previousSelectionChangeEventTime = now;
      if (delta1 < 5) {
        return;
      }
      const delta2 = now - this._screenReaderSupport.getIgnoreSelectionChangeTime();
      this._screenReaderSupport.resetSelectionChangeTime();
      if (delta2 < 100) {
        return;
      }
      const activeDocument = getActiveWindow().document;
      const activeDocumentSelection = activeDocument.getSelection();
      if (!activeDocumentSelection) {
        return;
      }
      const rangeCount = activeDocumentSelection.rangeCount;
      if (rangeCount === 0) {
        return;
      }
      const range = activeDocumentSelection.getRangeAt(0);
      const viewModel = this._context.viewModel;
      const model = viewModel.model;
      const coordinatesConverter = viewModel.coordinatesConverter;
      const modelScreenReaderContentStartPositionWithinEditor = coordinatesConverter.convertViewPositionToModelPosition(screenReaderContentState.startPositionWithinEditor);
      const offsetOfStartOfScreenReaderContent = model.getOffsetAt(modelScreenReaderContentStartPositionWithinEditor);
      let offsetOfSelectionStart = range.startOffset + offsetOfStartOfScreenReaderContent;
      let offsetOfSelectionEnd = range.endOffset + offsetOfStartOfScreenReaderContent;
      const modelUsesCRLF = model.getEndOfLineSequence() === 1;
      if (modelUsesCRLF) {
        const screenReaderContentText = screenReaderContentState.value;
        const offsetTransformer = new PositionOffsetTransformer(screenReaderContentText);
        const positionOfStartWithinText = offsetTransformer.getPosition(range.startOffset);
        const positionOfEndWithinText = offsetTransformer.getPosition(range.endOffset);
        offsetOfSelectionStart += positionOfStartWithinText.lineNumber - 1;
        offsetOfSelectionEnd += positionOfEndWithinText.lineNumber - 1;
      }
      const positionOfSelectionStart = model.getPositionAt(offsetOfSelectionStart);
      const positionOfSelectionEnd = model.getPositionAt(offsetOfSelectionEnd);
      const newSelection = Selection.fromPositions(positionOfSelectionStart, positionOfSelectionEnd);
      viewController.setSelection(newSelection);
    });
  }
};
NativeEditContext = __decorate([
  __param(5, IInstantiationService),
  __param(6, IAccessibilityService)
], NativeEditContext);
export {
  NativeEditContext
};
//# sourceMappingURL=nativeEditContext.js.map
