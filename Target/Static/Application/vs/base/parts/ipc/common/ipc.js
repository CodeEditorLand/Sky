var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { getRandomElement } from "../../../common/arrays.js";
import { createCancelablePromise, timeout } from "../../../common/async.js";
import { VSBuffer } from "../../../common/buffer.js";
import { CancellationToken, CancellationTokenSource } from "../../../common/cancellation.js";
import { memoize } from "../../../common/decorators.js";
import { CancellationError, ErrorNoTelemetry } from "../../../common/errors.js";
import { Emitter, Event, EventMultiplexer, Relay } from "../../../common/event.js";
import { createSingleCallFunction } from "../../../common/functional.js";
import { DisposableStore, dispose, toDisposable } from "../../../common/lifecycle.js";
import { revive } from "../../../common/marshalling.js";
import * as strings from "../../../common/strings.js";
import { isFunction, isUndefinedOrNull } from "../../../common/types.js";
var RequestType;
(function(RequestType2) {
  RequestType2[RequestType2["Promise"] = 100] = "Promise";
  RequestType2[RequestType2["PromiseCancel"] = 101] = "PromiseCancel";
  RequestType2[RequestType2["EventListen"] = 102] = "EventListen";
  RequestType2[RequestType2["EventDispose"] = 103] = "EventDispose";
})(RequestType || (RequestType = {}));
function requestTypeToStr(type) {
  switch (type) {
    case 100:
      return "req";
    case 101:
      return "cancel";
    case 102:
      return "subscribe";
    case 103:
      return "unsubscribe";
  }
}
__name(requestTypeToStr, "requestTypeToStr");
var ResponseType;
(function(ResponseType2) {
  ResponseType2[ResponseType2["Initialize"] = 200] = "Initialize";
  ResponseType2[ResponseType2["PromiseSuccess"] = 201] = "PromiseSuccess";
  ResponseType2[ResponseType2["PromiseError"] = 202] = "PromiseError";
  ResponseType2[ResponseType2["PromiseErrorObj"] = 203] = "PromiseErrorObj";
  ResponseType2[ResponseType2["EventFire"] = 204] = "EventFire";
})(ResponseType || (ResponseType = {}));
function responseTypeToStr(type) {
  switch (type) {
    case 200:
      return `init`;
    case 201:
      return `reply:`;
    case 202:
    case 203:
      return `replyErr:`;
    case 204:
      return `event:`;
  }
}
__name(responseTypeToStr, "responseTypeToStr");
var State;
(function(State2) {
  State2[State2["Uninitialized"] = 0] = "Uninitialized";
  State2[State2["Idle"] = 1] = "Idle";
})(State || (State = {}));
function readIntVQL(reader) {
  let value = 0;
  for (let n = 0; ; n += 7) {
    const next = reader.read(1);
    value |= (next.buffer[0] & 127) << n;
    if (!(next.buffer[0] & 128)) {
      return value;
    }
  }
}
__name(readIntVQL, "readIntVQL");
const vqlZero = createOneByteBuffer(0);
function writeInt32VQL(writer, value) {
  if (value === 0) {
    writer.write(vqlZero);
    return;
  }
  let len = 0;
  for (let v2 = value; v2 !== 0; v2 = v2 >>> 7) {
    len++;
  }
  const scratch = VSBuffer.alloc(len);
  for (let i = 0; value !== 0; i++) {
    scratch.buffer[i] = value & 127;
    value = value >>> 7;
    if (value > 0) {
      scratch.buffer[i] |= 128;
    }
  }
  writer.write(scratch);
}
__name(writeInt32VQL, "writeInt32VQL");
class BufferReader {
  static {
    __name(this, "BufferReader");
  }
  constructor(buffer) {
    this.buffer = buffer;
    this.pos = 0;
  }
  read(bytes) {
    const result = this.buffer.slice(this.pos, this.pos + bytes);
    this.pos += result.byteLength;
    return result;
  }
}
class BufferWriter {
  static {
    __name(this, "BufferWriter");
  }
  constructor() {
    this.buffers = [];
  }
  get buffer() {
    return VSBuffer.concat(this.buffers);
  }
  write(buffer) {
    this.buffers.push(buffer);
  }
}
var DataType;
(function(DataType2) {
  DataType2[DataType2["Undefined"] = 0] = "Undefined";
  DataType2[DataType2["String"] = 1] = "String";
  DataType2[DataType2["Buffer"] = 2] = "Buffer";
  DataType2[DataType2["VSBuffer"] = 3] = "VSBuffer";
  DataType2[DataType2["Array"] = 4] = "Array";
  DataType2[DataType2["Object"] = 5] = "Object";
  DataType2[DataType2["Int"] = 6] = "Int";
})(DataType || (DataType = {}));
function createOneByteBuffer(value) {
  const result = VSBuffer.alloc(1);
  result.writeUInt8(value, 0);
  return result;
}
__name(createOneByteBuffer, "createOneByteBuffer");
const BufferPresets = {
  Undefined: createOneByteBuffer(DataType.Undefined),
  String: createOneByteBuffer(DataType.String),
  Buffer: createOneByteBuffer(DataType.Buffer),
  VSBuffer: createOneByteBuffer(DataType.VSBuffer),
  Array: createOneByteBuffer(DataType.Array),
  Object: createOneByteBuffer(DataType.Object),
  Uint: createOneByteBuffer(DataType.Int)
};
function serialize(writer, data) {
  if (typeof data === "undefined") {
    writer.write(BufferPresets.Undefined);
  } else if (typeof data === "string") {
    const buffer = VSBuffer.fromString(data);
    writer.write(BufferPresets.String);
    writeInt32VQL(writer, buffer.byteLength);
    writer.write(buffer);
  } else if (VSBuffer.isNativeBuffer(data)) {
    const buffer = VSBuffer.wrap(data);
    writer.write(BufferPresets.Buffer);
    writeInt32VQL(writer, buffer.byteLength);
    writer.write(buffer);
  } else if (data instanceof VSBuffer) {
    writer.write(BufferPresets.VSBuffer);
    writeInt32VQL(writer, data.byteLength);
    writer.write(data);
  } else if (Array.isArray(data)) {
    writer.write(BufferPresets.Array);
    writeInt32VQL(writer, data.length);
    for (const el of data) {
      serialize(writer, el);
    }
  } else if (typeof data === "number" && (data | 0) === data) {
    writer.write(BufferPresets.Uint);
    writeInt32VQL(writer, data);
  } else {
    const buffer = VSBuffer.fromString(JSON.stringify(data));
    writer.write(BufferPresets.Object);
    writeInt32VQL(writer, buffer.byteLength);
    writer.write(buffer);
  }
}
__name(serialize, "serialize");
function deserialize(reader) {
  const type = reader.read(1).readUInt8(0);
  switch (type) {
    case DataType.Undefined:
      return void 0;
    case DataType.String:
      return reader.read(readIntVQL(reader)).toString();
    case DataType.Buffer:
      return reader.read(readIntVQL(reader)).buffer;
    case DataType.VSBuffer:
      return reader.read(readIntVQL(reader));
    case DataType.Array: {
      const length = readIntVQL(reader);
      const result = [];
      for (let i = 0; i < length; i++) {
        result.push(deserialize(reader));
      }
      return result;
    }
    case DataType.Object:
      return JSON.parse(reader.read(readIntVQL(reader)).toString());
    case DataType.Int:
      return readIntVQL(reader);
  }
}
__name(deserialize, "deserialize");
class ChannelServer {
  static {
    __name(this, "ChannelServer");
  }
  constructor(protocol, ctx, logger = null, timeoutDelay = 1e3) {
    this.protocol = protocol;
    this.ctx = ctx;
    this.logger = logger;
    this.timeoutDelay = timeoutDelay;
    this.channels = /* @__PURE__ */ new Map();
    this.activeRequests = /* @__PURE__ */ new Map();
    this.pendingRequests = /* @__PURE__ */ new Map();
    this.protocolListener = this.protocol.onMessage((msg) => this.onRawMessage(msg));
    this.sendResponse({
      type: 200
      /* ResponseType.Initialize */
    });
  }
  registerChannel(channelName, channel) {
    this.channels.set(channelName, channel);
    setTimeout(() => this.flushPendingRequests(channelName), 0);
  }
  sendResponse(response) {
    switch (response.type) {
      case 200: {
        const msgLength = this.send([response.type]);
        this.logger?.logOutgoing(msgLength, 0, 1, responseTypeToStr(response.type));
        return;
      }
      case 201:
      case 202:
      case 204:
      case 203: {
        const msgLength = this.send([response.type, response.id], response.data);
        this.logger?.logOutgoing(msgLength, response.id, 1, responseTypeToStr(response.type), response.data);
        return;
      }
    }
  }
  send(header, body = void 0) {
    const writer = new BufferWriter();
    serialize(writer, header);
    serialize(writer, body);
    return this.sendBuffer(writer.buffer);
  }
  sendBuffer(message) {
    try {
      this.protocol.send(message);
      return message.byteLength;
    } catch (err) {
      return 0;
    }
  }
  onRawMessage(message) {
    const reader = new BufferReader(message);
    const header = deserialize(reader);
    const body = deserialize(reader);
    const type = header[0];
    switch (type) {
      case 100:
        this.logger?.logIncoming(message.byteLength, header[1], 1, `${requestTypeToStr(type)}: ${header[2]}.${header[3]}`, body);
        return this.onPromise({ type, id: header[1], channelName: header[2], name: header[3], arg: body });
      case 102:
        this.logger?.logIncoming(message.byteLength, header[1], 1, `${requestTypeToStr(type)}: ${header[2]}.${header[3]}`, body);
        return this.onEventListen({ type, id: header[1], channelName: header[2], name: header[3], arg: body });
      case 101:
        this.logger?.logIncoming(message.byteLength, header[1], 1, `${requestTypeToStr(type)}`);
        return this.disposeActiveRequest({ type, id: header[1] });
      case 103:
        this.logger?.logIncoming(message.byteLength, header[1], 1, `${requestTypeToStr(type)}`);
        return this.disposeActiveRequest({ type, id: header[1] });
    }
  }
  onPromise(request) {
    const channel = this.channels.get(request.channelName);
    if (!channel) {
      this.collectPendingRequest(request);
      return;
    }
    const cancellationTokenSource = new CancellationTokenSource();
    let promise;
    try {
      promise = channel.call(this.ctx, request.name, request.arg, cancellationTokenSource.token);
    } catch (err) {
      promise = Promise.reject(err);
    }
    const id = request.id;
    promise.then((data) => {
      this.sendResponse({
        id,
        data,
        type: 201
        /* ResponseType.PromiseSuccess */
      });
    }, (err) => {
      if (err instanceof Error) {
        this.sendResponse({
          id,
          data: {
            message: err.message,
            name: err.name,
            stack: err.stack ? err.stack.split("\n") : void 0
          },
          type: 202
          /* ResponseType.PromiseError */
        });
      } else {
        this.sendResponse({
          id,
          data: err,
          type: 203
          /* ResponseType.PromiseErrorObj */
        });
      }
    }).finally(() => {
      disposable.dispose();
      this.activeRequests.delete(request.id);
    });
    const disposable = toDisposable(() => cancellationTokenSource.cancel());
    this.activeRequests.set(request.id, disposable);
  }
  onEventListen(request) {
    const channel = this.channels.get(request.channelName);
    if (!channel) {
      this.collectPendingRequest(request);
      return;
    }
    const id = request.id;
    const event = channel.listen(this.ctx, request.name, request.arg);
    const disposable = event((data) => this.sendResponse({
      id,
      data,
      type: 204
      /* ResponseType.EventFire */
    }));
    this.activeRequests.set(request.id, disposable);
  }
  disposeActiveRequest(request) {
    const disposable = this.activeRequests.get(request.id);
    if (disposable) {
      disposable.dispose();
      this.activeRequests.delete(request.id);
    }
  }
  collectPendingRequest(request) {
    let pendingRequests = this.pendingRequests.get(request.channelName);
    if (!pendingRequests) {
      pendingRequests = [];
      this.pendingRequests.set(request.channelName, pendingRequests);
    }
    const timer = setTimeout(() => {
      console.error(`Unknown channel: ${request.channelName}`);
      if (request.type === 100) {
        this.sendResponse({
          id: request.id,
          data: { name: "Unknown channel", message: `Channel name '${request.channelName}' timed out after ${this.timeoutDelay}ms`, stack: void 0 },
          type: 202
          /* ResponseType.PromiseError */
        });
      }
    }, this.timeoutDelay);
    pendingRequests.push({ request, timeoutTimer: timer });
  }
  flushPendingRequests(channelName) {
    const requests = this.pendingRequests.get(channelName);
    if (requests) {
      for (const request of requests) {
        clearTimeout(request.timeoutTimer);
        switch (request.request.type) {
          case 100:
            this.onPromise(request.request);
            break;
          case 102:
            this.onEventListen(request.request);
            break;
        }
      }
      this.pendingRequests.delete(channelName);
    }
  }
  dispose() {
    if (this.protocolListener) {
      this.protocolListener.dispose();
      this.protocolListener = null;
    }
    dispose(this.activeRequests.values());
    this.activeRequests.clear();
  }
}
var RequestInitiator;
(function(RequestInitiator2) {
  RequestInitiator2[RequestInitiator2["LocalSide"] = 0] = "LocalSide";
  RequestInitiator2[RequestInitiator2["OtherSide"] = 1] = "OtherSide";
})(RequestInitiator || (RequestInitiator = {}));
class ChannelClient {
  static {
    __name(this, "ChannelClient");
  }
  constructor(protocol, logger = null) {
    this.protocol = protocol;
    this.isDisposed = false;
    this.state = State.Uninitialized;
    this.activeRequests = /* @__PURE__ */ new Set();
    this.handlers = /* @__PURE__ */ new Map();
    this.lastRequestId = 0;
    this._onDidInitialize = new Emitter();
    this.onDidInitialize = this._onDidInitialize.event;
    this.protocolListener = this.protocol.onMessage((msg) => this.onBuffer(msg));
    this.logger = logger;
  }
  getChannel(channelName) {
    const that = this;
    return {
      call(command, arg, cancellationToken) {
        if (that.isDisposed) {
          return Promise.reject(new CancellationError());
        }
        return that.requestPromise(channelName, command, arg, cancellationToken);
      },
      listen(event, arg) {
        if (that.isDisposed) {
          return Event.None;
        }
        return that.requestEvent(channelName, event, arg);
      }
    };
  }
  requestPromise(channelName, name, arg, cancellationToken = CancellationToken.None) {
    const id = this.lastRequestId++;
    const type = 100;
    const request = { id, type, channelName, name, arg };
    if (cancellationToken.isCancellationRequested) {
      return Promise.reject(new CancellationError());
    }
    let disposable;
    let disposableWithRequestCancel;
    const result = new Promise((c, e) => {
      if (cancellationToken.isCancellationRequested) {
        return e(new CancellationError());
      }
      const doRequest = /* @__PURE__ */ __name(() => {
        const handler = /* @__PURE__ */ __name((response) => {
          switch (response.type) {
            case 201:
              this.handlers.delete(id);
              c(response.data);
              break;
            case 202: {
              this.handlers.delete(id);
              const error = new Error(response.data.message);
              error.stack = Array.isArray(response.data.stack) ? response.data.stack.join("\n") : response.data.stack;
              error.name = response.data.name;
              e(error);
              break;
            }
            case 203:
              this.handlers.delete(id);
              e(response.data);
              break;
          }
        }, "handler");
        this.handlers.set(id, handler);
        this.sendRequest(request);
      }, "doRequest");
      let uninitializedPromise = null;
      if (this.state === State.Idle) {
        doRequest();
      } else {
        uninitializedPromise = createCancelablePromise((_) => this.whenInitialized());
        uninitializedPromise.then(() => {
          uninitializedPromise = null;
          doRequest();
        });
      }
      const cancel = /* @__PURE__ */ __name(() => {
        if (uninitializedPromise) {
          uninitializedPromise.cancel();
          uninitializedPromise = null;
        } else {
          this.sendRequest({
            id,
            type: 101
            /* RequestType.PromiseCancel */
          });
        }
        e(new CancellationError());
      }, "cancel");
      disposable = cancellationToken.onCancellationRequested(cancel);
      disposableWithRequestCancel = {
        dispose: createSingleCallFunction(() => {
          cancel();
          disposable.dispose();
        })
      };
      this.activeRequests.add(disposableWithRequestCancel);
    });
    return result.finally(() => {
      disposable?.dispose();
      this.activeRequests.delete(disposableWithRequestCancel);
    });
  }
  requestEvent(channelName, name, arg) {
    const id = this.lastRequestId++;
    const type = 102;
    const request = { id, type, channelName, name, arg };
    let uninitializedPromise = null;
    const emitter = new Emitter({
      onWillAddFirstListener: /* @__PURE__ */ __name(() => {
        const doRequest = /* @__PURE__ */ __name(() => {
          this.activeRequests.add(emitter);
          this.sendRequest(request);
        }, "doRequest");
        if (this.state === State.Idle) {
          doRequest();
        } else {
          uninitializedPromise = createCancelablePromise((_) => this.whenInitialized());
          uninitializedPromise.then(() => {
            uninitializedPromise = null;
            doRequest();
          });
        }
      }, "onWillAddFirstListener"),
      onDidRemoveLastListener: /* @__PURE__ */ __name(() => {
        if (uninitializedPromise) {
          uninitializedPromise.cancel();
          uninitializedPromise = null;
        } else {
          this.activeRequests.delete(emitter);
          this.sendRequest({
            id,
            type: 103
            /* RequestType.EventDispose */
          });
        }
        this.handlers.delete(id);
      }, "onDidRemoveLastListener")
    });
    const handler = /* @__PURE__ */ __name((res) => emitter.fire(res.data), "handler");
    this.handlers.set(id, handler);
    return emitter.event;
  }
  sendRequest(request) {
    switch (request.type) {
      case 100:
      case 102: {
        const msgLength = this.send([request.type, request.id, request.channelName, request.name], request.arg);
        this.logger?.logOutgoing(msgLength, request.id, 0, `${requestTypeToStr(request.type)}: ${request.channelName}.${request.name}`, request.arg);
        return;
      }
      case 101:
      case 103: {
        const msgLength = this.send([request.type, request.id]);
        this.logger?.logOutgoing(msgLength, request.id, 0, requestTypeToStr(request.type));
        return;
      }
    }
  }
  send(header, body = void 0) {
    const writer = new BufferWriter();
    serialize(writer, header);
    serialize(writer, body);
    return this.sendBuffer(writer.buffer);
  }
  sendBuffer(message) {
    try {
      this.protocol.send(message);
      return message.byteLength;
    } catch (err) {
      return 0;
    }
  }
  onBuffer(message) {
    const reader = new BufferReader(message);
    const header = deserialize(reader);
    const body = deserialize(reader);
    const type = header[0];
    switch (type) {
      case 200:
        this.logger?.logIncoming(message.byteLength, 0, 0, responseTypeToStr(type));
        return this.onResponse({ type: header[0] });
      case 201:
      case 202:
      case 204:
      case 203:
        this.logger?.logIncoming(message.byteLength, header[1], 0, responseTypeToStr(type), body);
        return this.onResponse({ type: header[0], id: header[1], data: body });
    }
  }
  onResponse(response) {
    if (response.type === 200) {
      this.state = State.Idle;
      this._onDidInitialize.fire();
      return;
    }
    const handler = this.handlers.get(response.id);
    handler?.(response);
  }
  get onDidInitializePromise() {
    return Event.toPromise(this.onDidInitialize);
  }
  whenInitialized() {
    if (this.state === State.Idle) {
      return Promise.resolve();
    } else {
      return this.onDidInitializePromise;
    }
  }
  dispose() {
    this.isDisposed = true;
    if (this.protocolListener) {
      this.protocolListener.dispose();
      this.protocolListener = null;
    }
    dispose(this.activeRequests.values());
    this.activeRequests.clear();
  }
}
__decorate([
  memoize
], ChannelClient.prototype, "onDidInitializePromise", null);
class IPCServer {
  static {
    __name(this, "IPCServer");
  }
  get connections() {
    const result = [];
    this._connections.forEach((ctx) => result.push(ctx));
    return result;
  }
  constructor(onDidClientConnect, ipcLogger, timeoutDelay) {
    this.channels = /* @__PURE__ */ new Map();
    this._connections = /* @__PURE__ */ new Set();
    this._onDidAddConnection = new Emitter();
    this.onDidAddConnection = this._onDidAddConnection.event;
    this._onDidRemoveConnection = new Emitter();
    this.onDidRemoveConnection = this._onDidRemoveConnection.event;
    this.disposables = new DisposableStore();
    this.disposables.add(onDidClientConnect(({ protocol, onDidClientDisconnect }) => {
      const onFirstMessage = Event.once(protocol.onMessage);
      this.disposables.add(onFirstMessage((msg) => {
        const reader = new BufferReader(msg);
        const ctx = deserialize(reader);
        const channelServer = new ChannelServer(protocol, ctx, ipcLogger, timeoutDelay);
        const channelClient = new ChannelClient(protocol, ipcLogger);
        this.channels.forEach((channel, name) => channelServer.registerChannel(name, channel));
        const connection = { channelServer, channelClient, ctx };
        this._connections.add(connection);
        this._onDidAddConnection.fire(connection);
        this.disposables.add(onDidClientDisconnect(() => {
          channelServer.dispose();
          channelClient.dispose();
          this._connections.delete(connection);
          this._onDidRemoveConnection.fire(connection);
        }));
      }));
    }));
  }
  getChannel(channelName, routerOrClientFilter) {
    const that = this;
    return {
      call(command, arg, cancellationToken) {
        let connectionPromise;
        if (isFunction(routerOrClientFilter)) {
          const connection = getRandomElement(that.connections.filter(routerOrClientFilter));
          connectionPromise = connection ? Promise.resolve(connection) : Event.toPromise(Event.filter(that.onDidAddConnection, routerOrClientFilter));
        } else {
          connectionPromise = routerOrClientFilter.routeCall(that, command, arg);
        }
        const channelPromise = connectionPromise.then((connection) => connection.channelClient.getChannel(channelName));
        return getDelayedChannel(channelPromise).call(command, arg, cancellationToken);
      },
      listen(event, arg) {
        if (isFunction(routerOrClientFilter)) {
          return that.getMulticastEvent(channelName, routerOrClientFilter, event, arg);
        }
        const channelPromise = routerOrClientFilter.routeEvent(that, event, arg).then((connection) => connection.channelClient.getChannel(channelName));
        return getDelayedChannel(channelPromise).listen(event, arg);
      }
    };
  }
  getMulticastEvent(channelName, clientFilter, eventName, arg) {
    const that = this;
    let disposables;
    const emitter = new Emitter({
      onWillAddFirstListener: /* @__PURE__ */ __name(() => {
        disposables = new DisposableStore();
        const eventMultiplexer = new EventMultiplexer();
        const map = /* @__PURE__ */ new Map();
        const onDidAddConnection = /* @__PURE__ */ __name((connection) => {
          const channel = connection.channelClient.getChannel(channelName);
          const event = channel.listen(eventName, arg);
          const disposable = eventMultiplexer.add(event);
          map.set(connection, disposable);
        }, "onDidAddConnection");
        const onDidRemoveConnection = /* @__PURE__ */ __name((connection) => {
          const disposable = map.get(connection);
          if (!disposable) {
            return;
          }
          disposable.dispose();
          map.delete(connection);
        }, "onDidRemoveConnection");
        that.connections.filter(clientFilter).forEach(onDidAddConnection);
        Event.filter(that.onDidAddConnection, clientFilter)(onDidAddConnection, void 0, disposables);
        that.onDidRemoveConnection(onDidRemoveConnection, void 0, disposables);
        eventMultiplexer.event(emitter.fire, emitter, disposables);
        disposables.add(eventMultiplexer);
      }, "onWillAddFirstListener"),
      onDidRemoveLastListener: /* @__PURE__ */ __name(() => {
        disposables?.dispose();
        disposables = void 0;
      }, "onDidRemoveLastListener")
    });
    that.disposables.add(emitter);
    return emitter.event;
  }
  registerChannel(channelName, channel) {
    this.channels.set(channelName, channel);
    for (const connection of this._connections) {
      connection.channelServer.registerChannel(channelName, channel);
    }
  }
  dispose() {
    this.disposables.dispose();
    for (const connection of this._connections) {
      connection.channelClient.dispose();
      connection.channelServer.dispose();
    }
    this._connections.clear();
    this.channels.clear();
    this._onDidAddConnection.dispose();
    this._onDidRemoveConnection.dispose();
  }
}
class IPCClient {
  static {
    __name(this, "IPCClient");
  }
  constructor(protocol, ctx, ipcLogger = null) {
    const writer = new BufferWriter();
    serialize(writer, ctx);
    protocol.send(writer.buffer);
    this.channelClient = new ChannelClient(protocol, ipcLogger);
    this.channelServer = new ChannelServer(protocol, ctx, ipcLogger);
  }
  getChannel(channelName) {
    return this.channelClient.getChannel(channelName);
  }
  registerChannel(channelName, channel) {
    this.channelServer.registerChannel(channelName, channel);
  }
  dispose() {
    this.channelClient.dispose();
    this.channelServer.dispose();
  }
}
function getDelayedChannel(promise) {
  return {
    call(command, arg, cancellationToken) {
      return promise.then((c) => c.call(command, arg, cancellationToken));
    },
    listen(event, arg) {
      const relay = new Relay();
      promise.then((c) => relay.input = c.listen(event, arg));
      return relay.event;
    }
  };
}
__name(getDelayedChannel, "getDelayedChannel");
function getNextTickChannel(channel) {
  let didTick = false;
  return {
    call(command, arg, cancellationToken) {
      if (didTick) {
        return channel.call(command, arg, cancellationToken);
      }
      return timeout(0).then(() => didTick = true).then(() => channel.call(command, arg, cancellationToken));
    },
    listen(event, arg) {
      if (didTick) {
        return channel.listen(event, arg);
      }
      const relay = new Relay();
      timeout(0).then(() => didTick = true).then(() => relay.input = channel.listen(event, arg));
      return relay.event;
    }
  };
}
__name(getNextTickChannel, "getNextTickChannel");
class StaticRouter {
  static {
    __name(this, "StaticRouter");
  }
  constructor(fn) {
    this.fn = fn;
  }
  routeCall(hub) {
    return this.route(hub);
  }
  routeEvent(hub) {
    return this.route(hub);
  }
  async route(hub) {
    for (const connection of hub.connections) {
      if (await Promise.resolve(this.fn(connection.ctx))) {
        return Promise.resolve(connection);
      }
    }
    await Event.toPromise(hub.onDidAddConnection);
    return await this.route(hub);
  }
}
var ProxyChannel;
(function(ProxyChannel2) {
  function fromService(service, disposables, options) {
    const handler = service;
    const disableMarshalling = options?.disableMarshalling;
    const mapEventNameToEvent = /* @__PURE__ */ new Map();
    for (const key in handler) {
      if (propertyIsEvent(key)) {
        mapEventNameToEvent.set(key, Event.buffer(handler[key], true, void 0, disposables));
      }
    }
    return new class {
      listen(_, event, arg) {
        const eventImpl = mapEventNameToEvent.get(event);
        if (eventImpl) {
          return eventImpl;
        }
        const target = handler[event];
        if (typeof target === "function") {
          if (propertyIsDynamicEvent(event)) {
            return target.call(handler, arg);
          }
          if (propertyIsEvent(event)) {
            mapEventNameToEvent.set(event, Event.buffer(handler[event], true, void 0, disposables));
            return mapEventNameToEvent.get(event);
          }
        }
        throw new ErrorNoTelemetry(`Event not found: ${event}`);
      }
      call(_, command, args) {
        const target = handler[command];
        if (typeof target === "function") {
          if (!disableMarshalling && Array.isArray(args)) {
            for (let i = 0; i < args.length; i++) {
              args[i] = revive(args[i]);
            }
          }
          let res = target.apply(handler, args);
          if (!(res instanceof Promise)) {
            res = Promise.resolve(res);
          }
          return res;
        }
        throw new ErrorNoTelemetry(`Method not found: ${command}`);
      }
    }();
  }
  __name(fromService, "fromService");
  ProxyChannel2.fromService = fromService;
  function toService(channel, options) {
    const disableMarshalling = options?.disableMarshalling;
    return new Proxy({}, {
      get(_target, propKey) {
        if (typeof propKey === "string") {
          if (options?.properties?.has(propKey)) {
            return options.properties.get(propKey);
          }
          if (propertyIsDynamicEvent(propKey)) {
            return function(arg) {
              return channel.listen(propKey, arg);
            };
          }
          if (propertyIsEvent(propKey)) {
            return channel.listen(propKey);
          }
          return async function(...args) {
            let methodArgs;
            if (options && !isUndefinedOrNull(options.context)) {
              methodArgs = [options.context, ...args];
            } else {
              methodArgs = args;
            }
            const result = await channel.call(propKey, methodArgs);
            if (!disableMarshalling) {
              return revive(result);
            }
            return result;
          };
        }
        throw new ErrorNoTelemetry(`Property not found: ${String(propKey)}`);
      }
    });
  }
  __name(toService, "toService");
  ProxyChannel2.toService = toService;
  function propertyIsEvent(name) {
    return name[0] === "o" && name[1] === "n" && strings.isUpperAsciiLetter(name.charCodeAt(2));
  }
  __name(propertyIsEvent, "propertyIsEvent");
  function propertyIsDynamicEvent(name) {
    return /^onDynamic/.test(name) && strings.isUpperAsciiLetter(name.charCodeAt(9));
  }
  __name(propertyIsDynamicEvent, "propertyIsDynamicEvent");
})(ProxyChannel || (ProxyChannel = {}));
const colorTables = [
  ["#2977B1", "#FC802D", "#34A13A", "#D3282F", "#9366BA"],
  ["#8B564C", "#E177C0", "#7F7F7F", "#BBBE3D", "#2EBECD"]
];
function prettyWithoutArrays(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object" && typeof data.toString === "function") {
    const result = data.toString();
    if (result !== "[object Object]") {
      return result;
    }
  }
  return data;
}
__name(prettyWithoutArrays, "prettyWithoutArrays");
function pretty(data) {
  if (Array.isArray(data)) {
    return data.map(prettyWithoutArrays);
  }
  return prettyWithoutArrays(data);
}
__name(pretty, "pretty");
function logWithColors(direction, totalLength, msgLength, req, initiator, str, data) {
  data = pretty(data);
  const colorTable = colorTables[initiator];
  const color = colorTable[req % colorTable.length];
  let args = [`%c[${direction}]%c[${String(totalLength).padStart(7, " ")}]%c[len: ${String(msgLength).padStart(5, " ")}]%c${String(req).padStart(5, " ")} - ${str}`, "color: darkgreen", "color: grey", "color: grey", `color: ${color}`];
  if (/\($/.test(str)) {
    args = args.concat(data);
    args.push(")");
  } else {
    args.push(data);
  }
  console.log.apply(console, args);
}
__name(logWithColors, "logWithColors");
class IPCLogger {
  static {
    __name(this, "IPCLogger");
  }
  constructor(_outgoingPrefix, _incomingPrefix) {
    this._outgoingPrefix = _outgoingPrefix;
    this._incomingPrefix = _incomingPrefix;
    this._totalIncoming = 0;
    this._totalOutgoing = 0;
  }
  logOutgoing(msgLength, requestId, initiator, str, data) {
    this._totalOutgoing += msgLength;
    logWithColors(this._outgoingPrefix, this._totalOutgoing, msgLength, requestId, initiator, str, data);
  }
  logIncoming(msgLength, requestId, initiator, str, data) {
    this._totalIncoming += msgLength;
    logWithColors(this._incomingPrefix, this._totalIncoming, msgLength, requestId, initiator, str, data);
  }
}
export {
  BufferReader,
  BufferWriter,
  ChannelClient,
  ChannelServer,
  IPCClient,
  IPCLogger,
  IPCServer,
  ProxyChannel,
  RequestInitiator,
  StaticRouter,
  deserialize,
  getDelayedChannel,
  getNextTickChannel,
  serialize
};
//# sourceMappingURL=ipc.js.map
