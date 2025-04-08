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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { basename } from "../../../../base/common/resources.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorContributionInstantiation, registerEditorContribution } from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { ITextModel } from "../../../common/model.js";
import * as nls from "../../../../nls.js";
import { IConfirmationResult, IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
const ignoreUnusualLineTerminators = "ignoreUnusualLineTerminators";
function writeIgnoreState(codeEditorService, model, state) {
  codeEditorService.setModelProperty(model.uri, ignoreUnusualLineTerminators, state);
}
__name(writeIgnoreState, "writeIgnoreState");
function readIgnoreState(codeEditorService, model) {
  return codeEditorService.getModelProperty(model.uri, ignoreUnusualLineTerminators);
}
__name(readIgnoreState, "readIgnoreState");
let UnusualLineTerminatorsDetector = class extends Disposable {
  constructor(_editor, _dialogService, _codeEditorService) {
    super();
    this._editor = _editor;
    this._dialogService = _dialogService;
    this._codeEditorService = _codeEditorService;
    this._config = this._editor.getOption(EditorOption.unusualLineTerminators);
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.unusualLineTerminators)) {
        this._config = this._editor.getOption(EditorOption.unusualLineTerminators);
        this._checkForUnusualLineTerminators();
      }
    }));
    this._register(this._editor.onDidChangeModel(() => {
      this._checkForUnusualLineTerminators();
    }));
    this._register(this._editor.onDidChangeModelContent((e) => {
      if (e.isUndoing) {
        return;
      }
      this._checkForUnusualLineTerminators();
    }));
    this._checkForUnusualLineTerminators();
  }
  static {
    __name(this, "UnusualLineTerminatorsDetector");
  }
  static ID = "editor.contrib.unusualLineTerminatorsDetector";
  _config;
  _isPresentingDialog = false;
  async _checkForUnusualLineTerminators() {
    if (this._config === "off") {
      return;
    }
    if (!this._editor.hasModel()) {
      return;
    }
    const model = this._editor.getModel();
    if (!model.mightContainUnusualLineTerminators()) {
      return;
    }
    const ignoreState = readIgnoreState(this._codeEditorService, model);
    if (ignoreState === true) {
      return;
    }
    if (this._editor.getOption(EditorOption.readOnly)) {
      return;
    }
    if (this._config === "auto") {
      model.removeUnusualLineTerminators(this._editor.getSelections());
      return;
    }
    if (this._isPresentingDialog) {
      return;
    }
    let result;
    try {
      this._isPresentingDialog = true;
      result = await this._dialogService.confirm({
        title: nls.localize("unusualLineTerminators.title", "Unusual Line Terminators"),
        message: nls.localize("unusualLineTerminators.message", "Detected unusual line terminators"),
        detail: nls.localize("unusualLineTerminators.detail", "The file '{0}' contains one or more unusual line terminator characters, like Line Separator (LS) or Paragraph Separator (PS).\n\nIt is recommended to remove them from the file. This can be configured via `editor.unusualLineTerminators`.", basename(model.uri)),
        primaryButton: nls.localize({ key: "unusualLineTerminators.fix", comment: ["&& denotes a mnemonic"] }, "&&Remove Unusual Line Terminators"),
        cancelButton: nls.localize("unusualLineTerminators.ignore", "Ignore")
      });
    } finally {
      this._isPresentingDialog = false;
    }
    if (!result.confirmed) {
      writeIgnoreState(this._codeEditorService, model, true);
      return;
    }
    model.removeUnusualLineTerminators(this._editor.getSelections());
  }
};
UnusualLineTerminatorsDetector = __decorateClass([
  __decorateParam(1, IDialogService),
  __decorateParam(2, ICodeEditorService)
], UnusualLineTerminatorsDetector);
registerEditorContribution(UnusualLineTerminatorsDetector.ID, UnusualLineTerminatorsDetector, EditorContributionInstantiation.AfterFirstRender);
export {
  UnusualLineTerminatorsDetector
};
//# sourceMappingURL=unusualLineTerminators.js.map
