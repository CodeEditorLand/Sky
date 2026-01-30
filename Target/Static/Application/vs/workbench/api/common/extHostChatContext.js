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
import { CancellationToken } from "../../../base/common/cancellation.js";
import { URI } from "../../../base/common/uri.js";
import { MainContext } from "./extHost.protocol.js";
import { DocumentSelector } from "./extHostTypeConverters.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { IExtHostCommands } from "./extHostCommands.js";
let ExtHostChatContext = class ExtHostChatContext2 extends Disposable {
  static {
    __name(this, "ExtHostChatContext");
  }
  constructor(extHostRpc, _commands) {
    super();
    this._commands = _commands;
    this._handlePool = 0;
    this._providers = /* @__PURE__ */ new Map();
    this._itemPool = 0;
    this._globalItems = /* @__PURE__ */ new Map();
    this._providerItems = /* @__PURE__ */ new Map();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadChatContext);
  }
  async $provideChatContext(handle, token) {
    this._clearProviderItems(handle);
    const provider = this._getProvider(handle);
    if (!provider.provideChatContextExplicit) {
      throw new Error("provideChatContext not implemented");
    }
    const result = await provider.provideChatContextExplicit(token) ?? [];
    const items = [];
    for (const item of result) {
      const itemHandle = this._addTrackedItem(handle, item);
      items.push({
        handle: itemHandle,
        icon: item.icon,
        label: item.label,
        modelDescription: item.modelDescription,
        value: item.value,
        command: item.command ? { id: item.command.command } : void 0
      });
    }
    return items;
  }
  _clearProviderItems(handle) {
    const itemHandles = this._providerItems.get(handle);
    if (itemHandles) {
      for (const itemHandle of itemHandles) {
        this._globalItems.delete(itemHandle);
      }
      itemHandles.clear();
    }
  }
  _addTrackedItem(providerHandle, item) {
    const itemHandle = this._itemPool++;
    this._globalItems.set(itemHandle, item);
    if (!this._providerItems.has(providerHandle)) {
      this._providerItems.set(providerHandle, /* @__PURE__ */ new Set());
    }
    this._providerItems.get(providerHandle).add(itemHandle);
    return itemHandle;
  }
  async $provideChatContextForResource(handle, options, token) {
    const provider = this._getProvider(handle);
    if (!provider.provideChatContextForResource) {
      throw new Error("provideChatContextForResource not implemented");
    }
    const result = await provider.provideChatContextForResource({ resource: URI.revive(options.resource) }, token);
    if (!result) {
      return void 0;
    }
    const itemHandle = this._addTrackedItem(handle, result);
    const item = {
      handle: itemHandle,
      icon: result.icon,
      label: result.label,
      modelDescription: result.modelDescription,
      value: options.withValue ? result.value : void 0,
      command: result.command ? { id: result.command.command } : void 0
    };
    if (options.withValue && !item.value && provider.resolveChatContext) {
      const resolved = await provider.resolveChatContext(result, token);
      item.value = resolved?.value;
    }
    return item;
  }
  async _doResolve(provider, context, extItem, token) {
    const extResult = await provider.resolveChatContext(extItem, token);
    if (extResult) {
      return {
        handle: context.handle,
        icon: extResult.icon,
        label: extResult.label,
        modelDescription: extResult.modelDescription,
        value: extResult.value,
        command: extResult.command ? { id: extResult.command.command } : void 0
      };
    }
    return context;
  }
  async $resolveChatContext(handle, context, token) {
    const provider = this._getProvider(handle);
    if (!provider.resolveChatContext) {
      throw new Error("resolveChatContext not implemented");
    }
    const extItem = this._globalItems.get(context.handle);
    if (!extItem) {
      throw new Error("Chat context item not found");
    }
    return this._doResolve(provider, context, extItem, token);
  }
  async $executeChatContextItemCommand(itemHandle) {
    const extItem = this._globalItems.get(itemHandle);
    if (!extItem) {
      throw new Error("Chat context item not found");
    }
    if (!extItem.command) {
      throw new Error("Chat context item has no command");
    }
    const args = extItem.command.arguments ? [extItem, ...extItem.command.arguments] : [extItem];
    await this._commands.executeCommand(extItem.command.command, ...args);
  }
  registerChatContextProvider(selector, id, provider) {
    const handle = this._handlePool++;
    const disposables = new DisposableStore();
    this._listenForWorkspaceContextChanges(handle, provider, disposables);
    this._providers.set(handle, { provider, disposables });
    this._proxy.$registerChatContextProvider(handle, `${id}`, selector ? DocumentSelector.from(selector) : void 0, {}, { supportsResource: !!provider.provideChatContextForResource, supportsResolve: !!provider.resolveChatContext });
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._providers.delete(handle);
        this._clearProviderItems(handle);
        this._providerItems.delete(handle);
        this._proxy.$unregisterChatContextProvider(handle);
        disposables.dispose();
      }, "dispose")
    };
  }
  _listenForWorkspaceContextChanges(handle, provider, disposables) {
    if (!provider.onDidChangeWorkspaceChatContext || !provider.provideWorkspaceChatContext) {
      return;
    }
    const provideWorkspaceContext = /* @__PURE__ */ __name(async () => {
      const workspaceContexts = await provider.provideWorkspaceChatContext(CancellationToken.None);
      const resolvedContexts = [];
      for (const item of workspaceContexts ?? []) {
        const itemHandle = this._addTrackedItem(handle, item);
        const contextItem = {
          icon: item.icon,
          label: item.label,
          modelDescription: item.modelDescription,
          value: item.value,
          handle: itemHandle,
          command: item.command ? { id: item.command.command } : void 0
        };
        const resolved = await this._doResolve(provider, contextItem, item, CancellationToken.None);
        resolvedContexts.push(resolved);
      }
      return this._proxy.$updateWorkspaceContextItems(handle, resolvedContexts);
    }, "provideWorkspaceContext");
    disposables.add(provider.onDidChangeWorkspaceChatContext(async () => provideWorkspaceContext()));
    provideWorkspaceContext();
  }
  _getProvider(handle) {
    if (!this._providers.has(handle)) {
      throw new Error("Chat context provider not found");
    }
    return this._providers.get(handle).provider;
  }
  dispose() {
    super.dispose();
    for (const { disposables } of this._providers.values()) {
      disposables.dispose();
    }
  }
};
ExtHostChatContext = __decorate([
  __param(0, IExtHostRpcService),
  __param(1, IExtHostCommands)
], ExtHostChatContext);
export {
  ExtHostChatContext
};
//# sourceMappingURL=extHostChatContext.js.map
