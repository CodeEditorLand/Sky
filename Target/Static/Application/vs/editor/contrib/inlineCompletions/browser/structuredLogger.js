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
var StructuredLogger_1;
import { Disposable } from "../../../../base/common/lifecycle.js";
import { observableFromEvent } from "../../../../base/common/observable.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDataChannelService } from "../../../../platform/dataChannel/common/dataChannel.js";
function formatRecordableLogEntry(entry) {
  return entry.sourceId + " @@ " + JSON.stringify({ ...entry, modelUri: entry.modelUri?.toString(), sourceId: void 0 });
}
__name(formatRecordableLogEntry, "formatRecordableLogEntry");
let StructuredLogger = StructuredLogger_1 = class StructuredLogger2 extends Disposable {
  static {
    __name(this, "StructuredLogger");
  }
  static cast() {
    return this;
  }
  constructor(_key, _contextKeyService, _dataChannelService) {
    super();
    this._key = _key;
    this._contextKeyService = _contextKeyService;
    this._dataChannelService = _dataChannelService;
    this._isEnabledContextKeyValue = observableContextKey("structuredLogger.enabled:" + this._key, this._contextKeyService).recomputeInitiallyAndOnChange(this._store);
    this.isEnabled = this._isEnabledContextKeyValue.map((v) => v !== void 0);
  }
  log(data) {
    const enabled = this._isEnabledContextKeyValue.get();
    if (!enabled) {
      return false;
    }
    this._dataChannelService.getDataChannel("structuredLogger:" + this._key).sendData(data);
    return true;
  }
};
StructuredLogger = StructuredLogger_1 = __decorate([
  __param(1, IContextKeyService),
  __param(2, IDataChannelService)
], StructuredLogger);
function observableContextKey(key, contextKeyService) {
  return observableFromEvent(contextKeyService.onDidChangeContext, () => contextKeyService.getContextKeyValue(key));
}
__name(observableContextKey, "observableContextKey");
export {
  StructuredLogger,
  formatRecordableLogEntry
};
//# sourceMappingURL=structuredLogger.js.map
