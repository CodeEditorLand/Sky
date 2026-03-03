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
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IChatDebugService } from "../../contrib/chat/common/chatDebugService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
let MainThreadChatDebug = class MainThreadChatDebug2 extends Disposable {
  static {
    __name(this, "MainThreadChatDebug");
  }
  constructor(extHostContext, _chatDebugService) {
    super();
    this._chatDebugService = _chatDebugService;
    this._providerDisposables = /* @__PURE__ */ new Map();
    this._activeSessionResources = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatDebug);
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
      }, "resolveChatDebugLogEvent")
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
  __param(1, IChatDebugService)
], MainThreadChatDebug);
export {
  MainThreadChatDebug
};
//# sourceMappingURL=mainThreadChatDebug.js.map
