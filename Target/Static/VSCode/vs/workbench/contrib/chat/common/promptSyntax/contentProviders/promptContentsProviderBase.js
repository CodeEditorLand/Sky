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
import { URI } from "../../../../../../base/common/uri.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { assert } from "../../../../../../base/common/assert.js";
import { CancellationError } from "../../../../../../base/common/errors.js";
import { VSBufferReadableStream } from "../../../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { ObservableDisposable } from "../../../../../../base/common/observableDisposable.js";
import { FailedToResolveContentsStream, ResolveError } from "../../promptFileReferenceErrors.js";
import { cancelPreviousCalls } from "../../../../../../base/common/decorators/cancelPreviousCalls.js";
class PromptContentsProviderBase extends ObservableDisposable {
  static {
    __name(this, "PromptContentsProviderBase");
  }
  /**
   * Internal event emitter for the prompt contents change event. Classes that extend
   * this abstract class are responsible to use this emitter to fire the contents change
   * event when the prompt contents get modified.
   */
  onChangeEmitter = this._register(new Emitter());
  constructor() {
    super();
    this.onChangeEmitter.fire = this.onChangeEmitter.fire.bind(this.onChangeEmitter);
    this._register(this.onChangeEmitter.event(this.onContentsChanged, this));
  }
  /**
   * Event emitter for the prompt contents change event.
   * See {@linkcode onContentChanged} for more details.
   */
  onContentChangedEmitter = this._register(new Emitter());
  /**
   * Event that fires when the prompt contents change. The event is either
   * a `VSBufferReadableStream` stream with changed contents or an instance of
   * the `ResolveError` class representing a parsing failure case.
   *
   * `Note!` this field is meant to be used by the external consumers of the prompt
   *         contents provider that the classes that extend this abstract class.
   *         Please use the {@linkcode onChangeEmitter} event to provide a change
   *         event in your prompt contents implementation instead.
   */
  onContentChanged = this.onContentChangedEmitter.event;
  onContentsChanged(event, cancellationToken) {
    const promise = cancellationToken?.isCancellationRequested ? Promise.reject(new CancellationError()) : this.getContentsStream(event, cancellationToken);
    promise.then((stream) => {
      if (cancellationToken?.isCancellationRequested || this.disposed) {
        stream.destroy();
        throw new CancellationError();
      }
      this.onContentChangedEmitter.fire(stream);
    }).catch((error) => {
      if (error instanceof ResolveError) {
        this.onContentChangedEmitter.fire(error);
        return;
      }
      this.onContentChangedEmitter.fire(
        new FailedToResolveContentsStream(this.uri, error)
      );
    });
    return this;
  }
  /**
   * Start producing the prompt contents data.
   */
  start() {
    assert(
      !this.disposed,
      "Cannot start contents provider that was already disposed."
    );
    this.onContentsChanged("full");
    return this;
  }
}
__decorateClass([
  cancelPreviousCalls
], PromptContentsProviderBase.prototype, "onContentsChanged", 1);
export {
  PromptContentsProviderBase
};
//# sourceMappingURL=promptContentsProviderBase.js.map
