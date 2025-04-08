var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { ICellOutputViewModel, IGenericCellViewModel } from "../notebookBrowser.js";
import { NotebookTextModel } from "../../common/model/notebookTextModel.js";
import { ICellOutput, IOrderedMimeType, RENDERER_NOT_AVAILABLE } from "../../common/notebookCommon.js";
import { INotebookService } from "../../common/notebookService.js";
let handle = 0;
class CellOutputViewModel extends Disposable {
  constructor(cellViewModel, _outputRawData, _notebookService) {
    super();
    this.cellViewModel = cellViewModel;
    this._outputRawData = _outputRawData;
    this._notebookService = _notebookService;
  }
  static {
    __name(this, "CellOutputViewModel");
  }
  _onDidResetRendererEmitter = this._register(new Emitter());
  onDidResetRenderer = this._onDidResetRendererEmitter.event;
  alwaysShow = false;
  visible = observableValue("outputVisible", false);
  setVisible(visible = true, force = false) {
    if (!visible && this.alwaysShow) {
      return;
    }
    if (force && visible) {
      this.alwaysShow = true;
    }
    this.visible.set(visible, void 0);
  }
  outputHandle = handle++;
  get model() {
    return this._outputRawData;
  }
  _pickedMimeType;
  get pickedMimeType() {
    return this._pickedMimeType;
  }
  set pickedMimeType(value) {
    this._pickedMimeType = value;
  }
  hasMultiMimeType() {
    if (this._outputRawData.outputs.length < 2) {
      return false;
    }
    const firstMimeType = this._outputRawData.outputs[0].mime;
    return this._outputRawData.outputs.some((output) => output.mime !== firstMimeType);
  }
  resolveMimeTypes(textModel, kernelProvides) {
    const mimeTypes = this._notebookService.getOutputMimeTypeInfo(textModel, kernelProvides, this.model);
    const index = mimeTypes.findIndex((mimeType) => mimeType.rendererId !== RENDERER_NOT_AVAILABLE && mimeType.isTrusted);
    return [mimeTypes, Math.max(index, 0)];
  }
  resetRenderer() {
    this._pickedMimeType = void 0;
    this.model.bumpVersion();
    this._onDidResetRendererEmitter.fire();
  }
  toRawJSON() {
    return {
      outputs: this._outputRawData.outputs
      // TODO@rebronix, no id, right?
    };
  }
}
export {
  CellOutputViewModel
};
//# sourceMappingURL=cellOutputViewModel.js.map
