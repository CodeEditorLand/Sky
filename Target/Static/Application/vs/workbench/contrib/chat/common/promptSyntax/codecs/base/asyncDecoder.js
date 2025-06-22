var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
class AsyncDecoder extends Disposable {
  static {
    __name(this, "AsyncDecoder");
  }
  /**
   * @param decoder The decoder instance to wrap.
   *
   * Note! Assumes ownership of the `decoder` object, hence will `dispose`
   * 		 it when the decoder stream is ended.
   */
  constructor(decoder) {
    super();
    this.decoder = decoder;
    this.messages = [];
    this._register(decoder);
  }
  /**
   * Async iterator implementation.
   */
  async *[Symbol.asyncIterator]() {
    const callback = /* @__PURE__ */ __name((data) => {
      if (data !== void 0) {
        this.messages.push(data);
      } else {
        this.decoder.removeListener("data", callback);
        this.decoder.removeListener("end", callback);
      }
      if (this.resolveOnNewEvent) {
        this.resolveOnNewEvent();
        delete this.resolveOnNewEvent;
      }
    }, "callback");
    this.decoder.on("end", callback);
    this.decoder.on("data", callback);
    this.decoder.start();
    while (true) {
      const maybeMessage = this.messages.shift();
      if (maybeMessage !== void 0) {
        yield maybeMessage;
        continue;
      }
      if (this.decoder.ended) {
        this.dispose();
        return null;
      }
      await new Promise((resolve) => {
        this.resolveOnNewEvent = resolve;
      });
    }
  }
}
export {
  AsyncDecoder
};
//# sourceMappingURL=asyncDecoder.js.map
