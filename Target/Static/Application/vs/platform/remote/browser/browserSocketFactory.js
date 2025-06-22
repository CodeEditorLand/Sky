var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../base/browser/dom.js";
import { RunOnceScheduler } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { SocketDiagnostics } from "../../../base/parts/ipc/common/ipc.net.js";
import { RemoteAuthorityResolverError, RemoteAuthorityResolverErrorCode } from "../common/remoteAuthorityResolver.js";
import { mainWindow } from "../../../base/browser/window.js";
class BrowserWebSocket extends Disposable {
  static {
    __name(this, "BrowserWebSocket");
  }
  traceSocketEvent(type, data) {
    SocketDiagnostics.traceSocketEvent(this._socket, this._debugLabel, type, data);
  }
  constructor(url, debugLabel) {
    super();
    this._onData = new Emitter();
    this.onData = this._onData.event;
    this._onOpen = this._register(new Emitter());
    this.onOpen = this._onOpen.event;
    this._onClose = this._register(new Emitter());
    this.onClose = this._onClose.event;
    this._onError = this._register(new Emitter());
    this.onError = this._onError.event;
    this._debugLabel = debugLabel;
    this._socket = new WebSocket(url);
    this.traceSocketEvent("created", { type: "BrowserWebSocket", url });
    this._fileReader = new FileReader();
    this._queue = [];
    this._isReading = false;
    this._isClosed = false;
    this._fileReader.onload = (event) => {
      this._isReading = false;
      const buff = event.target.result;
      this.traceSocketEvent("read", buff);
      this._onData.fire(buff);
      if (this._queue.length > 0) {
        enqueue(this._queue.shift());
      }
    };
    const enqueue = /* @__PURE__ */ __name((blob) => {
      if (this._isReading) {
        this._queue.push(blob);
        return;
      }
      this._isReading = true;
      this._fileReader.readAsArrayBuffer(blob);
    }, "enqueue");
    this._socketMessageListener = (ev) => {
      const blob = ev.data;
      this.traceSocketEvent("browserWebSocketBlobReceived", { type: blob.type, size: blob.size });
      enqueue(blob);
    };
    this._socket.addEventListener("message", this._socketMessageListener);
    this._register(dom.addDisposableListener(this._socket, "open", (e) => {
      this.traceSocketEvent(
        "open"
        /* SocketDiagnosticsEventType.Open */
      );
      this._onOpen.fire();
    }));
    let pendingErrorEvent = null;
    const sendPendingErrorNow = /* @__PURE__ */ __name(() => {
      const err = pendingErrorEvent;
      pendingErrorEvent = null;
      this._onError.fire(err);
    }, "sendPendingErrorNow");
    const errorRunner = this._register(new RunOnceScheduler(sendPendingErrorNow, 0));
    const sendErrorSoon = /* @__PURE__ */ __name((err) => {
      errorRunner.cancel();
      pendingErrorEvent = err;
      errorRunner.schedule();
    }, "sendErrorSoon");
    const sendErrorNow = /* @__PURE__ */ __name((err) => {
      errorRunner.cancel();
      pendingErrorEvent = err;
      sendPendingErrorNow();
    }, "sendErrorNow");
    this._register(dom.addDisposableListener(this._socket, "close", (e) => {
      this.traceSocketEvent("close", { code: e.code, reason: e.reason, wasClean: e.wasClean });
      this._isClosed = true;
      if (pendingErrorEvent) {
        if (!navigator.onLine) {
          sendErrorNow(new RemoteAuthorityResolverError("Browser is offline", RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable, e));
        } else {
          if (!e.wasClean) {
            sendErrorNow(new RemoteAuthorityResolverError(e.reason || `WebSocket close with status code ${e.code}`, RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable, e));
          } else {
            errorRunner.cancel();
            sendPendingErrorNow();
          }
        }
      }
      this._onClose.fire({ code: e.code, reason: e.reason, wasClean: e.wasClean, event: e });
    }));
    this._register(dom.addDisposableListener(this._socket, "error", (err) => {
      this.traceSocketEvent("error", { message: err?.message });
      sendErrorSoon(err);
    }));
  }
  send(data) {
    if (this._isClosed) {
      return;
    }
    this.traceSocketEvent("write", data);
    this._socket.send(data);
  }
  close() {
    this._isClosed = true;
    this.traceSocketEvent(
      "close"
      /* SocketDiagnosticsEventType.Close */
    );
    this._socket.close();
    this._socket.removeEventListener("message", this._socketMessageListener);
    this.dispose();
  }
}
const defaultWebSocketFactory = new class {
  create(url, debugLabel) {
    return new BrowserWebSocket(url, debugLabel);
  }
}();
class BrowserSocket {
  static {
    __name(this, "BrowserSocket");
  }
  traceSocketEvent(type, data) {
    if (typeof this.socket.traceSocketEvent === "function") {
      this.socket.traceSocketEvent(type, data);
    } else {
      SocketDiagnostics.traceSocketEvent(this.socket, this.debugLabel, type, data);
    }
  }
  constructor(socket, debugLabel) {
    this.socket = socket;
    this.debugLabel = debugLabel;
  }
  dispose() {
    this.socket.close();
  }
  onData(listener) {
    return this.socket.onData((data) => listener(VSBuffer.wrap(new Uint8Array(data))));
  }
  onClose(listener) {
    const adapter = /* @__PURE__ */ __name((e) => {
      if (typeof e === "undefined") {
        listener(e);
      } else {
        listener({
          type: 1,
          code: e.code,
          reason: e.reason,
          wasClean: e.wasClean,
          event: e.event
        });
      }
    }, "adapter");
    return this.socket.onClose(adapter);
  }
  onEnd(listener) {
    return Disposable.None;
  }
  write(buffer) {
    this.socket.send(buffer.buffer);
  }
  end() {
    this.socket.close();
  }
  drain() {
    return Promise.resolve();
  }
}
class BrowserSocketFactory {
  static {
    __name(this, "BrowserSocketFactory");
  }
  constructor(webSocketFactory) {
    this._webSocketFactory = webSocketFactory || defaultWebSocketFactory;
  }
  supports(connectTo) {
    return true;
  }
  connect({ host, port }, path, query, debugLabel) {
    return new Promise((resolve, reject) => {
      const webSocketSchema = /^https:/.test(mainWindow.location.href) ? "wss" : "ws";
      const socket = this._webSocketFactory.create(`${webSocketSchema}://${/:/.test(host) && !/\[/.test(host) ? `[${host}]` : host}:${port}${path}?${query}&skipWebSocketFrames=false`, debugLabel);
      const errorListener = socket.onError(reject);
      socket.onOpen(() => {
        errorListener.dispose();
        resolve(new BrowserSocket(socket, debugLabel));
      });
    });
  }
}
export {
  BrowserSocketFactory
};
//# sourceMappingURL=browserSocketFactory.js.map
