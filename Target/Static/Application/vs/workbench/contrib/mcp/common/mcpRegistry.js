var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { derived, observableValue } from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/resources.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { observableMemento } from "../../../../platform/observable/common/observableMemento.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { ConfigurationResolverExpression } from "../../../services/configurationResolver/common/configurationResolverExpression.js";
import { AUX_WINDOW_GROUP, IEditorService } from "../../../services/editor/common/editorService.js";
import { mcpEnabledSection } from "./mcpConfiguration.js";
import { IMcpDevModeDebugging } from "./mcpDevMode.js";
import { McpRegistryInputStorage } from "./mcpRegistryInputStorage.js";
import { McpServerConnection } from "./mcpServerConnection.js";
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
const createTrustMemento = observableMemento({
  defaultValue: {},
  key: "mcp.trustedCollections"
});
let McpRegistry = class McpRegistry2 extends Disposable {
  static {
    __name(this, "McpRegistry");
  }
  get delegates() {
    return this._delegates;
  }
  constructor(_instantiationService, _configurationResolverService, _dialogService, _storageService, _productService, _notificationService, _editorService, configurationService) {
    super();
    this._instantiationService = _instantiationService;
    this._configurationResolverService = _configurationResolverService;
    this._dialogService = _dialogService;
    this._storageService = _storageService;
    this._productService = _productService;
    this._notificationService = _notificationService;
    this._editorService = _editorService;
    this._trustPrompts = /* @__PURE__ */ new Map();
    this._collections = observableValue("collections", []);
    this._delegates = observableValue("delegates", []);
    this.collections = derived((reader) => {
      if (!this._enabled.read(reader)) {
        return [];
      }
      return this._collections.read(reader);
    });
    this._serverIdAuthUsage = /* @__PURE__ */ new Map();
    this._workspaceStorage = new Lazy(() => this._register(this._instantiationService.createInstance(
      McpRegistryInputStorage,
      1,
      0
      /* StorageTarget.USER */
    )));
    this._profileStorage = new Lazy(() => this._register(this._instantiationService.createInstance(
      McpRegistryInputStorage,
      0,
      0
      /* StorageTarget.USER */
    )));
    this._trustMemento = new Lazy(() => this._register(createTrustMemento(-1, 1, this._storageService)));
    this._ongoingLazyActivations = observableValue(this, 0);
    this.lazyCollectionState = derived((reader) => {
      if (this._enabled.read(reader) === false) {
        return 2;
      }
      if (this._ongoingLazyActivations.read(reader) > 0) {
        return 1;
      }
      const collections = this._collections.read(reader);
      return collections.some((c) => c.lazy && c.lazy.isCached === false) ? 0 : 2;
    });
    this._onDidChangeInputs = this._register(new Emitter());
    this.onDidChangeInputs = this._onDidChangeInputs.event;
    this._enabled = observableConfigValue(mcpEnabledSection, true, configurationService);
  }
  registerDelegate(delegate) {
    const delegates = this._delegates.get().slice();
    delegates.push(delegate);
    delegates.sort((a, b) => b.priority - a.priority);
    this._delegates.set(delegates, void 0);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const delegates2 = this._delegates.get().filter((d) => d !== delegate);
        this._delegates.set(delegates2, void 0);
      }, "dispose")
    };
  }
  registerCollection(collection) {
    const currentCollections = this._collections.get();
    const toReplace = currentCollections.find((c) => c.lazy && c.id === collection.id);
    if (toReplace) {
      this._collections.set(currentCollections.map((c) => c === toReplace ? collection : c), void 0);
    } else {
      this._collections.set([...currentCollections, collection].sort((a, b) => (a.presentation?.order || 0) - (b.presentation?.order || 0)), void 0);
    }
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const currentCollections2 = this._collections.get();
        this._collections.set(currentCollections2.filter((c) => c !== collection), void 0);
      }, "dispose")
    };
  }
  getAuthenticationUsage(mcpServerId) {
    return this._serverIdAuthUsage.get(mcpServerId);
  }
  setAuthenticationUsage(mcpServerId, providerId) {
    this._serverIdAuthUsage.set(mcpServerId, providerId);
  }
  getServerDefinition(collectionRef, definitionRef) {
    const collectionObs = this._collections.map((cols) => cols.find((c) => c.id === collectionRef.id));
    return collectionObs.map((collection, reader) => {
      const server = collection?.serverDefinitions.read(reader).find((s) => s.id === definitionRef.id);
      return { collection, server };
    });
  }
  async discoverCollections() {
    const toDiscover = this._collections.get().filter((c) => c.lazy && !c.lazy.isCached);
    this._ongoingLazyActivations.set(this._ongoingLazyActivations.get() + 1, void 0);
    await Promise.all(toDiscover.map((c) => c.lazy?.load())).finally(() => {
      this._ongoingLazyActivations.set(this._ongoingLazyActivations.get() - 1, void 0);
    });
    const found = [];
    const current = this._collections.get();
    for (const collection of toDiscover) {
      const rec = current.find((c) => c.id === collection.id);
      if (!rec) {
      } else if (rec.lazy) {
        rec.lazy.removed?.();
      } else {
        found.push(rec);
      }
    }
    return found;
  }
  _getInputStorage(scope) {
    return scope === 1 ? this._workspaceStorage.value : this._profileStorage.value;
  }
  _getInputStorageInConfigTarget(configTarget) {
    return this._getInputStorage(
      configTarget === 5 || configTarget === 6 ? 1 : 0
      /* StorageScope.PROFILE */
    );
  }
  async clearSavedInputs(scope, inputId) {
    const storage = this._getInputStorage(scope);
    if (inputId) {
      await storage.clear(inputId);
    } else {
      storage.clearAll();
    }
    this._onDidChangeInputs.fire();
  }
  async editSavedInput(inputId, folderData, configSection, target) {
    const storage = this._getInputStorageInConfigTarget(target);
    const expr = ConfigurationResolverExpression.parse(inputId);
    const stored = await storage.getMap();
    const previous = stored[inputId].value;
    await this._configurationResolverService.resolveWithInteraction(folderData, expr, configSection, previous ? { [inputId.slice(2, -1)]: previous } : {}, target);
    await this._updateStorageWithExpressionInputs(storage, expr);
  }
  async setSavedInput(inputId, target, value) {
    const storage = this._getInputStorageInConfigTarget(target);
    const expr = ConfigurationResolverExpression.parse(inputId);
    for (const unresolved of expr.unresolved()) {
      expr.resolve(unresolved, value);
      break;
    }
    await this._updateStorageWithExpressionInputs(storage, expr);
  }
  getSavedInputs(scope) {
    return this._getInputStorage(scope).getMap();
  }
  resetTrust() {
    this._trustMemento.value.set({}, void 0);
  }
  getTrust(collectionRef) {
    return derived((reader) => {
      const collection = this._collections.read(reader).find((c) => c.id === collectionRef.id);
      if (!collection || collection.isTrustedByDefault) {
        return true;
      }
      const memento = this._trustMemento.value.read(reader);
      return memento.hasOwnProperty(collection.id) ? memento[collection.id] : void 0;
    });
  }
  _promptForTrust(collection) {
    let resultPromise = this._trustPrompts.get(collection.id);
    resultPromise ??= this._promptForTrustOpenDialog(collection).finally(() => {
      this._trustPrompts.delete(collection.id);
    });
    this._trustPrompts.set(collection.id, resultPromise);
    return resultPromise;
  }
  async _promptForTrustOpenDialog(collection) {
    const originURI = collection.presentation?.origin;
    const labelWithOrigin = originURI ? `[\`${basename(originURI)}\`](${originURI})` : collection.label;
    const result = await this._dialogService.prompt({
      message: localize("trustTitleWithOrigin", "Trust MCP servers from {0}?", collection.label),
      custom: {
        icon: Codicon.shield,
        markdownDetails: [{
          markdown: new MarkdownString(localize("mcp.trust.details", "{0} discovered Model Context Protocol servers from {1} (`{2}`). {0} can use their capabilities in Chat.\n\nDo you want to allow running MCP servers from {3}?", this._productService.nameShort, collection.label, collection.serverDefinitions.get().map((s) => s.label).join("`, `"), labelWithOrigin)),
          actionHandler: /* @__PURE__ */ __name(() => {
            const editor = this._editorService.openEditor({ resource: collection.presentation.origin }, AUX_WINDOW_GROUP);
            return editor.then(Boolean);
          }, "actionHandler")
        }]
      },
      buttons: [
        { label: localize("mcp.trust.yes", "Trust"), run: /* @__PURE__ */ __name(() => true, "run") },
        { label: localize("mcp.trust.no", "Do not trust"), run: /* @__PURE__ */ __name(() => false, "run") }
      ]
    });
    return result.result;
  }
  async _updateStorageWithExpressionInputs(inputStorage, expr) {
    const secrets = {};
    const inputs = {};
    for (const [replacement, resolved] of expr.resolved()) {
      if (resolved.input?.type === "promptString" && resolved.input.password) {
        secrets[replacement.id] = resolved;
      } else {
        inputs[replacement.id] = resolved;
      }
    }
    inputStorage.setPlainText(inputs);
    await inputStorage.setSecrets(secrets);
    this._onDidChangeInputs.fire();
  }
  async _replaceVariablesInLaunch(definition, launch) {
    if (!definition.variableReplacement) {
      return launch;
    }
    const { section, target, folder } = definition.variableReplacement;
    const inputStorage = this._getInputStorageInConfigTarget(target);
    const previouslyStored = await inputStorage.getMap();
    const expr = ConfigurationResolverExpression.parse(launch);
    for (const replacement of expr.unresolved()) {
      if (previouslyStored.hasOwnProperty(replacement.id)) {
        expr.resolve(replacement, previouslyStored[replacement.id]);
      }
    }
    await this._configurationResolverService.resolveWithInteraction(folder, expr, section, void 0, target);
    await this._updateStorageWithExpressionInputs(inputStorage, expr);
    return await this._configurationResolverService.resolveAsync(folder, expr);
  }
  async resolveConnection({ collectionRef, definitionRef, forceTrust, logger, debug }) {
    let collection = this._collections.get().find((c) => c.id === collectionRef.id);
    if (collection?.lazy) {
      await collection.lazy.load();
      collection = this._collections.get().find((c) => c.id === collectionRef.id);
    }
    const definition = collection?.serverDefinitions.get().find((s) => s.id === definitionRef.id);
    if (!collection || !definition) {
      throw new Error(`Collection or definition not found for ${collectionRef.id} and ${definitionRef.id}`);
    }
    const delegate = this._delegates.get().find((d) => d.canStart(collection, definition));
    if (!delegate) {
      throw new Error("No delegate found that can handle the connection");
    }
    if (!collection.isTrustedByDefault) {
      const memento = this._trustMemento.value.get();
      const trusted = memento.hasOwnProperty(collection.id) ? memento[collection.id] : void 0;
      if (trusted) {
      } else if (trusted === void 0 || forceTrust) {
        const trustValue = await this._promptForTrust(collection);
        if (trustValue !== void 0) {
          this._trustMemento.value.set({ ...memento, [collection.id]: trustValue }, void 0);
        }
        if (!trustValue) {
          return;
        }
      } else {
        return void 0;
      }
    }
    let launch = definition.launch;
    if (collection.resolveServerLanch) {
      launch = await collection.resolveServerLanch(definition);
      if (!launch) {
        return void 0;
      }
    }
    try {
      launch = await this._replaceVariablesInLaunch(definition, launch);
      if (definition.devMode && debug) {
        launch = await this._instantiationService.invokeFunction((accessor) => accessor.get(IMcpDevModeDebugging).transform(definition, launch));
      }
    } catch (e) {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("mcp.launchError", "Error starting {0}: {1}", definition.label, String(e)),
        actions: {
          primary: collection.presentation?.origin && [
            {
              id: "mcp.launchError.openConfig",
              class: void 0,
              enabled: true,
              tooltip: "",
              label: localize("mcp.launchError.openConfig", "Open Configuration"),
              run: /* @__PURE__ */ __name(() => this._editorService.openEditor({
                resource: collection.presentation.origin,
                options: { selection: definition.presentation?.origin?.range }
              }), "run")
            }
          ]
        }
      });
      return;
    }
    return this._instantiationService.createInstance(McpServerConnection, collection, definition, delegate, launch, logger);
  }
};
McpRegistry = __decorate([
  __param(0, IInstantiationService),
  __param(1, IConfigurationResolverService),
  __param(2, IDialogService),
  __param(3, IStorageService),
  __param(4, IProductService),
  __param(5, INotificationService),
  __param(6, IEditorService),
  __param(7, IConfigurationService)
], McpRegistry);
export {
  McpRegistry
};
//# sourceMappingURL=mcpRegistry.js.map
