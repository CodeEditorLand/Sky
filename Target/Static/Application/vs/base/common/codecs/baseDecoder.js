var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assert } from "../assert.js";
import { Emitter } from "../event.js";
import { DeferredPromise } from "../async.js";
import { AsyncDecoder } from "./asyncDecoder.js";
import { ObservableDisposable } from "../observableDisposable.js";
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
    this._listeners = /* @__PURE__ */ new Map();
    this.started = false;
    this.settledPromise = new DeferredPromise();
    this.tryOnStreamData = this.tryOnStreamData.bind(this);
    this.onStreamError = this.onStreamError.bind(this);
    this.onStreamEnd = this.onStreamEnd.bind(this);
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
    assert(!this._ended, "Cannot start stream that has already ended.");
    assert(!this.disposed, "Cannot start stream that has already disposed.");
    if (this.started) {
      return this;
    }
    this.started = true;
    this.stream.on("data", this.tryOnStreamData);
    this.stream.on("error", this.onStreamError);
    this.stream.on("end", this.onStreamEnd);
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
    throw new Error(`Invalid event name: ${event}`);
  }
  /**
   * Add listener for the `data` event.
   * @throws if the decoder stream has already ended.
   */
  onData(callback) {
    assert(!this.ended, "Cannot subscribe to the `data` event because the decoder stream has already ended.");
    let currentListeners = this._listeners.get("data");
    if (!currentListeners) {
      currentListeners = /* @__PURE__ */ new Map();
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
      currentListeners = /* @__PURE__ */ new Map();
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
      currentListeners = /* @__PURE__ */ new Map();
      this._listeners.set("end", currentListeners);
    }
    currentListeners.set(callback, this._onEnd.event(callback));
  }
  /**
   * Remove all existing event listeners.
   */
  removeAllListeners() {
    this.stream.removeListener("data", this.tryOnStreamData);
    this.stream.removeListener("error", this.onStreamError);
    this.stream.removeListener("end", this.onStreamEnd);
    for (const [name, listeners] of this._listeners.entries()) {
      this._listeners.delete(name);
      for (const [listener, disposable] of listeners) {
        disposable.dispose();
        listeners.delete(listener);
      }
    }
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
    assert(!this.ended, "Cannot resume the stream because it has already ended.");
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
  removeListener(event, callback) {
    for (const [nameName, listeners] of this._listeners.entries()) {
      if (nameName !== event) {
        continue;
      }
      for (const [listener, disposable] of listeners) {
        if (listener !== callback) {
          continue;
        }
        disposable.dispose();
        listeners.delete(listener);
      }
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
    if (this.disposed) {
      return;
    }
    this.onStreamEnd();
    this.stream.destroy();
    this.removeAllListeners();
    super.dispose();
  }
}
export {
  BaseDecoder
};
//# sourceMappingURL=baseDecoder.js.map
