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
var LanguageModelsService_1;
import { SequencerByKey, timeout } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { CancellationError, getErrorMessage, isCancellationError } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import { hash } from "../../../../base/common/hash.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../base/common/observable.js";
import { equals } from "../../../../base/common/objects.js";
import Severity from "../../../../base/common/severity.js";
import { format, isFalsyOrWhitespace } from "../../../../base/common/strings.js";
import { isObject, isString } from "../../../../base/common/types.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { localize } from "../../../../nls.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { asJson, IRequestService } from "../../../../platform/request/common/request.js";
import { IQuickInputService, QuickInputHideReason } from "../../../../platform/quickinput/common/quickInput.js";
import { ISecretStorageService } from "../../../../platform/secrets/common/secrets.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { ExtensionsRegistry } from "../../../services/extensions/common/extensionsRegistry.js";
import { ChatContextKeys } from "./actions/chatContextKeys.js";
import { ILanguageModelsConfigurationService } from "./languageModelsConfiguration.js";
var ChatMessageRole;
(function(ChatMessageRole2) {
  ChatMessageRole2[ChatMessageRole2["System"] = 0] = "System";
  ChatMessageRole2[ChatMessageRole2["User"] = 1] = "User";
  ChatMessageRole2[ChatMessageRole2["Assistant"] = 2] = "Assistant";
})(ChatMessageRole || (ChatMessageRole = {}));
var LanguageModelPartAudience;
(function(LanguageModelPartAudience2) {
  LanguageModelPartAudience2[LanguageModelPartAudience2["Assistant"] = 0] = "Assistant";
  LanguageModelPartAudience2[LanguageModelPartAudience2["User"] = 1] = "User";
  LanguageModelPartAudience2[LanguageModelPartAudience2["Extension"] = 2] = "Extension";
})(LanguageModelPartAudience || (LanguageModelPartAudience = {}));
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
var ILanguageModelChatMetadata;
(function(ILanguageModelChatMetadata2) {
  function suitableForAgentMode(metadata) {
    const supportsToolsAgent = typeof metadata.capabilities?.agentMode === "undefined" || metadata.capabilities.agentMode;
    return supportsToolsAgent && !!metadata.capabilities?.toolCalling;
  }
  __name(suitableForAgentMode, "suitableForAgentMode");
  ILanguageModelChatMetadata2.suitableForAgentMode = suitableForAgentMode;
  function asQualifiedName(metadata) {
    return `${metadata.name} (${metadata.vendor})`;
  }
  __name(asQualifiedName, "asQualifiedName");
  ILanguageModelChatMetadata2.asQualifiedName = asQualifiedName;
  function matchesQualifiedName(name, metadata) {
    if (metadata.vendor === "copilot" && name === metadata.name) {
      return true;
    }
    return name === asQualifiedName(metadata);
  }
  __name(matchesQualifiedName, "matchesQualifiedName");
  ILanguageModelChatMetadata2.matchesQualifiedName = matchesQualifiedName;
})(ILanguageModelChatMetadata || (ILanguageModelChatMetadata = {}));
async function getTextResponseFromStream(response) {
  let responseText = "";
  const streaming = (async () => {
    if (!response?.stream) {
      return;
    }
    for await (const part of response.stream) {
      if (Array.isArray(part)) {
        for (const item of part) {
          if (item.type === "text") {
            responseText += item.value;
          }
        }
      } else if (part.type === "text") {
        responseText += part.value;
      }
    }
  })();
  try {
    await Promise.all([response.result, streaming]);
    return responseText;
  } catch (err) {
    if (responseText) {
      return responseText;
    }
    throw err;
  }
}
__name(getTextResponseFromStream, "getTextResponseFromStream");
function isILanguageModelChatSelector(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value;
  return (obj.name === void 0 || typeof obj.name === "string") && (obj.id === void 0 || typeof obj.id === "string") && (obj.vendor === void 0 || typeof obj.vendor === "string") && (obj.version === void 0 || typeof obj.version === "string") && (obj.family === void 0 || typeof obj.family === "string") && (obj.tokens === void 0 || typeof obj.tokens === "number") && (obj.extension === void 0 || typeof obj.extension === "object");
}
__name(isILanguageModelChatSelector, "isILanguageModelChatSelector");
const ILanguageModelsService = createDecorator("ILanguageModelsService");
const languageModelChatProviderType = {
  type: "object",
  required: ["vendor", "displayName"],
  properties: {
    vendor: {
      type: "string",
      description: localize("vscode.extension.contributes.languageModels.vendor", "A globally unique vendor of language model chat provider.")
    },
    displayName: {
      type: "string",
      description: localize("vscode.extension.contributes.languageModels.displayName", "The display name of the language model chat provider.")
    },
    configuration: {
      type: "object",
      description: localize("vscode.extension.contributes.languageModels.configuration", "Configuration options for the language model chat provider."),
      anyOf: [
        {
          $ref: "http://json-schema.org/draft-07/schema#"
        },
        {
          properties: {
            properties: {
              type: "object",
              additionalProperties: {
                $ref: "http://json-schema.org/draft-07/schema#",
                properties: {
                  secret: {
                    type: "boolean",
                    description: localize("vscode.extension.contributes.languageModels.configuration.secret", "Whether the property is a secret.")
                  }
                }
              }
            },
            additionalProperties: {
              $ref: "http://json-schema.org/draft-07/schema#",
              properties: {
                secret: {
                  type: "boolean",
                  description: localize("vscode.extension.contributes.languageModels.configuration.secret", "Whether the property is a secret.")
                }
              }
            }
          }
        }
      ]
    },
    managementCommand: {
      type: "string",
      description: localize("vscode.extension.contributes.languageModels.managementCommand", "A command to manage the language model chat provider, e.g. 'Manage Copilot models'. This is used in the chat model picker. If not provided, a gear icon is not rendered during vendor selection."),
      deprecated: true,
      deprecationMessage: localize("vscode.extension.contributes.languageModels.managementCommand.deprecated", "The managementCommand property is deprecated and will be removed in a future release. Use the new configuration property instead.")
    },
    when: {
      type: "string",
      description: localize("vscode.extension.contributes.languageModels.when", "Condition which must be true to show this language model chat provider in the Manage Models list.")
    }
  }
};
const languageModelChatProviderExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "languageModelChatProviders",
  jsonSchema: {
    description: localize("vscode.extension.contributes.languageModelChatProviders", "Contribute language model chat providers of a specific vendor."),
    oneOf: [
      languageModelChatProviderType,
      {
        type: "array",
        items: languageModelChatProviderType
      }
    ]
  },
  activationEventsGenerator: /* @__PURE__ */ __name(function* (contribs) {
    for (const contrib of contribs) {
      yield `onLanguageModelChatProvider:${contrib.vendor}`;
    }
  }, "activationEventsGenerator")
});
const CHAT_MODEL_PICKER_PREFERENCES_STORAGE_KEY = "chatModelPickerPreferences";
const CHAT_MODEL_RECENTLY_USED_STORAGE_KEY = "chatModelRecentlyUsed";
const CHAT_PARTICIPANT_NAME_REGISTRY_STORAGE_KEY = "chat.participantNameRegistry";
const CHAT_MODELS_CONTROL_STORAGE_KEY = "chat.modelsControl";
let LanguageModelsService = class LanguageModelsService2 {
  static {
    __name(this, "LanguageModelsService");
  }
  static {
    LanguageModelsService_1 = this;
  }
  static {
    this.SECRET_KEY_PREFIX = "chat.lm.secret.";
  }
  static {
    this.SECRET_INPUT = "${input:{0}}";
  }
  constructor(_extensionService, _logService, _storageService, _contextKeyService, _languageModelsConfigurationService, _quickInputService, _secretStorageService, _productService, _requestService) {
    this._extensionService = _extensionService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._contextKeyService = _contextKeyService;
    this._languageModelsConfigurationService = _languageModelsConfigurationService;
    this._quickInputService = _quickInputService;
    this._secretStorageService = _secretStorageService;
    this._productService = _productService;
    this._requestService = _requestService;
    this._store = new DisposableStore();
    this._providers = /* @__PURE__ */ new Map();
    this._vendors = /* @__PURE__ */ new Map();
    this._onDidChangeLanguageModelVendors = this._store.add(new Emitter());
    this.onDidChangeLanguageModelVendors = this._onDidChangeLanguageModelVendors.event;
    this._modelsGroups = /* @__PURE__ */ new Map();
    this._modelCache = /* @__PURE__ */ new Map();
    this._resolveLMSequencer = new SequencerByKey();
    this._modelPickerUserPreferences = {};
    this._onLanguageModelChange = this._store.add(new Emitter());
    this.onDidChangeLanguageModels = this._onLanguageModelChange.event;
    this._recentlyUsedModelIds = [];
    this._onDidChangeModelsControlManifest = this._store.add(new Emitter());
    this.onDidChangeModelsControlManifest = this._onDidChangeModelsControlManifest.event;
    this._modelsControlManifest = { free: {}, paid: {} };
    this._chatControlDisposed = false;
    this._restrictedChatParticipants = observableValue(this, /* @__PURE__ */ Object.create(null));
    this.restrictedChatParticipants = this._restrictedChatParticipants;
    this._hasUserSelectableModels = ChatContextKeys.languageModelsAreUserSelectable.bindTo(_contextKeyService);
    this._modelPickerUserPreferences = this._readModelPickerPreferences();
    this._recentlyUsedModelIds = this._readRecentlyUsedModels();
    this._initChatControlData();
    this._store.add(this._storageService.onDidChangeValue(0, CHAT_MODEL_PICKER_PREFERENCES_STORAGE_KEY, this._store)(() => this._onDidChangeModelPickerPreferences()));
    this._store.add(this.onDidChangeLanguageModels(() => {
      this._hasUserSelectableModels.set(this._modelCache.size > 0 && Array.from(this._modelCache.values()).some((model) => model.isUserSelectable));
      this._refreshModelsControlManifest();
    }));
    this._store.add(this._languageModelsConfigurationService.onDidChangeLanguageModelGroups((changedGroups) => this._onDidChangeLanguageModelGroups(changedGroups)));
    this._store.add(languageModelChatProviderExtensionPoint.setHandler((extensions, { added, removed }) => {
      const addedVendors = [];
      const removedVendors = [];
      for (const extension of added) {
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
          addedVendors.push(item);
        }
      }
      for (const extension of removed) {
        for (const item of Iterable.wrap(extension.value)) {
          removedVendors.push(item);
        }
      }
      this.deltaLanguageModelChatProviderDescriptors(addedVendors, removedVendors);
    }));
  }
  deltaLanguageModelChatProviderDescriptors(added, removed) {
    const addedVendorIds = [];
    const removedVendorIds = [];
    for (const item of added) {
      if (this._vendors.has(item.vendor)) {
        this._logService.error(`The vendor '${item.vendor}' is already registered and cannot be registered twice`);
        continue;
      }
      if (isFalsyOrWhitespace(item.vendor)) {
        this._logService.error("The vendor field cannot be empty.");
        continue;
      }
      if (item.vendor.trim() !== item.vendor) {
        this._logService.error("The vendor field cannot start or end with whitespace.");
        continue;
      }
      const vendor = {
        vendor: item.vendor,
        displayName: item.displayName,
        configuration: item.configuration,
        managementCommand: item.managementCommand,
        when: item.when,
        isDefault: item.vendor === "copilot"
      };
      this._vendors.set(item.vendor, vendor);
      addedVendorIds.push(item.vendor);
      if (this._hasStoredModelForVendor(item.vendor)) {
        this._extensionService.activateByEvent(`onLanguageModelChatProvider:${item.vendor}`);
      }
    }
    for (const item of removed) {
      this._vendors.delete(item.vendor);
      this._providers.delete(item.vendor);
      this._clearModelCache(item.vendor);
      removedVendorIds.push(item.vendor);
    }
    for (const [vendor, _] of this._providers) {
      if (!this._vendors.has(vendor)) {
        this._providers.delete(vendor);
      }
    }
    if (addedVendorIds.length > 0 || removedVendorIds.length > 0) {
      this._onDidChangeLanguageModelVendors.fire([...addedVendorIds, ...removedVendorIds]);
      if (removedVendorIds.length > 0) {
        for (const vendor of removedVendorIds) {
          this._onLanguageModelChange.fire(vendor);
        }
      }
    }
  }
  async _onDidChangeLanguageModelGroups(changedGroups) {
    const changedVendors = new Set(changedGroups.map((g) => g.vendor));
    await Promise.all(Array.from(changedVendors).map((vendor) => this._resolveAllLanguageModels(vendor, true)));
  }
  _readModelPickerPreferences() {
    return this._storageService.getObject(CHAT_MODEL_PICKER_PREFERENCES_STORAGE_KEY, 0, {});
  }
  _onDidChangeModelPickerPreferences() {
    const newPreferences = this._readModelPickerPreferences();
    const oldPreferences = this._modelPickerUserPreferences;
    const affectedVendors = /* @__PURE__ */ new Set();
    let hasChanges = false;
    for (const modelId in newPreferences) {
      if (oldPreferences[modelId] !== newPreferences[modelId]) {
        hasChanges = true;
        const model = this._modelCache.get(modelId);
        if (model) {
          affectedVendors.add(model.vendor);
        }
      }
    }
    for (const modelId in oldPreferences) {
      if (!newPreferences.hasOwnProperty(modelId)) {
        hasChanges = true;
        const model = this._modelCache.get(modelId);
        if (model) {
          affectedVendors.add(model.vendor);
        }
      }
    }
    if (hasChanges) {
      this._logService.trace("[LM] Updated model picker preferences from storage");
      this._modelPickerUserPreferences = newPreferences;
      for (const vendor of affectedVendors) {
        this._onLanguageModelChange.fire(vendor);
      }
    }
  }
  _hasStoredModelForVendor(vendor) {
    return Object.keys(this._modelPickerUserPreferences).some((modelId) => {
      return modelId.startsWith(vendor);
    });
  }
  _saveModelPickerPreferences() {
    this._storageService.store(
      CHAT_MODEL_PICKER_PREFERENCES_STORAGE_KEY,
      this._modelPickerUserPreferences,
      0,
      0
      /* StorageTarget.USER */
    );
  }
  updateModelPickerPreference(modelIdentifier, showInModelPicker) {
    const model = this._modelCache.get(modelIdentifier);
    if (!model) {
      this._logService.warn(`[LM] Cannot update model picker preference for unknown model ${modelIdentifier}`);
      return;
    }
    this._modelPickerUserPreferences[modelIdentifier] = showInModelPicker;
    if (showInModelPicker === model.isUserSelectable) {
      delete this._modelPickerUserPreferences[modelIdentifier];
      this._saveModelPickerPreferences();
    } else if (model.isUserSelectable !== showInModelPicker) {
      this._saveModelPickerPreferences();
    }
    this._onLanguageModelChange.fire(model.vendor);
    this._logService.trace(`[LM] Updated model picker preference for ${modelIdentifier} to ${showInModelPicker}`);
  }
  getVendors() {
    return Array.from(this._vendors.values()).filter((vendor) => {
      if (!vendor.when) {
        return true;
      }
      const whenClause = ContextKeyExpr.deserialize(vendor.when);
      return whenClause ? this._contextKeyService.contextMatchesRules(whenClause) : false;
    });
  }
  getLanguageModelIds() {
    return Array.from(this._modelCache.keys());
  }
  lookupLanguageModel(modelIdentifier) {
    const model = this._modelCache.get(modelIdentifier);
    if (model && this._modelPickerUserPreferences[modelIdentifier] !== void 0) {
      return { ...model, isUserSelectable: this._modelPickerUserPreferences[modelIdentifier] };
    }
    return model;
  }
  lookupLanguageModelByQualifiedName(referenceName) {
    for (const [identifier, model] of this._modelCache.entries()) {
      if (ILanguageModelChatMetadata.matchesQualifiedName(referenceName, model)) {
        return { metadata: model, identifier };
      }
    }
    return void 0;
  }
  async _resolveAllLanguageModels(vendorId, silent) {
    const vendor = this._vendors.get(vendorId);
    if (!vendor) {
      return;
    }
    await this._extensionService.activateByEvent(`onLanguageModelChatProvider:${vendorId}`);
    const provider = this._providers.get(vendorId);
    if (!provider) {
      this._logService.warn(`[LM] No provider registered for vendor ${vendorId}`);
      return;
    }
    return this._resolveLMSequencer.queue(vendorId, async () => {
      const allModels = [];
      const languageModelsGroups = [];
      try {
        const models = await provider.provideLanguageModelChatInfo({ silent }, CancellationToken.None);
        if (models.length) {
          allModels.push(...models);
          const modelIdentifiers = [];
          for (const m of models) {
            if (vendor.isDefault) {
              if (m.metadata.isUserSelectable || this._modelPickerUserPreferences[m.identifier] === true) {
                modelIdentifiers.push(m.identifier);
              } else {
                this._logService.trace(`[LM] Skipping model ${m.identifier} from model picker as it is not user selectable.`);
              }
            } else {
              modelIdentifiers.push(m.identifier);
            }
          }
          languageModelsGroups.push({ modelIdentifiers });
        }
      } catch (error) {
        languageModelsGroups.push({
          modelIdentifiers: [],
          status: {
            message: getErrorMessage(error),
            severity: Severity.Error
          }
        });
      }
      const groups = this._languageModelsConfigurationService.getLanguageModelsProviderGroups();
      for (const group of groups) {
        if (group.vendor !== vendorId) {
          continue;
        }
        const configuration = await this._resolveConfiguration(group, vendor.configuration);
        try {
          const models = await provider.provideLanguageModelChatInfo({ group: group.name, silent, configuration }, CancellationToken.None);
          if (models.length) {
            allModels.push(...models);
            languageModelsGroups.push({ group, modelIdentifiers: models.map((m) => m.identifier) });
          }
        } catch (error) {
          languageModelsGroups.push({
            group,
            modelIdentifiers: [],
            status: {
              message: getErrorMessage(error),
              severity: Severity.Error
            }
          });
        }
      }
      this._modelsGroups.set(vendorId, languageModelsGroups);
      const oldModels = this._clearModelCache(vendorId);
      let hasChanges = false;
      for (const model of allModels) {
        if (this._modelCache.has(model.identifier)) {
          this._logService.warn(`[LM] Model ${model.identifier} is already registered. Skipping.`);
          continue;
        }
        this._modelCache.set(model.identifier, model.metadata);
        hasChanges = hasChanges || !equals(oldModels.get(model.identifier), model.metadata);
        oldModels.delete(model.identifier);
      }
      this._logService.trace(`[LM] Resolved language models for vendor ${vendorId}`, allModels);
      hasChanges = hasChanges || oldModels.size > 0;
      if (hasChanges) {
        this._onLanguageModelChange.fire(vendorId);
      } else {
        this._logService.trace(`[LM] No changes in language models for vendor ${vendorId}`);
      }
    });
  }
  getLanguageModelGroups(vendor) {
    return this._modelsGroups.get(vendor) ?? [];
  }
  async selectLanguageModels(selector) {
    if (selector.vendor) {
      await this._resolveAllLanguageModels(selector.vendor, true);
    } else {
      const allVendors = Array.from(this._vendors.keys());
      await Promise.all(allVendors.map((vendor) => this._resolveAllLanguageModels(vendor, true)));
    }
    const result = [];
    for (const [internalModelIdentifier, model] of this._modelCache) {
      if ((selector.vendor === void 0 || model.vendor === selector.vendor) && (selector.family === void 0 || model.family === selector.family) && (selector.version === void 0 || model.version === selector.version) && (selector.id === void 0 || model.id === selector.id)) {
        result.push(internalModelIdentifier);
      }
    }
    this._logService.trace("[LM] selected language models", selector, result);
    return result;
  }
  registerLanguageModelProvider(vendor, provider) {
    this._logService.trace("[LM] registering language model provider", vendor, provider);
    if (!this._vendors.has(vendor)) {
      throw new Error(`Chat model provider uses UNKNOWN vendor ${vendor}.`);
    }
    if (this._providers.has(vendor)) {
      throw new Error(`Chat model provider for vendor ${vendor} is already registered.`);
    }
    this._providers.set(vendor, provider);
    if (this._hasStoredModelForVendor(vendor)) {
      this._resolveAllLanguageModels(vendor, true);
    }
    const modelChangeListener = provider.onDidChange(() => {
      this._resolveAllLanguageModels(vendor, true);
    });
    return toDisposable(() => {
      this._logService.trace("[LM] UNregistered language model provider", vendor);
      this._clearModelCache(vendor);
      this._providers.delete(vendor);
      modelChangeListener.dispose();
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendChatRequest(modelId, from, messages, options, token) {
    const provider = this._providers.get(this._modelCache.get(modelId)?.vendor || "");
    if (!provider) {
      throw new Error(`Chat provider for model ${modelId} is not registered.`);
    }
    return provider.sendChatRequest(modelId, messages, from, options, token);
  }
  computeTokenLength(modelId, message, token) {
    const model = this._modelCache.get(modelId);
    if (!model) {
      throw new Error(`Chat model ${modelId} could not be found.`);
    }
    const provider = this._providers.get(model.vendor);
    if (!provider) {
      throw new Error(`Chat provider for model ${modelId} is not registered.`);
    }
    return provider.provideTokenCount(modelId, message, token);
  }
  async configureLanguageModelsProviderGroup(vendorId, providerGroupName) {
    const vendor = this.getVendors().find(({ vendor: vendor2 }) => vendor2 === vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found.`);
    }
    if (vendor.managementCommand) {
      await this._resolveAllLanguageModels(vendor.vendor, false);
      return;
    }
    const languageModelProviderGroups = this._languageModelsConfigurationService.getLanguageModelsProviderGroups();
    const existing = languageModelProviderGroups.find((g) => g.vendor === vendorId && g.name === providerGroupName);
    const name = await this.promptForName(languageModelProviderGroups, vendor, existing);
    if (!name) {
      return;
    }
    const existingConfiguration = existing ? await this._resolveConfiguration(existing, vendor.configuration) : void 0;
    try {
      const configuration = vendor.configuration ? await this.promptForConfiguration(name, vendor.configuration, existingConfiguration) : void 0;
      if (vendor.configuration && !configuration) {
        return;
      }
      const languageModelProviderGroup = await this._resolveLanguageModelProviderGroup(name, vendorId, configuration, vendor.configuration);
      const saved = existing ? await this._languageModelsConfigurationService.updateLanguageModelsProviderGroup(existing, languageModelProviderGroup) : await this._languageModelsConfigurationService.addLanguageModelsProviderGroup(languageModelProviderGroup);
      if (vendor.configuration && this.requireConfiguring(vendor.configuration)) {
        const snippet = this.getSnippetForFirstUnconfiguredProperty(configuration ?? {}, vendor.configuration);
        await this._languageModelsConfigurationService.configureLanguageModels({ group: saved, snippet });
      }
    } catch (error) {
      if (isCancellationError(error)) {
        return;
      }
      throw error;
    }
  }
  async addLanguageModelsProviderGroup(name, vendorId, configuration) {
    const vendor = this.getVendors().find(({ vendor: vendor2 }) => vendor2 === vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found.`);
    }
    const languageModelProviderGroup = await this._resolveLanguageModelProviderGroup(name, vendorId, configuration, vendor.configuration);
    await this._languageModelsConfigurationService.addLanguageModelsProviderGroup(languageModelProviderGroup);
  }
  async removeLanguageModelsProviderGroup(vendorId, providerGroupName) {
    const vendor = this.getVendors().find(({ vendor: vendor2 }) => vendor2 === vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found.`);
    }
    const languageModelProviderGroups = this._languageModelsConfigurationService.getLanguageModelsProviderGroups();
    const existing = languageModelProviderGroups.find((g) => g.vendor === vendorId && g.name === providerGroupName);
    if (!existing) {
      throw new Error(`Language model provider group ${providerGroupName} for vendor ${vendorId} not found.`);
    }
    await this._deleteSecretsInConfiguration(existing, vendor.configuration);
    await this._languageModelsConfigurationService.removeLanguageModelsProviderGroup(existing);
  }
  requireConfiguring(schema) {
    if (schema.additionalProperties) {
      return true;
    }
    if (!schema.properties) {
      return false;
    }
    for (const property of Object.keys(schema.properties)) {
      if (!this.canPromptForProperty(schema.properties[property])) {
        return true;
      }
    }
    return false;
  }
  getSnippetForFirstUnconfiguredProperty(configuration, schema) {
    if (!schema.properties) {
      return void 0;
    }
    for (const property of Object.keys(schema.properties)) {
      if (configuration[property] === void 0) {
        const propertySchema = schema.properties[property];
        if (propertySchema && typeof propertySchema !== "boolean" && propertySchema.defaultSnippets?.[0]) {
          const snippet = propertySchema.defaultSnippets[0];
          let bodyText = snippet.bodyText ?? JSON.stringify(snippet.body, null, "	");
          bodyText = bodyText.replace(/"(\^[^"]*)"/g, (_, value) => value.substring(1));
          return `"${property}": ${bodyText}`;
        }
      }
    }
    return void 0;
  }
  async promptForName(languageModelProviderGroups, vendor, existing) {
    let providerGroupName = existing?.name;
    if (!providerGroupName) {
      providerGroupName = vendor.displayName;
      let count = 1;
      while (languageModelProviderGroups.some((g) => g.vendor === vendor.vendor && g.name === providerGroupName)) {
        count++;
        providerGroupName = `${vendor.displayName} ${count}`;
      }
    }
    let result;
    const disposables = new DisposableStore();
    try {
      await new Promise((resolve) => {
        const inputBox = disposables.add(this._quickInputService.createInputBox());
        inputBox.title = localize("configureLanguageModelGroup", "Group Name");
        inputBox.placeholder = localize("languageModelGroupName", "Enter a name for the group");
        inputBox.value = providerGroupName;
        inputBox.ignoreFocusOut = true;
        disposables.add(inputBox.onDidChangeValue((value) => {
          if (!value) {
            inputBox.validationMessage = localize("enterName", "Please enter a name");
            inputBox.severity = Severity.Error;
            return;
          }
          if (!existing && languageModelProviderGroups.some((g) => g.name === value)) {
            inputBox.validationMessage = localize("nameExists", "A language models group with this name already exists");
            inputBox.severity = Severity.Error;
            return;
          }
          inputBox.validationMessage = void 0;
          inputBox.severity = Severity.Ignore;
        }));
        disposables.add(inputBox.onDidAccept(async () => {
          result = inputBox.value;
          inputBox.hide();
        }));
        disposables.add(inputBox.onDidHide(() => resolve()));
        inputBox.show();
      });
    } finally {
      disposables.dispose();
    }
    return result;
  }
  async promptForConfiguration(groupName, configuration, existing) {
    if (!configuration.properties) {
      return;
    }
    const result = existing ? { ...existing } : {};
    for (const property of Object.keys(configuration.properties)) {
      const propertySchema = configuration.properties[property];
      const required = !!configuration.required?.includes(property);
      const value = await this.promptForValue(groupName, property, propertySchema, required, existing);
      if (value !== void 0) {
        result[property] = value;
      }
    }
    return result;
  }
  async promptForValue(groupName, property, propertySchema, required, existing) {
    if (!propertySchema) {
      return void 0;
    }
    if (!this.canPromptForProperty(propertySchema)) {
      return void 0;
    }
    if (propertySchema.type === "array" && propertySchema.items && !Array.isArray(propertySchema.items) && propertySchema.items.enum) {
      const selectedItems = await this.promptForArray(groupName, property, propertySchema);
      if (selectedItems === void 0) {
        return void 0;
      }
      return selectedItems;
    }
    const value = await this.promptForInput(groupName, property, propertySchema, required, existing);
    if (value === void 0) {
      return void 0;
    }
    return value;
  }
  canPromptForProperty(propertySchema) {
    if (!propertySchema || typeof propertySchema === "boolean") {
      return false;
    }
    if (propertySchema.type === "array" && propertySchema.items && !Array.isArray(propertySchema.items) && propertySchema.items.enum) {
      return true;
    }
    if (propertySchema.type === "string" || propertySchema.type === "number" || propertySchema.type === "integer" || propertySchema.type === "boolean") {
      return true;
    }
    return false;
  }
  async promptForArray(groupName, property, propertySchema) {
    if (!propertySchema.items || Array.isArray(propertySchema.items) || !propertySchema.items.enum) {
      return void 0;
    }
    const items = propertySchema.items.enum;
    const disposables = new DisposableStore();
    try {
      return await new Promise((resolve) => {
        const quickPick = disposables.add(this._quickInputService.createQuickPick());
        quickPick.title = `${groupName}: ${propertySchema.title ?? property}`;
        quickPick.items = items.map((item) => ({ label: item }));
        quickPick.placeholder = propertySchema.description ?? localize("selectValue", "Select value for {0}", property);
        quickPick.canSelectMany = true;
        quickPick.ignoreFocusOut = true;
        disposables.add(quickPick.onDidAccept(() => {
          resolve(quickPick.selectedItems.map((item) => item.label));
          quickPick.hide();
        }));
        disposables.add(quickPick.onDidHide(() => {
          resolve(void 0);
        }));
        quickPick.show();
      });
    } finally {
      disposables.dispose();
    }
  }
  async promptForInput(groupName, property, propertySchema, required, existing) {
    const disposables = new DisposableStore();
    try {
      const value = await new Promise((resolve, reject) => {
        const inputBox = disposables.add(this._quickInputService.createInputBox());
        inputBox.title = `${groupName}: ${propertySchema.title ?? property}`;
        inputBox.placeholder = localize("enterValue", "Enter value for {0}", property);
        inputBox.password = !!propertySchema.secret;
        inputBox.ignoreFocusOut = true;
        if (existing?.[property]) {
          inputBox.value = String(existing?.[property]);
        } else if (propertySchema.default) {
          inputBox.value = String(propertySchema.default);
        }
        if (propertySchema.description) {
          inputBox.prompt = propertySchema.description;
        }
        disposables.add(inputBox.onDidChangeValue((value2) => {
          if (!value2 && required) {
            inputBox.validationMessage = localize("valueRequired", "Value is required");
            inputBox.severity = Severity.Error;
            return;
          }
          if (propertySchema.type === "number" || propertySchema.type === "integer") {
            if (isNaN(Number(value2))) {
              inputBox.validationMessage = localize("numberRequired", "Please enter a number");
              inputBox.severity = Severity.Error;
              return;
            }
          }
          if (propertySchema.type === "boolean") {
            if (value2 !== "true" && value2 !== "false") {
              inputBox.validationMessage = localize("booleanRequired", "Please enter true or false");
              inputBox.severity = Severity.Error;
              return;
            }
          }
          inputBox.validationMessage = void 0;
          inputBox.severity = Severity.Ignore;
        }));
        disposables.add(inputBox.onDidAccept(() => {
          if (!inputBox.value && required) {
            inputBox.validationMessage = localize("valueRequired", "Value is required");
            inputBox.severity = Severity.Error;
            return;
          }
          resolve(inputBox.value);
          inputBox.hide();
        }));
        disposables.add(inputBox.onDidHide((e) => {
          if (e.reason === QuickInputHideReason.Gesture) {
            reject(new CancellationError());
          } else {
            resolve(void 0);
          }
        }));
        inputBox.show();
      });
      if (!value) {
        return void 0;
      }
      if (propertySchema.type === "number" || propertySchema.type === "integer") {
        return Number(value);
      } else if (propertySchema.type === "boolean") {
        return value === "true";
      } else {
        return value;
      }
    } finally {
      disposables.dispose();
    }
  }
  encodeSecretKey(property) {
    return format(LanguageModelsService_1.SECRET_INPUT, property);
  }
  decodeSecretKey(secretInput) {
    if (!isString(secretInput)) {
      return void 0;
    }
    return secretInput.substring(secretInput.indexOf(":") + 1, secretInput.length - 1);
  }
  _clearModelCache(vendor) {
    const removed = /* @__PURE__ */ new Map();
    for (const [id, model] of this._modelCache.entries()) {
      if (model.vendor === vendor) {
        removed.set(id, model);
        this._modelCache.delete(id);
      }
    }
    return removed;
  }
  async _resolveConfiguration(group, schema) {
    if (!schema) {
      return {};
    }
    const result = {};
    for (const key in group) {
      if (key === "vendor" || key === "name" || key === "range") {
        continue;
      }
      let value = group[key];
      if (schema.properties?.[key]?.secret) {
        const secretKey = this.decodeSecretKey(value);
        value = secretKey ? await this._secretStorageService.get(secretKey) : void 0;
      }
      result[key] = value;
    }
    return result;
  }
  async _resolveLanguageModelProviderGroup(name, vendor, configuration, schema) {
    if (!schema) {
      return { name, vendor };
    }
    const result = {};
    for (const key in configuration) {
      let value = configuration[key];
      if (schema.properties?.[key]?.secret && isString(value)) {
        const secretKey = `${LanguageModelsService_1.SECRET_KEY_PREFIX}${hash(generateUuid()).toString(16)}`;
        await this._secretStorageService.set(secretKey, value);
        value = this.encodeSecretKey(secretKey);
      }
      result[key] = value;
    }
    return { name, vendor, ...result };
  }
  async _deleteSecretsInConfiguration(group, schema) {
    if (!schema) {
      return;
    }
    const { vendor, name, range, ...configuration } = group;
    for (const key in configuration) {
      const value = group[key];
      if (schema.properties?.[key]?.secret) {
        const secretKey = this.decodeSecretKey(value);
        if (secretKey) {
          await this._secretStorageService.delete(secretKey);
        }
      }
    }
  }
  async migrateLanguageModelsProviderGroup(languageModelsProviderGroup) {
    const { vendor, name, ...configuration } = languageModelsProviderGroup;
    if (!this._vendors.get(vendor)) {
      throw new Error(`Vendor ${vendor} not found.`);
    }
    await this._extensionService.activateByEvent(`onLanguageModelChatProvider:${vendor}`);
    const provider = this._providers.get(vendor);
    if (!provider) {
      throw new Error(`Chat model provider for vendor ${vendor} is not registered.`);
    }
    const models = await provider.provideLanguageModelChatInfo({ group: name, silent: false, configuration }, CancellationToken.None);
    for (const model of models) {
      const oldIdentifier = `${vendor}/${model.metadata.id}`;
      if (this._modelPickerUserPreferences[oldIdentifier] === true) {
        this._modelPickerUserPreferences[model.identifier] = true;
      }
      delete this._modelPickerUserPreferences[oldIdentifier];
    }
    this._saveModelPickerPreferences();
    await this.addLanguageModelsProviderGroup(name, vendor, configuration);
  }
  //#region Recently used models
  _readRecentlyUsedModels() {
    return this._storageService.getObject(CHAT_MODEL_RECENTLY_USED_STORAGE_KEY, 0, []);
  }
  _saveRecentlyUsedModels() {
    this._storageService.store(
      CHAT_MODEL_RECENTLY_USED_STORAGE_KEY,
      this._recentlyUsedModelIds,
      0,
      0
      /* StorageTarget.USER */
    );
  }
  getRecentlyUsedModelIds() {
    return this._recentlyUsedModelIds.filter((id) => this._modelCache.has(id) && id !== "copilot/auto").slice(0, 4);
  }
  addToRecentlyUsedList(modelIdentifier) {
    if (modelIdentifier === "copilot/auto") {
      return;
    }
    const index = this._recentlyUsedModelIds.indexOf(modelIdentifier);
    if (index !== -1) {
      this._recentlyUsedModelIds.splice(index, 1);
    }
    this._recentlyUsedModelIds.unshift(modelIdentifier);
    if (this._recentlyUsedModelIds.length > 20) {
      this._recentlyUsedModelIds.length = 20;
    }
    this._saveRecentlyUsedModels();
  }
  clearRecentlyUsedList() {
    this._recentlyUsedModelIds = [];
    this._saveRecentlyUsedModels();
  }
  //#endregion
  //#region Models control manifest
  getModelsControlManifest() {
    return this._modelsControlManifest;
  }
  _setModelsControlManifest(response) {
    this._modelsControlRawResponse = response;
    this._refreshModelsControlManifest();
  }
  _refreshModelsControlManifest() {
    const response = this._modelsControlRawResponse;
    const free = {};
    const paid = {};
    if (response?.free) {
      const freeEntries = Array.isArray(response.free) ? response.free : Object.values(response.free);
      for (const entry of freeEntries) {
        if (!entry || !isObject(entry)) {
          continue;
        }
        free[entry.id] = { label: entry.label, featured: entry.featured, exists: this._modelExistsInCache(entry.id) };
      }
    }
    if (response?.paid) {
      const paidEntries = Array.isArray(response.paid) ? response.paid : Object.values(response.paid);
      for (const entry of paidEntries) {
        if (!entry || !isObject(entry)) {
          continue;
        }
        paid[entry.id] = { label: entry.label, featured: entry.featured, minVSCodeVersion: entry.minVSCodeVersion, exists: this._modelExistsInCache(entry.id) };
      }
    }
    this._modelsControlManifest = { free, paid };
    this._onDidChangeModelsControlManifest.fire(this._modelsControlManifest);
  }
  _modelExistsInCache(metadataId) {
    for (const model of this._modelCache.values()) {
      if (model.id === metadataId) {
        return true;
      }
    }
    return false;
  }
  //#region Chat control data
  _initChatControlData() {
    this._chatControlUrl = this._productService.chatParticipantRegistry;
    if (!this._chatControlUrl) {
      return;
    }
    const raw = this._storageService.get(
      CHAT_PARTICIPANT_NAME_REGISTRY_STORAGE_KEY,
      -1
      /* StorageScope.APPLICATION */
    );
    try {
      this._restrictedChatParticipants.set(JSON.parse(raw ?? "{}"), void 0);
    } catch (err) {
      this._storageService.remove(
        CHAT_PARTICIPANT_NAME_REGISTRY_STORAGE_KEY,
        -1
        /* StorageScope.APPLICATION */
      );
    }
    const rawModels = this._storageService.get(
      CHAT_MODELS_CONTROL_STORAGE_KEY,
      -1
      /* StorageScope.APPLICATION */
    );
    try {
      const models = JSON.parse(rawModels ?? "{}");
      if (isObject(models)) {
        this._setModelsControlManifest(models);
      }
    } catch (err) {
      this._storageService.remove(
        CHAT_MODELS_CONTROL_STORAGE_KEY,
        -1
        /* StorageScope.APPLICATION */
      );
    }
    this._refreshChatControlData();
  }
  _refreshChatControlData() {
    if (this._chatControlDisposed) {
      return;
    }
    this._fetchChatControlData().catch((err) => this._logService.warn("Failed to fetch chat control data", err)).then(() => timeout(5 * 60 * 1e3)).then(() => this._refreshChatControlData());
  }
  async _fetchChatControlData() {
    this._logService.trace("[LM] Fetching chat control data from", this._chatControlUrl);
    let context;
    try {
      context = await this._requestService.request({ type: "GET", url: this._chatControlUrl, callSite: "languageModels.fetchChatControlData" }, CancellationToken.None);
    } catch (err) {
      this._logService.warn("[LM] Failed to request chat control data", getErrorMessage(err));
      return;
    }
    if (context.res.statusCode !== 200) {
      this._logService.warn(`[LM] Chat control data request failed with status ${context.res.statusCode}`);
      return;
    }
    let result;
    try {
      result = await asJson(context);
    } catch (err) {
      this._logService.warn("[LM] Failed to parse chat control response", getErrorMessage(err));
      return;
    }
    this._logService.trace("[LM] Received chat control response", result ? Object.keys(result) : "null");
    if (!result || result.version !== 1) {
      this._logService.warn("[LM] Unexpected chat control response version", result?.version);
      return;
    }
    const registry = result.restrictedChatParticipants;
    this._restrictedChatParticipants.set(registry, void 0);
    this._storageService.store(
      CHAT_PARTICIPANT_NAME_REGISTRY_STORAGE_KEY,
      JSON.stringify(registry),
      -1,
      1
      /* StorageTarget.MACHINE */
    );
    if (result.models) {
      this._logService.trace("[LM] Updating models control manifest", { freeCount: Object.keys(result.models.free ?? {}).length, paidCount: Object.keys(result.models.paid ?? {}).length });
      this._setModelsControlManifest(result.models);
      this._storageService.store(
        CHAT_MODELS_CONTROL_STORAGE_KEY,
        JSON.stringify(result.models),
        -1,
        1
        /* StorageTarget.MACHINE */
      );
    }
  }
  //#endregion
  dispose() {
    this._chatControlDisposed = true;
    this._store.dispose();
    this._providers.clear();
  }
};
LanguageModelsService = LanguageModelsService_1 = __decorate([
  __param(0, IExtensionService),
  __param(1, ILogService),
  __param(2, IStorageService),
  __param(3, IContextKeyService),
  __param(4, ILanguageModelsConfigurationService),
  __param(5, IQuickInputService),
  __param(6, ISecretStorageService),
  __param(7, IProductService),
  __param(8, IRequestService)
], LanguageModelsService);
export {
  ChatImageMimeType,
  ChatMessageRole,
  ILanguageModelChatMetadata,
  ILanguageModelsService,
  ImageDetailLevel,
  LanguageModelPartAudience,
  LanguageModelsService,
  getTextResponseFromStream,
  isILanguageModelChatSelector,
  languageModelChatProviderExtensionPoint
};
//# sourceMappingURL=languageModels.js.map
