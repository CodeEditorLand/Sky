var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { INotebookRendererMessagingService, IScopedRendererMessaging } from "../../common/notebookRendererMessagingService.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
let NotebookRendererMessagingService = class extends Disposable {
  constructor(extensionService) {
    super();
    this.extensionService = extensionService;
  }
  static {
    __name(this, "NotebookRendererMessagingService");
  }
  /**
   * Activation promises. Maps renderer IDs to a queue of messages that should
   * be sent once activation finishes, or undefined if activation is complete.
   */
  activations = /* @__PURE__ */ new Map();
  scopedMessaging = /* @__PURE__ */ new Map();
  postMessageEmitter = this._register(new Emitter());
  onShouldPostMessage = this.postMessageEmitter.event;
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
NotebookRendererMessagingService = __decorateClass([
  __decorateParam(0, IExtensionService)
], NotebookRendererMessagingService);
export {
  NotebookRendererMessagingService
};
//# sourceMappingURL=notebookRendererMessagingServiceImpl.js.map
