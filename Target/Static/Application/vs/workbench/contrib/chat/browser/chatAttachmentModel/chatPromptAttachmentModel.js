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
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { PromptParser } from "../../common/promptSyntax/parsers/promptParser.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
let ChatPromptAttachmentModel = class ChatPromptAttachmentModel2 extends Disposable {
  static {
    __name(this, "ChatPromptAttachmentModel");
  }
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
    const { errorCondition } = reference;
    if (errorCondition) {
      return [];
    }
    return [
      ...reference.allValidReferencesUris,
      reference.uri
    ];
  }
  /**
   * Get list of all tools associated with the prompt.
   *
   * Note! This property returns pont-in-time state of the tools metadata
   *       and does not take into account if the prompt or its nested child
   *       references are still being resolved. Please use the {@link settled}
   *       or {@link allSettled} properties if you need to retrieve the final
   *       list of the tools available.
   */
  get toolsMetadata() {
    return this.reference.allToolsMetadata;
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
   * Subscribe to the `onUpdate` event.
   * @param callback Function to invoke on update.
   */
  onUpdate(callback) {
    this._register(this._onUpdate.event(callback));
    return this;
  }
  /**
   * Subscribe to the `onDispose` event.
   * @param callback Function to invoke on dispose.
   */
  onDispose(callback) {
    this._register(this._onDispose.event(callback));
    return this;
  }
  constructor(uri, initService) {
    super();
    this.uri = uri;
    this.initService = initService;
    this._onUpdate = this._register(new Emitter());
    this._onDispose = this._register(new Emitter());
    this._reference = this._register(this.initService.createInstance(
      PromptParser,
      this.uri,
      // in this case we know that the attached file must have been a
      // prompt file, hence we pass the `allowNonPromptFiles` option
      // to the provider to allow for non-prompt files to be attached
      { allowNonPromptFiles: true }
    ));
    this._reference.onUpdate(this._onUpdate.fire.bind(this._onUpdate));
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
ChatPromptAttachmentModel = __decorate([
  __param(1, IInstantiationService)
], ChatPromptAttachmentModel);
export {
  ChatPromptAttachmentModel
};
//# sourceMappingURL=chatPromptAttachmentModel.js.map
