var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
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
let NotebookRendererMessagingService = class NotebookRendererMessagingService2 extends Disposable {
  static {
    __name(this, "NotebookRendererMessagingService");
  }
  constructor(extensionService) {
    super();
    this.extensionService = extensionService;
    this.activations = /* @__PURE__ */ new Map();
    this.scopedMessaging = /* @__PURE__ */ new Map();
    this.postMessageEmitter = this._register(new Emitter());
    this.onShouldPostMessage = this.postMessageEmitter.event;
  }
  /** @inheritdoc */
  receiveMessage(editorId, rendererId, message) {
    if (editorId === void 0) {
      const sends = [...this.scopedMessaging.values()].map((e) => e.receiveMessageHandler?.(rendererId, message));
      return Promise.all(sends).then((s) => s.some((s2) => !!s2));
    }
    return this.scopedMessaging.get(editorId)?.receiveMessageHandler?.(rendererId, message) ?? Promise.resolve(false);
  }
  /** @inheritdoc */
  prepare(rendererId) {
    if (this.activations.has(rendererId)) {
      return;
    }
    const queue = [];
    this.activations.set(rendererId, queue);
    this.extensionService.activateByEvent(`onRenderer:${rendererId}`).then(() => {
      for (const message of queue) {
        this.postMessageEmitter.fire(message);
      }
      this.activations.set(rendererId, void 0);
    });
  }
  /** @inheritdoc */
  getScoped(editorId) {
    const existing = this.scopedMessaging.get(editorId);
    if (existing) {
      return existing;
    }
    const messaging = {
      postMessage: /* @__PURE__ */ __name((rendererId, message) => this.postMessage(editorId, rendererId, message), "postMessage"),
      dispose: /* @__PURE__ */ __name(() => this.scopedMessaging.delete(editorId), "dispose")
    };
    this.scopedMessaging.set(editorId, messaging);
    return messaging;
  }
  postMessage(editorId, rendererId, message) {
    if (!this.activations.has(rendererId)) {
      this.prepare(rendererId);
    }
    const activation = this.activations.get(rendererId);
    const toSend = { rendererId, editorId, message };
    if (activation === void 0) {
      this.postMessageEmitter.fire(toSend);
    } else {
      activation.push(toSend);
    }
  }
};
NotebookRendererMessagingService = __decorate([
  __param(0, IExtensionService)
], NotebookRendererMessagingService);
export {
  NotebookRendererMessagingService
};
//# sourceMappingURL=notebookRendererMessagingServiceImpl.js.map
