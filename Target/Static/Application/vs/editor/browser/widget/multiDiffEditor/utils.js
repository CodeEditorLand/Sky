var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ActionRunner } from "../../../../base/common/actions.js";
class ActionRunnerWithContext extends ActionRunner {
  static {
    __name(this, "ActionRunnerWithContext");
  }
  constructor(_getContext) {
    super();
    this._getContext = _getContext;
  }
  runAction(action, _context) {
    const ctx = this._getContext();
    return super.runAction(action, ctx);
  }
}
export {
  ActionRunnerWithContext
};
//# sourceMappingURL=utils.js.map
