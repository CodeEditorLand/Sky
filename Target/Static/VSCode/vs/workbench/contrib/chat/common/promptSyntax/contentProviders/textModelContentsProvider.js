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
import { VSBuffer } from "../../../../../../base/common/buffer.js";
import { ITextModel } from "../../../../../../editor/common/model.js";
import { CancellationError } from "../../../../../../base/common/errors.js";
import { FilePromptContentProvider } from "./filePromptContentsProvider.js";
import { PromptContentsProviderBase } from "./promptContentsProviderBase.js";
import { TextModel } from "../../../../../../editor/common/model/textModel.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { newWriteableStream, ReadableStream } from "../../../../../../base/common/stream.js";
import { IModelContentChangedEvent } from "../../../../../../editor/common/textModelEvents.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
let TextModelContentsProvider = class extends PromptContentsProviderBase {
  constructor(model, initService) {
    super();
    this.model = model;
    this.initService = initService;
    this._register(this.model.onWillDispose(this.dispose.bind(this)));
    this._register(this.model.onDidChangeContent(this.onChangeEmitter.fire));
  }
  static {
    __name(this, "TextModelContentsProvider");
  }
  /**
   * URI component of the prompt associated with this contents provider.
   */
  get uri() {
    return this.model.uri;
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
    const stream = newWriteableStream(null);
    const linesCount = this.model.getLineCount();
    let i = 1;
    const interval = setInterval(() => {
      if (i >= linesCount) {
        clearInterval(interval);
        stream.end();
        stream.destroy();
      }
      if (this.model.isDisposed() || cancellationToken?.isCancellationRequested) {
        clearInterval(interval);
        stream.error(new CancellationError());
        stream.destroy();
        return;
      }
      try {
        stream.write(
          VSBuffer.fromString(this.model.getLineContent(i))
        );
        if (i !== linesCount) {
          stream.write(
            VSBuffer.fromString(this.model.getEOL())
          );
        }
      } catch (error) {
        console.log(this.uri, i, error);
      }
      i++;
    }, 1);
    return stream;
  }
  createNew(promptContentsSource) {
    if (promptContentsSource instanceof TextModel) {
      return this.initService.createInstance(
        TextModelContentsProvider,
        promptContentsSource
      );
    }
    return this.initService.createInstance(
      FilePromptContentProvider,
      promptContentsSource.uri
    );
  }
  /**
   * String representation of this object.
   */
  toString() {
    return `text-model-prompt-contents-provider:${this.uri.path}`;
  }
};
TextModelContentsProvider = __decorateClass([
  __decorateParam(1, IInstantiationService)
], TextModelContentsProvider);
export {
  TextModelContentsProvider
};
//# sourceMappingURL=textModelContentsProvider.js.map
