var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { autorunWithStore } from "../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { CodeEditorWidget } from "../../../../browser/widget/codeEditor/codeEditorWidget.js";
import { TextModelEditReason } from "../../../../common/textModelEditReason.js";
import { StructuredLogger } from "../structuredLogger.js";
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
let TextModelChangeRecorder = class TextModelChangeRecorder2 extends Disposable {
  static {
    __name(this, "TextModelChangeRecorder");
  }
  constructor(_editor, _instantiationService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._structuredLogger = this._register(this._instantiationService.createInstance(StructuredLogger.cast(), "editor.inlineSuggest.logChangeReason.commandId"));
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
        const metadata = TextModelEditReason._getCurrentMetadata();
        if (sources.length === 0 && metadata.source) {
          sources.push(metadata.source);
        }
        for (const source of sources) {
          const data = {
            ...metadata,
            sourceId: "TextModel.setChangeReason",
            source,
            time: Date.now(),
            modelUri: tm.uri,
            modelVersion: tm.getVersionId()
          };
          setTimeout(() => {
            this._structuredLogger.log(data);
          }, 0);
        }
        sources.length = 0;
      }));
    }));
  }
};
TextModelChangeRecorder = __decorate([
  __param(1, IInstantiationService)
], TextModelChangeRecorder);
export {
  TextModelChangeRecorder
};
//# sourceMappingURL=changeRecorder.js.map
