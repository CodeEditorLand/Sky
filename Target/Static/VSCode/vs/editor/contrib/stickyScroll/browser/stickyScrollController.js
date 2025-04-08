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
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { IActiveCodeEditor, ICodeEditor, MouseTargetType } from "../../../browser/editorBrowser.js";
import { IEditorContribution, ScrollType } from "../../../common/editorCommon.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { EditorOption, RenderLineNumbersType, ConfigurationChangedEvent } from "../../../common/config/editorOptions.js";
import { StickyScrollWidget, StickyScrollWidgetState } from "./stickyScrollWidget.js";
import { IStickyLineCandidateProvider, StickyLineCandidateProvider } from "./stickyScrollProvider.js";
import { IModelTokensChangedEvent } from "../../../common/textModelEvents.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { ClickLinkGesture, ClickLinkMouseEvent } from "../../gotoSymbol/browser/link/clickLinkGesture.js";
import { IRange, Range } from "../../../common/core/range.js";
import { getDefinitionsAtPosition } from "../../gotoSymbol/browser/goToSymbol.js";
import { goToDefinitionWithLocation } from "../../inlayHints/browser/inlayHintsLocations.js";
import { IPosition, Position } from "../../../common/core/position.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import { ILanguageFeatureDebounceService } from "../../../common/services/languageFeatureDebounce.js";
import * as dom from "../../../../base/browser/dom.js";
import { StickyRange } from "./stickyScrollElement.js";
import { IMouseEvent, StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { FoldingController } from "../../folding/browser/folding.js";
import { FoldingModel, toggleCollapseState } from "../../folding/browser/foldingModel.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { mainWindow } from "../../../../base/browser/window.js";
let StickyScrollController = class extends Disposable {
  constructor(_editor, _contextMenuService, _languageFeaturesService, _instaService, _languageConfigurationService, _languageFeatureDebounceService, _contextKeyService) {
    super();
    this._editor = _editor;
    this._contextMenuService = _contextMenuService;
    this._languageFeaturesService = _languageFeaturesService;
    this._instaService = _instaService;
    this._contextKeyService = _contextKeyService;
    this._stickyScrollWidget = new StickyScrollWidget(this._editor);
    this._stickyLineCandidateProvider = new StickyLineCandidateProvider(this._editor, _languageFeaturesService, _languageConfigurationService);
    this._register(this._stickyScrollWidget);
    this._register(this._stickyLineCandidateProvider);
    this._widgetState = StickyScrollWidgetState.Empty;
    const stickyScrollDomNode = this._stickyScrollWidget.getDomNode();
    this._register(this._editor.onDidChangeConfiguration((e) => {
      this._readConfigurationChange(e);
    }));
    this._register(dom.addDisposableListener(stickyScrollDomNode, dom.EventType.CONTEXT_MENU, async (event) => {
      this._onContextMenu(dom.getWindow(stickyScrollDomNode), event);
    }));
    this._stickyScrollFocusedContextKey = EditorContextKeys.stickyScrollFocused.bindTo(this._contextKeyService);
    this._stickyScrollVisibleContextKey = EditorContextKeys.stickyScrollVisible.bindTo(this._contextKeyService);
    const focusTracker = this._register(dom.trackFocus(stickyScrollDomNode));
    this._register(focusTracker.onDidBlur((_) => {
      if (this._positionRevealed === false && stickyScrollDomNode.clientHeight === 0) {
        this._focusedStickyElementIndex = -1;
        this.focus();
      } else {
        this._disposeFocusStickyScrollStore();
      }
    }));
    this._register(focusTracker.onDidFocus((_) => {
      this.focus();
    }));
    this._registerMouseListeners();
    this._register(dom.addDisposableListener(stickyScrollDomNode, dom.EventType.MOUSE_DOWN, (e) => {
      this._onMouseDown = true;
    }));
    this._register(this._stickyScrollWidget.onDidChangeStickyScrollHeight((e) => {
      this._onDidChangeStickyScrollHeight.fire(e);
    }));
    this._onDidResize();
    this._readConfiguration();
  }
  static {
    __name(this, "StickyScrollController");
  }
  static ID = "store.contrib.stickyScrollController";
  _stickyScrollWidget;
  _stickyLineCandidateProvider;
  _sessionStore = new DisposableStore();
  _widgetState;
  _foldingModel;
  _maxStickyLines = Number.MAX_SAFE_INTEGER;
  _stickyRangeProjectedOnEditor;
  _candidateDefinitionsLength = -1;
  _stickyScrollFocusedContextKey;
  _stickyScrollVisibleContextKey;
  _focusDisposableStore;
  _focusedStickyElementIndex = -1;
  _enabled = false;
  _focused = false;
  _positionRevealed = false;
  _onMouseDown = false;
  _endLineNumbers = [];
  _showEndForLine;
  _minRebuildFromLine;
  _mouseTarget = null;
  _onDidChangeStickyScrollHeight = this._register(new Emitter());
  onDidChangeStickyScrollHeight = this._onDidChangeStickyScrollHeight.event;
  get stickyScrollCandidateProvider() {
    return this._stickyLineCandidateProvider;
  }
  get stickyScrollWidgetState() {
    return this._widgetState;
  }
  get stickyScrollWidgetHeight() {
    return this._stickyScrollWidget.height;
  }
  static get(editor) {
    return editor.getContribution(StickyScrollController.ID);
  }
  _disposeFocusStickyScrollStore() {
    this._stickyScrollFocusedContextKey.set(false);
    this._focusDisposableStore?.dispose();
    this._focused = false;
    this._positionRevealed = false;
    this._onMouseDown = false;
  }
  isFocused() {
    return this._focused;
  }
  focus() {
    if (this._onMouseDown) {
      this._onMouseDown = false;
      this._editor.focus();
      return;
    }
    const focusState = this._stickyScrollFocusedContextKey.get();
    if (focusState === true) {
      return;
    }
    this._focused = true;
    this._focusDisposableStore = new DisposableStore();
    this._stickyScrollFocusedContextKey.set(true);
    this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumbers.length - 1;
    this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
  }
  focusNext() {
    if (this._focusedStickyElementIndex < this._stickyScrollWidget.lineNumberCount - 1) {
      this._focusNav(true);
    }
  }
  focusPrevious() {
    if (this._focusedStickyElementIndex > 0) {
      this._focusNav(false);
    }
  }
  selectEditor() {
    this._editor.focus();
  }
  // True is next, false is previous
  _focusNav(direction) {
    this._focusedStickyElementIndex = direction ? this._focusedStickyElementIndex + 1 : this._focusedStickyElementIndex - 1;
    this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
  }
  goToFocused() {
    const lineNumbers = this._stickyScrollWidget.lineNumbers;
    this._disposeFocusStickyScrollStore();
    this._revealPosition({ lineNumber: lineNumbers[this._focusedStickyElementIndex], column: 1 });
  }
  _revealPosition(position) {
    this._reveaInEditor(position, () => this._editor.revealPosition(position));
  }
  _revealLineInCenterIfOutsideViewport(position) {
    this._reveaInEditor(position, () => this._editor.revealLineInCenterIfOutsideViewport(position.lineNumber, ScrollType.Smooth));
  }
  _reveaInEditor(position, revealFunction) {
    if (this._focused) {
      this._disposeFocusStickyScrollStore();
    }
    this._positionRevealed = true;
    revealFunction();
    this._editor.setSelection(Range.fromPositions(position));
    this._editor.focus();
  }
  _registerMouseListeners() {
    const sessionStore = this._register(new DisposableStore());
    const gesture = this._register(new ClickLinkGesture(this._editor, {
      extractLineNumberFromMouseEvent: /* @__PURE__ */ __name((e) => {
        const position = this._stickyScrollWidget.getEditorPositionFromNode(e.target.element);
        return position ? position.lineNumber : 0;
      }, "extractLineNumberFromMouseEvent")
    }));
    const getMouseEventTarget = /* @__PURE__ */ __name((mouseEvent) => {
      if (!this._editor.hasModel()) {
        return null;
      }
      if (mouseEvent.target.type !== MouseTargetType.OVERLAY_WIDGET || mouseEvent.target.detail !== this._stickyScrollWidget.getId()) {
        return null;
      }
      const mouseTargetElement = mouseEvent.target.element;
      if (!mouseTargetElement || mouseTargetElement.innerText !== mouseTargetElement.innerHTML) {
        return null;
      }
      const position = this._stickyScrollWidget.getEditorPositionFromNode(mouseTargetElement);
      if (!position) {
        return null;
      }
      return {
        range: new Range(position.lineNumber, position.column, position.lineNumber, position.column + mouseTargetElement.innerText.length),
        textElement: mouseTargetElement
      };
    }, "getMouseEventTarget");
    const stickyScrollWidgetDomNode = this._stickyScrollWidget.getDomNode();
    this._register(dom.addStandardDisposableListener(stickyScrollWidgetDomNode, dom.EventType.CLICK, (mouseEvent) => {
      if (mouseEvent.ctrlKey || mouseEvent.altKey || mouseEvent.metaKey) {
        return;
      }
      if (!mouseEvent.leftButton) {
        return;
      }
      if (mouseEvent.shiftKey) {
        const lineIndex = this._stickyScrollWidget.getLineIndexFromChildDomNode(mouseEvent.target);
        if (lineIndex === null) {
          return;
        }
        const position2 = new Position(this._endLineNumbers[lineIndex], 1);
        this._revealLineInCenterIfOutsideViewport(position2);
        return;
      }
      const isInFoldingIconDomNode = this._stickyScrollWidget.isInFoldingIconDomNode(mouseEvent.target);
      if (isInFoldingIconDomNode) {
        const lineNumber = this._stickyScrollWidget.getLineNumberFromChildDomNode(mouseEvent.target);
        this._toggleFoldingRegionForLine(lineNumber);
        return;
      }
      const isInStickyLine = this._stickyScrollWidget.isInStickyLine(mouseEvent.target);
      if (!isInStickyLine) {
        return;
      }
      let position = this._stickyScrollWidget.getEditorPositionFromNode(mouseEvent.target);
      if (!position) {
        const lineNumber = this._stickyScrollWidget.getLineNumberFromChildDomNode(mouseEvent.target);
        if (lineNumber === null) {
          return;
        }
        position = new Position(lineNumber, 1);
      }
      this._revealPosition(position);
    }));
    const mouseMoveListener = /* @__PURE__ */ __name((mouseEvent) => {
      this._mouseTarget = mouseEvent.target;
      this._onMouseMoveOrKeyDown(mouseEvent);
    }, "mouseMoveListener");
    const keyDownListener = /* @__PURE__ */ __name((mouseEvent) => {
      this._onMouseMoveOrKeyDown(mouseEvent);
    }, "keyDownListener");
    const keyUpListener = /* @__PURE__ */ __name((e) => {
      if (this._showEndForLine !== void 0) {
        this._showEndForLine = void 0;
        this._renderStickyScroll();
      }
    }, "keyUpListener");
    mainWindow.addEventListener(dom.EventType.MOUSE_MOVE, mouseMoveListener);
    mainWindow.addEventListener(dom.EventType.KEY_DOWN, keyDownListener);
    mainWindow.addEventListener(dom.EventType.KEY_UP, keyUpListener);
    this._register(toDisposable(() => {
      mainWindow.removeEventListener(dom.EventType.MOUSE_MOVE, mouseMoveListener);
      mainWindow.removeEventListener(dom.EventType.KEY_DOWN, keyDownListener);
      mainWindow.removeEventListener(dom.EventType.KEY_UP, keyUpListener);
    }));
    this._register(gesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, _keyboardEvent]) => {
      const mouseTarget = getMouseEventTarget(mouseEvent);
      if (!mouseTarget || !mouseEvent.hasTriggerModifier || !this._editor.hasModel()) {
        sessionStore.clear();
        return;
      }
      const { range, textElement } = mouseTarget;
      if (!range.equalsRange(this._stickyRangeProjectedOnEditor)) {
        this._stickyRangeProjectedOnEditor = range;
        sessionStore.clear();
      } else if (textElement.style.textDecoration === "underline") {
        return;
      }
      const cancellationToken = new CancellationTokenSource();
      sessionStore.add(toDisposable(() => cancellationToken.dispose(true)));
      let currentHTMLChild;
      getDefinitionsAtPosition(this._languageFeaturesService.definitionProvider, this._editor.getModel(), new Position(range.startLineNumber, range.startColumn + 1), false, cancellationToken.token).then((candidateDefinitions) => {
        if (cancellationToken.token.isCancellationRequested) {
          return;
        }
        if (candidateDefinitions.length !== 0) {
          this._candidateDefinitionsLength = candidateDefinitions.length;
          const childHTML = textElement;
          if (currentHTMLChild !== childHTML) {
            sessionStore.clear();
            currentHTMLChild = childHTML;
            currentHTMLChild.style.textDecoration = "underline";
            sessionStore.add(toDisposable(() => {
              currentHTMLChild.style.textDecoration = "none";
            }));
          } else if (!currentHTMLChild) {
            currentHTMLChild = childHTML;
            currentHTMLChild.style.textDecoration = "underline";
            sessionStore.add(toDisposable(() => {
              currentHTMLChild.style.textDecoration = "none";
            }));
          }
        } else {
          sessionStore.clear();
        }
      });
    }));
    this._register(gesture.onCancel(() => {
      sessionStore.clear();
    }));
    this._register(gesture.onExecute(async (e) => {
      if (e.target.type !== MouseTargetType.OVERLAY_WIDGET || e.target.detail !== this._stickyScrollWidget.getId()) {
        return;
      }
      const position = this._stickyScrollWidget.getEditorPositionFromNode(e.target.element);
      if (!position) {
        return;
      }
      if (!this._editor.hasModel() || !this._stickyRangeProjectedOnEditor) {
        return;
      }
      if (this._candidateDefinitionsLength > 1) {
        if (this._focused) {
          this._disposeFocusStickyScrollStore();
        }
        this._revealPosition({ lineNumber: position.lineNumber, column: 1 });
      }
      this._instaService.invokeFunction(goToDefinitionWithLocation, e, this._editor, { uri: this._editor.getModel().uri, range: this._stickyRangeProjectedOnEditor });
    }));
  }
  _onContextMenu(targetWindow, e) {
    const event = new StandardMouseEvent(targetWindow, e);
    this._contextMenuService.showContextMenu({
      menuId: MenuId.StickyScrollContext,
      getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor")
    });
  }
  _onMouseMoveOrKeyDown(mouseEvent) {
    if (!mouseEvent.shiftKey) {
      return;
    }
    if (!this._mouseTarget || !dom.isHTMLElement(this._mouseTarget)) {
      return;
    }
    const currentEndForLineIndex = this._stickyScrollWidget.getLineIndexFromChildDomNode(this._mouseTarget);
    if (currentEndForLineIndex === null || this._showEndForLine === currentEndForLineIndex) {
      return;
    }
    this._showEndForLine = currentEndForLineIndex;
    this._renderStickyScroll();
  }
  _toggleFoldingRegionForLine(line) {
    if (!this._foldingModel || line === null) {
      return;
    }
    const stickyLine = this._stickyScrollWidget.getRenderedStickyLine(line);
    const foldingIcon = stickyLine?.foldingIcon;
    if (!foldingIcon) {
      return;
    }
    toggleCollapseState(this._foldingModel, 1, [line]);
    foldingIcon.isCollapsed = !foldingIcon.isCollapsed;
    const scrollTop = (foldingIcon.isCollapsed ? this._editor.getTopForLineNumber(foldingIcon.foldingEndLine) : this._editor.getTopForLineNumber(foldingIcon.foldingStartLine)) - this._editor.getOption(EditorOption.lineHeight) * stickyLine.index + 1;
    this._editor.setScrollTop(scrollTop);
    this._renderStickyScroll(line);
  }
  _readConfiguration() {
    const options = this._editor.getOption(EditorOption.stickyScroll);
    if (options.enabled === false) {
      this._editor.removeOverlayWidget(this._stickyScrollWidget);
      this._resetState();
      this._sessionStore.clear();
      this._enabled = false;
      return;
    } else if (options.enabled && !this._enabled) {
      this._editor.addOverlayWidget(this._stickyScrollWidget);
      this._sessionStore.add(this._editor.onDidScrollChange((e) => {
        if (e.scrollTopChanged) {
          this._showEndForLine = void 0;
          this._renderStickyScroll();
        }
      }));
      this._sessionStore.add(this._editor.onDidLayoutChange(() => this._onDidResize()));
      this._sessionStore.add(this._editor.onDidChangeModelTokens((e) => this._onTokensChange(e)));
      this._sessionStore.add(this._stickyLineCandidateProvider.onDidChangeStickyScroll(() => {
        this._showEndForLine = void 0;
        this._renderStickyScroll();
      }));
      this._enabled = true;
    }
    const lineNumberOption = this._editor.getOption(EditorOption.lineNumbers);
    if (lineNumberOption.renderType === RenderLineNumbersType.Relative) {
      this._sessionStore.add(this._editor.onDidChangeCursorPosition(() => {
        this._showEndForLine = void 0;
        this._renderStickyScroll(0);
      }));
    }
  }
  _readConfigurationChange(event) {
    if (event.hasChanged(EditorOption.stickyScroll) || event.hasChanged(EditorOption.minimap) || event.hasChanged(EditorOption.lineHeight) || event.hasChanged(EditorOption.showFoldingControls) || event.hasChanged(EditorOption.lineNumbers)) {
      this._readConfiguration();
    }
    if (event.hasChanged(EditorOption.lineNumbers) || event.hasChanged(EditorOption.folding) || event.hasChanged(EditorOption.showFoldingControls)) {
      this._renderStickyScroll(0);
    }
  }
  _needsUpdate(event) {
    const stickyLineNumbers = this._stickyScrollWidget.getCurrentLines();
    for (const stickyLineNumber of stickyLineNumbers) {
      for (const range of event.ranges) {
        if (stickyLineNumber >= range.fromLineNumber && stickyLineNumber <= range.toLineNumber) {
          return true;
        }
      }
    }
    return false;
  }
  _onTokensChange(event) {
    if (this._needsUpdate(event)) {
      this._renderStickyScroll(0);
    }
  }
  _onDidResize() {
    const layoutInfo = this._editor.getLayoutInfo();
    const theoreticalLines = layoutInfo.height / this._editor.getOption(EditorOption.lineHeight);
    this._maxStickyLines = Math.round(theoreticalLines * 0.25);
    this._renderStickyScroll(0);
  }
  async _renderStickyScroll(rebuildFromLine) {
    const model = this._editor.getModel();
    if (!model || model.isTooLargeForTokenization()) {
      this._resetState();
      return;
    }
    const nextRebuildFromLine = this._updateAndGetMinRebuildFromLine(rebuildFromLine);
    const stickyWidgetVersion = this._stickyLineCandidateProvider.getVersionId();
    const shouldUpdateState = stickyWidgetVersion === void 0 || stickyWidgetVersion === model.getVersionId();
    if (shouldUpdateState) {
      if (!this._focused) {
        await this._updateState(nextRebuildFromLine);
      } else {
        if (this._focusedStickyElementIndex === -1) {
          await this._updateState(nextRebuildFromLine);
          this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumberCount - 1;
          if (this._focusedStickyElementIndex !== -1) {
            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
          }
        } else {
          const focusedStickyElementLineNumber = this._stickyScrollWidget.lineNumbers[this._focusedStickyElementIndex];
          await this._updateState(nextRebuildFromLine);
          if (this._stickyScrollWidget.lineNumberCount === 0) {
            this._focusedStickyElementIndex = -1;
          } else {
            const previousFocusedLineNumberExists = this._stickyScrollWidget.lineNumbers.includes(focusedStickyElementLineNumber);
            if (!previousFocusedLineNumberExists) {
              this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumberCount - 1;
            }
            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
          }
        }
      }
    }
  }
  _updateAndGetMinRebuildFromLine(rebuildFromLine) {
    if (rebuildFromLine !== void 0) {
      const minRebuildFromLineOrInfinity = this._minRebuildFromLine !== void 0 ? this._minRebuildFromLine : Infinity;
      this._minRebuildFromLine = Math.min(rebuildFromLine, minRebuildFromLineOrInfinity);
    }
    return this._minRebuildFromLine;
  }
  async _updateState(rebuildFromLine) {
    this._minRebuildFromLine = void 0;
    this._foldingModel = await FoldingController.get(this._editor)?.getFoldingModel() ?? void 0;
    this._widgetState = this.findScrollWidgetState();
    const stickyWidgetHasLines = this._widgetState.startLineNumbers.length > 0;
    this._stickyScrollVisibleContextKey.set(stickyWidgetHasLines);
    this._stickyScrollWidget.setState(this._widgetState, this._foldingModel, rebuildFromLine);
  }
  async _resetState() {
    this._minRebuildFromLine = void 0;
    this._foldingModel = void 0;
    this._widgetState = StickyScrollWidgetState.Empty;
    this._stickyScrollVisibleContextKey.set(false);
    this._stickyScrollWidget.setState(void 0, void 0);
  }
  findScrollWidgetState() {
    if (!this._editor.hasModel()) {
      return StickyScrollWidgetState.Empty;
    }
    const textModel = this._editor.getModel();
    const maxNumberStickyLines = Math.min(this._maxStickyLines, this._editor.getOption(EditorOption.stickyScroll).maxLineCount);
    const scrollTop = this._editor.getScrollTop();
    let lastLineRelativePosition = 0;
    const startLineNumbers = [];
    const endLineNumbers = [];
    const arrayVisibleRanges = this._editor.getVisibleRanges();
    if (arrayVisibleRanges.length !== 0) {
      const fullVisibleRange = new StickyRange(arrayVisibleRanges[0].startLineNumber, arrayVisibleRanges[arrayVisibleRanges.length - 1].endLineNumber);
      const candidateRanges = this._stickyLineCandidateProvider.getCandidateStickyLinesIntersecting(fullVisibleRange);
      for (const range of candidateRanges) {
        const start = range.startLineNumber;
        const end = range.endLineNumber;
        const isValidRange = textModel.isValidRange({ startLineNumber: start, endLineNumber: end, startColumn: 1, endColumn: 1 });
        if (isValidRange && end - start > 0) {
          const topOfElement = range.top;
          const bottomOfElement = topOfElement + range.height;
          const topOfBeginningLine = this._editor.getTopForLineNumber(start) - scrollTop;
          const bottomOfEndLine = this._editor.getBottomForLineNumber(end) - scrollTop;
          if (topOfElement > topOfBeginningLine && topOfElement <= bottomOfEndLine) {
            startLineNumbers.push(start);
            endLineNumbers.push(end + 1);
            if (bottomOfElement > bottomOfEndLine) {
              lastLineRelativePosition = bottomOfEndLine - bottomOfElement;
            }
          }
          if (startLineNumbers.length === maxNumberStickyLines) {
            break;
          }
        }
      }
    }
    this._endLineNumbers = endLineNumbers;
    return new StickyScrollWidgetState(startLineNumbers, endLineNumbers, lastLineRelativePosition, this._showEndForLine);
  }
  dispose() {
    super.dispose();
    this._sessionStore.dispose();
  }
};
StickyScrollController = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILanguageConfigurationService),
  __decorateParam(5, ILanguageFeatureDebounceService),
  __decorateParam(6, IContextKeyService)
], StickyScrollController);
export {
  StickyScrollController
};
//# sourceMappingURL=stickyScrollController.js.map
