var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { observableFromEvent } from "../../../../base/common/observable.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
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
function formatRecordableLogEntry(entry) {
  return entry.sourceId + " @@ " + JSON.stringify({ ...entry, sourceId: void 0 });
}
__name(formatRecordableLogEntry, "formatRecordableLogEntry");
let StructuredLogger = StructuredLogger_1 = class StructuredLogger2 extends Disposable {
  static {
    __name(this, "StructuredLogger");
  }
  static cast() {
    return this;
  }
  constructor(_contextKey, _contextKeyService, _commandService) {
    super();
    this._contextKey = _contextKey;
    this._contextKeyService = _contextKeyService;
    this._commandService = _commandService;
    this._contextKeyValue = observableContextKey(this._contextKey, this._contextKeyService).recomputeInitiallyAndOnChange(this._store);
    this.isEnabled = this._contextKeyValue.map((v) => v !== void 0);
  }
  log(data) {
    const commandId = this._contextKeyValue.get();
    if (!commandId) {
      return false;
    }
    try {
      this._commandService.executeCommand(commandId, data).catch(() => {
      });
    } catch (e) {
    }
    return true;
  }
};
StructuredLogger = StructuredLogger_1 = __decorate([
  __param(1, IContextKeyService),
  __param(2, ICommandService)
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
