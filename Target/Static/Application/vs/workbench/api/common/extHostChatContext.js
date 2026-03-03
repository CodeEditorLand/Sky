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
import { DocumentSelector, MarkdownString } from "./extHostTypeConverters.js";
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
  // Workspace context provider methods
  async $provideWorkspaceChatContext(handle, token) {
    this._clearProviderItems(handle);
    const entry = this._providers.get(handle);
    if (!entry || entry.type !== "workspace") {
      throw new Error("Workspace context provider not found");
    }
    const provider = entry.provider;
    const result = await provider.provideWorkspaceChatContext?.(token) ?? await provider.provideChatContext?.(token) ?? [];
    return this._convertItems(handle, result);
  }
  // Explicit context provider methods
  async $provideExplicitChatContext(handle, token) {
    this._clearProviderItems(handle);
    const entry = this._providers.get(handle);
    if (!entry || entry.type !== "explicit") {
      throw new Error("Explicit context provider not found");
    }
    const provider = entry.provider;
    const result = await provider.provideExplicitChatContext?.(token) ?? await provider.provideChatContext?.(token) ?? [];
    return this._convertItems(handle, result);
  }
  async $resolveExplicitChatContext(handle, context, token) {
    const entry = this._providers.get(handle);
    if (!entry || entry.type !== "explicit") {
      throw new Error("Explicit context provider not found");
    }
    const provider = entry.provider;
    const extItem = this._globalItems.get(context.handle);
    if (!extItem) {
      throw new Error("Chat context item not found");
    }
    return this._doResolve((provider.resolveExplicitChatContext ?? provider.resolveChatContext)?.bind(provider), context, extItem, token);
  }
  // Resource context provider methods
  async $provideResourceChatContext(handle, options, token) {
    const entry = this._providers.get(handle);
    if (!entry || entry.type !== "resource") {
      throw new Error("Resource context provider not found");
    }
    const provider = entry.provider;
    const result = await provider.provideResourceChatContext?.({ resource: URI.revive(options.resource) }, token) ?? await provider.provideChatContext?.({ resource: URI.revive(options.resource) }, token);
    if (!result) {
      return void 0;
    }
    if (result.label === void 0 && result.resourceUri === void 0) {
      throw new Error("ChatContextItem must have either a label or a resourceUri");
    }
    const itemHandle = this._addTrackedItem(handle, result);
    const item = {
      handle: itemHandle,
      icon: result.icon,
      label: result.label,
      resourceUri: result.resourceUri,
      modelDescription: result.modelDescription,
      tooltip: result.tooltip ? MarkdownString.from(result.tooltip) : void 0,
      value: options.withValue ? result.value : void 0,
      command: result.command ? { id: result.command.command } : void 0
    };
    if (options.withValue && !item.value) {
      const resolved = await (provider.resolveResourceChatContext ?? provider.resolveChatContext)?.bind(provider)(result, token);
      item.value = resolved?.value;
      item.tooltip = resolved?.tooltip ? MarkdownString.from(resolved.tooltip) : item.tooltip;
    }
    return item;
  }
  async $resolveResourceChatContext(handle, context, token) {
    const entry = this._providers.get(handle);
    if (!entry || entry.type !== "resource") {
      throw new Error("Resource context provider not found");
    }
    const provider = entry.provider;
    const extItem = this._globalItems.get(context.handle);
    if (!extItem) {
      throw new Error("Chat context item not found");
    }
    return this._doResolve((provider.resolveResourceChatContext ?? provider.resolveChatContext)?.bind(provider), context, extItem, token);
  }
  // Command execution
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
  // Registration methods
  registerChatWorkspaceContextProvider(id, provider) {
    const handle = this._handlePool++;
    const disposables = new DisposableStore();
    this._providers.set(handle, { type: "workspace", provider, disposables });
    this._listenForWorkspaceContextChanges(handle, provider, disposables);
    this._proxy.$registerChatWorkspaceContextProvider(handle, id);
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
  registerChatExplicitContextProvider(id, provider) {
    const handle = this._handlePool++;
    const disposables = new DisposableStore();
    this._providers.set(handle, { type: "explicit", provider, disposables });
    this._proxy.$registerChatExplicitContextProvider(handle, id);
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
  registerChatResourceContextProvider(selector, id, provider) {
    const handle = this._handlePool++;
    const disposables = new DisposableStore();
    this._providers.set(handle, { type: "resource", provider, disposables });
    this._proxy.$registerChatResourceContextProvider(handle, id, DocumentSelector.from(selector));
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
  /**
   * @deprecated Use registerChatWorkspaceContextProvider, registerChatExplicitContextProvider, or registerChatResourceContextProvider instead.
   */
  registerChatContextProvider(selector, id, provider) {
    const disposables = [];
    if (provider.provideWorkspaceChatContext) {
      const workspaceProvider = {
        onDidChangeWorkspaceChatContext: provider.onDidChangeWorkspaceChatContext,
        provideWorkspaceChatContext: /* @__PURE__ */ __name((token) => provider.provideWorkspaceChatContext(token), "provideWorkspaceChatContext")
      };
      disposables.push(this.registerChatWorkspaceContextProvider(id, workspaceProvider));
    }
    if (provider.provideChatContextExplicit) {
      const explicitProvider = {
        provideExplicitChatContext: /* @__PURE__ */ __name((token) => provider.provideChatContextExplicit(token), "provideExplicitChatContext"),
        resolveExplicitChatContext: provider.resolveChatContext ? (context, token) => provider.resolveChatContext(context, token) : (context) => context
      };
      disposables.push(this.registerChatExplicitContextProvider(id, explicitProvider));
    }
    if (provider.provideChatContextForResource && selector) {
      const resourceProvider = {
        provideResourceChatContext: /* @__PURE__ */ __name((options, token) => provider.provideChatContextForResource(options, token), "provideResourceChatContext"),
        resolveResourceChatContext: provider.resolveChatContext ? (context, token) => provider.resolveChatContext(context, token) : (context) => context
      };
      disposables.push(this.registerChatResourceContextProvider(selector, id, resourceProvider));
    }
    return {
      dispose: /* @__PURE__ */ __name(() => {
        for (const disposable of disposables) {
          disposable.dispose();
        }
      }, "dispose")
    };
  }
  // Helper methods
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
  _convertItems(handle, items) {
    const result = [];
    for (const item of items) {
      if (item.label === void 0 && item.resourceUri === void 0) {
        throw new Error("ChatContextItem must have either a label or a resourceUri");
      }
      const itemHandle = this._addTrackedItem(handle, item);
      result.push({
        handle: itemHandle,
        icon: item.icon,
        label: item.label,
        resourceUri: item.resourceUri,
        modelDescription: item.modelDescription,
        tooltip: item.tooltip ? MarkdownString.from(item.tooltip) : void 0,
        value: item.value,
        command: item.command ? { id: item.command.command } : void 0
      });
    }
    return result;
  }
  async _doResolve(resolveFn, context, extItem, token) {
    const extResult = await resolveFn(extItem, token);
    if (extResult) {
      return {
        handle: context.handle,
        icon: extResult.icon,
        label: extResult.label,
        resourceUri: extResult.resourceUri,
        modelDescription: extResult.modelDescription,
        tooltip: extResult.tooltip ? MarkdownString.from(extResult.tooltip) : void 0,
        value: extResult.value,
        command: extResult.command ? { id: extResult.command.command } : void 0
      };
    }
    return context;
  }
  _listenForWorkspaceContextChanges(handle, provider, disposables) {
    if (!provider.onDidChangeWorkspaceChatContext) {
      return;
    }
    const provideWorkspaceContext = /* @__PURE__ */ __name(async () => {
      const workspaceContexts = await provider.provideWorkspaceChatContext?.(CancellationToken.None) ?? await provider.provideChatContext?.(CancellationToken.None);
      const resolvedContexts = this._convertItems(handle, workspaceContexts ?? []);
      return this._proxy.$updateWorkspaceContextItems(handle, resolvedContexts);
    }, "provideWorkspaceContext");
    disposables.add(provider.onDidChangeWorkspaceChatContext(async () => provideWorkspaceContext()));
    provideWorkspaceContext();
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
