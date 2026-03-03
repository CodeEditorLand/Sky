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
import { assertNever } from "../../../../base/common/assert.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { derived, observableValue, autorunSelfDisposable } from "../../../../base/common/observable.js";
import { isDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { mcpAccessConfig } from "../../../../platform/mcp/common/mcpManagement.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { ConfigurationResolverExpression } from "../../../services/configurationResolver/common/configurationResolverExpression.js";
import { AUX_WINDOW_GROUP, IEditorService } from "../../../services/editor/common/editorService.js";
import { IMcpDevModeDebugging } from "./mcpDevMode.js";
import { McpRegistryInputStorage } from "./mcpRegistryInputStorage.js";
import { IMcpSandboxService } from "./mcpSandboxService.js";
import { McpServerConnection } from "./mcpServerConnection.js";
import { McpStartServerInteraction, UserInteractionRequiredError } from "./mcpTypes.js";
const notTrustedNonce = "__vscode_not_trusted";
let McpRegistry = class McpRegistry2 extends Disposable {
  static {
    __name(this, "McpRegistry");
  }
  get delegates() {
    return this._delegates;
  }
  constructor(_instantiationService, _configurationResolverService, _dialogService, _notificationService, _editorService, configurationService, _quickInputService, _labelService, _logService, _mcpSandboxService) {
    super();
    this._instantiationService = _instantiationService;
    this._configurationResolverService = _configurationResolverService;
    this._dialogService = _dialogService;
    this._notificationService = _notificationService;
    this._editorService = _editorService;
    this._quickInputService = _quickInputService;
    this._labelService = _labelService;
    this._logService = _logService;
    this._mcpSandboxService = _mcpSandboxService;
    this._collections = observableValue("collections", []);
    this._delegates = observableValue("delegates", []);
    this.collections = derived((reader) => {
      if (this._mcpAccessValue.read(reader) === "none") {
        return [];
      }
      return this._collections.read(reader);
    });
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
    this._ongoingLazyActivations = observableValue(this, 0);
    this.lazyCollectionState = derived((reader) => {
      if (this._mcpAccessValue.read(reader) === "none") {
        return { state: 2, collections: [] };
      }
      if (this._ongoingLazyActivations.read(reader) > 0) {
        return { state: 1, collections: [] };
      }
      const collections = this._collections.read(reader);
      const hasUnknown = collections.some((c) => c.lazy && c.lazy.isCached === false);
      return hasUnknown ? { state: 0, collections: collections.filter((c) => c.lazy && c.lazy.isCached === false) } : { state: 2, collections: [] };
    });
    this._onDidChangeInputs = this._register(new Emitter());
    this.onDidChangeInputs = this._onDidChangeInputs.event;
    this._mcpAccessValue = observableConfigValue(mcpAccessConfig, "all", configurationService);
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
    const toReplace = currentCollections.find((c) => c.id === collection.id);
    if (toReplace && !toReplace.lazy) {
      return Disposable.None;
    } else if (toReplace) {
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
  async _checkTrust(collection, definition, { trustNonceBearer, interaction, promptType = "only-new", autoTrustChanges = false, errorOnUserInteraction = false }) {
    if (collection.trustBehavior === 0) {
      this._logService.trace(`MCP server ${definition.id} is trusted, no trust prompt needed`);
      return true;
    } else if (collection.trustBehavior === 1) {
      if (definition.cacheNonce === trustNonceBearer.trustedAtNonce) {
        this._logService.trace(`MCP server ${definition.id} is unchanged, no trust prompt needed`);
        return true;
      }
      if (autoTrustChanges) {
        this._logService.trace(`MCP server ${definition.id} is was changed but user explicitly executed`);
        trustNonceBearer.trustedAtNonce = definition.cacheNonce;
        return true;
      }
      if (trustNonceBearer.trustedAtNonce === notTrustedNonce) {
        if (promptType === "all-untrusted") {
          if (errorOnUserInteraction) {
            throw new UserInteractionRequiredError("serverTrust");
          }
          return this._promptForTrust(definition, collection, interaction, trustNonceBearer);
        } else {
          this._logService.trace(`MCP server ${definition.id} is untrusted, denying trust prompt`);
          return false;
        }
      }
      if (promptType === "never") {
        this._logService.trace(`MCP server ${definition.id} trust state is unknown, skipping prompt`);
        return false;
      }
      if (errorOnUserInteraction) {
        throw new UserInteractionRequiredError("serverTrust");
      }
      const didTrust = await this._promptForTrust(definition, collection, interaction, trustNonceBearer);
      if (didTrust) {
        return true;
      }
      if (didTrust === void 0) {
        return void 0;
      }
      trustNonceBearer.trustedAtNonce = notTrustedNonce;
      return false;
    } else {
      assertNever(collection.trustBehavior);
    }
  }
  async _promptForTrust(definition, collection, interaction, trustNonceBearer) {
    interaction ??= new McpStartServerInteraction();
    interaction.participants.set(definition.id, { s: "waiting", definition, collection });
    const trustedDefinitionIds = await new Promise((resolve) => {
      autorunSelfDisposable((reader) => {
        const map = interaction.participants.observable.read(reader);
        if (Iterable.some(map.values(), (p) => p.s === "unknown")) {
          return;
        }
        reader.dispose();
        interaction.choice ??= this._promptForTrustOpenDialog([...map.values()].map((v) => v.s === "waiting" ? v : void 0).filter(isDefined));
        resolve(interaction.choice);
      });
    });
    this._logService.trace(`MCP trusted servers:`, trustedDefinitionIds);
    if (trustedDefinitionIds) {
      trustNonceBearer.trustedAtNonce = trustedDefinitionIds.includes(definition.id) ? definition.cacheNonce : notTrustedNonce;
    }
    return !!trustedDefinitionIds?.includes(definition.id);
  }
  /**
   * Confirms with the user which of the provided definitions should be trusted.
   * Returns undefined if the user cancelled the flow, or the list of trusted
   * definition IDs otherwise.
   */
  async _promptForTrustOpenDialog(definitions) {
    function labelFor(r) {
      const originURI = r.definition.presentation?.origin?.uri || r.collection.presentation?.origin;
      let labelWithOrigin = originURI ? `[\`${r.definition.label}\`](${originURI})` : "`" + r.definition.label + "`";
      if (r.collection.source instanceof ExtensionIdentifier) {
        labelWithOrigin += ` (${localize("trustFromExt", "from {0}", r.collection.source.value)})`;
      }
      return labelWithOrigin;
    }
    __name(labelFor, "labelFor");
    if (definitions.length === 1) {
      const def = definitions[0];
      const originURI = def.definition.presentation?.origin?.uri;
      const { result: result2 } = await this._dialogService.prompt({
        message: localize("trustTitleWithOrigin", "Trust and run MCP server {0}?", def.definition.label),
        custom: {
          icon: Codicon.shield,
          markdownDetails: [{
            markdown: new MarkdownString(localize("mcp.trust.details", "The MCP server {0} was updated. MCP servers may add context to your chat session and lead to unexpected behavior. Do you want to trust and run this server?", labelFor(def))),
            actionHandler: /* @__PURE__ */ __name(() => {
              const editor = this._editorService.openEditor({ resource: originURI }, AUX_WINDOW_GROUP);
              return editor.then(Boolean);
            }, "actionHandler")
          }]
        },
        buttons: [
          { label: localize("mcp.trust.yes", "Trust"), run: /* @__PURE__ */ __name(() => true, "run") },
          { label: localize("mcp.trust.no", "Do not trust"), run: /* @__PURE__ */ __name(() => false, "run") }
        ]
      });
      return result2 === void 0 ? void 0 : result2 ? [def.definition.id] : [];
    }
    const list = definitions.map((d) => `- ${labelFor(d)}`).join("\n");
    const { result } = await this._dialogService.prompt({
      message: localize("trustTitleWithOriginMulti", "Trust and run {0} MCP servers?", definitions.length),
      custom: {
        icon: Codicon.shield,
        markdownDetails: [{
          markdown: new MarkdownString(localize("mcp.trust.detailsMulti", "Several updated MCP servers were discovered:\n\n{0}\n\n MCP servers may add context to your chat session and lead to unexpected behavior. Do you want to trust and run these server?", list)),
          actionHandler: /* @__PURE__ */ __name((uri) => {
            const editor = this._editorService.openEditor({ resource: URI.parse(uri) }, AUX_WINDOW_GROUP);
            return editor.then(Boolean);
          }, "actionHandler")
        }]
      },
      buttons: [
        { label: localize("mcp.trust.yes", "Trust"), run: /* @__PURE__ */ __name(() => "all", "run") },
        { label: localize("mcp.trust.pick", "Pick Trusted"), run: /* @__PURE__ */ __name(() => "pick", "run") },
        { label: localize("mcp.trust.no", "Do not trust"), run: /* @__PURE__ */ __name(() => "none", "run") }
      ]
    });
    if (result === void 0) {
      return void 0;
    } else if (result === "all") {
      return definitions.map((d) => d.definition.id);
    } else if (result === "none") {
      return [];
    }
    function isActionableButton(obj) {
      return typeof obj.action === "function";
    }
    __name(isActionableButton, "isActionableButton");
    const store = new DisposableStore();
    const picker = store.add(this._quickInputService.createQuickPick({ useSeparators: false }));
    picker.canSelectMany = true;
    picker.items = definitions.map(({ definition, collection }) => {
      const buttons = [];
      if (definition.presentation?.origin) {
        const origin = definition.presentation.origin;
        buttons.push({
          iconClass: "codicon-go-to-file",
          tooltip: "Go to Definition",
          action: /* @__PURE__ */ __name(() => this._editorService.openEditor({ resource: origin.uri, options: { selection: origin.range } }), "action")
        });
      }
      return {
        type: "item",
        label: definition.label,
        definitonId: definition.id,
        description: collection.source instanceof ExtensionIdentifier ? collection.source.value : definition.presentation?.origin ? this._labelService.getUriLabel(definition.presentation.origin.uri) : void 0,
        picked: false,
        buttons
      };
    });
    picker.placeholder = "Select MCP servers to trust";
    picker.ignoreFocusOut = true;
    store.add(picker.onDidTriggerItemButton((e) => {
      if (isActionableButton(e.button)) {
        e.button.action();
      }
    }));
    return new Promise((resolve) => {
      store.add(picker.onDidAccept(() => {
        resolve(picker.selectedItems.map((item) => item.definitonId));
        picker.hide();
      }));
      store.add(picker.onDidHide(() => {
        resolve(void 0);
      }));
      picker.show();
    }).finally(() => store.dispose());
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
  async _replaceVariablesInLaunch(delegate, definition, launch, errorOnUserInteraction) {
    if (!definition.variableReplacement) {
      return launch;
    }
    const { section, target, folder } = definition.variableReplacement;
    const inputStorage = this._getInputStorageInConfigTarget(target);
    const [previouslyStored, withRemoteFilled] = await Promise.all([
      inputStorage.getMap(),
      delegate.substituteVariables(definition, launch)
    ]);
    const expr = ConfigurationResolverExpression.parse(withRemoteFilled);
    for (const replacement of expr.unresolved()) {
      if (previouslyStored.hasOwnProperty(replacement.id)) {
        expr.resolve(replacement, previouslyStored[replacement.id]);
      }
    }
    if (errorOnUserInteraction) {
      const unresolved = Array.from(expr.unresolved());
      if (unresolved.length > 0) {
        throw new UserInteractionRequiredError("variables");
      }
    }
    await this._configurationResolverService.resolveWithInteraction(folder, expr, section, void 0, target);
    await this._updateStorageWithExpressionInputs(inputStorage, expr);
    return await this._configurationResolverService.resolveAsync(folder, expr);
  }
  async resolveConnection(opts) {
    const { collectionRef, definitionRef, interaction, logger, debug } = opts;
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
    const trusted = await this._checkTrust(collection, definition, opts);
    interaction?.participants.set(definition.id, { s: "resolved" });
    if (!trusted) {
      return void 0;
    }
    let launch = definition.launch;
    if (collection.resolveServerLanch) {
      launch = await collection.resolveServerLanch(definition);
      if (!launch) {
        return void 0;
      }
    }
    try {
      launch = await this._replaceVariablesInLaunch(delegate, definition, launch, opts.errorOnUserInteraction);
      if (definition.devMode && debug) {
        launch = await this._instantiationService.invokeFunction((accessor) => accessor.get(IMcpDevModeDebugging).transform(definition, launch));
      }
      launch = await this._mcpSandboxService.launchInSandboxIfEnabled(definition, launch, collection.remoteAuthority ?? void 0, collection.configTarget);
    } catch (e) {
      if (e instanceof UserInteractionRequiredError) {
        throw e;
      }
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
    return this._instantiationService.createInstance(McpServerConnection, collection, definition, delegate, launch, logger, opts.errorOnUserInteraction, opts.taskManager);
  }
};
McpRegistry = __decorate([
  __param(0, IInstantiationService),
  __param(1, IConfigurationResolverService),
  __param(2, IDialogService),
  __param(3, INotificationService),
  __param(4, IEditorService),
  __param(5, IConfigurationService),
  __param(6, IQuickInputService),
  __param(7, ILabelService),
  __param(8, ILogService),
  __param(9, IMcpSandboxService)
], McpRegistry);
export {
  McpRegistry
};
//# sourceMappingURL=mcpRegistry.js.map
