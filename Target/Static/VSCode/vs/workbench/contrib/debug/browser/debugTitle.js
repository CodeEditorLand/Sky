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
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IDebugService, State } from "../common/debug.js";
import { dispose, IDisposable } from "../../../../base/common/lifecycle.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { ITitleService } from "../../../services/title/browser/titleService.js";
let DebugTitleContribution = class {
  static {
    __name(this, "DebugTitleContribution");
  }
  toDispose = [];
  constructor(debugService, hostService, titleService) {
    const updateTitle = /* @__PURE__ */ __name(() => {
      if (debugService.state === State.Stopped && !hostService.hasFocus) {
        titleService.updateProperties({ prefix: "\u{1F534}" });
      } else {
        titleService.updateProperties({ prefix: "" });
      }
    }, "updateTitle");
    this.toDispose.push(debugService.onDidChangeState(updateTitle));
    this.toDispose.push(hostService.onDidChangeFocus(updateTitle));
  }
  dispose() {
    dispose(this.toDispose);
  }
};
DebugTitleContribution = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IHostService),
  __decorateParam(2, ITitleService)
], DebugTitleContribution);
export {
  DebugTitleContribution
};
//# sourceMappingURL=debugTitle.js.map
