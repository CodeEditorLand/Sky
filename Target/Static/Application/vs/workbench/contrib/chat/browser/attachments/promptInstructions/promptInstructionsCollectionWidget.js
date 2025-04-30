var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { InstructionsAttachmentWidget } from "./promptInstructionsWidget.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { INSTRUCTIONS_LANGUAGE_ID } from "../../../common/promptSyntax/constants.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
let PromptInstructionsAttachmentsCollectionWidget = class PromptInstructionsAttachmentsCollectionWidget2 extends Disposable {
  static {
    __name(this, "PromptInstructionsAttachmentsCollectionWidget");
  }
  /**
   * Subscribe to the `onAttachmentsChange` event.
   * @param callback Function to invoke when number of attachments change.
   */
  onAttachmentsChange(callback) {
    this._register(this._onAttachmentsChange.event(callback));
    return this;
  }
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
   * Get a promise that resolves when parsing/resolving processes
   * are fully completed, including all possible nested child references.
   */
  allSettled() {
    return this.model.allSettled();
  }
  /**
   * Check if child widget list is empty (no attachments present).
   */
  get empty() {
    return this.children.length === 0;
  }
  /**
   * Check if any of the attachments is a prompt file.
   */
  get hasInstructions() {
    return this.references.some((uri) => {
      const model = this.modelService.getModel(uri);
      const languageId = model ? model.getLanguageId() : this.languageService.guessLanguageIdByFilepathOrFirstLine(uri);
      return languageId === INSTRUCTIONS_LANGUAGE_ID;
    });
  }
  constructor(model, resourceLabels, initService, languageService, modelService, logService) {
    super();
    this.model = model;
    this.resourceLabels = resourceLabels;
    this.initService = initService;
    this.languageService = languageService;
    this.modelService = modelService;
    this.logService = logService;
    this.children = [];
    this._onAttachmentsChange = this._register(new Emitter());
    this.render = this.render.bind(this);
    this._register(this.model.onAdd((attachment) => {
      const widget = this.initService.createInstance(InstructionsAttachmentWidget, attachment, this.resourceLabels);
      widget.onDispose(this.handleAttachmentDispose.bind(this, widget));
      this.children.push(widget);
      if (this.parentNode) {
        this.parentNode.appendChild(widget.domNode);
      }
      this._onAttachmentsChange.fire();
    }));
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
          this.logService.warn(`${logPrefix} is present in the children references list multiple times.`);
        }
        widgetExists = true;
        return false;
      }
      return true;
    });
    if (!widgetExists) {
      this.logService.warn(`${logPrefix} was disposed, but was not found in the child references.`);
    }
    if (!this.parentNode) {
      this.logService.warn(`${logPrefix} no parent node reference found.`);
    }
    this.parentNode?.removeChild(widget.domNode);
    this._onAttachmentsChange.fire();
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
PromptInstructionsAttachmentsCollectionWidget = __decorate([
  __param(2, IInstantiationService),
  __param(3, ILanguageService),
  __param(4, IModelService),
  __param(5, ILogService)
], PromptInstructionsAttachmentsCollectionWidget);
export {
  PromptInstructionsAttachmentsCollectionWidget
};
//# sourceMappingURL=promptInstructionsCollectionWidget.js.map
