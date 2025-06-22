var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { TextModel } from "../../../../../../editor/common/model/textModel.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { objectStreamFromTextModel } from "../codecs/base/utils/objectStreamFromTextModel.js";
import { FilePromptContentProvider } from "./filePromptContentsProvider.js";
import { PromptContentsProviderBase } from "./promptContentsProviderBase.js";
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
var TextModelContentsProvider_1;
let TextModelContentsProvider = TextModelContentsProvider_1 = class TextModelContentsProvider2 extends PromptContentsProviderBase {
  static {
    __name(this, "TextModelContentsProvider");
  }
  /**
   * URI component of the prompt associated with this contents provider.
   */
  get uri() {
    return this.model.uri;
  }
  get sourceName() {
    return "text-model";
  }
  get languageId() {
    return this.model.getLanguageId();
  }
  constructor(model, options, instantiationService) {
    super(options);
    this.model = model;
    this.instantiationService = instantiationService;
    this._register(this.model.onWillDispose(this.dispose.bind(this)));
    this._register(this.model.onDidChangeContent(this.onChangeEmitter.fire.bind(this.onChangeEmitter)));
  }
  /**
   * Creates a stream of binary data from the text model based on the changes
   * listed in the provided event.
   *
   * Note! this method implements a basic logic which does not take into account
   * 		 the `_event` argument for incremental updates. This needs to be improved.
   *
   * @param _event - event that describes the changes in the text model; `'full'` is
   * 				   the special value that means that all contents have changed
   * @param cancellationToken - token that cancels this operation
   */
  async getContentsStream(_event, cancellationToken) {
    return objectStreamFromTextModel(this.model, cancellationToken);
  }
  createNew(promptContentsSource, options = {}) {
    if (promptContentsSource instanceof TextModel) {
      return this.instantiationService.createInstance(TextModelContentsProvider_1, promptContentsSource, options);
    }
    return this.instantiationService.createInstance(FilePromptContentProvider, promptContentsSource.uri, options);
  }
  /**
   * String representation of this object.
   */
  toString() {
    return `text-model-prompt-contents-provider:${this.uri.path}`;
  }
};
TextModelContentsProvider = TextModelContentsProvider_1 = __decorate([
  __param(2, IInstantiationService)
], TextModelContentsProvider);
export {
  TextModelContentsProvider
};
//# sourceMappingURL=textModelContentsProvider.js.map
