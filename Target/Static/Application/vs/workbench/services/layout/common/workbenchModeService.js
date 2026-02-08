var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IWorkbenchModeService = createDecorator("workbenchModeService");
class DefaultWorkbenchModeService {
  static {
    __name(this, "DefaultWorkbenchModeService");
  }
  constructor() {
    this.workbenchMode = void 0;
    this.onDidChangeWorkbenchMode = Event.None;
  }
  getWorkbenchModeConfiguration(_id) {
    return Promise.resolve(void 0);
  }
  getWorkbenchModeConfigurations() {
    return Promise.resolve([]);
  }
  setWorkbenchMode(_workbenchMode) {
    return Promise.resolve();
  }
}
export {
  DefaultWorkbenchModeService,
  IWorkbenchModeService
};
//# sourceMappingURL=workbenchModeService.js.map
