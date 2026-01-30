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
import { Disposable } from "../../../base/common/lifecycle.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { IChatContextService } from "../../contrib/chat/browser/contextContrib/chatContextService.js";
let MainThreadChatContext = class MainThreadChatContext2 extends Disposable {
  static {
    __name(this, "MainThreadChatContext");
  }
  constructor(extHostContext, _chatContextService) {
    super();
    this._chatContextService = _chatContextService;
    this._providers = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatContext);
    this._chatContextService.setExecuteCommandCallback((itemHandle) => this._proxy.$executeChatContextItemCommand(itemHandle));
  }
  $registerChatContextProvider(handle, id, selector, _options, support) {
    this._providers.set(handle, { selector, support, id });
    this._chatContextService.registerChatContextProvider(id, selector, {
      provideChatContext: /* @__PURE__ */ __name((_options2, token) => {
        return this._proxy.$provideChatContext(handle, token);
      }, "provideChatContext"),
      resolveChatContext: support.supportsResolve ? (context, token) => {
        return this._proxy.$resolveChatContext(handle, context, token);
      } : void 0,
      provideChatContextForResource: support.supportsResource ? (resource, withValue, token) => {
        return this._proxy.$provideChatContextForResource(handle, { resource, withValue }, token);
      } : void 0
    });
  }
  $unregisterChatContextProvider(handle) {
    const provider = this._providers.get(handle);
    if (!provider) {
      return;
    }
    this._chatContextService.unregisterChatContextProvider(provider.id);
    this._providers.delete(handle);
  }
  $updateWorkspaceContextItems(handle, items) {
    const provider = this._providers.get(handle);
    if (!provider) {
      return;
    }
    this._chatContextService.updateWorkspaceContextItems(provider.id, items);
  }
  $executeChatContextItemCommand(itemHandle) {
    return this._proxy.$executeChatContextItemCommand(itemHandle);
  }
};
MainThreadChatContext = __decorate([
  extHostNamedCustomer(MainContext.MainThreadChatContext),
  __param(1, IChatContextService)
], MainThreadChatContext);
export {
  MainThreadChatContext
};
//# sourceMappingURL=mainThreadChatContext.js.map
