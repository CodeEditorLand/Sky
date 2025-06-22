var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../../../base/common/event.js";
import { DeferredPromise } from "../../../../../../../base/common/async.js";
import { AsyncDecoder } from "./asyncDecoder.js";
import { assert, assertNever } from "../../../../../../../base/common/assert.js";
import { DisposableMap } from "../../../../../../../base/common/lifecycle.js";
import { ObservableDisposable } from "../../utils/observableDisposable.js";
class BaseDecoder extends ObservableDisposable {
  static {
    __name(this, "BaseDecoder");
  }
  /**
   * @param stream The input stream to decode.
   */
  constructor(stream) {
    super();
    this.stream = stream;
    this._ended = false;
    this._onData = this._register(new Emitter());
    this._onEnd = this._register(new Emitter());
    this._onError = this._register(new Emitter());
    this._listeners = this._register(new DisposableMap());
    this.started = false;
    this.settledPromise = new DeferredPromise();
  }
  /**
   * Promise that resolves when the stream has ended, either by
   * receiving the `end` event or by a disposal, but not when
   * the `error` event is received alone.
   *
   * @throws If the stream was not yet started to prevent this
   * 		   promise to block the consumer calls indefinitely.
   */
  get settled() {
    assert(this.started, [
      "Cannot get `settled` promise of a stream that has not been started.",
      "Please call `start()` first."
    ].join(" "));
    return this.settledPromise.p;
  }
  /**
   * Start receiving data from the stream.
   * @throws if the decoder stream has already ended.
   */
  start() {
    assert(this._ended === false, "Cannot start stream that has already ended.");
    assert(this.isDisposed === false, "Cannot start stream that has already disposed.");
    if (this.started) {
      return this;
    }
    this.started = true;
    this.stream.on("end", this.onStreamEnd.bind(this));
    this.stream.on("error", this.onStreamError.bind(this));
    this.stream.on("data", this.tryOnStreamData.bind(this));
    if (this.stream instanceof BaseDecoder) {
      this.stream.start();
    }
    return this;
  }
  /**
   * Check if the decoder has been ended hence has
   * no more data to produce.
   */
  get ended() {
    return this._ended;
  }
  /**
   * Automatically catch and dispatch errors thrown inside `onStreamData`.
   */
  tryOnStreamData(data) {
    try {
      this.onStreamData(data);
    } catch (error) {
      this.onStreamError(error);
    }
  }
  on(event, callback) {
    if (event === "data") {
      return this.onData(callback);
    }
    if (event === "error") {
      return this.onError(callback);
    }
    if (event === "end") {
      return this.onEnd(callback);
    }
    assertNever(event, `Invalid event name '${event}'`);
  }
  /**
   * Add listener for the `data` event.
   * @throws if the decoder stream has already ended.
   */
  onData(callback) {
    assert(!this.ended, "Cannot subscribe to the `data` event because the decoder stream has already ended.");
    let currentListeners = this._listeners.get("data");
    if (!currentListeners) {
      currentListeners = new DisposableMap();
      this._listeners.set("data", currentListeners);
    }
    currentListeners.set(callback, this._onData.event(callback));
  }
  /**
   * Add listener for the `error` event.
   * @throws if the decoder stream has already ended.
   */
  onError(callback) {
    assert(!this.ended, "Cannot subscribe to the `error` event because the decoder stream has already ended.");
    let currentListeners = this._listeners.get("error");
    if (!currentListeners) {
      currentListeners = new DisposableMap();
      this._listeners.set("error", currentListeners);
    }
    currentListeners.set(callback, this._onError.event(callback));
  }
  /**
   * Add listener for the `end` event.
   * @throws if the decoder stream has already ended.
   */
  onEnd(callback) {
    assert(!this.ended, "Cannot subscribe to the `end` event because the decoder stream has already ended.");
    let currentListeners = this._listeners.get("end");
    if (!currentListeners) {
      currentListeners = new DisposableMap();
      this._listeners.set("end", currentListeners);
    }
    currentListeners.set(callback, this._onEnd.event(callback));
  }
  /**
   * Pauses the stream.
   */
  pause() {
    this.stream.pause();
  }
  /**
   * Resumes the stream if it has been paused.
   * @throws if the decoder stream has already ended.
   */
  resume() {
    assert(this.ended === false, "Cannot resume the stream because it has already ended.");
    this.stream.resume();
  }
  /**
   * Destroys(disposes) the stream.
   */
  destroy() {
    this.dispose();
  }
  /**
   * Removes a previously-registered event listener for a specified event.
   *
   * Note!
   *  - the callback function must be the same as the one that was used when
   * 	  registering the event listener as it is used as an identifier to
   *    remove the listener
   *  - this method is idempotent and results in no-op if the listener is
   *    not found, therefore passing incorrect `callback` function may
   *    result in silent unexpected behavior
   */
  removeListener(eventName, callback) {
    const listeners = this._listeners.get(eventName);
    if (listeners === void 0) {
      return;
    }
    for (const [listener] of listeners) {
      if (listener !== callback) {
        continue;
      }
      listeners.deleteAndDispose(listener);
    }
  }
  /**
   * This method is called when the input stream ends.
   */
  onStreamEnd() {
    if (this._ended) {
      return;
    }
    this._ended = true;
    this._onEnd.fire();
    this.settledPromise.complete();
  }
  /**
   * This method is called when the input stream emits an error.
   * We re-emit the error here by default, but subclasses can
   * override this method to handle the error differently.
   */
  onStreamError(error) {
    this._onError.fire(error);
  }
  /**
   * Consume all messages from the stream, blocking until the stream finishes.
   * @throws if the decoder stream has already ended.
   */
  async consumeAll() {
    assert(!this._ended, "Cannot consume all messages of the stream that has already ended.");
    const messages = [];
    for await (const maybeMessage of this) {
      if (maybeMessage === null) {
        break;
      }
      messages.push(maybeMessage);
    }
    return messages;
  }
  /**
   * Async iterator interface for the decoder.
   * @throws if the decoder stream has already ended.
   */
  [Symbol.asyncIterator]() {
    assert(!this._ended, "Cannot iterate on messages of the stream that has already ended.");
    const asyncDecoder = this._register(new AsyncDecoder(this));
    return asyncDecoder[Symbol.asyncIterator]();
  }
  dispose() {
    this.settledPromise.complete();
    this._listeners.clearAndDisposeAll();
    this.stream.destroy();
    super.dispose();
  }
}
export {
  BaseDecoder
};
//# sourceMappingURL=baseDecoder.js.map
