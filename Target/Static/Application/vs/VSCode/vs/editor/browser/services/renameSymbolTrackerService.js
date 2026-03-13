var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { observableValue } from "../../../base/common/observable.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
const IRenameSymbolTrackerService = createDecorator("renameSymbolTrackerService");
class NullRenameSymbolTrackerService {
  static {
    __name(this, "NullRenameSymbolTrackerService");
  }
  constructor() {
    this._trackedWord = observableValue(this, void 0);
    this.trackedWord = this._trackedWord;
    this._trackedWord.set(void 0, void 0);
  }
}
export {
  IRenameSymbolTrackerService,
  NullRenameSymbolTrackerService
};
//# sourceMappingURL=renameSymbolTrackerService.js.map
