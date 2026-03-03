var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { ChatDebugLogLevel } from "./chatDebugService.js";
import { LocalChatSessionUri } from "./model/chatUri.js";
class ChatDebugServiceImpl extends Disposable {
  static {
    __name(this, "ChatDebugServiceImpl");
  }
  constructor() {
    super(...arguments);
    this._buffer = new Array(ChatDebugServiceImpl.MAX_EVENTS);
    this._head = 0;
    this._size = 0;
    this._onDidAddEvent = this._register(new Emitter());
    this.onDidAddEvent = this._onDidAddEvent.event;
    this._providers = /* @__PURE__ */ new Set();
    this._invocationCts = new ResourceMap();
    this._providerEvents = /* @__PURE__ */ new WeakSet();
  }
  static {
    this.MAX_EVENTS = 1e4;
  }
  log(sessionResource, name, details, level = ChatDebugLogLevel.Info, options) {
    if (!LocalChatSessionUri.isLocalSession(sessionResource)) {
      return;
    }
    this.addEvent({
      kind: "generic",
      id: options?.id,
      sessionResource,
      created: /* @__PURE__ */ new Date(),
      name,
      details,
      level,
      category: options?.category,
      parentEventId: options?.parentEventId
    });
  }
  addEvent(event) {
    const idx = (this._head + this._size) % ChatDebugServiceImpl.MAX_EVENTS;
    this._buffer[idx] = event;
    if (this._size < ChatDebugServiceImpl.MAX_EVENTS) {
      this._size++;
    } else {
      this._head = (this._head + 1) % ChatDebugServiceImpl.MAX_EVENTS;
    }
    this._onDidAddEvent.fire(event);
  }
  addProviderEvent(event) {
    this._providerEvents.add(event);
    this.addEvent(event);
  }
  getEvents(sessionResource) {
    const result = [];
    const key = sessionResource?.toString();
    for (let i = 0; i < this._size; i++) {
      const event = this._buffer[(this._head + i) % ChatDebugServiceImpl.MAX_EVENTS];
      if (!event) {
        continue;
      }
      if (!key || event.sessionResource.toString() === key) {
        result.push(event);
      }
    }
    result.sort((a, b) => a.created.getTime() - b.created.getTime());
    return result;
  }
  getSessionResources() {
    const seen = new ResourceMap();
    const result = [];
    for (let i = 0; i < this._size; i++) {
      const event = this._buffer[(this._head + i) % ChatDebugServiceImpl.MAX_EVENTS];
      if (!event) {
        continue;
      }
      if (!seen.has(event.sessionResource)) {
        seen.set(event.sessionResource, true);
        result.push(event.sessionResource);
      }
    }
    return result;
  }
  clear() {
    this._buffer.fill(void 0);
    this._head = 0;
    this._size = 0;
  }
  registerProvider(provider) {
    this._providers.add(provider);
    for (const [sessionResource, cts] of this._invocationCts) {
      if (!cts.token.isCancellationRequested) {
        this._invokeProvider(provider, sessionResource, cts.token).catch(onUnexpectedError);
      }
    }
    return toDisposable(() => {
      this._providers.delete(provider);
    });
  }
  async invokeProviders(sessionResource) {
    if (!LocalChatSessionUri.isLocalSession(sessionResource)) {
      return;
    }
    const existingCts = this._invocationCts.get(sessionResource);
    if (existingCts) {
      existingCts.cancel();
      existingCts.dispose();
    }
    this._clearProviderEvents(sessionResource);
    const cts = new CancellationTokenSource();
    this._invocationCts.set(sessionResource, cts);
    try {
      const promises = [...this._providers].map((provider) => this._invokeProvider(provider, sessionResource, cts.token));
      await Promise.allSettled(promises);
    } catch (err) {
      onUnexpectedError(err);
    }
  }
  async _invokeProvider(provider, sessionResource, token) {
    try {
      const events = await provider.provideChatDebugLog(sessionResource, token);
      if (events) {
        for (const event of events) {
          this.addProviderEvent({
            ...event,
            sessionResource: event.sessionResource ?? sessionResource
          });
        }
      }
    } catch (err) {
      onUnexpectedError(err);
    }
  }
  endSession(sessionResource) {
    const cts = this._invocationCts.get(sessionResource);
    if (cts) {
      cts.cancel();
      cts.dispose();
      this._invocationCts.delete(sessionResource);
    }
  }
  _clearProviderEvents(sessionResource) {
    const key = sessionResource.toString();
    let write = 0;
    for (let i = 0; i < this._size; i++) {
      const idx = (this._head + i) % ChatDebugServiceImpl.MAX_EVENTS;
      const event = this._buffer[idx];
      if (event && this._providerEvents.has(event) && event.sessionResource.toString() === key) {
        continue;
      }
      if (write !== i) {
        const writeIdx = (this._head + write) % ChatDebugServiceImpl.MAX_EVENTS;
        this._buffer[writeIdx] = event;
      }
      write++;
    }
    for (let i = write; i < this._size; i++) {
      this._buffer[(this._head + i) % ChatDebugServiceImpl.MAX_EVENTS] = void 0;
    }
    this._size = write;
  }
  async resolveEvent(eventId) {
    for (const provider of this._providers) {
      if (provider.resolveChatDebugLogEvent) {
        try {
          const resolved = await provider.resolveChatDebugLogEvent(eventId, CancellationToken.None);
          if (resolved !== void 0) {
            return resolved;
          }
        } catch (err) {
          onUnexpectedError(err);
        }
      }
    }
    return void 0;
  }
  dispose() {
    for (const cts of this._invocationCts.values()) {
      cts.cancel();
      cts.dispose();
    }
    this._invocationCts.clear();
    super.dispose();
  }
}
export {
  ChatDebugServiceImpl
};
//# sourceMappingURL=chatDebugServiceImpl.js.map
