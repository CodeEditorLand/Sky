var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { SuggestModel } from "./suggestModel.js";
class OvertypingCapturer {
  static {
    __name(this, "OvertypingCapturer");
  }
  static _maxSelectionLength = 51200;
  _disposables = new DisposableStore();
  _lastOvertyped = [];
  _locked = false;
  constructor(editor, suggestModel) {
    this._disposables.add(editor.onWillType(() => {
      if (this._locked || !editor.hasModel()) {
        return;
      }
      const selections = editor.getSelections();
      const selectionsLength = selections.length;
      let willOvertype = false;
      for (let i = 0; i < selectionsLength; i++) {
        if (!selections[i].isEmpty()) {
          willOvertype = true;
          break;
        }
      }
      if (!willOvertype) {
        if (this._lastOvertyped.length !== 0) {
          this._lastOvertyped.length = 0;
        }
        return;
      }
      this._lastOvertyped = [];
      const model = editor.getModel();
      for (let i = 0; i < selectionsLength; i++) {
        const selection = selections[i];
        if (model.getValueLengthInRange(selection) > OvertypingCapturer._maxSelectionLength) {
          return;
        }
        this._lastOvertyped[i] = { value: model.getValueInRange(selection), multiline: selection.startLineNumber !== selection.endLineNumber };
      }
    }));
    this._disposables.add(suggestModel.onDidTrigger((e) => {
      this._locked = true;
    }));
    this._disposables.add(suggestModel.onDidCancel((e) => {
      this._locked = false;
    }));
  }
  getLastOvertypedInfo(idx) {
    if (idx >= 0 && idx < this._lastOvertyped.length) {
      return this._lastOvertyped[idx];
    }
    return void 0;
  }
  dispose() {
    this._disposables.dispose();
  }
}
export {
  OvertypingCapturer
};
//# sourceMappingURL=suggestOvertypingCapturer.js.map
