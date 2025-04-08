var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createTrustedTypesPolicy } from "./trustedTypes.js";
import { onUnexpectedError } from "../common/errors.js";
import { COI } from "../common/network.js";
import { URI } from "../common/uri.js";
import { IWebWorker, IWebWorkerClient, Message, WebWorkerClient } from "../common/worker/webWorker.js";
import { Disposable, toDisposable } from "../common/lifecycle.js";
import { coalesce } from "../common/arrays.js";
import { getNLSLanguage, getNLSMessages } from "../../nls.js";
import { Emitter } from "../common/event.js";
let ttPolicy;
if (typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope" && globalThis.workerttPolicy !== void 0) {
  ttPolicy = globalThis.workerttPolicy;
} else {
  ttPolicy = createTrustedTypesPolicy("defaultWorkerFactory", { createScriptURL: /* @__PURE__ */ __name((value) => value, "createScriptURL") });
}
function createBlobWorker(blobUrl, options) {
  if (!blobUrl.startsWith("blob:")) {
    throw new URIError("Not a blob-url: " + blobUrl);
  }
  return new Worker(ttPolicy ? ttPolicy.createScriptURL(blobUrl) : blobUrl, { ...options, type: "module" });
}
__name(createBlobWorker, "createBlobWorker");
function getWorker(descriptor, id) {
  const label = descriptor.label || "anonymous" + id;
  const monacoEnvironment = globalThis.MonacoEnvironment;
  if (monacoEnvironment) {
    if (typeof monacoEnvironment.getWorker === "function") {
      return monacoEnvironment.getWorker("workerMain.js", label);
    }
    if (typeof monacoEnvironment.getWorkerUrl === "function") {
      const workerUrl = monacoEnvironment.getWorkerUrl("workerMain.js", label);
      return new Worker(ttPolicy ? ttPolicy.createScriptURL(workerUrl) : workerUrl, { name: label, type: "module" });
    }
  }
  const esmWorkerLocation = descriptor.esmModuleLocation;
  if (esmWorkerLocation) {
    const workerUrl = getWorkerBootstrapUrl(label, esmWorkerLocation.toString(true));
    const worker = new Worker(ttPolicy ? ttPolicy.createScriptURL(workerUrl) : workerUrl, { name: label, type: "module" });
    return whenESMWorkerReady(worker);
  }
  throw new Error(`You must define a function MonacoEnvironment.getWorkerUrl or MonacoEnvironment.getWorker`);
}
__name(getWorker, "getWorker");
function getWorkerBootstrapUrl(label, workerScriptUrl) {
  if (/^((http:)|(https:)|(file:))/.test(workerScriptUrl) && workerScriptUrl.substring(0, globalThis.origin.length) !== globalThis.origin) {
  } else {
    const start = workerScriptUrl.lastIndexOf("?");
    const end = workerScriptUrl.lastIndexOf("#", start);
    const params = start > 0 ? new URLSearchParams(workerScriptUrl.substring(start + 1, ~end ? end : void 0)) : new URLSearchParams();
    COI.addSearchParam(params, true, true);
    const search = params.toString();
    if (!search) {
      workerScriptUrl = `${workerScriptUrl}#${label}`;
    } else {
      workerScriptUrl = `${workerScriptUrl}?${params.toString()}#${label}`;
    }
  }
  const blob = new Blob([coalesce([
    `/*${label}*/`,
    `globalThis._VSCODE_NLS_MESSAGES = ${JSON.stringify(getNLSMessages())};`,
    `globalThis._VSCODE_NLS_LANGUAGE = ${JSON.stringify(getNLSLanguage())};`,
    `globalThis._VSCODE_FILE_ROOT = ${JSON.stringify(globalThis._VSCODE_FILE_ROOT)};`,
    `const ttPolicy = globalThis.trustedTypes?.createPolicy('defaultWorkerFactory', { createScriptURL: value => value });`,
    `globalThis.workerttPolicy = ttPolicy;`,
    `await import(ttPolicy?.createScriptURL(${JSON.stringify(workerScriptUrl)}) ?? ${JSON.stringify(workerScriptUrl)});`,
    `globalThis.postMessage({ type: 'vscode-worker-ready' });`,
    `/*${label}*/`
  ]).join("")], { type: "application/javascript" });
  return URL.createObjectURL(blob);
}
__name(getWorkerBootstrapUrl, "getWorkerBootstrapUrl");
function whenESMWorkerReady(worker) {
  return new Promise((resolve, reject) => {
    worker.onmessage = function(e) {
      if (e.data.type === "vscode-worker-ready") {
        worker.onmessage = null;
        resolve(worker);
      }
    };
    worker.onerror = reject;
  });
}
__name(whenESMWorkerReady, "whenESMWorkerReady");
function isPromiseLike(obj) {
  if (typeof obj.then === "function") {
    return true;
  }
  return false;
}
__name(isPromiseLike, "isPromiseLike");
class WebWorker extends Disposable {
  static {
    __name(this, "WebWorker");
  }
  static LAST_WORKER_ID = 0;
  id;
  worker;
  _onMessage = this._register(new Emitter());
  onMessage = this._onMessage.event;
  _onError = this._register(new Emitter());
  onError = this._onError.event;
  constructor(descriptorOrWorker) {
    super();
    this.id = ++WebWorker.LAST_WORKER_ID;
    const workerOrPromise = descriptorOrWorker instanceof Worker ? descriptorOrWorker : getWorker(descriptorOrWorker, this.id);
    if (isPromiseLike(workerOrPromise)) {
      this.worker = workerOrPromise;
    } else {
      this.worker = Promise.resolve(workerOrPromise);
    }
    this.postMessage("-please-ignore-", []);
    const errorHandler = /* @__PURE__ */ __name((ev) => {
      this._onError.fire(ev);
    }, "errorHandler");
    this.worker.then((w) => {
      w.onmessage = (ev) => {
        this._onMessage.fire(ev.data);
      };
      w.onmessageerror = (ev) => {
        this._onError.fire(ev);
      };
      if (typeof w.addEventListener === "function") {
        w.addEventListener("error", errorHandler);
      }
    });
    this._register(toDisposable(() => {
      this.worker?.then((w) => {
        w.onmessage = null;
        w.onmessageerror = null;
        w.removeEventListener("error", errorHandler);
        w.terminate();
      });
      this.worker = null;
    }));
  }
  getId() {
    return this.id;
  }
  postMessage(message, transfer) {
    this.worker?.then((w) => {
      try {
        w.postMessage(message, transfer);
      } catch (err) {
        onUnexpectedError(err);
        onUnexpectedError(new Error(`FAILED to post message to worker`, { cause: err }));
      }
    });
  }
}
class WebWorkerDescriptor {
  constructor(esmModuleLocation, label) {
    this.esmModuleLocation = esmModuleLocation;
    this.label = label;
  }
  static {
    __name(this, "WebWorkerDescriptor");
  }
}
function createWebWorker(arg0, arg1) {
  const workerDescriptorOrWorker = URI.isUri(arg0) ? new WebWorkerDescriptor(arg0, arg1) : arg0;
  return new WebWorkerClient(new WebWorker(workerDescriptorOrWorker));
}
__name(createWebWorker, "createWebWorker");
export {
  WebWorkerDescriptor,
  createBlobWorker,
  createWebWorker
};
//# sourceMappingURL=webWorkerFactory.js.map
