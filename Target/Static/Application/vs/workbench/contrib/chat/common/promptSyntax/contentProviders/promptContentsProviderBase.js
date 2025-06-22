var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assert } from "../../../../../../base/common/assert.js";
import { cancelPreviousCalls } from "../../../../../../base/common/decorators/cancelPreviousCalls.js";
import { CancellationError } from "../../../../../../base/common/errors.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { FailedToResolveContentsStream, ResolveError } from "../../promptFileReferenceErrors.js";
import { INSTRUCTIONS_LANGUAGE_ID, MODE_LANGUAGE_ID, PROMPT_LANGUAGE_ID, PromptsType } from "../promptTypes.js";
import { ObservableDisposable } from "../utils/observableDisposable.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const DEFAULT_OPTIONS = {
  allowNonPromptFiles: false
};
class PromptContentsProviderBase extends ObservableDisposable {
  static {
    __name(this, "PromptContentsProviderBase");
  }
  /**
   * Prompt contents stream.
   */
  get contents() {
    return this.getContentsStream("full");
  }
  /**
   * Prompt type used to determine how to interpret file contents.
   */
  get promptType() {
    const { languageId } = this;
    if (languageId === PROMPT_LANGUAGE_ID) {
      return PromptsType.prompt;
    }
    if (languageId === INSTRUCTIONS_LANGUAGE_ID) {
      return PromptsType.instructions;
    }
    if (languageId === MODE_LANGUAGE_ID) {
      return PromptsType.mode;
    }
    return "non-prompt";
  }
  constructor(options) {
    super();
    this.onChangeEmitter = this._register(new Emitter());
    this.onContentChangedEmitter = this._register(new Emitter());
    this.onContentChanged = this.onContentChangedEmitter.event;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options
    };
  }
  /**
   * Internal common implementation of the event that should be fired when
   * prompt contents change.
   */
  onContentsChanged(event, cancellationToken) {
    const promise = cancellationToken?.isCancellationRequested ? Promise.reject(new CancellationError()) : this.getContentsStream(event, cancellationToken);
    promise.then((stream) => {
      if (cancellationToken?.isCancellationRequested || this.isDisposed) {
        stream.destroy();
        throw new CancellationError();
      }
      this.onContentChangedEmitter.fire(stream);
    }).catch((error) => {
      if (error instanceof ResolveError) {
        this.onContentChangedEmitter.fire(error);
        return;
      }
      this.onContentChangedEmitter.fire(new FailedToResolveContentsStream(this.uri, error));
    });
    return this;
  }
  /**
   * Start producing the prompt contents data.
   */
  start(token) {
    assert(!this.isDisposed, "Cannot start contents provider that was already disposed.");
    this.onContentsChanged("full", token);
    this._register(this.onChangeEmitter.event(this.onContentsChanged, this));
    return this;
  }
}
__decorate([
  cancelPreviousCalls
], PromptContentsProviderBase.prototype, "onContentsChanged", null);
export {
  DEFAULT_OPTIONS,
  PromptContentsProviderBase
};
//# sourceMappingURL=promptContentsProviderBase.js.map
