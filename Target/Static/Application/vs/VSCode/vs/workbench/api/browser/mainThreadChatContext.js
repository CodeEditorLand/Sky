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
import { URI } from "../../../base/common/uri.js";
function reviveContextItem(item) {
  return {
    ...item,
    resourceUri: item.resourceUri ? URI.revive(item.resourceUri) : void 0
  };
}
__name(reviveContextItem, "reviveContextItem");
function reviveContextItems(items) {
  return items.map(reviveContextItem);
}
__name(reviveContextItems, "reviveContextItems");
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
  $registerChatWorkspaceContextProvider(handle, id) {
    this._providers.set(handle, { id });
    this._chatContextService.registerChatWorkspaceContextProvider(id, {
      provideWorkspaceChatContext: /* @__PURE__ */ __name(async (token) => {
        const items = await this._proxy.$provideWorkspaceChatContext(handle, token);
        return reviveContextItems(items);
      }, "provideWorkspaceChatContext")
    });
  }
  $registerChatExplicitContextProvider(handle, id) {
    this._providers.set(handle, { id });
    this._chatContextService.registerChatExplicitContextProvider(id, {
      provideChatContext: /* @__PURE__ */ __name(async (token) => {
        const items = await this._proxy.$provideExplicitChatContext(handle, token);
        return reviveContextItems(items);
      }, "provideChatContext"),
      resolveChatContext: /* @__PURE__ */ __name(async (context, token) => {
        const result = await this._proxy.$resolveExplicitChatContext(handle, context, token);
        return reviveContextItem(result);
      }, "resolveChatContext")
    });
  }
  $registerChatResourceContextProvider(handle, id, selector) {
    this._providers.set(handle, { id, selector });
    this._chatContextService.registerChatResourceContextProvider(id, selector, {
      provideChatContext: /* @__PURE__ */ __name(async (resource, withValue, token) => {
        const result = await this._proxy.$provideResourceChatContext(handle, { resource, withValue }, token);
        return result ? reviveContextItem(result) : void 0;
      }, "provideChatContext"),
      resolveChatContext: /* @__PURE__ */ __name(async (context, token) => {
        const result = await this._proxy.$resolveResourceChatContext(handle, context, token);
        return reviveContextItem(result);
      }, "resolveChatContext")
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
    this._chatContextService.updateWorkspaceContextItems(provider.id, reviveContextItems(items));
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
