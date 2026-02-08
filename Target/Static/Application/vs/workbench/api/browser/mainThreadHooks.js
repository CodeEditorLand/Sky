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
import { URI } from "../../../base/common/uri.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { IHooksExecutionService } from "../../contrib/chat/common/hooksExecutionService.js";
let MainThreadHooks = class MainThreadHooks2 extends Disposable {
  static {
    __name(this, "MainThreadHooks");
  }
  constructor(extHostContext, _hooksExecutionService) {
    super();
    this._hooksExecutionService = _hooksExecutionService;
    const extHostProxy = extHostContext.getProxy(ExtHostContext.ExtHostHooks);
    const proxy = {
      runHookCommand: /* @__PURE__ */ __name(async (hookCommand, input, token) => {
        const result = await extHostProxy.$runHookCommand(hookCommand, input, token);
        return {
          kind: result.kind,
          result: result.result
        };
      }, "runHookCommand")
    };
    this._hooksExecutionService.setProxy(proxy);
  }
  async $executeHook(hookType, sessionResource, input, token) {
    const uri = URI.revive(sessionResource);
    return this._hooksExecutionService.executeHook(hookType, uri, { input, token });
  }
};
MainThreadHooks = __decorate([
  extHostNamedCustomer(MainContext.MainThreadHooks),
  __param(1, IHooksExecutionService)
], MainThreadHooks);
export {
  MainThreadHooks
};
//# sourceMappingURL=mainThreadHooks.js.map
