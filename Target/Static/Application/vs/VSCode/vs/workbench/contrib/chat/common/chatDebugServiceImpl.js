var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { timeout } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { extUri } from "../../../../base/common/resources.js";
import { ChatDebugLogLevel } from "./chatDebugService.js";
import { LocalChatSessionUri } from "./model/chatUri.js";
class SessionEventBuffer {
  static {
    __name(this, "SessionEventBuffer");
  }
  constructor(capacity) {
    this.capacity = capacity;
    this._head = 0;
    this._size = 0;
    this._buffer = new Array(capacity);
  }
  get size() {
    return this._size;
  }
  push(event) {
    const idx = (this._head + this._size) % this.capacity;
    this._buffer[idx] = event;
    if (this._size < this.capacity) {
      this._size++;
    } else {
      this._head = (this._head + 1) % this.capacity;
    }
  }
  /** Return events in insertion order. */
  toArray() {
    const result = [];
    for (let i = 0; i < this._size; i++) {
      const event = this._buffer[(this._head + i) % this.capacity];
      if (event) {
        result.push(event);
      }
    }
    return result;
  }
  /** Remove events matching the predicate and compact in-place. */
  removeWhere(predicate) {
    let write = 0;
    for (let i = 0; i < this._size; i++) {
      const idx = (this._head + i) % this.capacity;
      const event = this._buffer[idx];
      if (event && predicate(event)) {
        continue;
      }
      if (write !== i) {
        const writeIdx = (this._head + write) % this.capacity;
        this._buffer[writeIdx] = event;
      }
      write++;
    }
    for (let i = write; i < this._size; i++) {
      this._buffer[(this._head + i) % this.capacity] = void 0;
    }
    this._size = write;
  }
  clear() {
    this._buffer.fill(void 0);
    this._head = 0;
    this._size = 0;
  }
}
class ChatDebugServiceImpl extends Disposable {
  static {
    __name(this, "ChatDebugServiceImpl");
  }
  constructor() {
    super(...arguments);
    this._sessionBuffers = new ResourceMap();
    this._sessionOrder = [];
    this._onDidAddEvent = this._register(new Emitter());
    this.onDidAddEvent = this._onDidAddEvent.event;
    this._onDidClearProviderEvents = this._register(new Emitter());
    this.onDidClearProviderEvents = this._onDidClearProviderEvents.event;
    this._onDidAttachDebugData = this._register(new Emitter());
    this.onDidAttachDebugData = this._onDidAttachDebugData.event;
    this._debugDataAttachedSessions = new ResourceMap();
    this._providers = /* @__PURE__ */ new Set();
    this._invocationCts = new ResourceMap();
    this._providerEvents = /* @__PURE__ */ new WeakSet();
    this._importedSessions = new ResourceMap();
    this._importedSessionTitles = new ResourceMap();
  }
  static {
    this.MAX_EVENTS_PER_SESSION = 1e4;
  }
  static {
    this.MAX_SESSIONS = 5;
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
    let buffer = this._sessionBuffers.get(event.sessionResource);
    if (!buffer) {
      if (this._sessionOrder.length >= ChatDebugServiceImpl.MAX_SESSIONS) {
        const evicted = this._sessionOrder.shift();
        this._evictSession(evicted);
      }
      buffer = new SessionEventBuffer(ChatDebugServiceImpl.MAX_EVENTS_PER_SESSION);
      this._sessionBuffers.set(event.sessionResource, buffer);
      this._sessionOrder.push(event.sessionResource);
    } else {
      const idx = this._sessionOrder.findIndex((u) => extUri.isEqual(u, event.sessionResource));
      if (idx !== -1 && idx !== this._sessionOrder.length - 1) {
        this._sessionOrder.splice(idx, 1);
        this._sessionOrder.push(event.sessionResource);
      }
    }
    buffer.push(event);
    this._onDidAddEvent.fire(event);
  }
  addProviderEvent(event) {
    this._providerEvents.add(event);
    this.addEvent(event);
  }
  getEvents(sessionResource) {
    let result;
    if (sessionResource) {
      const buffer = this._sessionBuffers.get(sessionResource);
      result = buffer ? buffer.toArray() : [];
    } else {
      result = [];
      for (const buffer of this._sessionBuffers.values()) {
        result.push(...buffer.toArray());
      }
    }
    result.sort((a, b) => a.created.getTime() - b.created.getTime());
    return result;
  }
  getSessionResources() {
    return [...this._sessionOrder];
  }
  clear() {
    this._sessionBuffers.clear();
    this._sessionOrder.length = 0;
    this._debugDataAttachedSessions.clear();
    this._importedSessions.clear();
    this._importedSessionTitles.clear();
  }
  /** Remove all ancillary state for an evicted session. */
  _evictSession(sessionResource) {
    this._sessionBuffers.delete(sessionResource);
    this._importedSessions.delete(sessionResource);
    this._importedSessionTitles.delete(sessionResource);
    this._debugDataAttachedSessions.delete(sessionResource);
    const cts = this._invocationCts.get(sessionResource);
    if (cts) {
      cts.cancel();
      cts.dispose();
      this._invocationCts.delete(sessionResource);
    }
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
  hasInvokedProviders(sessionResource) {
    return this._invocationCts.has(sessionResource);
  }
  async invokeProviders(sessionResource) {
    if (!LocalChatSessionUri.isLocalSession(sessionResource) && !this._importedSessions.has(sessionResource)) {
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
        const BATCH_SIZE = 500;
        for (let i = 0; i < events.length; i++) {
          if (token.isCancellationRequested) {
            break;
          }
          this.addProviderEvent({
            ...events[i],
            sessionResource: events[i].sessionResource ?? sessionResource
          });
          if (i > 0 && i % BATCH_SIZE === 0) {
            await timeout(0);
          }
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
    this._debugDataAttachedSessions.delete(sessionResource);
  }
  _clearProviderEvents(sessionResource) {
    const buffer = this._sessionBuffers.get(sessionResource);
    if (buffer) {
      buffer.removeWhere((event) => this._providerEvents.has(event));
    }
    this._onDidClearProviderEvents.fire(sessionResource);
  }
  markDebugDataAttached(sessionResource) {
    if (!this._debugDataAttachedSessions.has(sessionResource)) {
      this._debugDataAttachedSessions.set(sessionResource, true);
      this._onDidAttachDebugData.fire(sessionResource);
    }
  }
  hasAttachedDebugData(sessionResource) {
    return this._debugDataAttachedSessions.has(sessionResource);
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
  isCoreEvent(event) {
    return !this._providerEvents.has(event);
  }
  setImportedSessionTitle(sessionResource, title) {
    this._importedSessionTitles.set(sessionResource, title);
  }
  getImportedSessionTitle(sessionResource) {
    return this._importedSessionTitles.get(sessionResource);
  }
  async exportLog(sessionResource) {
    for (const provider of this._providers) {
      if (provider.provideChatDebugLogExport) {
        try {
          const data = await provider.provideChatDebugLogExport(sessionResource, CancellationToken.None);
          if (data !== void 0) {
            return data;
          }
        } catch (err) {
          onUnexpectedError(err);
        }
      }
    }
    return void 0;
  }
  async importLog(data) {
    for (const provider of this._providers) {
      if (provider.resolveChatDebugLogImport) {
        try {
          const sessionUri = await provider.resolveChatDebugLogImport(data, CancellationToken.None);
          if (sessionUri !== void 0) {
            this._importedSessions.set(sessionUri, true);
            return sessionUri;
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
    this.clear();
    this._providers.clear();
    super.dispose();
  }
}
export {
  ChatDebugServiceImpl
};
//# sourceMappingURL=chatDebugServiceImpl.js.map
