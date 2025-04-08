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
import { Disposable, IDisposable, toDisposable } from "../../../../../../base/common/lifecycle.js";
import { autorun, debouncedObservable, IObservable, ISettableObservable, observableFromEvent, observableValue } from "../../../../../../base/common/observable.js";
import { basename } from "../../../../../../base/common/resources.js";
import { assertType } from "../../../../../../base/common/types.js";
import { LineRange } from "../../../../../../editor/common/core/lineRange.js";
import { Range } from "../../../../../../editor/common/core/range.js";
import { nullDocumentDiff } from "../../../../../../editor/common/diff/documentDiffProvider.js";
import { localize } from "../../../../../../nls.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { MenuId } from "../../../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IEditorPane, IResourceDiffEditorInput } from "../../../../../common/editor.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { NotebookDeletedCellDecorator } from "../../../../notebook/browser/diff/inlineDiff/notebookDeletedCellDecorator.js";
import { NotebookInsertedCellDecorator } from "../../../../notebook/browser/diff/inlineDiff/notebookInsertedCellDecorator.js";
import { NotebookModifiedCellDecorator } from "../../../../notebook/browser/diff/inlineDiff/notebookModifiedCellDecorator.js";
import { INotebookTextDiffEditor } from "../../../../notebook/browser/diff/notebookDiffEditorBrowser.js";
import { getNotebookEditorFromEditorPane, ICellViewModel, INotebookEditor } from "../../../../notebook/browser/notebookBrowser.js";
import { INotebookEditorService } from "../../../../notebook/browser/services/notebookEditorService.js";
import { NotebookCellTextModel } from "../../../../notebook/common/model/notebookCellTextModel.js";
import { NotebookTextModel } from "../../../../notebook/common/model/notebookTextModel.js";
import { CellKind } from "../../../../notebook/common/notebookCommon.js";
import { IChatAgentService } from "../../../common/chatAgents.js";
import { IModifiedFileEntryChangeHunk, IModifiedFileEntryEditorIntegration } from "../../../common/chatEditingService.js";
import { ChatAgentLocation } from "../../../common/constants.js";
import { ChatEditingCodeEditorIntegration, IDocumentDiff2 } from "../chatEditingCodeEditorIntegration.js";
import { ChatEditingModifiedNotebookEntry } from "../chatEditingModifiedNotebookEntry.js";
import { countChanges, ICellDiffInfo, sortCellChanges } from "./notebookCellChanges.js";
let ChatEditingNotebookEditorIntegration = class extends Disposable {
  constructor(_entry, editor, notebookModel, originalModel, cellChanges, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    const notebookEditor = getNotebookEditorFromEditorPane(editor);
    assertType(notebookEditor);
    this.notebookEditor = notebookEditor;
    this.integration = this.instantiationService.createInstance(ChatEditingNotebookEditorWidgetIntegration, _entry, notebookEditor, notebookModel, originalModel, cellChanges);
    this._register(editor.onDidChangeControl(() => {
      const notebookEditor2 = getNotebookEditorFromEditorPane(editor);
      if (notebookEditor2 && notebookEditor2 !== this.notebookEditor) {
        this.notebookEditor = notebookEditor2;
        this.integration.dispose();
        this.integration = this.instantiationService.createInstance(ChatEditingNotebookEditorWidgetIntegration, _entry, notebookEditor2, notebookModel, originalModel, cellChanges);
      }
    }));
  }
  static {
    __name(this, "ChatEditingNotebookEditorIntegration");
  }
  integration;
  notebookEditor;
  get currentIndex() {
    return this.integration.currentIndex;
  }
  reveal(firstOrLast) {
    return this.integration.reveal(firstOrLast);
  }
  next(wrap) {
    return this.integration.next(wrap);
  }
  previous(wrap) {
    return this.integration.previous(wrap);
  }
  enableAccessibleDiffView() {
    this.integration.enableAccessibleDiffView();
  }
  acceptNearestChange(change) {
    return this.integration.acceptNearestChange(change);
  }
  rejectNearestChange(change) {
    return this.integration.rejectNearestChange(change);
  }
  toggleDiff(change) {
    return this.integration.toggleDiff(change);
  }
  dispose() {
    this.integration.dispose();
    super.dispose();
  }
};
ChatEditingNotebookEditorIntegration = __decorateClass([
  __decorateParam(5, IInstantiationService)
], ChatEditingNotebookEditorIntegration);
let ChatEditingNotebookEditorWidgetIntegration = class extends Disposable {
  constructor(_entry, notebookEditor, notebookModel, originalModel, cellChanges, instantiationService, _editorService, _chatAgentService, notebookEditorService, accessibilitySignalService) {
    super();
    this._entry = _entry;
    this.notebookEditor = notebookEditor;
    this.notebookModel = notebookModel;
    this.cellChanges = cellChanges;
    this.instantiationService = instantiationService;
    this._editorService = _editorService;
    this._chatAgentService = _chatAgentService;
    this.accessibilitySignalService = accessibilitySignalService;
    const onDidChangeVisibleRanges = debouncedObservable(observableFromEvent(notebookEditor.onDidChangeVisibleRanges, () => notebookEditor.visibleRanges), 50);
    this._register(toDisposable(() => {
      this.markupCellListeners.forEach((v) => v.dispose());
    }));
    let originalReadonly = void 0;
    const shouldBeReadonly = _entry.isCurrentlyBeingModifiedBy.map((value) => !!value);
    this._register(autorun((r) => {
      const isReadOnly = shouldBeReadonly.read(r);
      const notebookEditor2 = notebookEditorService.retrieveExistingWidgetFromURI(_entry.modifiedURI)?.value;
      if (!notebookEditor2) {
        return;
      }
      originalReadonly ??= notebookEditor2.isReadOnly;
      if (isReadOnly) {
        notebookEditor2.setOptions({ isReadOnly: true });
      } else if (originalReadonly === false) {
        notebookEditor2.setOptions({ isReadOnly: false });
        const timeout = setTimeout(() => {
          notebookEditor2.setOptions({ isReadOnly: true });
          notebookEditor2.setOptions({ isReadOnly: false });
          disposable.dispose();
        }, 100);
        const disposable = toDisposable(() => clearTimeout(timeout));
        this._register(disposable);
      }
    }));
    let lastModifyingRequestId;
    this._store.add(autorun((r) => {
      if (!_entry.isCurrentlyBeingModifiedBy.read(r) && !_entry.isProcessingResponse.read(r) && lastModifyingRequestId !== _entry.lastModifyingRequestId && cellChanges.read(r).some((c) => c.type !== "unchanged" && !c.diff.read(r).identical)) {
        lastModifyingRequestId = _entry.lastModifyingRequestId;
        this.reveal(true);
      }
    }));
    this._register(autorun((r) => {
      if (this.notebookEditor.textModel !== this.notebookModel) {
        return;
      }
      const sortedCellChanges = sortCellChanges(cellChanges.read(r));
      const changes = sortedCellChanges.filter((c) => c.type !== "delete");
      onDidChangeVisibleRanges.read(r);
      if (!changes.length) {
        this.cellEditorIntegrations.forEach(({ diff }) => {
          diff.set({ ...diff.get(), ...nullDocumentDiff }, void 0);
        });
        return;
      }
      this.mdCellEditorAttached.read(r);
      const validCells = /* @__PURE__ */ new Set();
      changes.forEach((change) => {
        if (change.modifiedCellIndex === void 0 || change.modifiedCellIndex >= notebookModel.cells.length) {
          return;
        }
        const cell = notebookModel.cells[change.modifiedCellIndex];
        const editor = notebookEditor.codeEditors.find(([vm]) => vm.handle === notebookModel.cells[change.modifiedCellIndex].handle)?.[1];
        const modifiedModel = change.modifiedModel.promiseResult.read(r)?.data;
        const originalModel2 = change.originalModel.promiseResult.read(r)?.data;
        if (!cell || !originalModel2 || !modifiedModel) {
          return;
        }
        if (!editor) {
          if (!this.markupCellListeners.has(cell.handle) && cell.cellKind === CellKind.Markup) {
            const cellModel = this.notebookEditor.getViewModel()?.viewCells.find((c) => c.handle === cell.handle);
            if (cellModel) {
              const listener = cellModel.onDidChangeEditorAttachState(() => {
                if (cellModel.editorAttached) {
                  this.mdCellEditorAttached.set(cell.handle, void 0);
                  listener.dispose();
                  this.markupCellListeners.delete(cell.handle);
                }
              });
              this.markupCellListeners.set(cell.handle, listener);
            }
          }
          return;
        }
        const diff = {
          ...change.diff.read(r),
          modifiedModel,
          originalModel: originalModel2,
          keep: change.keep,
          undo: change.undo
        };
        validCells.add(cell);
        const currentDiff = this.cellEditorIntegrations.get(cell);
        if (currentDiff) {
          if (!areDocumentDiff2Equal(currentDiff.diff.get(), diff)) {
            currentDiff.diff.set(diff, void 0);
          }
        } else {
          const diff2 = observableValue(`diff${cell.handle}`, diff);
          const integration = this.instantiationService.createInstance(ChatEditingCodeEditorIntegration, _entry, editor, diff2);
          this.cellEditorIntegrations.set(cell, { integration, diff: diff2 });
          this._register(integration);
          this._register(editor.onDidDispose(() => {
            this.cellEditorIntegrations.get(cell)?.integration.dispose();
            this.cellEditorIntegrations.delete(cell);
          }));
          this._register(editor.onDidChangeModel(() => {
            if (editor.getModel() !== cell.textModel) {
              this.cellEditorIntegrations.get(cell)?.integration.dispose();
              this.cellEditorIntegrations.delete(cell);
            }
          }));
        }
      });
      this.cellEditorIntegrations.forEach((v, cell) => {
        if (!validCells.has(cell)) {
          v.integration.dispose();
          this.cellEditorIntegrations.delete(cell);
        }
      });
    }));
    this._register(autorun((r) => {
      const currentChange = this.currentChange.read(r);
      if (!currentChange) {
        this._currentIndex.set(-1, void 0);
        return;
      }
      let index = 0;
      const sortedCellChanges = sortCellChanges(cellChanges.read(r));
      for (const change of sortedCellChanges) {
        if (currentChange && currentChange.change === change) {
          if (change.type === "modified") {
            index += currentChange.index;
          }
          break;
        }
        if (change.type === "insert" || change.type === "delete") {
          index++;
        } else if (change.type === "modified") {
          index += change.diff.read(r).changes.length;
        }
      }
      this._currentIndex.set(index, void 0);
    }));
    const cellsAreVisible = onDidChangeVisibleRanges.map((v) => v.length > 0);
    const debouncedChanges = debouncedObservable(cellChanges, 10);
    this._register(autorun((r) => {
      if (this.notebookEditor.textModel !== this.notebookModel || !cellsAreVisible.read(r) || !this.notebookEditor.getViewModel()) {
        return;
      }
      const changes = debouncedChanges.read(r).filter((c) => c.type === "insert" ? !c.diff.read(r).identical : true);
      const modifiedChanges = changes.filter((c) => c.type === "modified");
      this.createDecorators();
      this.insertedCellDecorator?.apply(changes);
      this.modifiedCellDecorator?.apply(modifiedChanges);
      this.deletedCellDecorator?.apply(changes, originalModel);
    }));
  }
  static {
    __name(this, "ChatEditingNotebookEditorWidgetIntegration");
  }
  _currentIndex = observableValue(this, -1);
  currentIndex = this._currentIndex;
  _currentChange = observableValue(this, void 0);
  currentChange = this._currentChange;
  deletedCellDecorator;
  insertedCellDecorator;
  modifiedCellDecorator;
  cellEditorIntegrations = /* @__PURE__ */ new Map();
  mdCellEditorAttached = observableValue(this, -1);
  markupCellListeners = /* @__PURE__ */ new Map();
  createDecorators() {
    const cellChanges = this.cellChanges.get();
    const accessibilitySignalService = this.accessibilitySignalService;
    this.insertedCellDecorator ??= this._register(this.instantiationService.createInstance(NotebookInsertedCellDecorator, this.notebookEditor));
    this.modifiedCellDecorator ??= this._register(this.instantiationService.createInstance(NotebookModifiedCellDecorator, this.notebookEditor));
    if (this.deletedCellDecorator) {
      this._store.delete(this.deletedCellDecorator);
      this.deletedCellDecorator.dispose();
    }
    this.deletedCellDecorator = this._register(this.instantiationService.createInstance(NotebookDeletedCellDecorator, this.notebookEditor, {
      className: "chat-diff-change-content-widget",
      telemetrySource: "chatEditingNotebookHunk",
      menuId: MenuId.ChatEditingEditorHunk,
      argFactory: /* @__PURE__ */ __name((deletedCellIndex) => {
        return {
          accept() {
            const entry = cellChanges.find((c) => c.type === "delete" && c.originalCellIndex === deletedCellIndex);
            if (entry) {
              return entry.keep(entry.diff.get().changes[0]);
            }
            accessibilitySignalService.playSignal(AccessibilitySignal.editsKept, { allowManyInParallel: true });
            return Promise.resolve(true);
          },
          reject() {
            const entry = cellChanges.find((c) => c.type === "delete" && c.originalCellIndex === deletedCellIndex);
            if (entry) {
              return entry.undo(entry.diff.get().changes[0]);
            }
            accessibilitySignalService.playSignal(AccessibilitySignal.editsUndone, { allowManyInParallel: true });
            return Promise.resolve(true);
          }
        };
      }, "argFactory")
    }));
  }
  getCell(modifiedCellIndex) {
    const cell = this.notebookModel.cells[modifiedCellIndex];
    const integration = this.cellEditorIntegrations.get(cell)?.integration;
    return integration;
  }
  reveal(firstOrLast) {
    const changes = sortCellChanges(this.cellChanges.get().filter((c) => c.type !== "unchanged"));
    if (!changes.length) {
      return void 0;
    }
    const change = firstOrLast ? changes[0] : changes[changes.length - 1];
    this._revealFirstOrLast(change, firstOrLast);
  }
  _revealFirstOrLast(change, firstOrLast = true) {
    switch (change.type) {
      case "insert":
      case "modified": {
        const index = firstOrLast || change.type === "insert" ? 0 : change.diff.get().changes.length - 1;
        const cellIntegration = this.getCell(change.modifiedCellIndex);
        if (cellIntegration) {
          cellIntegration.reveal(firstOrLast);
          this._currentChange.set({ change, index }, void 0);
          return true;
        } else {
          return this._revealChange(change, index);
        }
      }
      case "delete":
        this.deletedCellDecorator?.reveal(change.originalCellIndex);
        this._currentChange.set({ change, index: 0 }, void 0);
        return true;
      default:
        break;
    }
    return false;
  }
  _revealChange(change, indexInCell) {
    switch (change.type) {
      case "insert":
      case "modified": {
        const textChange = change.diff.get().changes[indexInCell];
        const cellViewModel = this.getCellViewModel(change);
        if (cellViewModel) {
          this.revealChangeInView(cellViewModel, textChange?.modified);
          this._currentChange.set({ change, index: indexInCell }, void 0);
        }
        return true;
      }
      case "delete":
        this.deletedCellDecorator?.reveal(change.originalCellIndex);
        this._currentChange.set({ change, index: 0 }, void 0);
        return true;
      default:
        break;
    }
    return false;
  }
  getCellViewModel(change) {
    if (change.type === "delete" || change.modifiedCellIndex === void 0) {
      return void 0;
    }
    const cell = this.notebookModel.cells[change.modifiedCellIndex];
    const cellViewModel = this.notebookEditor.getViewModel()?.viewCells.find((c) => c.handle === cell.handle);
    return cellViewModel;
  }
  async revealChangeInView(cell, lines) {
    const targetLines = lines ?? new LineRange(0, 0);
    await this.notebookEditor.focusNotebookCell(cell, "container", { focusEditorLine: targetLines.startLineNumber });
    await this.notebookEditor.revealRangeInCenterAsync(cell, new Range(targetLines.startLineNumber, 0, targetLines.endLineNumberExclusive, 0));
  }
  next(wrap) {
    const changes = sortCellChanges(this.cellChanges.get().filter((c) => c.type !== "unchanged"));
    const currentChange = this.currentChange.get();
    if (!currentChange) {
      const firstChange = changes[0];
      if (firstChange) {
        return this._revealFirstOrLast(firstChange);
      }
      return false;
    }
    switch (currentChange.change.type) {
      case "modified":
        {
          const cellIntegration = this.getCell(currentChange.change.modifiedCellIndex);
          if (cellIntegration) {
            if (cellIntegration.next(false)) {
              this._currentChange.set({ change: currentChange.change, index: cellIntegration.currentIndex.get() }, void 0);
              return true;
            }
          }
          const isLastChangeInCell = currentChange.index === lastChangeIndex(currentChange.change);
          const index = isLastChangeInCell ? 0 : currentChange.index + 1;
          const change = isLastChangeInCell ? changes[changes.indexOf(currentChange.change) + 1] : currentChange.change;
          if (change) {
            return this._revealChange(change, index);
          }
        }
        break;
      case "insert":
      case "delete":
        {
          const nextChange = changes[changes.indexOf(currentChange.change) + 1];
          if (nextChange) {
            return this._revealFirstOrLast(nextChange, true);
          }
        }
        break;
      default:
        break;
    }
    if (wrap) {
      return this.next(false);
    }
    return false;
  }
  previous(wrap) {
    const changes = sortCellChanges(this.cellChanges.get().filter((c) => c.type !== "unchanged"));
    const currentChange = this.currentChange.get();
    if (!currentChange) {
      const lastChange = changes[changes.length - 1];
      if (lastChange) {
        return this._revealFirstOrLast(lastChange, false);
      }
      return false;
    }
    switch (currentChange.change.type) {
      case "modified":
        {
          const cellIntegration = this.getCell(currentChange.change.modifiedCellIndex);
          if (cellIntegration) {
            if (cellIntegration.previous(false)) {
              this._currentChange.set({ change: currentChange.change, index: cellIntegration.currentIndex.get() }, void 0);
              return true;
            }
          }
          const isFirstChangeInCell = currentChange.index === 0;
          const change = isFirstChangeInCell ? changes[changes.indexOf(currentChange.change) - 1] : currentChange.change;
          if (change) {
            const index = isFirstChangeInCell ? lastChangeIndex(change) : currentChange.index - 1;
            return this._revealChange(change, index);
          }
        }
        break;
      case "insert":
      case "delete":
        {
          const prevChange = changes[changes.indexOf(currentChange.change) - 1];
          if (prevChange) {
            return this._revealFirstOrLast(prevChange, false);
          }
        }
        break;
      default:
        break;
    }
    if (wrap) {
      const lastChange = changes[changes.length - 1];
      if (lastChange) {
        return this._revealFirstOrLast(lastChange, false);
      }
    }
    return false;
  }
  enableAccessibleDiffView() {
    const cell = this.notebookEditor.getActiveCell()?.model;
    if (cell) {
      const integration = this.cellEditorIntegrations.get(cell)?.integration;
      integration?.enableAccessibleDiffView();
    }
  }
  async acceptNearestChange(change) {
    await change.accept();
    this.next(true);
  }
  async rejectNearestChange(change) {
    await change.reject();
    this.next(true);
  }
  async toggleDiff(_change) {
    const defaultAgentName = this._chatAgentService.getDefaultAgent(ChatAgentLocation.Panel)?.fullName;
    const diffInput = {
      original: { resource: this._entry.originalURI, options: { selection: void 0 } },
      modified: { resource: this._entry.modifiedURI, options: { selection: void 0 } },
      label: defaultAgentName ? localize("diff.agent", "{0} (changes from {1})", basename(this._entry.modifiedURI), defaultAgentName) : localize("diff.generic", "{0} (changes from chat)", basename(this._entry.modifiedURI))
    };
    await this._editorService.openEditor(diffInput);
  }
};
ChatEditingNotebookEditorWidgetIntegration = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IChatAgentService),
  __decorateParam(8, INotebookEditorService),
  __decorateParam(9, IAccessibilitySignalService)
], ChatEditingNotebookEditorWidgetIntegration);
class ChatEditingNotebookDiffEditorIntegration extends Disposable {
  constructor(notebookDiffEditor, cellChanges) {
    super();
    this.notebookDiffEditor = notebookDiffEditor;
    this.cellChanges = cellChanges;
    this._store.add(autorun((r) => {
      const index = notebookDiffEditor.currentChangedIndex.read(r);
      const numberOfCellChanges = cellChanges.read(r).filter((c) => !c.diff.read(r).identical);
      if (numberOfCellChanges.length && index >= 0 && index < numberOfCellChanges.length) {
        const changesSoFar = countChanges(numberOfCellChanges.slice(0, index + 1));
        this._currentIndex.set(changesSoFar - 1, void 0);
      } else {
        this._currentIndex.set(-1, void 0);
      }
    }));
  }
  static {
    __name(this, "ChatEditingNotebookDiffEditorIntegration");
  }
  _currentIndex = observableValue(this, -1);
  currentIndex = this._currentIndex;
  reveal(firstOrLast) {
    const changes = sortCellChanges(this.cellChanges.get().filter((c) => c.type !== "unchanged"));
    if (!changes.length) {
      return void 0;
    }
    if (firstOrLast) {
      this.notebookDiffEditor.firstChange();
    } else {
      this.notebookDiffEditor.lastChange();
    }
  }
  next(_wrap) {
    const changes = this.cellChanges.get().filter((c) => !c.diff.get().identical).length;
    if (this.notebookDiffEditor.currentChangedIndex.get() === changes - 1) {
      return false;
    }
    this.notebookDiffEditor.nextChange();
    return true;
  }
  previous(_wrap) {
    const changes = this.cellChanges.get().filter((c) => !c.diff.get().identical).length;
    if (this.notebookDiffEditor.currentChangedIndex.get() === changes - 1) {
      return false;
    }
    this.notebookDiffEditor.nextChange();
    return true;
  }
  enableAccessibleDiffView() {
  }
  async acceptNearestChange(change) {
    await change.accept();
    this.next(true);
  }
  async rejectNearestChange(change) {
    await change.reject();
    this.next(true);
  }
  async toggleDiff(_change) {
  }
}
function areDocumentDiff2Equal(diff1, diff2) {
  if (diff1.changes !== diff2.changes) {
    return false;
  }
  if (diff1.identical !== diff2.identical) {
    return false;
  }
  if (diff1.moves !== diff2.moves) {
    return false;
  }
  if (diff1.originalModel !== diff2.originalModel) {
    return false;
  }
  if (diff1.modifiedModel !== diff2.modifiedModel) {
    return false;
  }
  if (diff1.keep !== diff2.keep) {
    return false;
  }
  if (diff1.undo !== diff2.undo) {
    return false;
  }
  if (diff1.quitEarly !== diff2.quitEarly) {
    return false;
  }
  return true;
}
__name(areDocumentDiff2Equal, "areDocumentDiff2Equal");
function lastChangeIndex(change) {
  if (change.type === "modified") {
    return change.diff.get().changes.length - 1;
  }
  return 0;
}
__name(lastChangeIndex, "lastChangeIndex");
export {
  ChatEditingNotebookDiffEditorIntegration,
  ChatEditingNotebookEditorIntegration
};
//# sourceMappingURL=chatEditingNotebookEditorIntegration.js.map
