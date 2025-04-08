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
import { IObservable, observableFromEvent } from "../../../../base/common/observable.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
function formatRecordableLogEntry(entry) {
  return entry.sourceId + " @@ " + JSON.stringify({ ...entry, sourceId: void 0 });
}
__name(formatRecordableLogEntry, "formatRecordableLogEntry");
let StructuredLogger = class extends Disposable {
  constructor(_contextKey, _contextKeyService, _commandService) {
    super();
    this._contextKey = _contextKey;
    this._contextKeyService = _contextKeyService;
    this._commandService = _commandService;
    this._contextKeyValue = observableContextKey(this._contextKey, this._contextKeyService).recomputeInitiallyAndOnChange(this._store);
    this.isEnabled = this._contextKeyValue.map((v) => v !== void 0);
  }
  static {
    __name(this, "StructuredLogger");
  }
  static cast() {
    return this;
  }
  isEnabled;
  _contextKeyValue;
  log(data) {
    const commandId = this._contextKeyValue.get();
    if (!commandId) {
      return false;
    }
    this._commandService.executeCommand(commandId, data);
    return true;
  }
};
StructuredLogger = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ICommandService)
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
