var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDiffEditorModel } from "../../../editor/common/editorCommon.js";
import { BaseTextEditorModel } from "./textEditorModel.js";
import { DiffEditorModel } from "./diffEditorModel.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
class TextDiffEditorModel extends DiffEditorModel {
  static {
    __name(this, "TextDiffEditorModel");
  }
  _originalModel;
  get originalModel() {
    return this._originalModel;
  }
  _modifiedModel;
  get modifiedModel() {
    return this._modifiedModel;
  }
  _textDiffEditorModel = void 0;
  get textDiffEditorModel() {
    return this._textDiffEditorModel;
  }
  constructor(originalModel, modifiedModel) {
    super(originalModel, modifiedModel);
    this._originalModel = originalModel;
    this._modifiedModel = modifiedModel;
    this.updateTextDiffEditorModel();
  }
  async resolve() {
    await super.resolve();
    this.updateTextDiffEditorModel();
  }
  updateTextDiffEditorModel() {
    if (this.originalModel?.isResolved() && this.modifiedModel?.isResolved()) {
      if (!this._textDiffEditorModel) {
        this._textDiffEditorModel = {
          original: this.originalModel.textEditorModel,
          modified: this.modifiedModel.textEditorModel
        };
      } else {
        this._textDiffEditorModel.original = this.originalModel.textEditorModel;
        this._textDiffEditorModel.modified = this.modifiedModel.textEditorModel;
      }
    }
  }
  isResolved() {
    return !!this._textDiffEditorModel;
  }
  isReadonly() {
    return !!this.modifiedModel && this.modifiedModel.isReadonly();
  }
  dispose() {
    this._textDiffEditorModel = void 0;
    super.dispose();
  }
}
export {
  TextDiffEditorModel
};
//# sourceMappingURL=textDiffEditorModel.js.map
