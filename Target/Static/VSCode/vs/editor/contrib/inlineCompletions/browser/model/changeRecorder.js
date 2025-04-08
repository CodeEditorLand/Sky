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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { autorunWithStore } from "../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { CodeEditorWidget } from "../../../../browser/widget/codeEditor/codeEditorWidget.js";
import { IRecordableEditorLogEntry, StructuredLogger } from "../structuredLogger.js";
let TextModelChangeRecorder = class extends Disposable {
  constructor(_editor, _instantiationService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._register(autorunWithStore((reader, store) => {
      if (!(this._editor instanceof CodeEditorWidget)) {
        return;
      }
      if (!this._structuredLogger.isEnabled.read(reader)) {
        return;
      }
      const sources = [];
      store.add(this._editor.onBeforeExecuteEdit(({ source }) => {
        if (source) {
          sources.push(source);
        }
      }));
      store.add(this._editor.onDidChangeModelContent((e) => {
        const tm = this._editor.getModel();
        if (!tm) {
          return;
        }
        for (const source of sources) {
          const data = {
            sourceId: "TextModel.setChangeReason",
            source,
            time: Date.now(),
            modelUri: tm.uri.toString(),
            modelVersion: tm.getVersionId()
          };
          this._structuredLogger.log(data);
        }
        sources.length = 0;
      }));
    }));
  }
  static {
    __name(this, "TextModelChangeRecorder");
  }
  _structuredLogger = this._register(this._instantiationService.createInstance(
    StructuredLogger.cast(),
    "editor.inlineSuggest.logChangeReason.commandId"
  ));
};
TextModelChangeRecorder = __decorateClass([
  __decorateParam(1, IInstantiationService)
], TextModelChangeRecorder);
export {
  TextModelChangeRecorder
};
//# sourceMappingURL=changeRecorder.js.map
