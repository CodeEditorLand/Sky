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
import { Disposable, DisposableStore, MutableDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { IChatDebugService } from "../../contrib/chat/common/chatDebugService.js";
import { IChatService } from "../../contrib/chat/common/chatService/chatService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
let MainThreadChatDebug = class MainThreadChatDebug2 extends Disposable {
  static {
    __name(this, "MainThreadChatDebug");
  }
  constructor(extHostContext, _chatDebugService, _chatService) {
    super();
    this._chatDebugService = _chatDebugService;
    this._chatService = _chatService;
    this._providerDisposables = /* @__PURE__ */ new Map();
    this._activeSessionResources = /* @__PURE__ */ new Map();
    this._coreEventForwarder = this._register(new MutableDisposable());
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatDebug);
  }
  $subscribeToCoreDebugEvents() {
    this._coreEventForwarder.value = this._chatDebugService.onDidAddEvent((event) => {
      if (this._chatDebugService.isCoreEvent(event)) {
        this._proxy.$onCoreDebugEvent(this._serializeEvent(event));
      }
    });
  }
  $unsubscribeFromCoreDebugEvents() {
    this._coreEventForwarder.clear();
  }
  $registerChatDebugLogProvider(handle) {
    const disposables = new DisposableStore();
    this._providerDisposables.set(handle, disposables);
    disposables.add(this._chatDebugService.registerProvider({
      provideChatDebugLog: /* @__PURE__ */ __name(async (sessionResource, token) => {
        this._activeSessionResources.set(handle, sessionResource);
        const dtos = await this._proxy.$provideChatDebugLog(handle, sessionResource, token);
        return dtos?.map((dto) => this._reviveEvent(dto, sessionResource));
      }, "provideChatDebugLog"),
      resolveChatDebugLogEvent: /* @__PURE__ */ __name(async (eventId, token) => {
        return this._proxy.$resolveChatDebugLogEvent(handle, eventId, token);
      }, "resolveChatDebugLogEvent"),
      provideChatDebugLogExport: /* @__PURE__ */ __name(async (sessionResource, token) => {
        const coreEventDtos = this._chatDebugService.getEvents(sessionResource).filter((e) => this._chatDebugService.isCoreEvent(e)).map((e) => this._serializeEvent(e));
        const sessionTitle = this._chatService.getSessionTitle(sessionResource);
        const result = await this._proxy.$exportChatDebugLog(handle, sessionResource, coreEventDtos, sessionTitle, token);
        return result?.buffer;
      }, "provideChatDebugLogExport"),
      resolveChatDebugLogImport: /* @__PURE__ */ __name(async (data, token) => {
        const result = await this._proxy.$importChatDebugLog(handle, VSBuffer.wrap(data), token);
        if (!result) {
          return void 0;
        }
        const uri = URI.revive(result.uri);
        if (result.sessionTitle) {
          this._chatDebugService.setImportedSessionTitle(uri, result.sessionTitle);
        }
        return uri;
      }, "resolveChatDebugLogImport")
    }));
  }
  $unregisterChatDebugLogProvider(handle) {
    const disposables = this._providerDisposables.get(handle);
    disposables?.dispose();
    this._providerDisposables.delete(handle);
    this._activeSessionResources.delete(handle);
  }
  $acceptChatDebugEvent(handle, dto) {
    const sessionResource = (dto.sessionResource ? URI.revive(dto.sessionResource) : void 0) ?? this._activeSessionResources.get(handle) ?? this._chatDebugService.activeSessionResource;
    if (!sessionResource) {
      return;
    }
    const revived = this._reviveEvent(dto, sessionResource);
    this._chatDebugService.addProviderEvent(revived);
  }
  _serializeEvent(event) {
    const base = {
      id: event.id,
      sessionResource: event.sessionResource,
      created: event.created.getTime(),
      parentEventId: event.parentEventId
    };
    switch (event.kind) {
      case "toolCall":
        return { ...base, kind: "toolCall", toolName: event.toolName, toolCallId: event.toolCallId, input: event.input, output: event.output, result: event.result, durationInMillis: event.durationInMillis };
      case "modelTurn":
        return { ...base, kind: "modelTurn", model: event.model, requestName: event.requestName, inputTokens: event.inputTokens, outputTokens: event.outputTokens, totalTokens: event.totalTokens, durationInMillis: event.durationInMillis };
      case "generic":
        return { ...base, kind: "generic", name: event.name, details: event.details, level: event.level, category: event.category };
      case "subagentInvocation":
        return { ...base, kind: "subagentInvocation", agentName: event.agentName, description: event.description, status: event.status, durationInMillis: event.durationInMillis, toolCallCount: event.toolCallCount, modelTurnCount: event.modelTurnCount };
      case "userMessage":
        return { ...base, kind: "userMessage", message: event.message, sections: event.sections.map((s) => ({ name: s.name, content: s.content })) };
      case "agentResponse":
        return { ...base, kind: "agentResponse", message: event.message, sections: event.sections.map((s) => ({ name: s.name, content: s.content })) };
    }
  }
  _reviveEvent(dto, sessionResource) {
    const base = {
      id: dto.id,
      sessionResource,
      created: new Date(dto.created),
      parentEventId: dto.parentEventId
    };
    switch (dto.kind) {
      case "toolCall":
        return {
          ...base,
          kind: "toolCall",
          toolName: dto.toolName,
          toolCallId: dto.toolCallId,
          input: dto.input,
          output: dto.output,
          result: dto.result,
          durationInMillis: dto.durationInMillis
        };
      case "modelTurn":
        return {
          ...base,
          kind: "modelTurn",
          model: dto.model,
          requestName: dto.requestName,
          inputTokens: dto.inputTokens,
          outputTokens: dto.outputTokens,
          totalTokens: dto.totalTokens,
          durationInMillis: dto.durationInMillis
        };
      case "generic":
        return {
          ...base,
          kind: "generic",
          name: dto.name,
          details: dto.details,
          level: dto.level,
          category: dto.category
        };
      case "subagentInvocation":
        return {
          ...base,
          kind: "subagentInvocation",
          agentName: dto.agentName,
          description: dto.description,
          status: dto.status,
          durationInMillis: dto.durationInMillis,
          toolCallCount: dto.toolCallCount,
          modelTurnCount: dto.modelTurnCount
        };
      case "userMessage":
        return {
          ...base,
          kind: "userMessage",
          message: dto.message,
          sections: dto.sections
        };
      case "agentResponse":
        return {
          ...base,
          kind: "agentResponse",
          message: dto.message,
          sections: dto.sections
        };
    }
  }
};
MainThreadChatDebug = __decorate([
  extHostNamedCustomer(MainContext.MainThreadChatDebug),
  __param(1, IChatDebugService),
  __param(2, IChatService)
], MainThreadChatDebug);
export {
  MainThreadChatDebug
};
//# sourceMappingURL=mainThreadChatDebug.js.map
