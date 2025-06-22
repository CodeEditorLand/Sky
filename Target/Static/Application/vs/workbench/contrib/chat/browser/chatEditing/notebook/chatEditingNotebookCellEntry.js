var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { observableValue, transaction } from "../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { CellEditState } from "../../../../notebook/browser/notebookBrowser.js";
import { INotebookEditorService } from "../../../../notebook/browser/services/notebookEditorService.js";
import { CellKind } from "../../../../notebook/common/notebookCommon.js";
import { ChatEditingTextModelChangeService } from "../chatEditingTextModelChangeService.js";
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
let ChatEditingNotebookCellEntry = class ChatEditingNotebookCellEntry2 extends Disposable {
  static {
    __name(this, "ChatEditingNotebookCellEntry");
  }
  get isDisposed() {
    return this._store.isDisposed;
  }
  get isEditFromUs() {
    return this._textModelChangeService.isEditFromUs;
  }
  get allEditsAreFromUs() {
    return this._textModelChangeService.allEditsAreFromUs;
  }
  get diffInfo() {
    return this._textModelChangeService.diffInfo;
  }
  constructor(notebookUri, cell, modifiedModel, originalModel, disposables, notebookEditorService, instantiationService) {
    super();
    this.notebookUri = notebookUri;
    this.cell = cell;
    this.modifiedModel = modifiedModel;
    this.originalModel = originalModel;
    this.notebookEditorService = notebookEditorService;
    this.instantiationService = instantiationService;
    this._maxModifiedLineNumber = observableValue(this, 0);
    this.maxModifiedLineNumber = this._maxModifiedLineNumber;
    this._stateObs = observableValue(
      this,
      0
      /* ModifiedFileEntryState.Modified */
    );
    this.state = this._stateObs;
    this.initialContent = this.originalModel.getValue();
    this._register(disposables);
    this._textModelChangeService = this._register(this.instantiationService.createInstance(ChatEditingTextModelChangeService, this.originalModel, this.modifiedModel, this.state));
    this._register(this._textModelChangeService.onDidAcceptOrRejectAllHunks((action) => {
      this.revertMarkdownPreviewState();
      this._stateObs.set(action, void 0);
    }));
    this._register(this._textModelChangeService.onDidUserEditModel(() => {
      const didResetToOriginalContent = this.modifiedModel.getValue() === this.initialContent;
      if (this._stateObs.get() === 0 && didResetToOriginalContent) {
        this._stateObs.set(2, void 0);
      }
    }));
  }
  clearCurrentEditLineDecoration() {
    if (this.modifiedModel.isDisposed()) {
      return;
    }
    this._textModelChangeService.clearCurrentEditLineDecoration();
  }
  async acceptAgentEdits(textEdits, isLastEdits, responseModel) {
    const { maxLineNumber } = await this._textModelChangeService.acceptAgentEdits(this.modifiedModel.uri, textEdits, isLastEdits);
    transaction((tx) => {
      if (!isLastEdits) {
        this._stateObs.set(0, tx);
        this._maxModifiedLineNumber.set(maxLineNumber, tx);
      } else {
        this._maxModifiedLineNumber.set(0, tx);
      }
    });
  }
  revertMarkdownPreviewState() {
    if (this.cell.cellKind !== CellKind.Markup) {
      return;
    }
    const notebookEditor = this.notebookEditorService.retrieveExistingWidgetFromURI(this.notebookUri)?.value;
    if (notebookEditor) {
      const vm = notebookEditor.getCellByHandle(this.cell.handle);
      if (vm?.getEditState() === CellEditState.Editing && (vm.editStateSource === "chatEdit" || vm.editStateSource === "chatEditNavigation")) {
        vm?.updateEditState(CellEditState.Preview, "chatEdit");
      }
    }
  }
  async keep(change) {
    return this._textModelChangeService.diffInfo.get().keep(change);
  }
  async undo(change) {
    return this._textModelChangeService.diffInfo.get().undo(change);
  }
};
ChatEditingNotebookCellEntry = __decorate([
  __param(5, INotebookEditorService),
  __param(6, IInstantiationService)
], ChatEditingNotebookCellEntry);
export {
  ChatEditingNotebookCellEntry
};
//# sourceMappingURL=chatEditingNotebookCellEntry.js.map
