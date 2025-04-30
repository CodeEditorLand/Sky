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
import { Emitter } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { isFalsyOrWhitespace } from "../../../../base/common/strings.js";
import { localize } from "../../../../nls.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IExtensionService, isProposedApiEnabled } from "../../../services/extensions/common/extensions.js";
import { ExtensionsRegistry } from "../../../services/extensions/common/extensionsRegistry.js";
import { ChatContextKeys } from "./chatContextKeys.js";
var ChatMessageRole;
(function(ChatMessageRole2) {
  ChatMessageRole2[ChatMessageRole2["System"] = 0] = "System";
  ChatMessageRole2[ChatMessageRole2["User"] = 1] = "User";
  ChatMessageRole2[ChatMessageRole2["Assistant"] = 2] = "Assistant";
})(ChatMessageRole || (ChatMessageRole = {}));
var ChatImageMimeType;
(function(ChatImageMimeType2) {
  ChatImageMimeType2["PNG"] = "image/png";
  ChatImageMimeType2["JPEG"] = "image/jpeg";
  ChatImageMimeType2["GIF"] = "image/gif";
  ChatImageMimeType2["WEBP"] = "image/webp";
  ChatImageMimeType2["BMP"] = "image/bmp";
})(ChatImageMimeType || (ChatImageMimeType = {}));
var ImageDetailLevel;
(function(ImageDetailLevel2) {
  ImageDetailLevel2["Low"] = "low";
  ImageDetailLevel2["High"] = "high";
})(ImageDetailLevel || (ImageDetailLevel = {}));
const ILanguageModelsService = createDecorator("ILanguageModelsService");
const languageModelType = {
  type: "object",
  properties: {
    vendor: {
      type: "string",
      description: localize("vscode.extension.contributes.languageModels.vendor", "A globally unique vendor of language models.")
    }
  }
};
const languageModelExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "languageModels",
  jsonSchema: {
    description: localize("vscode.extension.contributes.languageModels", "Contribute language models of a specific vendor."),
    oneOf: [
      languageModelType,
      {
        type: "array",
        items: languageModelType
      }
    ]
  },
  activationEventsGenerator: /* @__PURE__ */ __name((contribs, result) => {
    for (const contrib of contribs) {
      result.push(`onLanguageModelChat:${contrib.vendor}`);
    }
  }, "activationEventsGenerator")
});
let LanguageModelsService = class LanguageModelsService2 {
  static {
    __name(this, "LanguageModelsService");
  }
  constructor(_extensionService, _logService, _contextKeyService) {
    this._extensionService = _extensionService;
    this._logService = _logService;
    this._contextKeyService = _contextKeyService;
    this._store = new DisposableStore();
    this._providers = /* @__PURE__ */ new Map();
    this._vendors = /* @__PURE__ */ new Set();
    this._onDidChangeProviders = this._store.add(new Emitter());
    this.onDidChangeLanguageModels = this._onDidChangeProviders.event;
    this._hasUserSelectableModels = ChatContextKeys.languageModelsAreUserSelectable.bindTo(this._contextKeyService);
    this._store.add(languageModelExtensionPoint.setHandler((extensions) => {
      this._vendors.clear();
      for (const extension of extensions) {
        if (!isProposedApiEnabled(extension.description, "chatProvider")) {
          extension.collector.error(localize("vscode.extension.contributes.languageModels.chatProviderRequired", "This contribution point requires the 'chatProvider' proposal."));
          continue;
        }
        for (const item of Iterable.wrap(extension.value)) {
          if (this._vendors.has(item.vendor)) {
            extension.collector.error(localize("vscode.extension.contributes.languageModels.vendorAlreadyRegistered", "The vendor '{0}' is already registered and cannot be registered twice", item.vendor));
            continue;
          }
          if (isFalsyOrWhitespace(item.vendor)) {
            extension.collector.error(localize("vscode.extension.contributes.languageModels.emptyVendor", "The vendor field cannot be empty."));
            continue;
          }
          if (item.vendor.trim() !== item.vendor) {
            extension.collector.error(localize("vscode.extension.contributes.languageModels.whitespaceVendor", "The vendor field cannot start or end with whitespace."));
            continue;
          }
          this._vendors.add(item.vendor);
        }
      }
      const removed = [];
      for (const [identifier, value] of this._providers) {
        if (!this._vendors.has(value.metadata.vendor)) {
          this._providers.delete(identifier);
          removed.push(identifier);
        }
      }
      if (removed.length > 0) {
        this._onDidChangeProviders.fire({ removed });
      }
    }));
  }
  dispose() {
    this._store.dispose();
    this._providers.clear();
  }
  getLanguageModelIds() {
    return Array.from(this._providers.keys());
  }
  lookupLanguageModel(identifier) {
    return this._providers.get(identifier)?.metadata;
  }
  async selectLanguageModels(selector) {
    if (selector.vendor) {
      await this._extensionService.activateByEvent(`onLanguageModelChat:${selector.vendor}}`);
    } else {
      const all = Array.from(this._vendors).map((vendor) => this._extensionService.activateByEvent(`onLanguageModelChat:${vendor}`));
      await Promise.all(all);
    }
    const result = [];
    for (const [identifier, model] of this._providers) {
      if ((selector.vendor === void 0 || model.metadata.vendor === selector.vendor) && (selector.family === void 0 || model.metadata.family === selector.family) && (selector.version === void 0 || model.metadata.version === selector.version) && (selector.id === void 0 || model.metadata.id === selector.id) && (!model.metadata.targetExtensions || model.metadata.targetExtensions.some((candidate) => ExtensionIdentifier.equals(candidate, selector.extension)))) {
        result.push(identifier);
      }
    }
    this._logService.trace("[LM] selected language models", selector, result);
    return result;
  }
  registerLanguageModelChat(identifier, provider) {
    this._logService.trace("[LM] registering language model chat", identifier, provider.metadata);
    if (!this._vendors.has(provider.metadata.vendor)) {
      throw new Error(`Chat response provider uses UNKNOWN vendor ${provider.metadata.vendor}.`);
    }
    if (this._providers.has(identifier)) {
      throw new Error(`Chat response provider with identifier ${identifier} is already registered.`);
    }
    this._providers.set(identifier, provider);
    this._onDidChangeProviders.fire({ added: [{ identifier, metadata: provider.metadata }] });
    this.updateUserSelectableModelsContext();
    return toDisposable(() => {
      this.updateUserSelectableModelsContext();
      if (this._providers.delete(identifier)) {
        this._onDidChangeProviders.fire({ removed: [identifier] });
        this._logService.trace("[LM] UNregistered language model chat", identifier, provider.metadata);
      }
    });
  }
  updateUserSelectableModelsContext() {
    const hasUserSelectableModels = Array.from(this._providers.values()).some((p) => p.metadata.isUserSelectable && !p.metadata.isDefault);
    const hasDefaultModel = Array.from(this._providers.values()).some((p) => p.metadata.isDefault);
    this._hasUserSelectableModels.set(hasUserSelectableModels && hasDefaultModel);
  }
  async sendChatRequest(identifier, from, messages, options, token) {
    const provider = this._providers.get(identifier);
    if (!provider) {
      throw new Error(`Chat response provider with identifier ${identifier} is not registered.`);
    }
    return provider.sendChatRequest(messages, from, options, token);
  }
  computeTokenLength(identifier, message, token) {
    const provider = this._providers.get(identifier);
    if (!provider) {
      throw new Error(`Chat response provider with identifier ${identifier} is not registered.`);
    }
    return provider.provideTokenCount(message, token);
  }
};
LanguageModelsService = __decorate([
  __param(0, IExtensionService),
  __param(1, ILogService),
  __param(2, IContextKeyService)
], LanguageModelsService);
export {
  ChatImageMimeType,
  ChatMessageRole,
  ILanguageModelsService,
  ImageDetailLevel,
  LanguageModelsService,
  languageModelExtensionPoint
};
//# sourceMappingURL=languageModels.js.map
