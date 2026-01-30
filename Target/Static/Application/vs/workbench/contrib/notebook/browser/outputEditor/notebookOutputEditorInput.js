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
var NotebookOutputEditorInput_1;
import * as nls from "../../../../../nls.js";
import { EditorInput } from "../../../../common/editor/editorInput.js";
import { INotebookEditorModelResolverService } from "../../common/notebookEditorModelResolverService.js";
import { isEqual } from "../../../../../base/common/resources.js";
class ResolvedNotebookOutputEditorInputModel {
  static {
    __name(this, "ResolvedNotebookOutputEditorInputModel");
  }
  constructor(resolvedNotebookEditorModel, notebookUri, cell, outputId) {
    this.resolvedNotebookEditorModel = resolvedNotebookEditorModel;
    this.notebookUri = notebookUri;
    this.cell = cell;
    this.outputId = outputId;
  }
  dispose() {
    this.resolvedNotebookEditorModel.dispose();
  }
}
let NotebookOutputEditorInput = class NotebookOutputEditorInput2 extends EditorInput {
  static {
    __name(this, "NotebookOutputEditorInput");
  }
  static {
    NotebookOutputEditorInput_1 = this;
  }
  static {
    this.ID = "workbench.input.notebookOutputEditorInput";
  }
  constructor(notebookUri, cellIndex, outputId, outputIndex, notebookEditorModelResolverService) {
    super();
    this.notebookEditorModelResolverService = notebookEditorModelResolverService;
    this._notebookUri = notebookUri;
    this.cellUri = void 0;
    this.cellIndex = cellIndex;
    this.outputId = outputId;
    this.outputIndex = outputIndex;
  }
  get typeId() {
    return NotebookOutputEditorInput_1.ID;
  }
  async resolve() {
    if (!this._notebookRef) {
      this._notebookRef = await this.notebookEditorModelResolverService.resolve(this._notebookUri);
    }
    const cell = this._notebookRef.object.notebook.cells[this.cellIndex];
    if (!cell) {
      throw new Error("Cell not found");
    }
    this.cellUri = cell.uri;
    const resolvedOutputId = cell.outputs[this.outputIndex]?.outputId;
    if (!resolvedOutputId) {
      throw new Error("Output not found");
    }
    if (!this.outputId) {
      this.outputId = resolvedOutputId;
    }
    return new ResolvedNotebookOutputEditorInputModel(this._notebookRef.object, this._notebookUri, cell, resolvedOutputId);
  }
  getSerializedData() {
    if (!this._notebookRef) {
      return;
    }
    const cellIndex = this._notebookRef.object.notebook.cells.findIndex((c) => isEqual(c.uri, this.cellUri));
    const cell = this._notebookRef.object.notebook.cells[cellIndex];
    if (!cell) {
      return;
    }
    const outputIndex = cell.outputs.findIndex((o) => o.outputId === this.outputId);
    if (outputIndex === -1) {
      return;
    }
    return {
      notebookUri: this._notebookUri,
      cellIndex,
      outputIndex
    };
  }
  getName() {
    return nls.localize("notebookOutputEditorInput", "Notebook Output Preview");
  }
  get editorId() {
    return "notebookOutputEditor";
  }
  get resource() {
    return;
  }
  get capabilities() {
    return 2;
  }
  dispose() {
    super.dispose();
  }
};
NotebookOutputEditorInput = NotebookOutputEditorInput_1 = __decorate([
  __param(4, INotebookEditorModelResolverService)
], NotebookOutputEditorInput);
export {
  NotebookOutputEditorInput
};
//# sourceMappingURL=notebookOutputEditorInput.js.map
