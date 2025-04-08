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
import { URI } from "../../../../../base/common/uri.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { FilePromptParser } from "../../common/promptSyntax/parsers/filePromptParser.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
let ChatPromptAttachmentModel = class extends Disposable {
  constructor(uri, initService) {
    super();
    this.initService = initService;
    this._onUpdate.fire = this._onUpdate.fire.bind(this._onUpdate);
    this._reference = this._register(this.initService.createInstance(FilePromptParser, uri, [])).onUpdate(this._onUpdate.fire);
  }
  static {
    __name(this, "ChatPromptAttachmentModel");
  }
  /**
   * Private reference of the underlying prompt instructions
   * reference instance.
   */
  _reference;
  /**
   * Get the prompt instructions reference instance.
   */
  get reference() {
    return this._reference;
  }
  /**
   * Get `URI` for the main reference and `URI`s of all valid child
   * references it may contain, including reference of this model itself.
   */
  get references() {
    const { reference } = this;
    const { errorCondition } = this.reference;
    if (errorCondition) {
      return [];
    }
    return [
      ...reference.allValidReferencesUris,
      reference.uri
    ];
  }
  /**
   * Promise that resolves when the prompt is fully parsed,
   * including all its possible nested child references.
   */
  get allSettled() {
    return this.reference.allSettled();
  }
  /**
   * Get the top-level error of the prompt instructions
   * reference, if any.
   */
  get topError() {
    return this.reference.topError;
  }
  /**
   * Event that fires when the error condition of the prompt
   * reference changes.
   *
   * See {@linkcode onUpdate}.
   */
  _onUpdate = this._register(new Emitter());
  /**
   * Subscribe to the `onUpdate` event.
   * @param callback Function to invoke on update.
   */
  onUpdate(callback) {
    this._register(this._onUpdate.event(callback));
    return this;
  }
  /**
   * Event that fires when the object is disposed.
   *
   * See {@linkcode onDispose}.
   */
  _onDispose = this._register(new Emitter());
  /**
   * Subscribe to the `onDispose` event.
   * @param callback Function to invoke on dispose.
   */
  onDispose(callback) {
    this._register(this._onDispose.event(callback));
    return this;
  }
  /**
   * Start resolving the prompt instructions reference and child references
   * that it may contain.
   */
  resolve() {
    this._reference.start();
    return this;
  }
  dispose() {
    this._onDispose.fire();
    super.dispose();
  }
};
ChatPromptAttachmentModel = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ChatPromptAttachmentModel);
export {
  ChatPromptAttachmentModel
};
//# sourceMappingURL=chatPromptAttachmentModel.js.map
