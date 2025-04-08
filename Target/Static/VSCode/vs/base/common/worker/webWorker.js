var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharCode } from "../charCode.js";
import { onUnexpectedError, transformErrorForSerialization } from "../errors.js";
import { Emitter, Event } from "../event.js";
import { Disposable, IDisposable } from "../lifecycle.js";
import { isWeb } from "../platform.js";
import * as strings from "../strings.js";
const DEFAULT_CHANNEL = "default";
const INITIALIZE = "$initialize";
let webWorkerWarningLogged = false;
function logOnceWebWorkerWarning(err) {
  if (!isWeb) {
    return;
  }
  if (!webWorkerWarningLogged) {
    webWorkerWarningLogged = true;
    console.warn("Could not create web worker(s). Falling back to loading web worker code in main thread, which might cause UI freezes. Please see https://github.com/microsoft/monaco-editor#faq");
  }
  console.warn(err.message);
}
__name(logOnceWebWorkerWarning, "logOnceWebWorkerWarning");
var MessageType = /* @__PURE__ */ ((MessageType2) => {
  MessageType2[MessageType2["Request"] = 0] = "Request";
  MessageType2[MessageType2["Reply"] = 1] = "Reply";
  MessageType2[MessageType2["SubscribeEvent"] = 2] = "SubscribeEvent";
  MessageType2[MessageType2["Event"] = 3] = "Event";
  MessageType2[MessageType2["UnsubscribeEvent"] = 4] = "UnsubscribeEvent";
  return MessageType2;
})(MessageType || {});
class RequestMessage {
  constructor(vsWorker, req, channel, method, args) {
    this.vsWorker = vsWorker;
    this.req = req;
    this.channel = channel;
    this.method = method;
    this.args = args;
  }
  static {
    __name(this, "RequestMessage");
  }
  type = 0 /* Request */;
}
class ReplyMessage {
  constructor(vsWorker, seq, res, err) {
    this.vsWorker = vsWorker;
    this.seq = seq;
    this.res = res;
    this.err = err;
  }
  static {
    __name(this, "ReplyMessage");
  }
  type = 1 /* Reply */;
}
class SubscribeEventMessage {
  constructor(vsWorker, req, channel, eventName, arg) {
    this.vsWorker = vsWorker;
    this.req = req;
    this.channel = channel;
    this.eventName = eventName;
    this.arg = arg;
  }
  static {
    __name(this, "SubscribeEventMessage");
  }
  type = 2 /* SubscribeEvent */;
}
class EventMessage {
  constructor(vsWorker, req, event) {
    this.vsWorker = vsWorker;
    this.req = req;
    this.event = event;
  }
  static {
    __name(this, "EventMessage");
  }
  type = 3 /* Event */;
}
class UnsubscribeEventMessage {
  constructor(vsWorker, req) {
    this.vsWorker = vsWorker;
    this.req = req;
  }
  static {
    __name(this, "UnsubscribeEventMessage");
  }
  type = 4 /* UnsubscribeEvent */;
}
class WebWorkerProtocol {
  static {
    __name(this, "WebWorkerProtocol");
  }
  _workerId;
  _lastSentReq;
  _pendingReplies;
  _pendingEmitters;
  _pendingEvents;
  _handler;
  constructor(handler) {
    this._workerId = -1;
    this._handler = handler;
    this._lastSentReq = 0;
    this._pendingReplies = /* @__PURE__ */ Object.create(null);
    this._pendingEmitters = /* @__PURE__ */ new Map();
    this._pendingEvents = /* @__PURE__ */ new Map();
  }
  setWorkerId(workerId) {
    this._workerId = workerId;
  }
  sendMessage(channel, method, args) {
    const req = String(++this._lastSentReq);
    return new Promise((resolve, reject) => {
      this._pendingReplies[req] = {
        resolve,
        reject
      };
      this._send(new RequestMessage(this._workerId, req, channel, method, args));
    });
  }
  listen(channel, eventName, arg) {
    let req = null;
    const emitter = new Emitter({
      onWillAddFirstListener: /* @__PURE__ */ __name(() => {
        req = String(++this._lastSentReq);
        this._pendingEmitters.set(req, emitter);
        this._send(new SubscribeEventMessage(this._workerId, req, channel, eventName, arg));
      }, "onWillAddFirstListener"),
      onDidRemoveLastListener: /* @__PURE__ */ __name(() => {
        this._pendingEmitters.delete(req);
        this._send(new UnsubscribeEventMessage(this._workerId, req));
        req = null;
      }, "onDidRemoveLastListener")
    });
    return emitter.event;
  }
  handleMessage(message) {
    if (!message || !message.vsWorker) {
      return;
    }
    if (this._workerId !== -1 && message.vsWorker !== this._workerId) {
      return;
    }
    this._handleMessage(message);
  }
  createProxyToRemoteChannel(channel, sendMessageBarrier) {
    const handler = {
      get: /* @__PURE__ */ __name((target, name) => {
        if (typeof name === "string" && !target[name]) {
          if (propertyIsDynamicEvent(name)) {
            target[name] = (arg) => {
              return this.listen(channel, name, arg);
            };
          } else if (propertyIsEvent(name)) {
            target[name] = this.listen(channel, name, void 0);
          } else if (name.charCodeAt(0) === CharCode.DollarSign) {
            target[name] = async (...myArgs) => {
              await sendMessageBarrier?.();
              return this.sendMessage(channel, name, myArgs);
            };
          }
        }
        return target[name];
      }, "get")
    };
    return new Proxy(/* @__PURE__ */ Object.create(null), handler);
  }
  _handleMessage(msg) {
    switch (msg.type) {
      case 1 /* Reply */:
        return this._handleReplyMessage(msg);
      case 0 /* Request */:
        return this._handleRequestMessage(msg);
      case 2 /* SubscribeEvent */:
        return this._handleSubscribeEventMessage(msg);
      case 3 /* Event */:
        return this._handleEventMessage(msg);
      case 4 /* UnsubscribeEvent */:
        return this._handleUnsubscribeEventMessage(msg);
    }
  }
  _handleReplyMessage(replyMessage) {
    if (!this._pendingReplies[replyMessage.seq]) {
      console.warn("Got reply to unknown seq");
      return;
    }
    const reply = this._pendingReplies[replyMessage.seq];
    delete this._pendingReplies[replyMessage.seq];
    if (replyMessage.err) {
      let err = replyMessage.err;
      if (replyMessage.err.$isError) {
        err = new Error();
        err.name = replyMessage.err.name;
        err.message = replyMessage.err.message;
        err.stack = replyMessage.err.stack;
      }
      reply.reject(err);
      return;
    }
    reply.resolve(replyMessage.res);
  }
  _handleRequestMessage(requestMessage) {
    const req = requestMessage.req;
    const result = this._handler.handleMessage(requestMessage.channel, requestMessage.method, requestMessage.args);
    result.then((r) => {
      this._send(new ReplyMessage(this._workerId, req, r, void 0));
    }, (e) => {
      if (e.detail instanceof Error) {
        e.detail = transformErrorForSerialization(e.detail);
      }
      this._send(new ReplyMessage(this._workerId, req, void 0, transformErrorForSerialization(e)));
    });
  }
  _handleSubscribeEventMessage(msg) {
    const req = msg.req;
    const disposable = this._handler.handleEvent(msg.channel, msg.eventName, msg.arg)((event) => {
      this._send(new EventMessage(this._workerId, req, event));
    });
    this._pendingEvents.set(req, disposable);
  }
  _handleEventMessage(msg) {
    if (!this._pendingEmitters.has(msg.req)) {
      console.warn("Got event for unknown req");
      return;
    }
    this._pendingEmitters.get(msg.req).fire(msg.event);
  }
  _handleUnsubscribeEventMessage(msg) {
    if (!this._pendingEvents.has(msg.req)) {
      console.warn("Got unsubscribe for unknown req");
      return;
    }
    this._pendingEvents.get(msg.req).dispose();
    this._pendingEvents.delete(msg.req);
  }
  _send(msg) {
    const transfer = [];
    if (msg.type === 0 /* Request */) {
      for (let i = 0; i < msg.args.length; i++) {
        if (msg.args[i] instanceof ArrayBuffer) {
          transfer.push(msg.args[i]);
        }
      }
    } else if (msg.type === 1 /* Reply */) {
      if (msg.res instanceof ArrayBuffer) {
        transfer.push(msg.res);
      }
    }
    this._handler.sendMessage(msg, transfer);
  }
}
class WebWorkerClient extends Disposable {
  static {
    __name(this, "WebWorkerClient");
  }
  _worker;
  _onModuleLoaded;
  _protocol;
  proxy;
  _localChannels = /* @__PURE__ */ new Map();
  _remoteChannels = /* @__PURE__ */ new Map();
  constructor(worker) {
    super();
    this._worker = worker;
    this._register(this._worker.onMessage((msg) => {
      this._protocol.handleMessage(msg);
    }));
    this._register(this._worker.onError((err) => {
      logOnceWebWorkerWarning(err);
      onUnexpectedError(err);
    }));
    this._protocol = new WebWorkerProtocol({
      sendMessage: /* @__PURE__ */ __name((msg, transfer) => {
        this._worker.postMessage(msg, transfer);
      }, "sendMessage"),
      handleMessage: /* @__PURE__ */ __name((channel, method, args) => {
        return this._handleMessage(channel, method, args);
      }, "handleMessage"),
      handleEvent: /* @__PURE__ */ __name((channel, eventName, arg) => {
        return this._handleEvent(channel, eventName, arg);
      }, "handleEvent")
    });
    this._protocol.setWorkerId(this._worker.getId());
    this._onModuleLoaded = this._protocol.sendMessage(DEFAULT_CHANNEL, INITIALIZE, [
      this._worker.getId()
    ]);
    this.proxy = this._protocol.createProxyToRemoteChannel(DEFAULT_CHANNEL, async () => {
      await this._onModuleLoaded;
    });
    this._onModuleLoaded.catch((e) => {
      this._onError("Worker failed to load ", e);
    });
  }
  _handleMessage(channelName, method, args) {
    const channel = this._localChannels.get(channelName);
    if (!channel) {
      return Promise.reject(new Error(`Missing channel ${channelName} on main thread`));
    }
    if (typeof channel[method] !== "function") {
      return Promise.reject(new Error(`Missing method ${method} on main thread channel ${channelName}`));
    }
    try {
      return Promise.resolve(channel[method].apply(channel, args));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  _handleEvent(channelName, eventName, arg) {
    const channel = this._localChannels.get(channelName);
    if (!channel) {
      throw new Error(`Missing channel ${channelName} on main thread`);
    }
    if (propertyIsDynamicEvent(eventName)) {
      const event = channel[eventName].call(channel, arg);
      if (typeof event !== "function") {
        throw new Error(`Missing dynamic event ${eventName} on main thread channel ${channelName}.`);
      }
      return event;
    }
    if (propertyIsEvent(eventName)) {
      const event = channel[eventName];
      if (typeof event !== "function") {
        throw new Error(`Missing event ${eventName} on main thread channel ${channelName}.`);
      }
      return event;
    }
    throw new Error(`Malformed event name ${eventName}`);
  }
  setChannel(channel, handler) {
    this._localChannels.set(channel, handler);
  }
  getChannel(channel) {
    if (!this._remoteChannels.has(channel)) {
      const inst = this._protocol.createProxyToRemoteChannel(channel, async () => {
        await this._onModuleLoaded;
      });
      this._remoteChannels.set(channel, inst);
    }
    return this._remoteChannels.get(channel);
  }
  _onError(message, error) {
    console.error(message);
    console.info(error);
  }
}
function propertyIsEvent(name) {
  return name[0] === "o" && name[1] === "n" && strings.isUpperAsciiLetter(name.charCodeAt(2));
}
__name(propertyIsEvent, "propertyIsEvent");
function propertyIsDynamicEvent(name) {
  return /^onDynamic/.test(name) && strings.isUpperAsciiLetter(name.charCodeAt(9));
}
__name(propertyIsDynamicEvent, "propertyIsDynamicEvent");
class WebWorkerServer {
  static {
    __name(this, "WebWorkerServer");
  }
  requestHandler;
  _protocol;
  _localChannels = /* @__PURE__ */ new Map();
  _remoteChannels = /* @__PURE__ */ new Map();
  constructor(postMessage, requestHandlerFactory) {
    this._protocol = new WebWorkerProtocol({
      sendMessage: /* @__PURE__ */ __name((msg, transfer) => {
        postMessage(msg, transfer);
      }, "sendMessage"),
      handleMessage: /* @__PURE__ */ __name((channel, method, args) => this._handleMessage(channel, method, args), "handleMessage"),
      handleEvent: /* @__PURE__ */ __name((channel, eventName, arg) => this._handleEvent(channel, eventName, arg), "handleEvent")
    });
    this.requestHandler = requestHandlerFactory(this);
  }
  onmessage(msg) {
    this._protocol.handleMessage(msg);
  }
  _handleMessage(channel, method, args) {
    if (channel === DEFAULT_CHANNEL && method === INITIALIZE) {
      return this.initialize(args[0]);
    }
    const requestHandler = channel === DEFAULT_CHANNEL ? this.requestHandler : this._localChannels.get(channel);
    if (!requestHandler) {
      return Promise.reject(new Error(`Missing channel ${channel} on worker thread`));
    }
    if (typeof requestHandler[method] !== "function") {
      return Promise.reject(new Error(`Missing method ${method} on worker thread channel ${channel}`));
    }
    try {
      return Promise.resolve(requestHandler[method].apply(requestHandler, args));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  _handleEvent(channel, eventName, arg) {
    const requestHandler = channel === DEFAULT_CHANNEL ? this.requestHandler : this._localChannels.get(channel);
    if (!requestHandler) {
      throw new Error(`Missing channel ${channel} on worker thread`);
    }
    if (propertyIsDynamicEvent(eventName)) {
      const event = requestHandler[eventName].call(requestHandler, arg);
      if (typeof event !== "function") {
        throw new Error(`Missing dynamic event ${eventName} on request handler.`);
      }
      return event;
    }
    if (propertyIsEvent(eventName)) {
      const event = requestHandler[eventName];
      if (typeof event !== "function") {
        throw new Error(`Missing event ${eventName} on request handler.`);
      }
      return event;
    }
    throw new Error(`Malformed event name ${eventName}`);
  }
  setChannel(channel, handler) {
    this._localChannels.set(channel, handler);
  }
  getChannel(channel) {
    if (!this._remoteChannels.has(channel)) {
      const inst = this._protocol.createProxyToRemoteChannel(channel);
      this._remoteChannels.set(channel, inst);
    }
    return this._remoteChannels.get(channel);
  }
  async initialize(workerId) {
    this._protocol.setWorkerId(workerId);
  }
}
export {
  WebWorkerClient,
  WebWorkerServer,
  logOnceWebWorkerWarning
};
//# sourceMappingURL=webWorker.js.map
