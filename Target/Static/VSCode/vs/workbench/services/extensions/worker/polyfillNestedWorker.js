var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { NewWorkerMessage, TerminateWorkerMessage } from "../common/polyfillNestedWorker.protocol.js";
const _bootstrapFnSource = (/* @__PURE__ */ __name(function _bootstrapFn(workerUrl) {
  const listener = /* @__PURE__ */ __name((event) => {
    globalThis.removeEventListener("message", listener);
    const port = event.data;
    Object.defineProperties(globalThis, {
      "postMessage": {
        value(data, transferOrOptions) {
          port.postMessage(data, transferOrOptions);
        }
      },
      "onmessage": {
        get() {
          return port.onmessage;
        },
        set(value) {
          port.onmessage = value;
        }
      }
      // todo onerror
    });
    port.addEventListener("message", (msg) => {
      globalThis.dispatchEvent(new MessageEvent("message", { data: msg.data, ports: msg.ports ? [...msg.ports] : void 0 }));
    });
    port.start();
    globalThis.Worker = class {
      constructor() {
        throw new TypeError("Nested workers from within nested worker are NOT supported.");
      }
    };
    importScripts(workerUrl);
  }, "listener");
  globalThis.addEventListener("message", listener);
}, "_bootstrapFn")).toString();
class NestedWorker extends EventTarget {
  static {
    __name(this, "NestedWorker");
  }
  onmessage = null;
  onmessageerror = null;
  onerror = null;
  terminate;
  postMessage;
  constructor(nativePostMessage, stringOrUrl, options) {
    super();
    const bootstrap = `((${_bootstrapFnSource})('${stringOrUrl}'))`;
    const blob = new Blob([bootstrap], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    const channel = new MessageChannel();
    const id = blobUrl;
    const msg = {
      type: "_newWorker",
      id,
      port: channel.port2,
      url: blobUrl,
      options
    };
    nativePostMessage(msg, [channel.port2]);
    this.postMessage = channel.port1.postMessage.bind(channel.port1);
    this.terminate = () => {
      const msg2 = {
        type: "_terminateWorker",
        id
      };
      nativePostMessage(msg2);
      URL.revokeObjectURL(blobUrl);
      channel.port1.close();
      channel.port2.close();
    };
    Object.defineProperties(this, {
      "onmessage": {
        get() {
          return channel.port1.onmessage;
        },
        set(value) {
          channel.port1.onmessage = value;
        }
      },
      "onmessageerror": {
        get() {
          return channel.port1.onmessageerror;
        },
        set(value) {
          channel.port1.onmessageerror = value;
        }
      }
      // todo onerror
    });
    channel.port1.addEventListener("messageerror", (evt) => {
      const msgEvent = new MessageEvent("messageerror", { data: evt.data });
      this.dispatchEvent(msgEvent);
    });
    channel.port1.addEventListener("message", (evt) => {
      const msgEvent = new MessageEvent("message", { data: evt.data });
      this.dispatchEvent(msgEvent);
    });
    channel.port1.start();
  }
}
export {
  NestedWorker
};
//# sourceMappingURL=polyfillNestedWorker.js.map
