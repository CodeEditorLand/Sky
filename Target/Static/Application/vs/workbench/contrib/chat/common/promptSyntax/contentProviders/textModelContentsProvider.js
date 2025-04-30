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
var TextModelContentsProvider_1;
import { VSBuffer } from "../../../../../../base/common/buffer.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { CancellationError } from "../../../../../../base/common/errors.js";
import { FilePromptContentProvider } from "./filePromptContentsProvider.js";
import { TextModel } from "../../../../../../editor/common/model/textModel.js";
import { newWriteableStream } from "../../../../../../base/common/stream.js";
import { PromptContentsProviderBase } from "./promptContentsProviderBase.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
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
  constructor(model, options = {}, initService, logService) {
    super(options);
    this.model = model;
    this.initService = initService;
    this.logService = logService;
    this._register(this.model.onWillDispose(this.dispose.bind(this)));
    this._register(this.model.onDidChangeContent(this.onChangeEmitter.fire));
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
    if (this.model.isDisposed()) {
      stream.end();
      stream.destroy();
      return stream;
    }
    let i = 1;
    const linesCount = this.model.getLineCount();
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
        stream.write(VSBuffer.fromString(this.model.getLineContent(i)));
        if (i !== linesCount) {
          stream.write(VSBuffer.fromString(this.model.getEOL()));
        }
      } catch (error) {
        this.logService.error([
          "[text model contents provider]: ",
          `Failed to write line #${i} of text model '${this.uri.path}' to stream: `
        ].join(""), error);
      }
      i++;
    }, 1);
    return stream;
  }
  createNew(promptContentsSource, options = {}) {
    if (promptContentsSource instanceof TextModel) {
      return this.initService.createInstance(TextModelContentsProvider_1, promptContentsSource, options);
    }
    return this.initService.createInstance(FilePromptContentProvider, promptContentsSource.uri, options);
  }
  /**
   * String representation of this object.
   */
  toString() {
    return `text-model-prompt-contents-provider:${this.uri.path}`;
  }
};
TextModelContentsProvider = TextModelContentsProvider_1 = __decorate([
  __param(2, IInstantiationService),
  __param(3, ILogService)
], TextModelContentsProvider);
export {
  TextModelContentsProvider
};
//# sourceMappingURL=textModelContentsProvider.js.map
