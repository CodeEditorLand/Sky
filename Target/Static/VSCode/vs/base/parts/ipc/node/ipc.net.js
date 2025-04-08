var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createHash } from "crypto";
import { Server as NetServer, Socket, createServer, createConnection } from "net";
import { tmpdir } from "os";
import { createDeflateRaw, ZlibOptions, InflateRaw, DeflateRaw, createInflateRaw } from "zlib";
import { VSBuffer } from "../../../common/buffer.js";
import { onUnexpectedError } from "../../../common/errors.js";
import { Emitter, Event } from "../../../common/event.js";
import { Disposable, IDisposable } from "../../../common/lifecycle.js";
import { join } from "../../../common/path.js";
import { Platform, platform } from "../../../common/platform.js";
import { generateUuid } from "../../../common/uuid.js";
import { ClientConnectionEvent, IPCServer } from "../common/ipc.js";
import { ChunkStream, Client, ISocket, Protocol, SocketCloseEvent, SocketCloseEventType, SocketDiagnostics, SocketDiagnosticsEventType } from "../common/ipc.net.js";
const socketEndTimeoutMs = 3e4;
class NodeSocket {
  static {
    __name(this, "NodeSocket");
  }
  debugLabel;
  socket;
  _errorListener;
  _closeListener;
  _endListener;
  _canWrite = true;
  traceSocketEvent(type, data) {
    SocketDiagnostics.traceSocketEvent(this.socket, this.debugLabel, type, data);
  }
  constructor(socket, debugLabel = "") {
    this.debugLabel = debugLabel;
    this.socket = socket;
    this.traceSocketEvent(SocketDiagnosticsEventType.Created, { type: "NodeSocket" });
    this._errorListener = (err) => {
      this.traceSocketEvent(SocketDiagnosticsEventType.Error, { code: err?.code, message: err?.message });
      if (err) {
        if (err.code === "EPIPE") {
          return;
        }
        onUnexpectedError(err);
      }
    };
    this.socket.on("error", this._errorListener);
    let endTimeoutHandle;
    this._closeListener = (hadError) => {
      this.traceSocketEvent(SocketDiagnosticsEventType.Close, { hadError });
      this._canWrite = false;
      if (endTimeoutHandle) {
        clearTimeout(endTimeoutHandle);
      }
    };
    this.socket.on("close", this._closeListener);
    this._endListener = () => {
      this.traceSocketEvent(SocketDiagnosticsEventType.NodeEndReceived);
      this._canWrite = false;
      endTimeoutHandle = setTimeout(() => socket.destroy(), socketEndTimeoutMs);
    };
    this.socket.on("end", this._endListener);
  }
  dispose() {
    this.socket.off("error", this._errorListener);
    this.socket.off("close", this._closeListener);
    this.socket.off("end", this._endListener);
    this.socket.destroy();
  }
  onData(_listener) {
    const listener = /* @__PURE__ */ __name((buff) => {
      this.traceSocketEvent(SocketDiagnosticsEventType.Read, buff);
      _listener(VSBuffer.wrap(buff));
    }, "listener");
    this.socket.on("data", listener);
    return {
      dispose: /* @__PURE__ */ __name(() => this.socket.off("data", listener), "dispose")
    };
  }
  onClose(listener) {
    const adapter = /* @__PURE__ */ __name((hadError) => {
      listener({
        type: SocketCloseEventType.NodeSocketCloseEvent,
        hadError,
        error: void 0
      });
    }, "adapter");
    this.socket.on("close", adapter);
    return {
      dispose: /* @__PURE__ */ __name(() => this.socket.off("close", adapter), "dispose")
    };
  }
  onEnd(listener) {
    const adapter = /* @__PURE__ */ __name(() => {
      listener();
    }, "adapter");
    this.socket.on("end", adapter);
    return {
      dispose: /* @__PURE__ */ __name(() => this.socket.off("end", adapter), "dispose")
    };
  }
  write(buffer) {
    if (this.socket.destroyed || !this._canWrite) {
      return;
    }
    try {
      this.traceSocketEvent(SocketDiagnosticsEventType.Write, buffer);
      this.socket.write(buffer.buffer, (err) => {
        if (err) {
          if (err.code === "EPIPE") {
            return;
          }
          onUnexpectedError(err);
        }
      });
    } catch (err) {
      if (err.code === "EPIPE") {
        return;
      }
      onUnexpectedError(err);
    }
  }
  end() {
    this.traceSocketEvent(SocketDiagnosticsEventType.NodeEndSent);
    this.socket.end();
  }
  drain() {
    this.traceSocketEvent(SocketDiagnosticsEventType.NodeDrainBegin);
    return new Promise((resolve, reject) => {
      if (this.socket.bufferSize === 0) {
        this.traceSocketEvent(SocketDiagnosticsEventType.NodeDrainEnd);
        resolve();
        return;
      }
      const finished = /* @__PURE__ */ __name(() => {
        this.socket.off("close", finished);
        this.socket.off("end", finished);
        this.socket.off("error", finished);
        this.socket.off("timeout", finished);
        this.socket.off("drain", finished);
        this.traceSocketEvent(SocketDiagnosticsEventType.NodeDrainEnd);
        resolve();
      }, "finished");
      this.socket.on("close", finished);
      this.socket.on("end", finished);
      this.socket.on("error", finished);
      this.socket.on("timeout", finished);
      this.socket.on("drain", finished);
    });
  }
}
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["MinHeaderByteSize"] = 2] = "MinHeaderByteSize";
  Constants2[Constants2["MaxWebSocketMessageLength"] = 262144] = "MaxWebSocketMessageLength";
  return Constants2;
})(Constants || {});
var ReadState = /* @__PURE__ */ ((ReadState2) => {
  ReadState2[ReadState2["PeekHeader"] = 1] = "PeekHeader";
  ReadState2[ReadState2["ReadHeader"] = 2] = "ReadHeader";
  ReadState2[ReadState2["ReadBody"] = 3] = "ReadBody";
  ReadState2[ReadState2["Fin"] = 4] = "Fin";
  return ReadState2;
})(ReadState || {});
class WebSocketNodeSocket extends Disposable {
  static {
    __name(this, "WebSocketNodeSocket");
  }
  socket;
  _flowManager;
  _incomingData;
  _onData = this._register(new Emitter());
  _onClose = this._register(new Emitter());
  _isEnded = false;
  _state = {
    state: 1 /* PeekHeader */,
    readLen: 2 /* MinHeaderByteSize */,
    fin: 0,
    compressed: false,
    firstFrameOfMessage: true,
    mask: 0,
    opcode: 0
  };
  get permessageDeflate() {
    return this._flowManager.permessageDeflate;
  }
  get recordedInflateBytes() {
    return this._flowManager.recordedInflateBytes;
  }
  traceSocketEvent(type, data) {
    this.socket.traceSocketEvent(type, data);
  }
  /**
   * Create a socket which can communicate using WebSocket frames.
   *
   * **NOTE**: When using the permessage-deflate WebSocket extension, if parts of inflating was done
   *  in a different zlib instance, we need to pass all those bytes into zlib, otherwise the inflate
   *  might hit an inflated portion referencing a distance too far back.
   *
   * @param socket The underlying socket
   * @param permessageDeflate Use the permessage-deflate WebSocket extension
   * @param inflateBytes "Seed" zlib inflate with these bytes.
   * @param recordInflateBytes Record all bytes sent to inflate
   */
  constructor(socket, permessageDeflate, inflateBytes, recordInflateBytes) {
    super();
    this.socket = socket;
    this.traceSocketEvent(SocketDiagnosticsEventType.Created, { type: "WebSocketNodeSocket", permessageDeflate, inflateBytesLength: inflateBytes?.byteLength || 0, recordInflateBytes });
    this._flowManager = this._register(new WebSocketFlowManager(
      this,
      permessageDeflate,
      inflateBytes,
      recordInflateBytes,
      this._onData,
      (data, options) => this._write(data, options)
    ));
    this._register(this._flowManager.onError((err) => {
      console.error(err);
      onUnexpectedError(err);
      this._onClose.fire({
        type: SocketCloseEventType.NodeSocketCloseEvent,
        hadError: true,
        error: err
      });
    }));
    this._incomingData = new ChunkStream();
    this._register(this.socket.onData((data) => this._acceptChunk(data)));
    this._register(this.socket.onClose(async (e) => {
      if (this._flowManager.isProcessingReadQueue()) {
        await Event.toPromise(this._flowManager.onDidFinishProcessingReadQueue);
      }
      this._onClose.fire(e);
    }));
  }
  dispose() {
    if (this._flowManager.isProcessingWriteQueue()) {
      this._register(this._flowManager.onDidFinishProcessingWriteQueue(() => {
        this.dispose();
      }));
    } else {
      this.socket.dispose();
      super.dispose();
    }
  }
  onData(listener) {
    return this._onData.event(listener);
  }
  onClose(listener) {
    return this._onClose.event(listener);
  }
  onEnd(listener) {
    return this.socket.onEnd(listener);
  }
  write(buffer) {
    let start = 0;
    while (start < buffer.byteLength) {
      this._flowManager.writeMessage(buffer.slice(start, Math.min(start + 262144 /* MaxWebSocketMessageLength */, buffer.byteLength)), {
        compressed: true,
        opcode: 2
        /* Binary frame */
      });
      start += 262144 /* MaxWebSocketMessageLength */;
    }
  }
  _write(buffer, { compressed, opcode }) {
    if (this._isEnded) {
      return;
    }
    this.traceSocketEvent(SocketDiagnosticsEventType.WebSocketNodeSocketWrite, buffer);
    let headerLen = 2 /* MinHeaderByteSize */;
    if (buffer.byteLength < 126) {
      headerLen += 0;
    } else if (buffer.byteLength < 2 ** 16) {
      headerLen += 2;
    } else {
      headerLen += 8;
    }
    const header = VSBuffer.alloc(headerLen);
    const compressedFlag = compressed ? 64 : 0;
    const opcodeFlag = opcode & 15;
    header.writeUInt8(128 | compressedFlag | opcodeFlag, 0);
    if (buffer.byteLength < 126) {
      header.writeUInt8(buffer.byteLength, 1);
    } else if (buffer.byteLength < 2 ** 16) {
      header.writeUInt8(126, 1);
      let offset = 1;
      header.writeUInt8(buffer.byteLength >>> 8 & 255, ++offset);
      header.writeUInt8(buffer.byteLength >>> 0 & 255, ++offset);
    } else {
      header.writeUInt8(127, 1);
      let offset = 1;
      header.writeUInt8(0, ++offset);
      header.writeUInt8(0, ++offset);
      header.writeUInt8(0, ++offset);
      header.writeUInt8(0, ++offset);
      header.writeUInt8(buffer.byteLength >>> 24 & 255, ++offset);
      header.writeUInt8(buffer.byteLength >>> 16 & 255, ++offset);
      header.writeUInt8(buffer.byteLength >>> 8 & 255, ++offset);
      header.writeUInt8(buffer.byteLength >>> 0 & 255, ++offset);
    }
    this.socket.write(VSBuffer.concat([header, buffer]));
  }
  end() {
    this._isEnded = true;
    this.socket.end();
  }
  _acceptChunk(data) {
    if (data.byteLength === 0) {
      return;
    }
    this._incomingData.acceptChunk(data);
    while (this._incomingData.byteLength >= this._state.readLen) {
      if (this._state.state === 1 /* PeekHeader */) {
        const peekHeader = this._incomingData.peek(this._state.readLen);
        const firstByte = peekHeader.readUInt8(0);
        const finBit = (firstByte & 128) >>> 7;
        const rsv1Bit = (firstByte & 64) >>> 6;
        const opcode = firstByte & 15;
        const secondByte = peekHeader.readUInt8(1);
        const hasMask = (secondByte & 128) >>> 7;
        const len = secondByte & 127;
        this._state.state = 2 /* ReadHeader */;
        this._state.readLen = 2 /* MinHeaderByteSize */ + (hasMask ? 4 : 0) + (len === 126 ? 2 : 0) + (len === 127 ? 8 : 0);
        this._state.fin = finBit;
        if (this._state.firstFrameOfMessage) {
          this._state.compressed = Boolean(rsv1Bit);
        }
        this._state.firstFrameOfMessage = Boolean(finBit);
        this._state.mask = 0;
        this._state.opcode = opcode;
        this.traceSocketEvent(SocketDiagnosticsEventType.WebSocketNodeSocketPeekedHeader, { headerSize: this._state.readLen, compressed: this._state.compressed, fin: this._state.fin, opcode: this._state.opcode });
      } else if (this._state.state === 2 /* ReadHeader */) {
        const header = this._incomingData.read(this._state.readLen);
        const secondByte = header.readUInt8(1);
        const hasMask = (secondByte & 128) >>> 7;
        let len = secondByte & 127;
        let offset = 1;
        if (len === 126) {
          len = header.readUInt8(++offset) * 2 ** 8 + header.readUInt8(++offset);
        } else if (len === 127) {
          len = header.readUInt8(++offset) * 0 + header.readUInt8(++offset) * 0 + header.readUInt8(++offset) * 0 + header.readUInt8(++offset) * 0 + header.readUInt8(++offset) * 2 ** 24 + header.readUInt8(++offset) * 2 ** 16 + header.readUInt8(++offset) * 2 ** 8 + header.readUInt8(++offset);
        }
        let mask = 0;
        if (hasMask) {
          mask = header.readUInt8(++offset) * 2 ** 24 + header.readUInt8(++offset) * 2 ** 16 + header.readUInt8(++offset) * 2 ** 8 + header.readUInt8(++offset);
        }
        this._state.state = 3 /* ReadBody */;
        this._state.readLen = len;
        this._state.mask = mask;
        this.traceSocketEvent(SocketDiagnosticsEventType.WebSocketNodeSocketPeekedHeader, { bodySize: this._state.readLen, compressed: this._state.compressed, fin: this._state.fin, mask: this._state.mask, opcode: this._state.opcode });
      } else if (this._state.state === 3 /* ReadBody */) {
        const body = this._incomingData.read(this._state.readLen);
        this.traceSocketEvent(SocketDiagnosticsEventType.WebSocketNodeSocketReadData, body);
        unmask(body, this._state.mask);
        this.traceSocketEvent(SocketDiagnosticsEventType.WebSocketNodeSocketUnmaskedData, body);
        this._state.state = 1 /* PeekHeader */;
        this._state.readLen = 2 /* MinHeaderByteSize */;
        this._state.mask = 0;
        if (this._state.opcode <= 2) {
          this._flowManager.acceptFrame(body, this._state.compressed, !!this._state.fin);
        } else if (this._state.opcode === 9) {
          this._flowManager.writeMessage(body, {
            compressed: false,
            opcode: 10
            /* Pong frame */
          });
        }
      }
    }
  }
  async drain() {
    this.traceSocketEvent(SocketDiagnosticsEventType.WebSocketNodeSocketDrainBegin);
    if (this._flowManager.isProcessingWriteQueue()) {
      await Event.toPromise(this._flowManager.onDidFinishProcessingWriteQueue);
    }
    await this.socket.drain();
    this.traceSocketEvent(SocketDiagnosticsEventType.WebSocketNodeSocketDrainEnd);
  }
}
class WebSocketFlowManager extends Disposable {
  constructor(_tracer, permessageDeflate, inflateBytes, recordInflateBytes, _onData, _writeFn) {
    super();
    this._tracer = _tracer;
    this._onData = _onData;
    this._writeFn = _writeFn;
    if (permessageDeflate) {
      this._zlibInflateStream = this._register(new ZlibInflateStream(this._tracer, recordInflateBytes, inflateBytes, { windowBits: 15 }));
      this._zlibDeflateStream = this._register(new ZlibDeflateStream(this._tracer, { windowBits: 15 }));
      this._register(this._zlibInflateStream.onError((err) => this._onError.fire(err)));
      this._register(this._zlibDeflateStream.onError((err) => this._onError.fire(err)));
    } else {
      this._zlibInflateStream = null;
      this._zlibDeflateStream = null;
    }
  }
  static {
    __name(this, "WebSocketFlowManager");
  }
  _onError = this._register(new Emitter());
  onError = this._onError.event;
  _zlibInflateStream;
  _zlibDeflateStream;
  _writeQueue = [];
  _readQueue = [];
  _onDidFinishProcessingReadQueue = this._register(new Emitter());
  onDidFinishProcessingReadQueue = this._onDidFinishProcessingReadQueue.event;
  _onDidFinishProcessingWriteQueue = this._register(new Emitter());
  onDidFinishProcessingWriteQueue = this._onDidFinishProcessingWriteQueue.event;
  get permessageDeflate() {
    return Boolean(this._zlibInflateStream && this._zlibDeflateStream);
  }
  get recordedInflateBytes() {
    if (this._zlibInflateStream) {
      return this._zlibInflateStream.recordedInflateBytes;
    }
    return VSBuffer.alloc(0);
  }
  writeMessage(data, options) {
    this._writeQueue.push({ data, options });
    this._processWriteQueue();
  }
  _isProcessingWriteQueue = false;
  async _processWriteQueue() {
    if (this._isProcessingWriteQueue) {
      return;
    }
    this._isProcessingWriteQueue = true;
    while (this._writeQueue.length > 0) {
      const { data, options } = this._writeQueue.shift();
      if (this._zlibDeflateStream && options.compressed) {
        const compressedData = await this._deflateMessage(this._zlibDeflateStream, data);
        this._writeFn(compressedData, options);
      } else {
        this._writeFn(data, { ...options, compressed: false });
      }
    }
    this._isProcessingWriteQueue = false;
    this._onDidFinishProcessingWriteQueue.fire();
  }
  isProcessingWriteQueue() {
    return this._isProcessingWriteQueue;
  }
  /**
   * Subsequent calls should wait for the previous `_deflateBuffer` call to complete.
   */
  _deflateMessage(zlibDeflateStream, buffer) {
    return new Promise((resolve, reject) => {
      zlibDeflateStream.write(buffer);
      zlibDeflateStream.flush((data) => resolve(data));
    });
  }
  acceptFrame(data, isCompressed, isLastFrameOfMessage) {
    this._readQueue.push({ data, isCompressed, isLastFrameOfMessage });
    this._processReadQueue();
  }
  _isProcessingReadQueue = false;
  async _processReadQueue() {
    if (this._isProcessingReadQueue) {
      return;
    }
    this._isProcessingReadQueue = true;
    while (this._readQueue.length > 0) {
      const frameInfo = this._readQueue.shift();
      if (this._zlibInflateStream && frameInfo.isCompressed) {
        const data = await this._inflateFrame(this._zlibInflateStream, frameInfo.data, frameInfo.isLastFrameOfMessage);
        this._onData.fire(data);
      } else {
        this._onData.fire(frameInfo.data);
      }
    }
    this._isProcessingReadQueue = false;
    this._onDidFinishProcessingReadQueue.fire();
  }
  isProcessingReadQueue() {
    return this._isProcessingReadQueue;
  }
  /**
   * Subsequent calls should wait for the previous `transformRead` call to complete.
   */
  _inflateFrame(zlibInflateStream, buffer, isLastFrameOfMessage) {
    return new Promise((resolve, reject) => {
      zlibInflateStream.write(buffer);
      if (isLastFrameOfMessage) {
        zlibInflateStream.write(VSBuffer.fromByteArray([0, 0, 255, 255]));
      }
      zlibInflateStream.flush((data) => resolve(data));
    });
  }
}
class ZlibInflateStream extends Disposable {
  constructor(_tracer, _recordInflateBytes, inflateBytes, options) {
    super();
    this._tracer = _tracer;
    this._recordInflateBytes = _recordInflateBytes;
    this._zlibInflate = createInflateRaw(options);
    this._zlibInflate.on("error", (err) => {
      this._tracer.traceSocketEvent(SocketDiagnosticsEventType.zlibInflateError, { message: err?.message, code: err?.code });
      this._onError.fire(err);
    });
    this._zlibInflate.on("data", (data) => {
      this._tracer.traceSocketEvent(SocketDiagnosticsEventType.zlibInflateData, data);
      this._pendingInflateData.push(VSBuffer.wrap(data));
    });
    if (inflateBytes) {
      this._tracer.traceSocketEvent(SocketDiagnosticsEventType.zlibInflateInitialWrite, inflateBytes.buffer);
      this._zlibInflate.write(inflateBytes.buffer);
      this._zlibInflate.flush(() => {
        this._tracer.traceSocketEvent(SocketDiagnosticsEventType.zlibInflateInitialFlushFired);
        this._pendingInflateData.length = 0;
      });
    }
  }
  static {
    __name(this, "ZlibInflateStream");
  }
  _onError = this._register(new Emitter());
  onError = this._onError.event;
  _zlibInflate;
  _recordedInflateBytes = [];
  _pendingInflateData = [];
  get recordedInflateBytes() {
    if (this._recordInflateBytes) {
      return VSBuffer.concat(this._recordedInflateBytes);
    }
    return VSBuffer.alloc(0);
  }
  write(buffer) {
    if (this._recordInflateBytes) {
      this._recordedInflateBytes.push(buffer.clone());
    }
    this._tracer.traceSocketEvent(SocketDiagnosticsEventType.zlibInflateWrite, buffer);
    this._zlibInflate.write(buffer.buffer);
  }
  flush(callback) {
    this._zlibInflate.flush(() => {
      this._tracer.traceSocketEvent(SocketDiagnosticsEventType.zlibInflateFlushFired);
      const data = VSBuffer.concat(this._pendingInflateData);
      this._pendingInflateData.length = 0;
      callback(data);
    });
  }
}
class ZlibDeflateStream extends Disposable {
  constructor(_tracer, options) {
    super();
    this._tracer = _tracer;
    this._zlibDeflate = createDeflateRaw({
      windowBits: 15
    });
    this._zlibDeflate.on("error", (err) => {
      this._tracer.traceSocketEvent(SocketDiagnosticsEventType.zlibDeflateError, { message: err?.message, code: err?.code });
      this._onError.fire(err);
    });
    this._zlibDeflate.on("data", (data) => {
      this._tracer.traceSocketEvent(SocketDiagnosticsEventType.zlibDeflateData, data);
      this._pendingDeflateData.push(VSBuffer.wrap(data));
    });
  }
  static {
    __name(this, "ZlibDeflateStream");
  }
  _onError = this._register(new Emitter());
  onError = this._onError.event;
  _zlibDeflate;
  _pendingDeflateData = [];
  write(buffer) {
    this._tracer.traceSocketEvent(SocketDiagnosticsEventType.zlibDeflateWrite, buffer.buffer);
    this._zlibDeflate.write(buffer.buffer);
  }
  flush(callback) {
    this._zlibDeflate.flush(
      /*Z_SYNC_FLUSH*/
      2,
      () => {
        this._tracer.traceSocketEvent(SocketDiagnosticsEventType.zlibDeflateFlushFired);
        let data = VSBuffer.concat(this._pendingDeflateData);
        this._pendingDeflateData.length = 0;
        data = data.slice(0, data.byteLength - 4);
        callback(data);
      }
    );
  }
}
function unmask(buffer, mask) {
  if (mask === 0) {
    return;
  }
  const cnt = buffer.byteLength >>> 2;
  for (let i = 0; i < cnt; i++) {
    const v = buffer.readUInt32BE(i * 4);
    buffer.writeUInt32BE(v ^ mask, i * 4);
  }
  const offset = cnt * 4;
  const bytesLeft = buffer.byteLength - offset;
  const m3 = mask >>> 24 & 255;
  const m2 = mask >>> 16 & 255;
  const m1 = mask >>> 8 & 255;
  if (bytesLeft >= 1) {
    buffer.writeUInt8(buffer.readUInt8(offset) ^ m3, offset);
  }
  if (bytesLeft >= 2) {
    buffer.writeUInt8(buffer.readUInt8(offset + 1) ^ m2, offset + 1);
  }
  if (bytesLeft >= 3) {
    buffer.writeUInt8(buffer.readUInt8(offset + 2) ^ m1, offset + 2);
  }
}
__name(unmask, "unmask");
const XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
const safeIpcPathLengths = {
  [Platform.Linux]: 107,
  [Platform.Mac]: 103
};
function createRandomIPCHandle() {
  const randomSuffix = generateUuid();
  if (process.platform === "win32") {
    return `\\\\.\\pipe\\vscode-ipc-${randomSuffix}-sock`;
  }
  const basePath = process.platform !== "darwin" && XDG_RUNTIME_DIR ? XDG_RUNTIME_DIR : tmpdir();
  const result = join(basePath, `vscode-ipc-${randomSuffix}.sock`);
  validateIPCHandleLength(result);
  return result;
}
__name(createRandomIPCHandle, "createRandomIPCHandle");
function createStaticIPCHandle(directoryPath, type, version) {
  const scope = createHash("sha256").update(directoryPath).digest("hex");
  const scopeForSocket = scope.substr(0, 8);
  if (process.platform === "win32") {
    return `\\\\.\\pipe\\${scopeForSocket}-${version}-${type}-sock`;
  }
  const versionForSocket = version.substr(0, 4);
  const typeForSocket = type.substr(0, 6);
  let result;
  if (process.platform !== "darwin" && XDG_RUNTIME_DIR && !process.env["VSCODE_PORTABLE"]) {
    result = join(XDG_RUNTIME_DIR, `vscode-${scopeForSocket}-${versionForSocket}-${typeForSocket}.sock`);
  } else {
    result = join(directoryPath, `${versionForSocket}-${typeForSocket}.sock`);
  }
  validateIPCHandleLength(result);
  return result;
}
__name(createStaticIPCHandle, "createStaticIPCHandle");
function validateIPCHandleLength(handle) {
  const limit = safeIpcPathLengths[platform];
  if (typeof limit === "number" && handle.length >= limit) {
    console.warn(`WARNING: IPC handle "${handle}" is longer than ${limit} chars, try a shorter --user-data-dir`);
  }
}
__name(validateIPCHandleLength, "validateIPCHandleLength");
class Server extends IPCServer {
  static {
    __name(this, "Server");
  }
  static toClientConnectionEvent(server) {
    const onConnection = Event.fromNodeEventEmitter(server, "connection");
    return Event.map(onConnection, (socket) => ({
      protocol: new Protocol(new NodeSocket(socket, "ipc-server-connection")),
      onDidClientDisconnect: Event.once(Event.fromNodeEventEmitter(socket, "close"))
    }));
  }
  server;
  constructor(server) {
    super(Server.toClientConnectionEvent(server));
    this.server = server;
  }
  dispose() {
    super.dispose();
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}
function serve(hook) {
  return new Promise((c, e) => {
    const server = createServer();
    server.on("error", e);
    server.listen(hook, () => {
      server.removeListener("error", e);
      c(new Server(server));
    });
  });
}
__name(serve, "serve");
function connect(hook, clientId) {
  return new Promise((c, e) => {
    const socket = createConnection(hook, () => {
      socket.removeListener("error", e);
      c(Client.fromSocket(new NodeSocket(socket, `ipc-client${clientId}`), clientId));
    });
    socket.once("error", e);
  });
}
__name(connect, "connect");
export {
  NodeSocket,
  Server,
  WebSocketNodeSocket,
  XDG_RUNTIME_DIR,
  connect,
  createRandomIPCHandle,
  createStaticIPCHandle,
  serve
};
//# sourceMappingURL=ipc.net.js.map
