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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { autorun, observableFromEvent } from "../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { canLog, ILoggerService, LogLevel } from "../../../../../platform/log/common/log.js";
import { CodeEditorWidget } from "../../../../browser/widget/codeEditor/codeEditorWidget.js";
import { StructuredLogger } from "../structuredLogger.js";
let TextModelChangeRecorder = class TextModelChangeRecorder2 extends Disposable {
  static {
    __name(this, "TextModelChangeRecorder");
  }
  constructor(_editor, _instantiationService, _loggerService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._loggerService = _loggerService;
    this._structuredLogger = this._register(this._instantiationService.createInstance(StructuredLogger.cast(), "editor.inlineSuggest.logChangeReason.commandId"));
    const logger = this._loggerService?.createLogger("textModelChanges", { hidden: false, name: "Text Model Changes Reason" });
    const loggingLevel = observableFromEvent(this, logger.onDidChangeLogLevel, () => logger.getLevel());
    this._register(autorun((reader) => {
      if (!canLog(loggingLevel.read(reader), LogLevel.Trace)) {
        return;
      }
      reader.store.add(this._editor.onDidChangeModelContent((e) => {
        if (this._editor.getModel()?.uri.scheme === "output") {
          return;
        }
        logger.trace("onDidChangeModelContent: " + e.detailedReasons.map((r) => r.toKey(Number.MAX_VALUE)).join(", "));
      }));
    }));
    this._register(autorun((reader) => {
      if (!(this._editor instanceof CodeEditorWidget)) {
        return;
      }
      if (!this._structuredLogger.isEnabled.read(reader)) {
        return;
      }
      reader.store.add(this._editor.onDidChangeModelContent((e) => {
        const tm = this._editor.getModel();
        if (!tm) {
          return;
        }
        const reason = e.detailedReasons[0];
        const data = {
          ...reason.metadata,
          sourceId: "TextModel.setChangeReason",
          source: reason.metadata.source,
          time: Date.now(),
          modelUri: tm.uri,
          modelVersion: tm.getVersionId()
        };
        setTimeout(() => {
          this._structuredLogger.log(data);
        }, 0);
      }));
    }));
  }
};
TextModelChangeRecorder = __decorate([
  __param(1, IInstantiationService),
  __param(2, ILoggerService)
], TextModelChangeRecorder);
export {
  TextModelChangeRecorder
};
//# sourceMappingURL=changeRecorder.js.map
