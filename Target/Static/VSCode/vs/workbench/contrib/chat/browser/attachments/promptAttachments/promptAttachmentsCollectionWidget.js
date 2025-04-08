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
import { URI } from "../../../../../../base/common/uri.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { ResourceLabels } from "../../../../../browser/labels.js";
import { PromptAttachmentWidget } from "./promptAttachmentWidget.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ChatPromptAttachmentsCollection } from "../../chatAttachmentModel/chatPromptAttachmentsCollection.js";
let PromptAttachmentsCollectionWidget = class extends Disposable {
  constructor(model, resourceLabels, initService, logService) {
    super();
    this.model = model;
    this.resourceLabels = resourceLabels;
    this.initService = initService;
    this.logService = logService;
    this.render = this.render.bind(this);
    this.model.onAdd((attachment) => {
      const widget = this.initService.createInstance(
        PromptAttachmentWidget,
        attachment,
        this.resourceLabels
      );
      widget.onDispose(this.handleAttachmentDispose.bind(this, widget));
      this.children.push(widget);
      if (this.parentNode) {
        this.parentNode.appendChild(widget.domNode);
      }
      this._onAttachmentsCountChange.fire();
    });
  }
  static {
    __name(this, "PromptAttachmentsCollectionWidget");
  }
  /**
   * List of child instruction attachment widgets.
   */
  children = [];
  /**
   * Event that fires when number of attachments change
   *
   * See {@linkcode onAttachmentsCountChange}.
   */
  _onAttachmentsCountChange = this._register(new Emitter());
  /**
   * Subscribe to the `onAttachmentsCountChange` event.
   * @param callback Function to invoke when number of attachments change.
   */
  onAttachmentsCountChange(callback) {
    this._register(this._onAttachmentsCountChange.event(callback));
    return this;
  }
  /**
   * The parent DOM node this widget was rendered into.
   */
  parentNode;
  /**
   * Get all `URI`s of all valid references, including all
   * the possible references nested inside the children.
   */
  get references() {
    return this.model.references;
  }
  /**
   * Get the list of all prompt instruction attachment variables, including all
   * nested child references of each attachment explicitly attached by user.
   */
  get chatAttachments() {
    return this.model.chatAttachments;
  }
  /**
   * Check if child widget list is empty (no attachments present).
   */
  get empty() {
    return this.children.length === 0;
  }
  /**
   * Handle child widget disposal.
   * @param widget The child widget that was disposed.
   */
  handleAttachmentDispose(widget) {
    const logPrefix = `[onChildDispose] Widget for instructions attachment '${widget.uri.path}'`;
    let widgetExists = false;
    this.children = this.children.filter((child) => {
      if (child === widget) {
        if (widgetExists) {
          this.logService.warn(
            `${logPrefix} is present in the children references list multiple times.`
          );
        }
        widgetExists = true;
        return false;
      }
      return true;
    });
    if (!widgetExists) {
      this.logService.warn(
        `${logPrefix} was disposed, but was not found in the child references.`
      );
    }
    if (!this.parentNode) {
      this.logService.warn(
        `${logPrefix} no parent node reference found.`
      );
    }
    this.parentNode?.removeChild(widget.domNode);
    this._onAttachmentsCountChange.fire();
    return this;
  }
  /**
   * Render attachments into the provided `parentNode`.
   *
   * Note! this method assumes that the provided `parentNode` is cleared by the caller.
   */
  render(parentNode) {
    this.parentNode = parentNode;
    for (const widget of this.children) {
      this.parentNode.appendChild(widget.domNode);
    }
    return this;
  }
  /**
   * Dispose of the widget, including all the child
   * widget instances.
   */
  dispose() {
    for (const child of this.children) {
      child.dispose();
    }
    super.dispose();
  }
};
PromptAttachmentsCollectionWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ILogService)
], PromptAttachmentsCollectionWidget);
export {
  PromptAttachmentsCollectionWidget
};
//# sourceMappingURL=promptAttachmentsCollectionWidget.js.map
