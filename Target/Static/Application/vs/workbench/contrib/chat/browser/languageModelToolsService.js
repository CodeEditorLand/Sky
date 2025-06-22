var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getActiveDocument } from "../../../../base/browser/dom.js";
import { renderStringAsPlaintext } from "../../../../base/browser/markdownRenderer.js";
import { assertNever } from "../../../../base/common/assert.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { encodeBase64 } from "../../../../base/common/buffer.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { CancellationError, isCancellationError } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { LRUCache } from "../../../../base/common/map.js";
import { ObservableSet } from "../../../../base/common/observable.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import * as JSONContributionRegistry from "../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { ChatContextKeys } from "../common/chatContextKeys.js";
import { ChatToolInvocation } from "../common/chatProgressTypes/chatToolInvocation.js";
import { IChatService } from "../common/chatService.js";
import { ChatConfiguration } from "../common/constants.js";
import { createToolSchemaUri, ToolSet, stringifyPromptTsxPart } from "../common/languageModelToolsService.js";
import { getToolConfirmationAlert } from "./chatAccessibilityProvider.js";
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
var ToolConfirmStore_1;
const jsonSchemaRegistry = Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
let LanguageModelToolsService = class LanguageModelToolsService2 extends Disposable {
  static {
    __name(this, "LanguageModelToolsService");
  }
  constructor(_instantiationService, _extensionService, _contextKeyService, _chatService, _dialogService, _telemetryService, _logService, _configurationService, _accessibilityService, _accessibilitySignalService) {
    super();
    this._instantiationService = _instantiationService;
    this._extensionService = _extensionService;
    this._contextKeyService = _contextKeyService;
    this._chatService = _chatService;
    this._dialogService = _dialogService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._accessibilityService = _accessibilityService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._onDidChangeTools = new Emitter();
    this.onDidChangeTools = this._onDidChangeTools.event;
    this._onDidChangeToolsScheduler = new RunOnceScheduler(() => this._onDidChangeTools.fire(), 750);
    this._tools = /* @__PURE__ */ new Map();
    this._toolContextKeys = /* @__PURE__ */ new Set();
    this._callsByRequestId = /* @__PURE__ */ new Map();
    this._memoryToolConfirmStore = /* @__PURE__ */ new Set();
    this._toolSets = new ObservableSet();
    this.toolSets = this._toolSets.observable;
    this._workspaceToolConfirmStore = new Lazy(() => this._register(this._instantiationService.createInstance(
      ToolConfirmStore,
      1
      /* StorageScope.WORKSPACE */
    )));
    this._profileToolConfirmStore = new Lazy(() => this._register(this._instantiationService.createInstance(
      ToolConfirmStore,
      0
      /* StorageScope.PROFILE */
    )));
    this._register(this._contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(this._toolContextKeys)) {
        this._onDidChangeToolsScheduler.schedule();
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ChatConfiguration.ExtensionToolsEnabled)) {
        this._onDidChangeToolsScheduler.schedule();
      }
    }));
    this._ctxToolsCount = ChatContextKeys.Tools.toolsCount.bindTo(_contextKeyService);
  }
  dispose() {
    super.dispose();
    this._callsByRequestId.forEach((calls) => calls.forEach((call) => call.store.dispose()));
    this._ctxToolsCount.reset();
  }
  registerToolData(toolData) {
    if (this._tools.has(toolData.id)) {
      throw new Error(`Tool "${toolData.id}" is already registered.`);
    }
    this._tools.set(toolData.id, { data: toolData });
    this._ctxToolsCount.set(this._tools.size);
    this._onDidChangeToolsScheduler.schedule();
    toolData.when?.keys().forEach((key) => this._toolContextKeys.add(key));
    let store;
    if (toolData.inputSchema) {
      store = new DisposableStore();
      const schemaUrl = createToolSchemaUri(toolData.id).toString();
      jsonSchemaRegistry.registerSchema(schemaUrl, toolData.inputSchema, store);
      store.add(jsonSchemaRegistry.registerSchemaAssociation(schemaUrl, `/lm/tool/${toolData.id}/tool_input.json`));
    }
    return toDisposable(() => {
      store?.dispose();
      this._tools.delete(toolData.id);
      this._ctxToolsCount.set(this._tools.size);
      this._refreshAllToolContextKeys();
      this._onDidChangeToolsScheduler.schedule();
    });
  }
  _refreshAllToolContextKeys() {
    this._toolContextKeys.clear();
    for (const tool of this._tools.values()) {
      tool.data.when?.keys().forEach((key) => this._toolContextKeys.add(key));
    }
  }
  registerToolImplementation(id, tool) {
    const entry = this._tools.get(id);
    if (!entry) {
      throw new Error(`Tool "${id}" was not contributed.`);
    }
    if (entry.impl) {
      throw new Error(`Tool "${id}" already has an implementation.`);
    }
    entry.impl = tool;
    return toDisposable(() => {
      entry.impl = void 0;
    });
  }
  getTools(includeDisabled) {
    const toolDatas = Iterable.map(this._tools.values(), (i) => i.data);
    const extensionToolsEnabled = this._configurationService.getValue(ChatConfiguration.ExtensionToolsEnabled);
    return Iterable.filter(toolDatas, (toolData) => {
      const satisfiesWhenClause = includeDisabled || !toolData.when || this._contextKeyService.contextMatchesRules(toolData.when);
      const satisfiesExternalToolCheck = toolData.source.type !== "extension" || !!extensionToolsEnabled;
      return satisfiesWhenClause && satisfiesExternalToolCheck;
    });
  }
  getTool(id) {
    return this._getToolEntry(id)?.data;
  }
  _getToolEntry(id) {
    const entry = this._tools.get(id);
    if (entry && (!entry.data.when || this._contextKeyService.contextMatchesRules(entry.data.when))) {
      return entry;
    } else {
      return void 0;
    }
  }
  getToolByName(name, includeDisabled) {
    for (const tool of this.getTools(!!includeDisabled)) {
      if (tool.toolReferenceName === name) {
        return tool;
      }
    }
    return void 0;
  }
  setToolAutoConfirmation(toolId, scope, autoConfirm = true) {
    if (scope === "workspace") {
      this._workspaceToolConfirmStore.value.setAutoConfirm(toolId, autoConfirm);
    } else if (scope === "profile") {
      this._profileToolConfirmStore.value.setAutoConfirm(toolId, autoConfirm);
    } else {
      this._memoryToolConfirmStore.add(toolId);
    }
  }
  resetToolAutoConfirmation() {
    this._workspaceToolConfirmStore.value.reset();
    this._profileToolConfirmStore.value.reset();
    this._memoryToolConfirmStore.clear();
  }
  async invokeTool(dto, countTokens, token) {
    this._logService.trace(`[LanguageModelToolsService#invokeTool] Invoking tool ${dto.toolId} with parameters ${JSON.stringify(dto.parameters)}`);
    let tool = this._tools.get(dto.toolId);
    if (!tool) {
      throw new Error(`Tool ${dto.toolId} was not contributed`);
    }
    if (!tool.impl) {
      await this._extensionService.activateByEvent(`onLanguageModelTool:${dto.toolId}`);
      tool = this._tools.get(dto.toolId);
      if (!tool?.impl) {
        throw new Error(`Tool ${dto.toolId} does not have an implementation registered.`);
      }
    }
    let toolInvocation;
    let requestId;
    let store;
    let toolResult;
    try {
      if (dto.context) {
        store = new DisposableStore();
        const model = this._chatService.getSession(dto.context?.sessionId);
        if (!model) {
          throw new Error(`Tool called for unknown chat session`);
        }
        const request = model.getRequests().at(-1);
        requestId = request.id;
        dto.modelId = request.modelId;
        if (!this._callsByRequestId.has(requestId)) {
          this._callsByRequestId.set(requestId, []);
        }
        const trackedCall = { store };
        this._callsByRequestId.get(requestId).push(trackedCall);
        const source = new CancellationTokenSource();
        store.add(toDisposable(() => {
          source.dispose(true);
        }));
        store.add(token.onCancellationRequested(() => {
          toolInvocation?.confirmed.complete(false);
          source.cancel();
        }));
        store.add(source.token.onCancellationRequested(() => {
          toolInvocation?.confirmed.complete(false);
        }));
        token = source.token;
        const prepared = await this.prepareToolInvocation(tool, dto, token);
        toolInvocation = new ChatToolInvocation(prepared, tool.data, dto.callId);
        trackedCall.invocation = toolInvocation;
        const autoConfirmed = this.shouldAutoConfirm(tool.data.id, tool.data.runsInWorkspace);
        if (autoConfirmed) {
          toolInvocation.confirmed.complete(true);
        }
        model.acceptResponseProgress(request, toolInvocation);
        if (prepared?.confirmationMessages) {
          if (!toolInvocation.isConfirmed && !autoConfirmed) {
            this.playAccessibilitySignal([toolInvocation]);
          }
          const userConfirmed = await toolInvocation.confirmed.p;
          if (!userConfirmed) {
            throw new CancellationError();
          }
          dto.toolSpecificData = toolInvocation?.toolSpecificData;
          if (dto.toolSpecificData?.kind === "input") {
            dto.parameters = dto.toolSpecificData.rawInput;
            dto.toolSpecificData = void 0;
          }
        }
      } else {
        const prepared = await this.prepareToolInvocation(tool, dto, token);
        if (prepared?.confirmationMessages && !this.shouldAutoConfirm(tool.data.id, tool.data.runsInWorkspace)) {
          const result = await this._dialogService.confirm({ message: renderStringAsPlaintext(prepared.confirmationMessages.title), detail: renderStringAsPlaintext(prepared.confirmationMessages.message) });
          if (!result.confirmed) {
            throw new CancellationError();
          }
        }
      }
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      toolResult = await tool.impl.invoke(dto, countTokens, {
        report: /* @__PURE__ */ __name((step) => {
          toolInvocation?.acceptProgress(step);
        }, "report")
      }, token);
      this.ensureToolDetails(dto, toolResult, tool.data);
      this._telemetryService.publicLog2("languageModelToolInvoked", {
        result: "success",
        chatSessionId: dto.context?.sessionId,
        toolId: tool.data.id,
        toolExtensionId: tool.data.source.type === "extension" ? tool.data.source.extensionId.value : void 0,
        toolSourceKind: tool.data.source.type
      });
      return toolResult;
    } catch (err) {
      const result = isCancellationError(err) ? "userCancelled" : "error";
      this._telemetryService.publicLog2("languageModelToolInvoked", {
        result,
        chatSessionId: dto.context?.sessionId,
        toolId: tool.data.id,
        toolExtensionId: tool.data.source.type === "extension" ? tool.data.source.extensionId.value : void 0,
        toolSourceKind: tool.data.source.type
      });
      this._logService.error(`[LanguageModelToolsService#invokeTool] Error from tool ${dto.toolId} with parameters ${JSON.stringify(dto.parameters)}:
${toErrorMessage(err, true)}`);
      toolResult ??= { content: [] };
      toolResult.toolResultError = err instanceof Error ? err.message : String(err);
      if (tool.data.alwaysDisplayInputOutput) {
        toolResult.toolResultDetails = { input: this.formatToolInput(dto), output: [{ isText: true, value: String(err) }], isError: true };
      }
      throw err;
    } finally {
      toolInvocation?.complete(toolResult);
      if (requestId && store) {
        this.cleanupCallDisposables(requestId, store);
      }
    }
  }
  async prepareToolInvocation(tool, dto, token) {
    const prepared = tool.impl.prepareToolInvocation ? await tool.impl.prepareToolInvocation(dto.parameters, token) : void 0;
    if (prepared?.confirmationMessages) {
      if (prepared.toolSpecificData?.kind !== "terminal" && typeof prepared.confirmationMessages.allowAutoConfirm !== "boolean") {
        prepared.confirmationMessages.allowAutoConfirm = true;
      }
      if (!prepared.toolSpecificData && tool.data.alwaysDisplayInputOutput) {
        prepared.toolSpecificData = {
          kind: "input",
          rawInput: dto.parameters
        };
      }
    }
    return prepared;
  }
  playAccessibilitySignal(toolInvocations) {
    const hasFocusedWindow = getActiveDocument().hasFocus();
    const autoApproved = this._configurationService.getValue("chat.tools.autoApprove");
    if (autoApproved) {
      return;
    }
    const setting = this._configurationService.getValue(AccessibilitySignal.chatUserActionRequired.settingsKey);
    if (!setting) {
      return;
    }
    const soundEnabled = setting.sound === "on" || setting.sound === "auto" && (this._accessibilityService.isScreenReaderOptimized() || !hasFocusedWindow);
    const announcementEnabled = this._accessibilityService.isScreenReaderOptimized() && setting.announcement === "auto";
    if (soundEnabled || announcementEnabled) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.chatUserActionRequired, { customAlertMessage: this._instantiationService.invokeFunction(getToolConfirmationAlert, toolInvocations), userGesture: true, modality: !soundEnabled ? "announcement" : void 0 });
    }
  }
  ensureToolDetails(dto, toolResult, toolData) {
    if (!toolResult.toolResultDetails && toolData.alwaysDisplayInputOutput) {
      toolResult.toolResultDetails = {
        input: this.formatToolInput(dto),
        output: this.toolResultToIO(toolResult)
      };
    }
  }
  formatToolInput(dto) {
    return JSON.stringify(dto.parameters, void 0, 2);
  }
  toolResultToIO(toolResult) {
    return toolResult.content.map((part) => {
      if (part.kind === "text") {
        return { isText: true, value: part.value };
      } else if (part.kind === "promptTsx") {
        return { isText: true, value: stringifyPromptTsxPart(part) };
      } else if (part.kind === "data") {
        return { value: encodeBase64(part.value.data), mimeType: part.value.mimeType };
      } else {
        assertNever(part);
      }
    });
  }
  shouldAutoConfirm(toolId, runsInWorkspace) {
    if (this._workspaceToolConfirmStore.value.getAutoConfirm(toolId) || this._profileToolConfirmStore.value.getAutoConfirm(toolId) || this._memoryToolConfirmStore.has(toolId)) {
      return true;
    }
    const config = this._configurationService.inspect("chat.tools.autoApprove");
    let value = config.value ?? config.defaultValue;
    if (typeof runsInWorkspace === "boolean") {
      value = config.userLocalValue ?? config.applicationValue;
      if (runsInWorkspace) {
        value = config.workspaceValue ?? config.workspaceFolderValue ?? config.userRemoteValue ?? value;
      }
    }
    return value === true || typeof value === "object" && value.hasOwnProperty(toolId) && value[toolId] === true;
  }
  cleanupCallDisposables(requestId, store) {
    const disposables = this._callsByRequestId.get(requestId);
    if (disposables) {
      const index = disposables.findIndex((d) => d.store === store);
      if (index > -1) {
        disposables.splice(index, 1);
      }
      if (disposables.length === 0) {
        this._callsByRequestId.delete(requestId);
      }
    }
    store.dispose();
  }
  cancelToolCallsForRequest(requestId) {
    const calls = this._callsByRequestId.get(requestId);
    if (calls) {
      calls.forEach((call) => call.store.dispose());
      this._callsByRequestId.delete(requestId);
    }
  }
  toEnablementMap(toolOrToolsetNames) {
    const toolOrToolset = new Set(toolOrToolsetNames);
    const result = {};
    for (const tool of this._tools.values()) {
      if (tool.data.toolReferenceName && toolOrToolset.has(tool.data.toolReferenceName) || toolOrToolset.has(tool.data.id)) {
        result[tool.data.id] = true;
      } else {
        result[tool.data.id] = false;
      }
    }
    for (const toolSet of this._toolSets) {
      if (toolOrToolset.has(toolSet.referenceName)) {
        result[toolSet.referenceName] = true;
      }
      for (const tool of toolSet.getTools()) {
        if (toolOrToolset.has(tool.id)) {
          result[tool.id] = true;
        }
      }
    }
    return result;
  }
  getToolSetByName(name) {
    for (const toolSet of this._toolSets) {
      if (toolSet.referenceName === name) {
        return toolSet;
      }
    }
    return void 0;
  }
  createToolSet(source, id, referenceName, options) {
    const that = this;
    const result = new class extends ToolSet {
      dispose() {
        if (that._toolSets.has(result)) {
          this._tools.clear();
          that._toolSets.delete(result);
        }
      }
    }(id, referenceName, options?.icon ?? Codicon.tools, source, options?.description);
    this._toolSets.add(result);
    return result;
  }
};
LanguageModelToolsService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IExtensionService),
  __param(2, IContextKeyService),
  __param(3, IChatService),
  __param(4, IDialogService),
  __param(5, ITelemetryService),
  __param(6, ILogService),
  __param(7, IConfigurationService),
  __param(8, IAccessibilityService),
  __param(9, IAccessibilitySignalService)
], LanguageModelToolsService);
let ToolConfirmStore = class ToolConfirmStore2 extends Disposable {
  static {
    __name(this, "ToolConfirmStore");
  }
  static {
    ToolConfirmStore_1 = this;
  }
  static {
    this.STORED_KEY = "chat/autoconfirm";
  }
  constructor(_scope, storageService) {
    super();
    this._scope = _scope;
    this.storageService = storageService;
    this._autoConfirmTools = new LRUCache(100);
    this._didChange = false;
    const stored = storageService.getObject(ToolConfirmStore_1.STORED_KEY, this._scope);
    if (stored) {
      for (const key of stored) {
        this._autoConfirmTools.set(key, true);
      }
    }
    this._register(storageService.onWillSaveState(() => {
      if (this._didChange) {
        this.storageService.store(
          ToolConfirmStore_1.STORED_KEY,
          [...this._autoConfirmTools.keys()],
          this._scope,
          1
          /* StorageTarget.MACHINE */
        );
        this._didChange = false;
      }
    }));
  }
  reset() {
    this._autoConfirmTools.clear();
    this._didChange = true;
  }
  getAutoConfirm(toolId) {
    if (this._autoConfirmTools.get(toolId)) {
      this._didChange = true;
      return true;
    }
    return false;
  }
  setAutoConfirm(toolId, autoConfirm) {
    if (autoConfirm) {
      this._autoConfirmTools.set(toolId, true);
    } else {
      this._autoConfirmTools.delete(toolId);
    }
    this._didChange = true;
  }
};
ToolConfirmStore = ToolConfirmStore_1 = __decorate([
  __param(1, IStorageService)
], ToolConfirmStore);
export {
  LanguageModelToolsService
};
//# sourceMappingURL=languageModelToolsService.js.map
