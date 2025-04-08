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
import { Emitter, Event } from "../../../../../base/common/event.js";
import * as UUID from "../../../../../base/common/uuid.js";
import * as editorCommon from "../../../../../editor/common/editorCommon.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { CellEditState, CellFindMatch, CellFoldingState, CellLayoutContext, CellLayoutState, EditorFoldingStateDelegate, ICellOutputViewModel, ICellViewModel, MarkupCellLayoutChangeEvent, MarkupCellLayoutInfo } from "../notebookBrowser.js";
import { BaseCellViewModel } from "./baseCellViewModel.js";
import { NotebookCellTextModel } from "../../common/model/notebookCellTextModel.js";
import { CellKind, INotebookFindOptions } from "../../common/notebookCommon.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { ViewContext } from "./viewContext.js";
import { IUndoRedoService } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { NotebookOptionsChangeEvent } from "../notebookOptions.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { NotebookCellStateChangedEvent, NotebookLayoutInfo } from "../notebookViewEvents.js";
import { IInlineChatSessionService } from "../../../inlineChat/browser/inlineChatSessionService.js";
let MarkupCellViewModel = class extends BaseCellViewModel {
  constructor(viewType, model, initialNotebookLayoutInfo, foldingDelegate, viewContext, configurationService, textModelService, undoRedoService, codeEditorService, inlineChatSessionService) {
    super(viewType, model, UUID.generateUuid(), viewContext, configurationService, textModelService, undoRedoService, codeEditorService, inlineChatSessionService);
    this.foldingDelegate = foldingDelegate;
    this.viewContext = viewContext;
    const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
    this._layoutInfo = {
      chatHeight: 0,
      editorHeight: 0,
      previewHeight: 0,
      fontInfo: initialNotebookLayoutInfo?.fontInfo || null,
      editorWidth: initialNotebookLayoutInfo?.width ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(initialNotebookLayoutInfo.width) : 0,
      commentOffset: 0,
      commentHeight: 0,
      bottomToolbarOffset: bottomToolbarGap,
      totalHeight: 100,
      layoutState: CellLayoutState.Uninitialized,
      foldHintHeight: 0,
      statusBarHeight: 0
    };
    this._register(this.onDidChangeState((e) => {
      this.viewContext.eventDispatcher.emit([new NotebookCellStateChangedEvent(e, this.model)]);
      if (e.foldingStateChanged) {
        this._updateTotalHeight(this._computeTotalHeight(), CellLayoutContext.Fold);
      }
    }));
  }
  static {
    __name(this, "MarkupCellViewModel");
  }
  cellKind = CellKind.Markup;
  _layoutInfo;
  _renderedHtml;
  get renderedHtml() {
    return this._renderedHtml;
  }
  set renderedHtml(value) {
    if (this._renderedHtml !== value) {
      this._renderedHtml = value;
      this._onDidChangeState.fire({ contentChanged: true });
    }
  }
  get layoutInfo() {
    return this._layoutInfo;
  }
  _previewHeight = 0;
  set renderedMarkdownHeight(newHeight) {
    this._previewHeight = newHeight;
    this._updateTotalHeight(this._computeTotalHeight());
  }
  _chatHeight = 0;
  set chatHeight(newHeight) {
    this._chatHeight = newHeight;
    this._updateTotalHeight(this._computeTotalHeight());
  }
  get chatHeight() {
    return this._chatHeight;
  }
  _editorHeight = 0;
  _statusBarHeight = 0;
  set editorHeight(newHeight) {
    this._editorHeight = newHeight;
    this._statusBarHeight = this.viewContext.notebookOptions.computeStatusBarHeight();
    this._updateTotalHeight(this._computeTotalHeight());
  }
  get editorHeight() {
    throw new Error("MarkdownCellViewModel.editorHeight is write only");
  }
  _onDidChangeLayout = this._register(new Emitter());
  onDidChangeLayout = this._onDidChangeLayout.event;
  get foldingState() {
    return this.foldingDelegate.getFoldingState(this.foldingDelegate.getCellIndex(this));
  }
  _hoveringOutput = false;
  get outputIsHovered() {
    return this._hoveringOutput;
  }
  set outputIsHovered(v) {
    this._hoveringOutput = v;
  }
  _focusOnOutput = false;
  get outputIsFocused() {
    return this._focusOnOutput;
  }
  set outputIsFocused(v) {
    this._focusOnOutput = v;
  }
  get inputInOutputIsFocused() {
    return false;
  }
  set inputInOutputIsFocused(_) {
  }
  _hoveringCell = false;
  get cellIsHovered() {
    return this._hoveringCell;
  }
  set cellIsHovered(v) {
    this._hoveringCell = v;
    this._onDidChangeState.fire({ cellIsHoveredChanged: true });
  }
  _computeTotalHeight() {
    const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
    const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
    const foldHintHeight = this._computeFoldHintHeight();
    if (this.getEditState() === CellEditState.Editing) {
      return this._editorHeight + layoutConfiguration.markdownCellTopMargin + layoutConfiguration.markdownCellBottomMargin + bottomToolbarGap + this._statusBarHeight + this._commentHeight;
    } else {
      return Math.max(1, this._previewHeight + bottomToolbarGap + foldHintHeight + this._commentHeight);
    }
  }
  _computeFoldHintHeight() {
    return this.getEditState() === CellEditState.Editing || this.foldingState !== CellFoldingState.Collapsed ? 0 : this.viewContext.notebookOptions.getLayoutConfiguration().markdownFoldHintHeight;
  }
  updateOptions(e) {
    super.updateOptions(e);
    if (e.cellStatusBarVisibility || e.insertToolbarPosition || e.cellToolbarLocation) {
      this._updateTotalHeight(this._computeTotalHeight());
    }
  }
  /**
   * we put outputs stuff here to make compiler happy
   */
  outputsViewModels = [];
  getOutputOffset(index) {
    return -1;
  }
  updateOutputHeight(index, height) {
  }
  triggerFoldingStateChange() {
    this._onDidChangeState.fire({ foldingStateChanged: true });
  }
  _updateTotalHeight(newHeight, context) {
    if (newHeight !== this.layoutInfo.totalHeight) {
      this.layoutChange({ totalHeight: newHeight, context });
    }
  }
  layoutChange(state) {
    let totalHeight;
    let foldHintHeight;
    if (!this.isInputCollapsed) {
      totalHeight = state.totalHeight === void 0 ? this._layoutInfo.layoutState === CellLayoutState.Uninitialized ? 100 : this._layoutInfo.totalHeight : state.totalHeight;
      foldHintHeight = this._computeFoldHintHeight();
    } else {
      totalHeight = this.viewContext.notebookOptions.computeCollapsedMarkdownCellHeight(this.viewType);
      state.totalHeight = totalHeight;
      foldHintHeight = 0;
    }
    let commentOffset;
    if (this.getEditState() === CellEditState.Editing) {
      const notebookLayoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
      commentOffset = notebookLayoutConfiguration.editorToolbarHeight + notebookLayoutConfiguration.cellTopMargin + this._chatHeight + this._editorHeight + this._statusBarHeight;
    } else {
      commentOffset = this._previewHeight;
    }
    this._layoutInfo = {
      fontInfo: state.font || this._layoutInfo.fontInfo,
      editorWidth: state.outerWidth !== void 0 ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(state.outerWidth) : this._layoutInfo.editorWidth,
      chatHeight: this._chatHeight,
      editorHeight: this._editorHeight,
      statusBarHeight: this._statusBarHeight,
      previewHeight: this._previewHeight,
      bottomToolbarOffset: this.viewContext.notebookOptions.computeBottomToolbarOffset(
        totalHeight,
        this.viewType
      ),
      totalHeight,
      layoutState: CellLayoutState.Measured,
      foldHintHeight,
      commentOffset,
      commentHeight: state.commentHeight ? this._commentHeight : this._layoutInfo.commentHeight
    };
    this._onDidChangeLayout.fire(state);
  }
  restoreEditorViewState(editorViewStates, totalHeight) {
    super.restoreEditorViewState(editorViewStates);
    if (totalHeight !== void 0 && this.layoutInfo.layoutState === CellLayoutState.Uninitialized) {
      this._layoutInfo = {
        ...this.layoutInfo,
        totalHeight,
        chatHeight: this._chatHeight,
        editorHeight: this._editorHeight,
        statusBarHeight: this._statusBarHeight,
        layoutState: CellLayoutState.FromCache
      };
      this.layoutChange({});
    }
  }
  getDynamicHeight() {
    return null;
  }
  getHeight(lineHeight) {
    if (this._layoutInfo.layoutState === CellLayoutState.Uninitialized) {
      return 100;
    } else {
      return this._layoutInfo.totalHeight;
    }
  }
  onDidChangeTextModelContent() {
    this._onDidChangeState.fire({ contentChanged: true });
  }
  onDeselect() {
  }
  _hasFindResult = this._register(new Emitter());
  hasFindResult = this._hasFindResult.event;
  startFind(value, options) {
    const matches = super.cellStartFind(value, options);
    if (matches === null) {
      return null;
    }
    return {
      cell: this,
      contentMatches: matches
    };
  }
  dispose() {
    super.dispose();
    this.foldingDelegate = null;
  }
};
MarkupCellViewModel = __decorateClass([
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, IUndoRedoService),
  __decorateParam(8, ICodeEditorService),
  __decorateParam(9, IInlineChatSessionService)
], MarkupCellViewModel);
export {
  MarkupCellViewModel
};
//# sourceMappingURL=markupCellViewModel.js.map
