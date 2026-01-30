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
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { score } from "../../../../../editor/common/languageSelector.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { IChatContextPickService } from "../attachments/chatContextPickService.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { Disposable, DisposableMap } from "../../../../../base/common/lifecycle.js";
const IChatContextService = createDecorator("chatContextService");
let ChatContextService = class ChatContextService2 extends Disposable {
  static {
    __name(this, "ChatContextService");
  }
  constructor(_contextPickService, _extensionService) {
    super();
    this._contextPickService = _contextPickService;
    this._extensionService = _extensionService;
    this._providers = /* @__PURE__ */ new Map();
    this._workspaceContext = /* @__PURE__ */ new Map();
    this._registeredPickers = this._register(new DisposableMap());
    this._lastResourceContext = /* @__PURE__ */ new Map();
  }
  setExecuteCommandCallback(callback) {
    this._executeCommandCallback = callback;
  }
  async executeChatContextItemCommand(handle) {
    if (!this._executeCommandCallback) {
      return;
    }
    await this._executeCommandCallback(handle);
  }
  setChatContextProvider(id, picker) {
    const providerEntry = this._providers.get(id) ?? { picker: void 0 };
    providerEntry.picker = picker;
    this._providers.set(id, providerEntry);
    this._registerWithPickService(id);
  }
  _registerWithPickService(id) {
    const providerEntry = this._providers.get(id);
    if (!providerEntry || !providerEntry.picker || !providerEntry.chatContextProvider) {
      return;
    }
    const title = `${providerEntry.picker.title.replace(/\.+$/, "")}...`;
    this._registeredPickers.set(id, this._contextPickService.registerChatContextItem(this._asPicker(title, providerEntry.picker.icon, id)));
  }
  registerChatContextProvider(id, selector, provider) {
    const providerEntry = this._providers.get(id) ?? { picker: void 0 };
    providerEntry.chatContextProvider = { selector, provider };
    this._providers.set(id, providerEntry);
    this._registerWithPickService(id);
  }
  unregisterChatContextProvider(id) {
    this._providers.delete(id);
    this._registeredPickers.deleteAndDispose(id);
  }
  updateWorkspaceContextItems(id, items) {
    this._workspaceContext.set(id, items);
  }
  getWorkspaceContextItems() {
    const items = [];
    for (const workspaceContexts of this._workspaceContext.values()) {
      for (const item of workspaceContexts) {
        if (!item.value) {
          continue;
        }
        items.push({
          value: item.value,
          name: item.label,
          modelDescription: item.modelDescription,
          id: item.label,
          kind: "workspace"
        });
      }
    }
    return items;
  }
  async contextForResource(uri) {
    return this._contextForResource(uri, false);
  }
  async _contextForResource(uri, withValue) {
    const scoredProviders = [];
    for (const providerEntry of this._providers.values()) {
      if (!providerEntry.chatContextProvider?.provider.provideChatContextForResource || providerEntry.chatContextProvider.selector === void 0) {
        continue;
      }
      const matchScore = score(providerEntry.chatContextProvider.selector, uri, "", true, void 0, void 0);
      scoredProviders.push({ score: matchScore, provider: providerEntry.chatContextProvider.provider });
    }
    scoredProviders.sort((a, b) => b.score - a.score);
    if (scoredProviders.length === 0 || scoredProviders[0].score <= 0) {
      return;
    }
    const provider = scoredProviders[0].provider;
    const context = await provider.provideChatContextForResource(uri, withValue, CancellationToken.None);
    if (!context) {
      return;
    }
    const contextValue = {
      value: void 0,
      name: context.label,
      icon: context.icon,
      uri,
      modelDescription: context.modelDescription,
      commandId: context.command?.id,
      handle: context.handle
    };
    this._lastResourceContext.clear();
    this._lastResourceContext.set(contextValue, { originalItem: context, provider });
    return contextValue;
  }
  async resolveChatContext(context) {
    if (context.value !== void 0) {
      return context;
    }
    const item = this._lastResourceContext.get(context);
    if (!item) {
      const resolved = await this._contextForResource(context.uri, true);
      context.value = resolved?.value;
      context.modelDescription = resolved?.modelDescription;
      return context;
    } else if (item.provider.resolveChatContext) {
      const resolved = await item.provider.resolveChatContext(item.originalItem, CancellationToken.None);
      if (resolved) {
        context.value = resolved.value;
        context.modelDescription = resolved.modelDescription;
        return context;
      }
    }
    return context;
  }
  _asPicker(title, icon, id) {
    const asPicker = /* @__PURE__ */ __name(() => {
      let providerEntry = this._providers.get(id);
      if (!providerEntry) {
        throw new Error("No chat context provider registered");
      }
      const picks = /* @__PURE__ */ __name(async () => {
        if (providerEntry && !providerEntry.chatContextProvider) {
          await this._extensionService.activateByEvent(`onChatContextProvider:${id}`);
          providerEntry = this._providers.get(id);
          if (!providerEntry?.chatContextProvider) {
            return [];
          }
        }
        const results = await providerEntry?.chatContextProvider.provider.provideChatContext({}, CancellationToken.None);
        return results || [];
      }, "picks");
      return {
        picks: picks().then((items) => {
          return items.map((item) => ({
            label: item.label,
            iconClass: ThemeIcon.asClassName(item.icon),
            asAttachment: /* @__PURE__ */ __name(async () => {
              let contextValue = item;
              if (contextValue.value === void 0 && providerEntry?.chatContextProvider?.provider.resolveChatContext) {
                contextValue = await providerEntry.chatContextProvider.provider.resolveChatContext(item, CancellationToken.None);
              }
              return {
                kind: "generic",
                id: contextValue.label,
                name: contextValue.label,
                icon: contextValue.icon,
                value: contextValue.value
              };
            }, "asAttachment")
          }));
        }),
        placeholder: title
      };
    }, "asPicker");
    const picker = {
      asPicker,
      type: "pickerPick",
      label: title,
      icon
    };
    return picker;
  }
};
ChatContextService = __decorate([
  __param(0, IChatContextPickService),
  __param(1, IExtensionService)
], ChatContextService);
registerSingleton(
  IChatContextService,
  ChatContextService,
  1
  /* InstantiationType.Delayed */
);
export {
  ChatContextService,
  IChatContextService
};
//# sourceMappingURL=chatContextService.js.map
