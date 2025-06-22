var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore, toDisposable } from "../../../../../../base/common/lifecycle.js";
import { autorunWithStore, derived, observableFromEvent } from "../../../../../../base/common/observable.js";
import { ThrottledDelayer } from "../../../../../../base/common/async.js";
import { IEditorWorkerService } from "../../../../../../editor/common/services/editorWorker.js";
import { themeColorFromId } from "../../../../../../base/common/themables.js";
import { RenderOptions, LineSource, renderLines } from "../../../../../../editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines.js";
import { diffAddDecoration, diffWholeLineAddDecoration, diffDeleteDecoration } from "../../../../../../editor/browser/widget/diffEditor/registrations.contribution.js";
import { OverviewRulerLane } from "../../../../../../editor/common/model.js";
import { ModelDecorationOptions } from "../../../../../../editor/common/model/textModel.js";
import { InlineDecoration } from "../../../../../../editor/common/viewModel.js";
import { Range } from "../../../../../../editor/common/core/range.js";
import { minimapGutterAddedBackground, minimapGutterDeletedBackground, minimapGutterModifiedBackground, overviewRulerAddedForeground, overviewRulerDeletedForeground, overviewRulerModifiedForeground } from "../../../../scm/common/quickDiff.js";
import { INotebookOriginalCellModelFactory } from "./notebookOriginalCellModelFactory.js";
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
let NotebookCellDiffDecorator = class NotebookCellDiffDecorator2 extends DisposableStore {
  static {
    __name(this, "NotebookCellDiffDecorator");
  }
  constructor(notebookEditor, modifiedCell, originalCell, editor, _editorWorkerService, originalCellModelFactory) {
    super();
    this.modifiedCell = modifiedCell;
    this.originalCell = originalCell;
    this.editor = editor;
    this._editorWorkerService = _editorWorkerService;
    this.originalCellModelFactory = originalCellModelFactory;
    this._viewZones = [];
    this.throttledDecorator = new ThrottledDelayer(50);
    this.perEditorDisposables = this.add(new DisposableStore());
    const onDidChangeVisibleRanges = observableFromEvent(notebookEditor.onDidChangeVisibleRanges, () => notebookEditor.visibleRanges);
    const editorObs = derived((r) => {
      const visibleRanges = onDidChangeVisibleRanges.read(r);
      const visibleCellHandles = visibleRanges.map((range) => notebookEditor.getCellsInRange(range)).flat().map((c) => c.handle);
      if (!visibleCellHandles.includes(modifiedCell.handle)) {
        return;
      }
      const editor2 = notebookEditor.codeEditors.find((item) => item[0].handle === modifiedCell.handle)?.[1];
      if (editor2?.getModel() !== this.modifiedCell.textModel) {
        return;
      }
      return editor2;
    });
    this.add(autorunWithStore((r, store) => {
      const editor2 = editorObs.read(r);
      this.perEditorDisposables.clear();
      if (editor2) {
        store.add(editor2.onDidChangeModel(() => {
          this.perEditorDisposables.clear();
        }));
        store.add(editor2.onDidChangeModelContent(() => {
          this.update(editor2);
        }));
        store.add(editor2.onDidChangeConfiguration((e) => {
          if (e.hasChanged(
            55
            /* EditorOption.fontInfo */
          ) || e.hasChanged(
            71
            /* EditorOption.lineHeight */
          )) {
            this.update(editor2);
          }
        }));
        this.update(editor2);
      }
    }));
  }
  update(editor) {
    this.throttledDecorator.trigger(() => this._updateImpl(editor));
  }
  async _updateImpl(editor) {
    if (this.isDisposed) {
      return;
    }
    if (editor.getOption(
      66
      /* EditorOption.inDiffEditor */
    )) {
      this.perEditorDisposables.clear();
      return;
    }
    const model = editor.getModel();
    if (!model || model !== this.modifiedCell.textModel) {
      this.perEditorDisposables.clear();
      return;
    }
    const originalModel = this.getOrCreateOriginalModel(editor);
    if (!originalModel) {
      this.perEditorDisposables.clear();
      return;
    }
    const version = model.getVersionId();
    const diff = await this._editorWorkerService.computeDiff(originalModel.uri, model.uri, { computeMoves: true, ignoreTrimWhitespace: false, maxComputationTimeMs: Number.MAX_SAFE_INTEGER }, "advanced");
    if (this.isDisposed) {
      return;
    }
    if (diff && !diff.identical && this.modifiedCell.textModel && originalModel && model === editor.getModel() && editor.getModel()?.getVersionId() === version) {
      this._updateWithDiff(editor, originalModel, diff, this.modifiedCell.textModel);
    } else {
      this.perEditorDisposables.clear();
    }
  }
  getOrCreateOriginalModel(editor) {
    if (!this._originalModel) {
      const model = editor.getModel();
      if (!model) {
        return;
      }
      this._originalModel = this.add(this.originalCellModelFactory.getOrCreate(model.uri, this.originalCell.getValue(), model.getLanguageId(), this.modifiedCell.cellKind)).object;
    }
    return this._originalModel;
  }
  _updateWithDiff(editor, originalModel, diff, currentModel) {
    if (areDiffsEqual(diff, this.diffForPreviouslyAppliedDecorators)) {
      return;
    }
    this.perEditorDisposables.clear();
    const decorations = editor.createDecorationsCollection();
    this.perEditorDisposables.add(toDisposable(() => {
      editor.changeViewZones((viewZoneChangeAccessor) => {
        for (const id of this._viewZones) {
          viewZoneChangeAccessor.removeZone(id);
        }
      });
      this._viewZones = [];
      decorations.clear();
      this.diffForPreviouslyAppliedDecorators = void 0;
    }));
    this.diffForPreviouslyAppliedDecorators = diff;
    const chatDiffAddDecoration = ModelDecorationOptions.createDynamic({
      ...diffAddDecoration,
      stickiness: 1
      /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
    });
    const chatDiffWholeLineAddDecoration = ModelDecorationOptions.createDynamic({
      ...diffWholeLineAddDecoration,
      stickiness: 1
    });
    const createOverviewDecoration = /* @__PURE__ */ __name((overviewRulerColor, minimapColor) => {
      return ModelDecorationOptions.createDynamic({
        description: "chat-editing-decoration",
        overviewRuler: { color: themeColorFromId(overviewRulerColor), position: OverviewRulerLane.Left },
        minimap: {
          color: themeColorFromId(minimapColor),
          position: 2
          /* MinimapPosition.Gutter */
        }
      });
    }, "createOverviewDecoration");
    const modifiedDecoration = createOverviewDecoration(overviewRulerModifiedForeground, minimapGutterModifiedBackground);
    const addedDecoration = createOverviewDecoration(overviewRulerAddedForeground, minimapGutterAddedBackground);
    const deletedDecoration = createOverviewDecoration(overviewRulerDeletedForeground, minimapGutterDeletedBackground);
    editor.changeViewZones((viewZoneChangeAccessor) => {
      for (const id of this._viewZones) {
        viewZoneChangeAccessor.removeZone(id);
      }
      this._viewZones = [];
      const modifiedVisualDecorations = [];
      const mightContainNonBasicASCII = originalModel.mightContainNonBasicASCII();
      const mightContainRTL = originalModel.mightContainRTL();
      const renderOptions = RenderOptions.fromEditor(this.editor);
      const editorLineCount = currentModel.getLineCount();
      for (const diffEntry of diff.changes) {
        const originalRange = diffEntry.original;
        originalModel.tokenization.forceTokenization(Math.max(1, originalRange.endLineNumberExclusive - 1));
        const source = new LineSource(originalRange.mapToLineArray((l) => originalModel.tokenization.getLineTokens(l)), [], mightContainNonBasicASCII, mightContainRTL);
        const decorations2 = [];
        for (const i of diffEntry.innerChanges || []) {
          decorations2.push(new InlineDecoration(
            i.originalRange.delta(-(diffEntry.original.startLineNumber - 1)),
            diffDeleteDecoration.className,
            0
            /* InlineDecorationType.Regular */
          ));
          if (!(i.originalRange.isEmpty() && i.originalRange.startLineNumber === 1 && i.modifiedRange.endLineNumber === editorLineCount) && !i.modifiedRange.isEmpty()) {
            modifiedVisualDecorations.push({
              range: i.modifiedRange,
              options: chatDiffAddDecoration
            });
          }
        }
        const isCreatedContent = decorations2.length === 1 && decorations2[0].range.isEmpty() && diffEntry.original.startLineNumber === 1;
        if (!diffEntry.modified.isEmpty && !(isCreatedContent && diffEntry.modified.endLineNumberExclusive - 1 === editorLineCount)) {
          modifiedVisualDecorations.push({
            range: diffEntry.modified.toInclusiveRange(),
            options: chatDiffWholeLineAddDecoration
          });
        }
        if (diffEntry.original.isEmpty) {
          modifiedVisualDecorations.push({
            range: diffEntry.modified.toInclusiveRange(),
            options: addedDecoration
          });
        } else if (diffEntry.modified.isEmpty) {
          modifiedVisualDecorations.push({
            range: new Range(diffEntry.modified.startLineNumber - 1, 1, diffEntry.modified.startLineNumber, 1),
            options: deletedDecoration
          });
        } else {
          modifiedVisualDecorations.push({
            range: diffEntry.modified.toInclusiveRange(),
            options: modifiedDecoration
          });
        }
        const domNode = document.createElement("div");
        domNode.className = "chat-editing-original-zone view-lines line-delete monaco-mouse-cursor-text";
        const result = renderLines(source, renderOptions, decorations2, domNode);
        if (!isCreatedContent) {
          const viewZoneData = {
            afterLineNumber: diffEntry.modified.startLineNumber - 1,
            heightInLines: result.heightInLines,
            domNode,
            ordinal: 5e4 + 2
            // more than https://github.com/microsoft/vscode/blob/bf52a5cfb2c75a7327c9adeaefbddc06d529dcad/src/vs/workbench/contrib/inlineChat/browser/inlineChatZoneWidget.ts#L42
          };
          this._viewZones.push(viewZoneChangeAccessor.addZone(viewZoneData));
        }
      }
      decorations.set(modifiedVisualDecorations);
    });
  }
};
NotebookCellDiffDecorator = __decorate([
  __param(4, IEditorWorkerService),
  __param(5, INotebookOriginalCellModelFactory)
], NotebookCellDiffDecorator);
function areDiffsEqual(a, b) {
  if (a && b) {
    if (a.changes.length !== b.changes.length) {
      return false;
    }
    if (a.moves.length !== b.moves.length) {
      return false;
    }
    if (!areLineRangeMappinsEqual(a.changes, b.changes)) {
      return false;
    }
    if (!a.moves.some((move, i) => {
      const bMove = b.moves[i];
      if (!areLineRangeMappinsEqual(move.changes, bMove.changes)) {
        return true;
      }
      if (move.lineRangeMapping.changedLineCount !== bMove.lineRangeMapping.changedLineCount) {
        return true;
      }
      if (!move.lineRangeMapping.modified.equals(bMove.lineRangeMapping.modified)) {
        return true;
      }
      if (!move.lineRangeMapping.original.equals(bMove.lineRangeMapping.original)) {
        return true;
      }
      return false;
    })) {
      return false;
    }
    return true;
  } else if (!a && !b) {
    return true;
  } else {
    return false;
  }
}
__name(areDiffsEqual, "areDiffsEqual");
function areLineRangeMappinsEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  if (a.some((c, i) => {
    const bChange = b[i];
    if (c.changedLineCount !== bChange.changedLineCount) {
      return true;
    }
    if ((c.innerChanges || []).length !== (bChange.innerChanges || []).length) {
      return true;
    }
    if ((c.innerChanges || []).some((innerC, innerIdx) => {
      const bInnerC = bChange.innerChanges[innerIdx];
      if (!innerC.modifiedRange.equalsRange(bInnerC.modifiedRange)) {
        return true;
      }
      if (!innerC.originalRange.equalsRange(bInnerC.originalRange)) {
        return true;
      }
      return false;
    })) {
      return true;
    }
    return false;
  })) {
    return false;
  }
  return true;
}
__name(areLineRangeMappinsEqual, "areLineRangeMappinsEqual");
export {
  NotebookCellDiffDecorator
};
//# sourceMappingURL=notebookCellDiffDecorator.js.map
