var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { renderStringAsPlaintext } from "../../../../base/browser/markdownRenderer.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { CancellationError, isCancellationError } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable, DisposableStore, dispose, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { LRUCache } from "../../../../base/common/map.js";
import { localize } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import * as JSONContributionRegistry from "../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { ChatContextKeys } from "../common/chatContextKeys.js";
import { ChatModel } from "../common/chatModel.js";
import { ChatToolInvocation } from "../common/chatProgressTypes/chatToolInvocation.js";
import { IChatService } from "../common/chatService.js";
import { ChatConfiguration } from "../common/constants.js";
import { CountTokensCallback, createToolSchemaUri, ILanguageModelToolsService, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolResult, stringifyPromptTsxPart } from "../common/languageModelToolsService.js";
const jsonSchemaRegistry = Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
let LanguageModelToolsService = class extends Disposable {
  constructor(_instantiationService, _extensionService, _contextKeyService, _chatService, _dialogService, _telemetryService, _logService, _configurationService, _accessibilityService) {
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
    this._workspaceToolConfirmStore = new Lazy(() => this._register(this._instantiationService.createInstance(ToolConfirmStore, StorageScope.WORKSPACE)));
    this._profileToolConfirmStore = new Lazy(() => this._register(this._instantiationService.createInstance(ToolConfirmStore, StorageScope.PROFILE)));
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
  static {
    __name(this, "LanguageModelToolsService");
  }
  _serviceBrand;
  _onDidChangeTools = new Emitter();
  onDidChangeTools = this._onDidChangeTools.event;
  /** Throttle tools updates because it sends all tools and runs on context key updates */
  _onDidChangeToolsScheduler = new RunOnceScheduler(() => this._onDidChangeTools.fire(), 750);
  _tools = /* @__PURE__ */ new Map();
  _toolContextKeys = /* @__PURE__ */ new Set();
  _ctxToolsCount;
  _callsByRequestId = /* @__PURE__ */ new Map();
  _workspaceToolConfirmStore;
  _profileToolConfirmStore;
  _memoryToolConfirmStore = /* @__PURE__ */ new Set();
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
  getTools() {
    const toolDatas = Iterable.map(this._tools.values(), (i) => i.data);
    const extensionToolsEnabled = this._configurationService.getValue(ChatConfiguration.ExtensionToolsEnabled);
    return Iterable.filter(
      toolDatas,
      (toolData) => {
        const satisfiesWhenClause = !toolData.when || this._contextKeyService.contextMatchesRules(toolData.when);
        const satisfiesExternalToolCheck = toolData.source.type === "extension" && !extensionToolsEnabled ? !toolData.source.isExternalTool : true;
        return satisfiesWhenClause && satisfiesExternalToolCheck;
      }
    );
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
  getToolByName(name) {
    for (const toolData of this.getTools()) {
      if (toolData.toolReferenceName === name) {
        return toolData;
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
        this._callsByRequestId.get(requestId).push(store);
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
        if (this.shouldAutoConfirm(tool.data.id, tool.data.runsInWorkspace)) {
          toolInvocation.confirmed.complete(true);
        }
        model.acceptResponseProgress(request, toolInvocation);
        if (prepared?.confirmationMessages) {
          this._accessibilityService.alert(localize("toolConfirmationMessage", "Action required: {0}", prepared.confirmationMessages.title));
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
        if (prepared?.confirmationMessages) {
          const result = await this._dialogService.confirm({ message: prepared.confirmationMessages.title, detail: renderStringAsPlaintext(prepared.confirmationMessages.message) });
          if (!result.confirmed) {
            throw new CancellationError();
          }
        }
      }
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      toolResult = await tool.impl.invoke(dto, countTokens, token);
      this.ensureToolDetails(dto, toolResult, tool.data);
      this._telemetryService.publicLog2(
        "languageModelToolInvoked",
        {
          result: "success",
          chatSessionId: dto.context?.sessionId,
          toolId: tool.data.id,
          toolExtensionId: tool.data.source.type === "extension" ? tool.data.source.extensionId.value : void 0,
          toolSourceKind: tool.data.source.type
        }
      );
      return toolResult;
    } catch (err) {
      const result = isCancellationError(err) ? "userCancelled" : "error";
      this._telemetryService.publicLog2(
        "languageModelToolInvoked",
        {
          result,
          chatSessionId: dto.context?.sessionId,
          toolId: tool.data.id,
          toolExtensionId: tool.data.source.type === "extension" ? tool.data.source.extensionId.value : void 0,
          toolSourceKind: tool.data.source.type
        }
      );
      this._logService.error(`[LanguageModelToolsService#invokeTool] Error from tool ${dto.toolId} with parameters ${JSON.stringify(dto.parameters)}:
${toErrorMessage(err, true)}`);
      throw err;
    } finally {
      toolInvocation?.complete(toolResult);
      if (requestId && store) {
        this.cleanupCallDisposables(requestId, store);
      }
    }
  }
  async prepareToolInvocation(tool, dto, token) {
    let prepared = tool.impl.prepareToolInvocation ? await tool.impl.prepareToolInvocation(dto.parameters, token) : void 0;
    if (!prepared?.confirmationMessages && tool.data.requiresConfirmation && tool.data.source.type === "extension") {
      if (!prepared) {
        prepared = {};
      }
      const toolWarning = localize(
        "tool.warning",
        "{0} This tool is from the extension `{1}`. Please carefully review any requested actions.",
        "$(info)",
        tool.data.source.extensionId.value
      );
      prepared.confirmationMessages = {
        title: localize("msg.title", "Run {0}", `"${tool.data.displayName}"`),
        message: new MarkdownString((tool.data.userDescription ?? tool.data.modelDescription) + "\n\n" + toolWarning, { supportThemeIcons: true }),
        allowAutoConfirm: true
      };
    }
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
  ensureToolDetails(dto, toolResult, toolData) {
    if (!toolResult.toolResultDetails && toolData.alwaysDisplayInputOutput) {
      toolResult.toolResultDetails = {
        input: JSON.stringify(dto.parameters, void 0, 2),
        output: this.toolResultToString(toolResult)
      };
    }
  }
  toolResultToString(toolResult) {
    const strs = [];
    for (const part of toolResult.content) {
      if (part.kind === "text") {
        strs.push(part.value);
      } else if (part.kind === "promptTsx") {
        strs.push(stringifyPromptTsxPart(part));
      }
    }
    return strs.join("");
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
      const index = disposables.indexOf(store);
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
      calls.forEach((call) => call.dispose());
      this._callsByRequestId.delete(requestId);
    }
  }
  dispose() {
    super.dispose();
    this._callsByRequestId.forEach((calls) => dispose(calls));
    this._ctxToolsCount.reset();
  }
};
LanguageModelToolsService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IAccessibilityService)
], LanguageModelToolsService);
let ToolConfirmStore = class extends Disposable {
  constructor(_scope, storageService) {
    super();
    this._scope = _scope;
    this.storageService = storageService;
    const stored = storageService.getObject(ToolConfirmStore.STORED_KEY, this._scope);
    if (stored) {
      for (const key of stored) {
        this._autoConfirmTools.set(key, true);
      }
    }
    this._register(storageService.onWillSaveState(() => {
      if (this._didChange) {
        this.storageService.store(ToolConfirmStore.STORED_KEY, [...this._autoConfirmTools.keys()], this._scope, StorageTarget.MACHINE);
        this._didChange = false;
      }
    }));
  }
  static {
    __name(this, "ToolConfirmStore");
  }
  static STORED_KEY = "chat/autoconfirm";
  _autoConfirmTools = new LRUCache(100);
  _didChange = false;
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
ToolConfirmStore = __decorateClass([
  __decorateParam(1, IStorageService)
], ToolConfirmStore);
export {
  LanguageModelToolsService
};
//# sourceMappingURL=languageModelToolsService.js.map
