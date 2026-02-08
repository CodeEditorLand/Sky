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
var LanguageModelToolsService_1;
import { renderAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
import { assertNever } from "../../../../../base/common/assert.js";
import { RunOnceScheduler, timeout } from "../../../../../base/common/async.js";
import { encodeBase64 } from "../../../../../base/common/buffer.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { arrayEqualsC } from "../../../../../base/common/equals.js";
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { CancellationError, isCancellationError } from "../../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { createMarkdownCommandLink, MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { combinedDisposable, Disposable, DisposableStore, toDisposable } from "../../../../../base/common/lifecycle.js";
import { derived, derivedOpts, observableFromEventOpts, ObservableSet, observableSignal, transaction } from "../../../../../base/common/observable.js";
import Severity from "../../../../../base/common/severity.js";
import { StopWatch } from "../../../../../base/common/stopwatch.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize, localize2 } from "../../../../../nls.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import * as JSONContributionRegistry from "../../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { toToolSetVariableEntry, toToolVariableEntry } from "../../common/attachments/chatVariableEntries.js";
import { IChatService, IChatToolInvocation } from "../../common/chatService/chatService.js";
import { ChatConfiguration } from "../../common/constants.js";
import { ChatToolInvocation } from "../../common/model/chatProgressTypes/chatToolInvocation.js";
import { ILanguageModelToolsConfirmationService } from "../../common/tools/languageModelToolsConfirmationService.js";
import { createToolSchemaUri, SpecedToolAliases, stringifyPromptTsxPart, isToolSet, ToolDataSource, toolMatchesModel, ToolSet, VSCodeToolReference, ToolSetForModel } from "../../common/tools/languageModelToolsService.js";
import { getToolConfirmationAlert } from "../accessibility/chatAccessibilityProvider.js";
import { chatSessionResourceToId } from "../../common/model/chatUri.js";
const jsonSchemaRegistry = Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
var AutoApproveStorageKeys;
(function(AutoApproveStorageKeys2) {
  AutoApproveStorageKeys2["GlobalAutoApproveOptIn"] = "chat.tools.global.autoApprove.optIn";
})(AutoApproveStorageKeys || (AutoApproveStorageKeys = {}));
const SkipAutoApproveConfirmationKey = "vscode.chat.tools.global.autoApprove.testMode";
const globalAutoApproveDescription = localize2({
  key: "autoApprove2.markdown",
  comment: [
    "{Locked='](https://github.com/features/codespaces)'}",
    "{Locked='](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)'}",
    "{Locked='](https://code.visualstudio.com/docs/copilot/security)'}",
    "{Locked='**'}"
  ]
}, 'Global auto approve also known as "YOLO mode" disables manual approval completely for _all tools in all workspaces_, allowing the agent to act fully autonomously. This is extremely dangerous and is *never* recommended, even containerized environments like [Codespaces](https://github.com/features/codespaces) and [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) have user keys forwarded into the container that could be compromised.\n\n**This feature disables [critical security protections](https://code.visualstudio.com/docs/copilot/security) and makes it much easier for an attacker to compromise the machine.**');
let LanguageModelToolsService = class LanguageModelToolsService2 extends Disposable {
  static {
    __name(this, "LanguageModelToolsService");
  }
  static {
    LanguageModelToolsService_1 = this;
  }
  constructor(_instantiationService, _extensionService, _contextKeyService, _chatService, _dialogService, _telemetryService, _logService, _configurationService, _accessibilityService, _accessibilitySignalService, _storageService, _confirmationService) {
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
    this._storageService = _storageService;
    this._confirmationService = _confirmationService;
    this._onDidChangeTools = this._register(new Emitter());
    this.onDidChangeTools = this._onDidChangeTools.event;
    this._onDidPrepareToolCallBecomeUnresponsive = this._register(new Emitter());
    this.onDidPrepareToolCallBecomeUnresponsive = this._onDidPrepareToolCallBecomeUnresponsive.event;
    this._onDidInvokeTool = this._register(new Emitter());
    this.onDidInvokeTool = this._onDidInvokeTool.event;
    this._onDidChangeToolsScheduler = new RunOnceScheduler(() => this._onDidChangeTools.fire(), 750);
    this._tools = /* @__PURE__ */ new Map();
    this._toolContextKeys = /* @__PURE__ */ new Set();
    this._callsByRequestId = /* @__PURE__ */ new Map();
    this._pendingToolCalls = /* @__PURE__ */ new Map();
    this._toolSets = new ObservableSet();
    this.toolSets = derived(this, (reader) => {
      const allToolSets = Array.from(this._toolSets.observable.read(reader));
      return allToolSets.filter((toolSet) => this.isPermitted(toolSet, reader));
    });
    this.allToolsIncludingDisableObs = observableFromEventOpts({ equalsFn: arrayEqualsC() }, this.onDidChangeTools, () => Array.from(this.getAllToolsIncludingDisabled()));
    this.toolsWithFullReferenceName = derived((reader) => {
      const result = [];
      const coveredByToolSets = /* @__PURE__ */ new Set();
      for (const toolSet of this.toolSets.read(reader)) {
        if (toolSet.source.type !== "user") {
          result.push([toolSet, getToolSetFullReferenceName(toolSet)]);
          for (const tool of toolSet.getTools()) {
            result.push([tool, getToolFullReferenceName(tool, toolSet)]);
            coveredByToolSets.add(tool);
          }
        }
      }
      for (const tool of this.allToolsIncludingDisableObs.read(reader)) {
        if (tool.when && !this._contextKeyService.contextMatchesRules(tool.when)) {
          continue;
        }
        if (tool.canBeReferencedInPrompt && !coveredByToolSets.has(tool) && this.isPermitted(tool, reader)) {
          result.push([tool, getToolFullReferenceName(tool)]);
        }
      }
      return result;
    });
    this._isAgentModeEnabled = observableConfigValue(ChatConfiguration.AgentEnabled, true, this._configurationService);
    this._register(this._contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(this._toolContextKeys)) {
        this._onDidChangeToolsScheduler.schedule();
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ChatConfiguration.ExtensionToolsEnabled) || e.affectsConfiguration(ChatConfiguration.AgentEnabled)) {
        this._onDidChangeToolsScheduler.schedule();
      }
    }));
    this._register(Event.runAndSubscribe(this._configurationService.onDidChangeConfiguration, (e) => {
      if (!e || e.affectsConfiguration(ChatConfiguration.GlobalAutoApprove)) {
        if (this._configurationService.getValue(ChatConfiguration.GlobalAutoApprove) !== true) {
          this._storageService.remove(
            "chat.tools.global.autoApprove.optIn",
            -1
            /* StorageScope.APPLICATION */
          );
        }
      }
    }));
    this._ctxToolsCount = ChatContextKeys.Tools.toolsCount.bindTo(_contextKeyService);
    this.vscodeToolSet = this._register(this.createToolSet(ToolDataSource.Internal, "vscode", VSCodeToolReference.vscode, {
      icon: ThemeIcon.fromId(Codicon.vscode.id),
      description: localize("copilot.toolSet.vscode.description", "Use VS Code features")
    }));
    this.executeToolSet = this._register(this.createToolSet(ToolDataSource.Internal, "execute", SpecedToolAliases.execute, {
      icon: ThemeIcon.fromId(Codicon.terminal.id),
      description: localize("copilot.toolSet.execute.description", "Execute code and applications on your machine")
    }));
    this.readToolSet = this._register(this.createToolSet(ToolDataSource.Internal, "read", SpecedToolAliases.read, {
      icon: ThemeIcon.fromId(Codicon.book.id),
      description: localize("copilot.toolSet.read.description", "Read files in your workspace")
    }));
    this.agentToolSet = this._register(this.createToolSet(ToolDataSource.Internal, "agent", SpecedToolAliases.agent, {
      icon: ThemeIcon.fromId(Codicon.agent.id),
      description: localize("copilot.toolSet.agent.description", "Delegate tasks to other agents")
    }));
  }
  /**
   * Returns if the given tool or toolset is permitted in the current context.
   * When agent mode is enabled, all tools are permitted (no restriction)
   * When agent mode is disabled only a subset of read-only tools are permitted in agentic-loop contexts.
   */
  isPermitted(toolOrToolSet, reader) {
    const agentModeEnabled = this._isAgentModeEnabled.read(reader);
    if (agentModeEnabled !== false) {
      return true;
    }
    const permittedInternalToolSetIds = [SpecedToolAliases.read, SpecedToolAliases.search, SpecedToolAliases.web];
    if (isToolSet(toolOrToolSet)) {
      const permitted = toolOrToolSet.source.type === "internal" && permittedInternalToolSetIds.includes(toolOrToolSet.referenceName);
      this._logService.trace(`LanguageModelToolsService#isPermitted: ToolSet ${toolOrToolSet.id} (${toolOrToolSet.referenceName}) permitted=${permitted}`);
      return permitted;
    }
    for (const toolSet of this._toolSets) {
      if (toolSet.source.type === "internal" && permittedInternalToolSetIds.includes(toolSet.referenceName)) {
        for (const memberTool of toolSet.getTools()) {
          if (memberTool.id === toolOrToolSet.id) {
            this._logService.trace(`LanguageModelToolsService#isPermitted: Tool ${toolOrToolSet.id} (${toolOrToolSet.toolReferenceName}) permitted=true (member of ${toolSet.referenceName})`);
            return true;
          }
        }
      }
    }
    if (toolOrToolSet.id === "vscode_fetchWebPage_internal" && permittedInternalToolSetIds.includes(SpecedToolAliases.web)) {
      this._logService.trace(`LanguageModelToolsService#isPermitted: Tool ${toolOrToolSet.id} (${toolOrToolSet.toolReferenceName}) permitted=true (special case)`);
      return true;
    }
    this._logService.trace(`LanguageModelToolsService#isPermitted: Tool ${toolOrToolSet.id} (${toolOrToolSet.toolReferenceName}) permitted=false`);
    return false;
  }
  dispose() {
    super.dispose();
    this._callsByRequestId.forEach((calls) => calls.forEach((call) => call.store.dispose()));
    this._pendingToolCalls.clear();
    this._ctxToolsCount.reset();
  }
  registerToolData(toolData) {
    if (this._tools.has(toolData.id)) {
      throw new Error(`Tool "${toolData.id}" is already registered.`);
    }
    this._tools.set(toolData.id, { data: toolData });
    this._ctxToolsCount.set(this._tools.size);
    if (!this._onDidChangeToolsScheduler.isScheduled()) {
      this._onDidChangeToolsScheduler.schedule();
    }
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
      if (!this._onDidChangeToolsScheduler.isScheduled()) {
        this._onDidChangeToolsScheduler.schedule();
      }
    });
  }
  flushToolUpdates() {
    this._onDidChangeToolsScheduler.flush();
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
  registerTool(toolData, tool) {
    return combinedDisposable(this.registerToolData(toolData), this.registerToolImplementation(toolData.id, tool));
  }
  getTools(model) {
    const toolDatas = Iterable.map(this._tools.values(), (i) => i.data);
    const extensionToolsEnabled = this._configurationService.getValue(ChatConfiguration.ExtensionToolsEnabled);
    return Iterable.filter(toolDatas, (toolData) => {
      const satisfiesWhenClause = !toolData.when || this._contextKeyService.contextMatchesRules(toolData.when);
      const satisfiesExternalToolCheck = toolData.source.type !== "extension" || !!extensionToolsEnabled;
      const satisfiesPermittedCheck = this.isPermitted(toolData);
      const satisfiesModelFilter = toolMatchesModel(toolData, model);
      return satisfiesWhenClause && satisfiesExternalToolCheck && satisfiesPermittedCheck && satisfiesModelFilter;
    });
  }
  observeTools(model) {
    const meta = derived((reader) => {
      const signal = observableSignal("observeToolsContext");
      const trigger = /* @__PURE__ */ __name(() => transaction((tx) => signal.trigger(tx)), "trigger");
      reader.store.add(this.onDidChangeTools(trigger));
      return signal;
    });
    return derivedOpts({ equalsFn: arrayEqualsC() }, (reader) => {
      meta.read(reader).read(reader);
      return Array.from(this.getTools(model));
    });
  }
  getAllToolsIncludingDisabled() {
    const toolDatas = Iterable.map(this._tools.values(), (i) => i.data);
    const extensionToolsEnabled = this._configurationService.getValue(ChatConfiguration.ExtensionToolsEnabled);
    return Iterable.filter(toolDatas, (toolData) => {
      const satisfiesExternalToolCheck = toolData.source.type !== "extension" || !!extensionToolsEnabled;
      const satisfiesPermittedCheck = this.isPermitted(toolData);
      return satisfiesExternalToolCheck && satisfiesPermittedCheck;
    });
  }
  getTool(id) {
    return this._tools.get(id)?.data;
  }
  getToolByName(name) {
    for (const tool of this.getAllToolsIncludingDisabled()) {
      if (tool.toolReferenceName === name) {
        return tool;
      }
    }
    return void 0;
  }
  async invokeTool(dto, countTokens, token) {
    this._logService.trace(`[LanguageModelToolsService#invokeTool] Invoking tool ${dto.toolId} with parameters ${JSON.stringify(dto.parameters)}`);
    this._onDidInvokeTool.fire({
      toolId: dto.toolId,
      sessionResource: dto.context?.sessionResource,
      requestId: dto.chatRequestId,
      subagentInvocationId: dto.subAgentInvocationId
    });
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
    let pendingToolCallKey;
    let toolInvocation;
    if (this._pendingToolCalls.has(dto.callId)) {
      pendingToolCallKey = dto.callId;
      toolInvocation = this._pendingToolCalls.get(dto.callId);
    } else if (dto.chatStreamToolCallId && this._pendingToolCalls.has(dto.chatStreamToolCallId)) {
      pendingToolCallKey = dto.chatStreamToolCallId;
      toolInvocation = this._pendingToolCalls.get(dto.chatStreamToolCallId);
    }
    const hadPendingInvocation = !!toolInvocation;
    if (hadPendingInvocation && pendingToolCallKey) {
      this._pendingToolCalls.delete(pendingToolCallKey);
    }
    let requestId;
    let store;
    let toolResult;
    let prepareTimeWatch;
    let invocationTimeWatch;
    let preparedInvocation;
    try {
      if (dto.context) {
        store = new DisposableStore();
        const model = this._chatService.getSession(dto.context.sessionResource);
        if (!model) {
          throw new Error(`Tool called for unknown chat session`);
        }
        const request = model.getRequests().at(-1);
        requestId = request.id;
        dto.modelId = request.modelId;
        dto.userSelectedTools = request.userSelectedTools && { ...request.userSelectedTools };
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
          IChatToolInvocation.confirmWith(toolInvocation, {
            type: 0
            /* ToolConfirmKind.Denied */
          });
          source.cancel();
        }));
        store.add(source.token.onCancellationRequested(() => {
          IChatToolInvocation.confirmWith(toolInvocation, {
            type: 0
            /* ToolConfirmKind.Denied */
          });
        }));
        token = source.token;
        prepareTimeWatch = StopWatch.create(true);
        preparedInvocation = await this.prepareToolInvocation(tool, dto, token);
        prepareTimeWatch.stop();
        const autoConfirmed = await this.shouldAutoConfirm(tool.data.id, tool.data.runsInWorkspace, tool.data.source, dto.parameters, dto.context?.sessionResource);
        if (hadPendingInvocation && toolInvocation) {
          toolInvocation.transitionFromStreaming(preparedInvocation, dto.parameters, autoConfirmed);
        } else {
          toolInvocation = new ChatToolInvocation(preparedInvocation, tool.data, dto.callId, dto.subAgentInvocationId, dto.parameters);
          if (autoConfirmed) {
            IChatToolInvocation.confirmWith(toolInvocation, autoConfirmed);
          }
          this._chatService.appendProgress(request, toolInvocation);
        }
        dto.toolSpecificData = toolInvocation?.toolSpecificData;
        if (preparedInvocation?.confirmationMessages?.title) {
          if (!IChatToolInvocation.executionConfirmedOrDenied(toolInvocation) && !autoConfirmed) {
            this.playAccessibilitySignal([toolInvocation]);
          }
          const userConfirmed = await IChatToolInvocation.awaitConfirmation(toolInvocation, token);
          if (userConfirmed.type === 0) {
            throw new CancellationError();
          }
          if (userConfirmed.type === 5) {
            toolResult = {
              content: [{
                kind: "text",
                value: "The user chose to skip the tool call, they want to proceed without running it"
              }]
            };
            return toolResult;
          }
          if (dto.toolSpecificData?.kind === "input") {
            dto.parameters = dto.toolSpecificData.rawInput;
            dto.toolSpecificData = void 0;
          }
        }
      } else {
        prepareTimeWatch = StopWatch.create(true);
        preparedInvocation = await this.prepareToolInvocation(tool, dto, token);
        prepareTimeWatch.stop();
        if (preparedInvocation?.confirmationMessages?.title && !await this.shouldAutoConfirm(tool.data.id, tool.data.runsInWorkspace, tool.data.source, dto.parameters, void 0)) {
          const result = await this._dialogService.confirm({ message: renderAsPlaintext(preparedInvocation.confirmationMessages.title), detail: renderAsPlaintext(preparedInvocation.confirmationMessages.message) });
          if (!result.confirmed) {
            throw new CancellationError();
          }
        }
        dto.toolSpecificData = preparedInvocation?.toolSpecificData;
      }
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      invocationTimeWatch = StopWatch.create(true);
      toolResult = await tool.impl.invoke(dto, countTokens, {
        report: /* @__PURE__ */ __name((step) => {
          toolInvocation?.acceptProgress(step);
        }, "report")
      }, token);
      invocationTimeWatch.stop();
      this.ensureToolDetails(dto, toolResult, tool.data);
      const afterExecuteState = await toolInvocation?.didExecuteTool(toolResult, void 0, () => this.shouldAutoConfirmPostExecution(tool.data.id, tool.data.runsInWorkspace, tool.data.source, dto.parameters, dto.context?.sessionResource));
      if (toolInvocation && afterExecuteState?.type === 3) {
        const postConfirm = await IChatToolInvocation.awaitPostConfirmation(toolInvocation, token);
        if (postConfirm.type === 0) {
          throw new CancellationError();
        }
        if (postConfirm.type === 5) {
          toolResult = {
            content: [{
              kind: "text",
              value: "The tool executed but the user chose not to share the results"
            }]
          };
        }
      }
      this._telemetryService.publicLog2("languageModelToolInvoked", {
        result: "success",
        chatSessionId: dto.context?.sessionResource ? chatSessionResourceToId(dto.context.sessionResource) : void 0,
        toolId: tool.data.id,
        toolExtensionId: tool.data.source.type === "extension" ? tool.data.source.extensionId.value : void 0,
        toolSourceKind: tool.data.source.type,
        prepareTimeMs: prepareTimeWatch?.elapsed(),
        invocationTimeMs: invocationTimeWatch?.elapsed()
      });
      return toolResult;
    } catch (err) {
      const result = isCancellationError(err) ? "userCancelled" : "error";
      this._telemetryService.publicLog2("languageModelToolInvoked", {
        result,
        chatSessionId: dto.context?.sessionId,
        toolId: tool.data.id,
        toolExtensionId: tool.data.source.type === "extension" ? tool.data.source.extensionId.value : void 0,
        toolSourceKind: tool.data.source.type,
        prepareTimeMs: prepareTimeWatch?.elapsed(),
        invocationTimeMs: invocationTimeWatch?.elapsed()
      });
      if (!isCancellationError(err)) {
        this._logService.error(`[LanguageModelToolsService#invokeTool] Error from tool ${dto.toolId} with parameters ${JSON.stringify(dto.parameters)}:
${toErrorMessage(err, true)}`);
      }
      toolResult ??= { content: [] };
      toolResult.toolResultError = err instanceof Error ? err.message : String(err);
      if (tool.data.alwaysDisplayInputOutput) {
        toolResult.toolResultDetails = { input: this.formatToolInput(dto), output: [{ type: "embed", isText: true, value: String(err) }], isError: true };
      }
      throw err;
    } finally {
      toolInvocation?.didExecuteTool(toolResult, true);
      if (store) {
        this.cleanupCallDisposables(requestId, store);
      }
    }
  }
  async prepareToolInvocation(tool, dto, token) {
    let prepared;
    if (tool.impl.prepareToolInvocation) {
      const preparePromise = tool.impl.prepareToolInvocation({
        parameters: dto.parameters,
        chatRequestId: dto.chatRequestId,
        chatSessionId: dto.context?.sessionId,
        chatSessionResource: dto.context?.sessionResource,
        chatInteractionId: dto.chatInteractionId
      }, token);
      const raceResult = await Promise.race([
        timeout(3e3, token).then(() => "timeout"),
        preparePromise
      ]);
      if (raceResult === "timeout" && dto.context) {
        this._onDidPrepareToolCallBecomeUnresponsive.fire({
          sessionResource: dto.context.sessionResource,
          toolData: tool.data
        });
      }
      prepared = await preparePromise;
    }
    const isEligibleForAutoApproval = this.isToolEligibleForAutoApproval(tool.data);
    if (!isEligibleForAutoApproval && !prepared?.confirmationMessages?.title) {
      if (!prepared) {
        prepared = {};
      }
      const fullReferenceName = getToolFullReferenceName(tool.data);
      prepared.confirmationMessages = {
        ...prepared.confirmationMessages,
        title: localize("defaultToolConfirmation.title", "Confirm tool execution"),
        message: localize("defaultToolConfirmation.message", "Run the '{0}' tool?", fullReferenceName),
        disclaimer: new MarkdownString(localize("defaultToolConfirmation.disclaimer", "Auto approval for '{0}' is restricted via {1}.", getToolFullReferenceName(tool.data), createMarkdownCommandLink({ title: "`" + ChatConfiguration.EligibleForAutoApproval + "`", id: "workbench.action.openSettings", arguments: [ChatConfiguration.EligibleForAutoApproval] }, false)), { isTrusted: true }),
        allowAutoConfirm: false
      };
    }
    if (!isEligibleForAutoApproval && prepared?.confirmationMessages?.title) {
      prepared.confirmationMessages.disclaimer = new MarkdownString(localize("defaultToolConfirmation.disclaimer", "Auto approval for '{0}' is restricted via {1}.", getToolFullReferenceName(tool.data), createMarkdownCommandLink({ title: "`" + ChatConfiguration.EligibleForAutoApproval + "`", id: "workbench.action.openSettings", arguments: [ChatConfiguration.EligibleForAutoApproval] }, false)), { isTrusted: true });
    }
    if (prepared?.confirmationMessages?.title) {
      if (prepared.toolSpecificData?.kind !== "terminal" && prepared.confirmationMessages.allowAutoConfirm !== false) {
        prepared.confirmationMessages.allowAutoConfirm = isEligibleForAutoApproval;
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
  beginToolCall(options) {
    const toolEntry = this._tools.get(options.toolId);
    if (!toolEntry) {
      return void 0;
    }
    if (!toolEntry.impl?.handleToolStream) {
      return void 0;
    }
    const invocation = ChatToolInvocation.createStreaming({
      toolCallId: options.toolCallId,
      toolId: options.toolId,
      toolData: toolEntry.data,
      subagentInvocationId: options.subagentInvocationId,
      chatRequestId: options.chatRequestId
    });
    this._pendingToolCalls.set(options.toolCallId, invocation);
    if (options.sessionResource) {
      const model = this._chatService.getSession(options.sessionResource);
      if (model) {
        const request = (options.chatRequestId ? model.getRequests().find((r) => r.id === options.chatRequestId) : void 0) ?? model.getRequests().at(-1);
        if (request) {
          this._chatService.appendProgress(request, invocation);
        }
      }
    }
    this._callHandleToolStream(toolEntry, invocation, options.toolCallId, void 0, CancellationToken.None);
    return invocation;
  }
  async _callHandleToolStream(toolEntry, invocation, toolCallId, rawInput, token) {
    if (!toolEntry.impl?.handleToolStream) {
      return;
    }
    try {
      const result = await toolEntry.impl.handleToolStream({
        toolCallId,
        rawInput,
        chatRequestId: invocation.chatRequestId
      }, token);
      if (result?.invocationMessage) {
        invocation.updateStreamingMessage(result.invocationMessage);
      }
    } catch (error) {
      this._logService.error(`[LanguageModelToolsService#_callHandleToolStream] Error calling handleToolStream for tool ${toolEntry.data.id}:`, error);
    }
  }
  async updateToolStream(toolCallId, partialInput, token) {
    const invocation = this._pendingToolCalls.get(toolCallId);
    if (!invocation) {
      return;
    }
    invocation.updatePartialInput(partialInput);
    const toolEntry = this._tools.get(invocation.toolId);
    if (toolEntry) {
      await this._callHandleToolStream(toolEntry, invocation, toolCallId, partialInput, token);
    }
  }
  playAccessibilitySignal(toolInvocations) {
    const autoApproved = this._configurationService.getValue(ChatConfiguration.GlobalAutoApprove);
    if (autoApproved) {
      return;
    }
    const pendingInvocations = toolInvocations.filter((inv) => !IChatToolInvocation.executionConfirmedOrDenied(inv));
    if (pendingInvocations.length === 0) {
      return;
    }
    const setting = this._configurationService.getValue(AccessibilitySignal.chatUserActionRequired.settingsKey);
    if (!setting) {
      return;
    }
    const soundEnabled = setting.sound === "on" || setting.sound === "auto" && this._accessibilityService.isScreenReaderOptimized();
    const announcementEnabled = this._accessibilityService.isScreenReaderOptimized() && setting.announcement === "auto";
    if (soundEnabled || announcementEnabled) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.chatUserActionRequired, { customAlertMessage: this._instantiationService.invokeFunction(getToolConfirmationAlert, pendingInvocations), userGesture: true, modality: !soundEnabled ? "announcement" : void 0 });
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
        return { type: "embed", isText: true, value: part.value };
      } else if (part.kind === "promptTsx") {
        return { type: "embed", isText: true, value: stringifyPromptTsxPart(part) };
      } else if (part.kind === "data") {
        return { type: "embed", value: encodeBase64(part.value.data), mimeType: part.value.mimeType };
      } else {
        assertNever(part);
      }
    });
  }
  getEligibleForAutoApprovalSpecialCase(toolData) {
    if (toolData.id === "vscode_fetchWebPage_internal") {
      return "fetch";
    }
    return void 0;
  }
  isToolEligibleForAutoApproval(toolData) {
    const fullReferenceName = this.getEligibleForAutoApprovalSpecialCase(toolData) ?? getToolFullReferenceName(toolData);
    if (toolData.id === "copilot_fetchWebPage") {
      return true;
    }
    const eligibilityConfig = this._configurationService.getValue(ChatConfiguration.EligibleForAutoApproval);
    if (eligibilityConfig && typeof eligibilityConfig === "object" && fullReferenceName) {
      if (Object.prototype.hasOwnProperty.call(eligibilityConfig, fullReferenceName)) {
        return eligibilityConfig[fullReferenceName];
      }
      if (toolData.legacyToolReferenceFullNames) {
        for (const legacyName of toolData.legacyToolReferenceFullNames) {
          if (Object.prototype.hasOwnProperty.call(eligibilityConfig, legacyName)) {
            return eligibilityConfig[legacyName];
          }
          if (legacyName.includes("/")) {
            const trimmedLegacyName = legacyName.split("/").pop();
            if (trimmedLegacyName && Object.prototype.hasOwnProperty.call(eligibilityConfig, trimmedLegacyName)) {
              return eligibilityConfig[trimmedLegacyName];
            }
          }
        }
      }
    }
    return true;
  }
  async shouldAutoConfirm(toolId, runsInWorkspace, source, parameters, chatSessionResource) {
    const tool = this._tools.get(toolId);
    if (!tool) {
      return void 0;
    }
    if (!this.isToolEligibleForAutoApproval(tool.data)) {
      return void 0;
    }
    const reason = this._confirmationService.getPreConfirmAction({ toolId, source, parameters, chatSessionResource });
    if (reason) {
      return reason;
    }
    const config = this._configurationService.inspect(ChatConfiguration.GlobalAutoApprove);
    let value = config.value ?? config.defaultValue;
    if (typeof runsInWorkspace === "boolean") {
      value = config.userLocalValue ?? config.applicationValue;
      if (runsInWorkspace) {
        value = config.workspaceValue ?? config.workspaceFolderValue ?? config.userRemoteValue ?? value;
      }
    }
    const autoConfirm = value === true || typeof value === "object" && value.hasOwnProperty(toolId) && value[toolId] === true;
    if (autoConfirm) {
      if (await this._checkGlobalAutoApprove()) {
        return { type: 2, id: ChatConfiguration.GlobalAutoApprove };
      }
    }
    return void 0;
  }
  async shouldAutoConfirmPostExecution(toolId, runsInWorkspace, source, parameters, chatSessionResource) {
    if (this._configurationService.getValue(ChatConfiguration.GlobalAutoApprove) && await this._checkGlobalAutoApprove()) {
      return { type: 2, id: ChatConfiguration.GlobalAutoApprove };
    }
    return this._confirmationService.getPostConfirmAction({ toolId, source, parameters, chatSessionResource });
  }
  async _checkGlobalAutoApprove() {
    const optedIn = this._storageService.getBoolean("chat.tools.global.autoApprove.optIn", -1, false);
    if (optedIn) {
      return true;
    }
    if (this._contextKeyService.getContextKeyValue(SkipAutoApproveConfirmationKey) === true) {
      return true;
    }
    const promptResult = await this._dialogService.prompt({
      type: Severity.Warning,
      message: localize("autoApprove2.title", "Enable global auto approve?"),
      buttons: [
        {
          label: localize("autoApprove2.button.enable", "Enable"),
          run: /* @__PURE__ */ __name(() => true, "run")
        },
        {
          label: localize("autoApprove2.button.disable", "Disable"),
          run: /* @__PURE__ */ __name(() => false, "run")
        }
      ],
      custom: {
        icon: Codicon.warning,
        disableCloseAction: true,
        markdownDetails: [{
          markdown: new MarkdownString(globalAutoApproveDescription.value)
        }]
      }
    });
    if (promptResult.result !== true) {
      await this._configurationService.updateValue(ChatConfiguration.GlobalAutoApprove, false);
      return false;
    }
    this._storageService.store(
      "chat.tools.global.autoApprove.optIn",
      true,
      -1,
      0
      /* StorageTarget.USER */
    );
    return true;
  }
  cleanupCallDisposables(requestId, store) {
    if (requestId) {
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
    }
    store.dispose();
  }
  cancelToolCallsForRequest(requestId) {
    const calls = this._callsByRequestId.get(requestId);
    if (calls) {
      calls.forEach((call) => call.store.dispose());
      this._callsByRequestId.delete(requestId);
    }
    for (const [toolCallId, invocation] of this._pendingToolCalls) {
      if (invocation.chatRequestId === requestId) {
        this._pendingToolCalls.delete(toolCallId);
      }
    }
  }
  static {
    this.githubMCPServerAliases = ["github/github-mcp-server", "io.github.github/github-mcp-server", "github-mcp-server"];
  }
  static {
    this.playwrightMCPServerAliases = ["microsoft/playwright-mcp", "com.microsoft/playwright-mcp"];
  }
  *getToolSetAliases(toolSet, fullReferenceName) {
    if (fullReferenceName !== toolSet.referenceName) {
      yield toolSet.referenceName;
    }
    if (toolSet.legacyFullNames) {
      yield* toolSet.legacyFullNames;
    }
    switch (toolSet.referenceName) {
      case "github":
        for (const alias of LanguageModelToolsService_1.githubMCPServerAliases) {
          yield alias + "/*";
        }
        break;
      case "playwright":
        for (const alias of LanguageModelToolsService_1.playwrightMCPServerAliases) {
          yield alias + "/*";
        }
        break;
      case SpecedToolAliases.execute:
        yield "shell";
        break;
      case SpecedToolAliases.agent:
        yield VSCodeToolReference.runSubagent;
        yield "custom-agent";
        break;
    }
  }
  *getToolAliases(toolSet, fullReferenceName) {
    const referenceName = toolSet.toolReferenceName ?? toolSet.displayName;
    if (fullReferenceName !== referenceName && referenceName !== VSCodeToolReference.runSubagent) {
      yield referenceName;
    }
    if (toolSet.legacyToolReferenceFullNames) {
      for (const legacyName of toolSet.legacyToolReferenceFullNames) {
        yield legacyName;
        const lastSlashIndex = legacyName.lastIndexOf("/");
        if (lastSlashIndex !== -1) {
          yield legacyName.substring(lastSlashIndex + 1);
        }
      }
    }
    const slashIndex = fullReferenceName.lastIndexOf("/");
    if (slashIndex !== -1) {
      switch (fullReferenceName.substring(0, slashIndex)) {
        case "github":
          for (const alias of LanguageModelToolsService_1.githubMCPServerAliases) {
            yield alias + fullReferenceName.substring(slashIndex);
          }
          break;
        case "playwright":
          for (const alias of LanguageModelToolsService_1.playwrightMCPServerAliases) {
            yield alias + fullReferenceName.substring(slashIndex);
          }
          break;
      }
    }
  }
  /**
   * Create a map that contains all tools and toolsets with their enablement state.
   * @param fullReferenceNames A list of tool or toolset by their full reference names that are enabled.
   * @returns A map of tool or toolset instances to their enablement state.
   */
  toToolAndToolSetEnablementMap(fullReferenceNames, _target, model) {
    const toolOrToolSetNames = new Set(fullReferenceNames);
    const result = /* @__PURE__ */ new Map();
    for (const [tool, fullReferenceName] of this.toolsWithFullReferenceName.get()) {
      if (isToolSet(tool)) {
        const enabled = toolOrToolSetNames.has(fullReferenceName) || Iterable.some(this.getToolSetAliases(tool, fullReferenceName), (name) => toolOrToolSetNames.has(name));
        const scoped = model ? new ToolSetForModel(tool, model) : tool;
        result.set(scoped, enabled);
        if (enabled) {
          for (const memberTool of scoped.getTools()) {
            result.set(memberTool, true);
          }
        }
      } else {
        if (model && !toolMatchesModel(tool, model)) {
          continue;
        }
        if (!result.has(tool)) {
          const enabled = toolOrToolSetNames.has(fullReferenceName) || Iterable.some(this.getToolAliases(tool, fullReferenceName), (name) => toolOrToolSetNames.has(name)) || !!tool.legacyToolReferenceFullNames?.some((toolFullName) => {
            const index = toolFullName.lastIndexOf("/");
            return index !== -1 && toolOrToolSetNames.has(toolFullName.substring(0, index));
          });
          result.set(tool, enabled);
        }
      }
    }
    for (const toolSet of this._toolSets) {
      if (toolSet.source.type === "user") {
        const enabled = Iterable.every(toolSet.getTools(), (t) => result.get(t) === true);
        result.set(toolSet, enabled);
      }
    }
    return result;
  }
  toFullReferenceNames(map) {
    const result = [];
    const toolsCoveredByEnabledToolSet = /* @__PURE__ */ new Set();
    for (const [tool, fullReferenceName] of this.toolsWithFullReferenceName.get()) {
      if (isToolSet(tool)) {
        if (map.get(tool)) {
          result.push(fullReferenceName);
          for (const memberTool of tool.getTools()) {
            toolsCoveredByEnabledToolSet.add(memberTool);
          }
        }
      } else {
        if (map.get(tool) && !toolsCoveredByEnabledToolSet.has(tool)) {
          result.push(fullReferenceName);
        }
      }
    }
    return result;
  }
  toToolReferences(variableReferences) {
    const toolsOrToolSetByName = /* @__PURE__ */ new Map();
    for (const [tool, fullReferenceName] of this.toolsWithFullReferenceName.get()) {
      toolsOrToolSetByName.set(fullReferenceName, tool);
    }
    const result = [];
    for (const ref of variableReferences) {
      const toolOrToolSet = toolsOrToolSetByName.get(ref.name);
      if (toolOrToolSet) {
        if (isToolSet(toolOrToolSet)) {
          result.push(toToolSetVariableEntry(toolOrToolSet, ref.range));
        } else {
          result.push(toToolVariableEntry(toolOrToolSet, ref.range));
        }
      }
    }
    return result;
  }
  getToolSetsForModel(model, reader) {
    if (!model) {
      return this.toolSets.read(reader);
    }
    return Iterable.map(this.toolSets.read(reader), (ts) => new ToolSetForModel(ts, model));
  }
  getToolSet(id) {
    for (const toolSet of this._toolSets) {
      if (toolSet.id === id) {
        return toolSet;
      }
    }
    return void 0;
  }
  getToolSetByName(name) {
    for (const toolSet of this._toolSets) {
      if (toolSet.referenceName === name) {
        return toolSet;
      }
    }
    return void 0;
  }
  getSpecedToolSetName(referenceName) {
    if (LanguageModelToolsService_1.githubMCPServerAliases.includes(referenceName)) {
      return "github";
    }
    if (LanguageModelToolsService_1.playwrightMCPServerAliases.includes(referenceName)) {
      return "playwright";
    }
    return referenceName;
  }
  createToolSet(source, id, referenceName, options) {
    const that = this;
    referenceName = this.getSpecedToolSetName(referenceName);
    const result = new class extends ToolSet {
      dispose() {
        if (that._toolSets.has(result)) {
          this._tools.clear();
          that._toolSets.delete(result);
        }
      }
    }(id, referenceName, options?.icon ?? Codicon.tools, source, options?.description, options?.legacyFullNames, this._contextKeyService);
    this._toolSets.add(result);
    return result;
  }
  *getFullReferenceNames() {
    for (const [, fullReferenceName] of this.toolsWithFullReferenceName.get()) {
      yield fullReferenceName;
    }
  }
  getDeprecatedFullReferenceNames() {
    const result = /* @__PURE__ */ new Map();
    const knownToolSetNames = /* @__PURE__ */ new Set();
    const add = /* @__PURE__ */ __name((name, fullReferenceName) => {
      if (name !== fullReferenceName) {
        if (!result.has(name)) {
          result.set(name, /* @__PURE__ */ new Set());
        }
        result.get(name).add(fullReferenceName);
      }
    }, "add");
    for (const [tool, _] of this.toolsWithFullReferenceName.get()) {
      if (isToolSet(tool)) {
        knownToolSetNames.add(tool.referenceName);
        if (tool.legacyFullNames) {
          for (const legacyName of tool.legacyFullNames) {
            knownToolSetNames.add(legacyName);
          }
        }
      }
    }
    for (const [tool, fullReferenceName] of this.toolsWithFullReferenceName.get()) {
      if (isToolSet(tool)) {
        for (const alias of this.getToolSetAliases(tool, fullReferenceName)) {
          add(alias, fullReferenceName);
        }
      } else {
        for (const alias of this.getToolAliases(tool, fullReferenceName)) {
          add(alias, fullReferenceName);
        }
        if (tool.legacyToolReferenceFullNames) {
          for (const legacyName of tool.legacyToolReferenceFullNames) {
            if (legacyName.includes("/")) {
              const toolSetFullName = legacyName.substring(0, legacyName.lastIndexOf("/"));
              if (!knownToolSetNames.has(toolSetFullName)) {
                add(toolSetFullName, fullReferenceName);
              }
            }
          }
        }
      }
    }
    return result;
  }
  getToolByFullReferenceName(fullReferenceName) {
    for (const [tool, toolFullReferenceName] of this.toolsWithFullReferenceName.get()) {
      if (fullReferenceName === toolFullReferenceName) {
        return tool;
      }
      const aliases = isToolSet(tool) ? this.getToolSetAliases(tool, toolFullReferenceName) : this.getToolAliases(tool, toolFullReferenceName);
      if (Iterable.some(aliases, (alias) => fullReferenceName === alias)) {
        return tool;
      }
    }
    return void 0;
  }
  getFullReferenceName(tool, toolSet) {
    if (isToolSet(tool)) {
      return getToolSetFullReferenceName(tool);
    }
    return getToolFullReferenceName(tool, toolSet);
  }
};
LanguageModelToolsService = LanguageModelToolsService_1 = __decorate([
  __param(0, IInstantiationService),
  __param(1, IExtensionService),
  __param(2, IContextKeyService),
  __param(3, IChatService),
  __param(4, IDialogService),
  __param(5, ITelemetryService),
  __param(6, ILogService),
  __param(7, IConfigurationService),
  __param(8, IAccessibilityService),
  __param(9, IAccessibilitySignalService),
  __param(10, IStorageService),
  __param(11, ILanguageModelToolsConfirmationService)
], LanguageModelToolsService);
function getToolFullReferenceName(tool, toolSet) {
  const toolName = tool.toolReferenceName ?? tool.displayName;
  if (toolSet) {
    return `${toolSet.referenceName}/${toolName}`;
  } else if (tool.source.type === "extension") {
    return `${tool.source.extensionId.value.toLowerCase()}/${toolName}`;
  }
  return toolName;
}
__name(getToolFullReferenceName, "getToolFullReferenceName");
function getToolSetFullReferenceName(toolSet) {
  if (toolSet.source.type === "mcp") {
    return `${toolSet.referenceName}/*`;
  }
  return toolSet.referenceName;
}
__name(getToolSetFullReferenceName, "getToolSetFullReferenceName");
export {
  LanguageModelToolsService,
  globalAutoApproveDescription
};
//# sourceMappingURL=languageModelToolsService.js.map
