var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assert, assertNever } from "../../../../base/common/assert.js";
import { ObservableDisposable } from "../../../../base/common/observableDisposable.js";
import { newWriteableStream } from "../../../../base/common/stream.js";
class TokenStream extends ObservableDisposable {
  static {
    __name(this, "TokenStream");
  }
  /**
   * Number of tokens left to be sent.
   */
  get tokensLeft() {
    return this.tokens.length - this.index;
  }
  constructor(tokens) {
    super();
    this.tokens = tokens;
    this.stream = newWriteableStream(null);
    this.index = 0;
    this.sendTokens();
  }
  /**
   * Start periodically sending tokens to the stream
   * asynchronously in the background.
   */
  startStream() {
    if (this.interval !== void 0) {
      return this;
    }
    if (this.tokens.length === 0) {
      this.stream.end();
      return this;
    }
    this.interval = setInterval(() => {
      if (this.tokensLeft === 0) {
        clearInterval(this.interval);
        delete this.interval;
        return;
      }
      this.sendTokens();
    }, 1);
    return this;
  }
  /**
   * Stop tokens sending interval.
   */
  stopStream() {
    if (this.interval === void 0) {
      return this;
    }
    clearInterval(this.interval);
    delete this.interval;
    return this;
  }
  /**
   * Sends a provided number of tokens to the stream.
   */
  sendTokens(tokensCount = 25) {
    if (this.tokensLeft <= 0) {
      return;
    }
    let tokensToSend = Math.min(this.tokensLeft, tokensCount);
    while (tokensToSend > 0) {
      assert(this.index < this.tokens.length, `Token index '${this.index}' is out of bounds.`);
      this.stream.write(this.tokens[this.index]);
      this.index++;
      tokensToSend--;
    }
    if (this.tokensLeft === 0) {
      this.stream.end();
    }
  }
  pause() {
    this.stopStream();
    return this.stream.pause();
  }
  resume() {
    this.startStream();
    return this.stream.resume();
  }
  destroy() {
    this.dispose();
  }
  removeListener(event, callback) {
    return this.stream.removeListener(event, callback);
  }
  on(event, callback) {
    if (event === "data") {
      this.stream.on(event, callback);
      this.startStream();
      return;
    }
    if (event === "error") {
      return this.stream.on(event, callback);
    }
    if (event === "end") {
      return this.stream.on(event, callback);
    }
    assertNever(event, `Unexpected event name '${event}'.`);
  }
  /**
   * Cleanup send interval and destroy the stream.
   */
  dispose() {
    this.stopStream();
    this.stream.destroy();
    super.dispose();
  }
}
export {
  TokenStream
};
//# sourceMappingURL=tokenStream.js.map
