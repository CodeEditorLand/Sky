var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { INotebookEditorWorkerService } from "../../../common/services/notebookWorkerService.js";
import { registerNotebookContribution } from "../../notebookEditorExtensions.js";
import { NotebookCellDiffDecorator } from "./notebookCellDiffDecorator.js";
import { NotebookDeletedCellDecorator } from "./notebookDeletedCellDecorator.js";
import { NotebookInsertedCellDecorator } from "./notebookInsertedCellDecorator.js";
import { INotebookLoggingService } from "../../../common/notebookLoggingService.js";
import { computeDiff } from "../../../common/notebookDiff.js";
import { registerSingleton } from "../../../../../../platform/instantiation/common/extensions.js";
import { INotebookOriginalModelReferenceFactory, NotebookOriginalModelReferenceFactory } from "./notebookOriginalModelRefFactory.js";
import { INotebookOriginalCellModelFactory, OriginalNotebookCellModelFactory } from "./notebookOriginalCellModelFactory.js";
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
let NotebookInlineDiffDecorationContribution = class NotebookInlineDiffDecorationContribution2 extends Disposable {
  static {
    __name(this, "NotebookInlineDiffDecorationContribution");
  }
  static {
    this.ID = "workbench.notebook.inlineDiffDecoration";
  }
  constructor(notebookEditor, notebookEditorWorkerService, instantiationService, logService) {
    super();
    this.notebookEditor = notebookEditor;
    this.notebookEditorWorkerService = notebookEditorWorkerService;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.cellDecorators = /* @__PURE__ */ new Map();
    this.listeners = [];
    this.logService.debug("inlineDiff", "Watching for previous model");
    this._register(autorun((reader) => {
      this.previous = this.notebookEditor.notebookOptions.previousModelToCompare.read(reader);
      if (this.previous) {
        this.logService.debug("inlineDiff", "Previous model set");
        if (this.notebookEditor.hasModel()) {
          this.initialize();
        } else {
          this.logService.debug("inlineDiff", "Waiting for model to attach");
          this.listeners.push(Event.once(this.notebookEditor.onDidAttachViewModel)(() => this.initialize()));
        }
      }
    }));
  }
  clear() {
    this.listeners.forEach((l) => l.dispose());
    this.cellDecorators.forEach((v, cell) => {
      v.dispose();
      this.cellDecorators.delete(cell);
    });
    this.insertedCellDecorator?.dispose();
    this.deletedCellDecorator?.dispose();
    this.cachedNotebookDiff = void 0;
    this.listeners = [];
    this.logService.debug("inlineDiff", "Cleared decorations and listeners");
  }
  dispose() {
    this.logService.debug("inlineDiff", "Disposing");
    this.clear();
    super.dispose();
  }
  initialize() {
    this.clear();
    if (!this.previous) {
      return;
    }
    this.insertedCellDecorator = this.instantiationService.createInstance(NotebookInsertedCellDecorator, this.notebookEditor);
    this.deletedCellDecorator = this.instantiationService.createInstance(NotebookDeletedCellDecorator, this.notebookEditor, void 0);
    this._update();
    const onVisibleChange = Event.debounce(this.notebookEditor.onDidChangeVisibleRanges, (e) => e, 100, void 0, void 0, void 0, this._store);
    this.listeners.push(onVisibleChange(() => this._update()));
    this.listeners.push(this.notebookEditor.onDidChangeModel(() => this._update()));
    if (this.notebookEditor.textModel) {
      const onContentChange = Event.debounce(this.notebookEditor.textModel.onDidChangeContent, (_, event) => event, 100, void 0, void 0, void 0, this._store);
      const onOriginalContentChange = Event.debounce(this.previous.onDidChangeContent, (_, event) => event, 100, void 0, void 0, void 0, this._store);
      this.listeners.push(onContentChange(() => this._update()));
      this.listeners.push(onOriginalContentChange(() => this._update()));
    }
    this.logService.debug("inlineDiff", "Initialized");
  }
  async _update() {
    const current = this.notebookEditor.getViewModel()?.notebookDocument;
    if (!this.previous || !current) {
      this.logService.debug("inlineDiff", "Update skipped - no original or current document");
      return;
    }
    if (!this.cachedNotebookDiff || this.cachedNotebookDiff.originalVersion !== this.previous.versionId || this.cachedNotebookDiff.version !== current.versionId) {
      let diffInfo = { cellDiffInfo: [] };
      try {
        const notebookDiff = await this.notebookEditorWorkerService.computeDiff(this.previous.uri, current.uri);
        diffInfo = computeDiff(this.previous, current, notebookDiff);
      } catch (e) {
        this.logService.error("inlineDiff", "Error computing diff:\n" + e);
        return;
      }
      this.cachedNotebookDiff = { cellDiffInfo: diffInfo.cellDiffInfo, originalVersion: this.previous.versionId, version: current.versionId };
      this.insertedCellDecorator?.apply(diffInfo.cellDiffInfo);
      this.deletedCellDecorator?.apply(diffInfo.cellDiffInfo, this.previous);
    }
    await this.updateCells(this.previous, current, this.cachedNotebookDiff.cellDiffInfo);
  }
  async updateCells(original, modified, cellDiffs) {
    const validDiffDecorators = /* @__PURE__ */ new Set();
    cellDiffs.forEach((diff) => {
      if (diff.type === "modified") {
        const modifiedCell = modified.cells[diff.modifiedCellIndex];
        const originalCell = original.cells[diff.originalCellIndex];
        const editor = this.notebookEditor.codeEditors.find(([vm]) => vm.handle === modifiedCell.handle)?.[1];
        if (editor) {
          const currentDecorator = this.cellDecorators.get(modifiedCell);
          if (currentDecorator?.modifiedCell !== modifiedCell || currentDecorator?.originalCell !== originalCell) {
            currentDecorator?.dispose();
            const decorator = this.instantiationService.createInstance(NotebookCellDiffDecorator, this.notebookEditor, modifiedCell, originalCell, editor);
            this.cellDecorators.set(modifiedCell, decorator);
            validDiffDecorators.add(decorator);
            this._register(editor.onDidDispose(() => {
              decorator.dispose();
              if (this.cellDecorators.get(modifiedCell) === decorator) {
                this.cellDecorators.delete(modifiedCell);
              }
            }));
          } else if (currentDecorator) {
            validDiffDecorators.add(currentDecorator);
          }
        }
      }
    });
    this.cellDecorators.forEach((v, cell) => {
      if (!validDiffDecorators.has(v)) {
        v.dispose();
        this.cellDecorators.delete(cell);
      }
    });
  }
};
NotebookInlineDiffDecorationContribution = __decorate([
  __param(1, INotebookEditorWorkerService),
  __param(2, IInstantiationService),
  __param(3, INotebookLoggingService)
], NotebookInlineDiffDecorationContribution);
registerNotebookContribution(NotebookInlineDiffDecorationContribution.ID, NotebookInlineDiffDecorationContribution);
registerSingleton(
  INotebookOriginalModelReferenceFactory,
  NotebookOriginalModelReferenceFactory,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  INotebookOriginalCellModelFactory,
  OriginalNotebookCellModelFactory,
  1
  /* InstantiationType.Delayed */
);
export {
  NotebookInlineDiffDecorationContribution
};
//# sourceMappingURL=notebookInlineDiff.js.map
