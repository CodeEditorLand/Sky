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
import { Emitter } from "../../../base/common/event.js";
import { Disposable, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { MainContext } from "./extHost.protocol.js";
import { ChatDebugMessageContentType, ChatDebugSubagentStatus, ChatDebugToolCallResult } from "./extHostTypes.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
let ExtHostChatDebug = class ExtHostChatDebug2 extends Disposable {
  static {
    __name(this, "ExtHostChatDebug");
  }
  constructor(extHostRpc) {
    super();
    this._nextHandle = 0;
    this._activeProgress = /* @__PURE__ */ new Map();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadChatDebug);
  }
  _progressKey(handle, sessionResource) {
    return `${handle}:${URI.revive(sessionResource).toString()}`;
  }
  _cleanupProgress(key) {
    const store = this._activeProgress.get(key);
    if (store) {
      store.dispose();
      this._activeProgress.delete(key);
    }
  }
  registerChatDebugLogProvider(provider) {
    if (this._provider) {
      throw new Error("A ChatDebugLogProvider is already registered.");
    }
    this._provider = provider;
    const handle = this._nextHandle++;
    this._proxy.$registerChatDebugLogProvider(handle);
    return toDisposable(() => {
      this._provider = void 0;
      for (const [key, store] of this._activeProgress) {
        if (key.startsWith(`${handle}:`)) {
          store.dispose();
          this._activeProgress.delete(key);
        }
      }
      this._proxy.$unregisterChatDebugLogProvider(handle);
    });
  }
  async $provideChatDebugLog(handle, sessionResource, token) {
    if (!this._provider) {
      return void 0;
    }
    const key = this._progressKey(handle, sessionResource);
    this._cleanupProgress(key);
    const store = new DisposableStore();
    this._activeProgress.set(key, store);
    const emitter = store.add(new Emitter());
    store.add(emitter.event((event) => {
      const dto = this._serializeEvent(event);
      if (!dto.sessionResource) {
        dto.sessionResource = sessionResource;
      }
      this._proxy.$acceptChatDebugEvent(handle, dto);
    }));
    store.add(token.onCancellationRequested(() => {
      this._cleanupProgress(key);
    }));
    try {
      const progress = {
        report: /* @__PURE__ */ __name((value) => emitter.fire(value), "report")
      };
      const sessionUri = URI.revive(sessionResource);
      const result = await this._provider.provideChatDebugLog(sessionUri, progress, token);
      if (!result) {
        return void 0;
      }
      return result.map((event) => this._serializeEvent(event));
    } catch (err) {
      this._cleanupProgress(key);
      throw err;
    }
  }
  _serializeEvent(event) {
    const base = {
      id: event.id,
      sessionResource: event.sessionResource,
      created: event.created.getTime(),
      parentEventId: event.parentEventId
    };
    const kind = event._kind;
    switch (kind) {
      case "toolCall": {
        const e = event;
        return {
          ...base,
          kind: "toolCall",
          toolName: e.toolName,
          toolCallId: e.toolCallId,
          input: e.input,
          output: e.output,
          result: e.result === ChatDebugToolCallResult.Success ? "success" : e.result === ChatDebugToolCallResult.Error ? "error" : void 0,
          durationInMillis: e.durationInMillis
        };
      }
      case "modelTurn": {
        const e = event;
        return {
          ...base,
          kind: "modelTurn",
          model: e.model,
          requestName: e.requestName,
          inputTokens: e.inputTokens,
          outputTokens: e.outputTokens,
          totalTokens: e.totalTokens,
          durationInMillis: e.durationInMillis
        };
      }
      case "generic": {
        const e = event;
        return {
          ...base,
          kind: "generic",
          name: e.name,
          details: e.details,
          level: e.level,
          category: e.category
        };
      }
      case "subagentInvocation": {
        const e = event;
        return {
          ...base,
          kind: "subagentInvocation",
          agentName: e.agentName,
          description: e.description,
          status: e.status === ChatDebugSubagentStatus.Running ? "running" : e.status === ChatDebugSubagentStatus.Completed ? "completed" : e.status === ChatDebugSubagentStatus.Failed ? "failed" : void 0,
          durationInMillis: e.durationInMillis,
          toolCallCount: e.toolCallCount,
          modelTurnCount: e.modelTurnCount
        };
      }
      case "userMessage": {
        const e = event;
        return {
          ...base,
          kind: "userMessage",
          message: e.message,
          sections: e.sections.map((s) => ({ name: s.name, content: s.content }))
        };
      }
      case "agentResponse": {
        const e = event;
        return {
          ...base,
          kind: "agentResponse",
          message: e.message,
          sections: e.sections.map((s) => ({ name: s.name, content: s.content }))
        };
      }
      default: {
        const generic = event;
        const rawName = generic.name;
        const rawDetails = generic.details;
        return {
          ...base,
          kind: "generic",
          name: typeof rawName === "string" ? rawName : "",
          details: typeof rawDetails === "string" ? rawDetails : void 0,
          level: generic.level ?? 1,
          category: generic.category
        };
      }
    }
  }
  async $resolveChatDebugLogEvent(_handle, eventId, token) {
    if (!this._provider?.resolveChatDebugLogEvent) {
      return void 0;
    }
    const result = await this._provider.resolveChatDebugLogEvent(eventId, token);
    if (!result) {
      return void 0;
    }
    const kind = result._kind;
    switch (kind) {
      case "text":
        return { kind: "text", value: result.value };
      case "messageContent": {
        const msg = result;
        return {
          kind: "message",
          type: msg.type === ChatDebugMessageContentType.User ? "user" : "agent",
          message: msg.message,
          sections: msg.sections.map((s) => ({ name: s.name, content: s.content }))
        };
      }
      case "userMessage": {
        const msg = result;
        return {
          kind: "message",
          type: "user",
          message: msg.message,
          sections: msg.sections.map((s) => ({ name: s.name, content: s.content }))
        };
      }
      case "agentResponse": {
        const msg = result;
        return {
          kind: "message",
          type: "agent",
          message: msg.message,
          sections: msg.sections.map((s) => ({ name: s.name, content: s.content }))
        };
      }
      case "toolCallContent": {
        const tc = result;
        return {
          kind: "toolCall",
          toolName: tc.toolName,
          result: tc.result === ChatDebugToolCallResult.Success ? "success" : tc.result === ChatDebugToolCallResult.Error ? "error" : void 0,
          durationInMillis: tc.durationInMillis,
          input: tc.input,
          output: tc.output
        };
      }
      case "modelTurnContent": {
        const mt = result;
        return {
          kind: "modelTurn",
          requestName: mt.requestName,
          model: mt.model,
          status: mt.status,
          durationInMillis: mt.durationInMillis,
          timeToFirstTokenInMillis: mt.timeToFirstTokenInMillis,
          maxInputTokens: mt.maxInputTokens,
          maxOutputTokens: mt.maxOutputTokens,
          inputTokens: mt.inputTokens,
          outputTokens: mt.outputTokens,
          cachedTokens: mt.cachedTokens,
          totalTokens: mt.totalTokens,
          errorMessage: mt.errorMessage,
          sections: mt.sections?.map((s) => ({ name: s.name, content: s.content }))
        };
      }
      default:
        return void 0;
    }
  }
  dispose() {
    for (const store of this._activeProgress.values()) {
      store.dispose();
    }
    this._activeProgress.clear();
    super.dispose();
  }
};
ExtHostChatDebug = __decorate([
  __param(0, IExtHostRpcService)
], ExtHostChatDebug);
export {
  ExtHostChatDebug
};
//# sourceMappingURL=extHostChatDebug.js.map
