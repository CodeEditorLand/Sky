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
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IDebugService } from "./debug.js";
let ReplAccessibilityAnnouncer = class extends Disposable {
  static {
    __name(this, "ReplAccessibilityAnnouncer");
  }
  static ID = "debug.replAccessibilityAnnouncer";
  constructor(debugService, accessibilityService, logService) {
    super();
    const viewModel = debugService.getViewModel();
    this._register(viewModel.onDidFocusSession((session) => {
      if (!session) {
        return;
      }
      this._register(session.onDidChangeReplElements((element) => {
        if (!element || !("originalExpression" in element)) {
          return;
        }
        const value = element.toString();
        accessibilityService.status(value);
        logService.trace("ReplAccessibilityAnnouncer#onDidChangeReplElements", element.originalExpression + ": " + value);
      }));
    }));
  }
};
ReplAccessibilityAnnouncer = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IAccessibilityService),
  __decorateParam(2, ILogService)
], ReplAccessibilityAnnouncer);
export {
  ReplAccessibilityAnnouncer
};
//# sourceMappingURL=replAccessibilityAnnouncer.js.map
