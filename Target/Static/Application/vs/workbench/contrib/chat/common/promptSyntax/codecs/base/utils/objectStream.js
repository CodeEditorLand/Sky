var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../../../../../base/common/assert.js";
import { ObservableDisposable } from "../../../utils/observableDisposable.js";
import { newWriteableStream } from "../../../../../../../../base/common/stream.js";
class ObjectStream extends ObservableDisposable {
  static {
    __name(this, "ObjectStream");
  }
  constructor(data, cancellationToken) {
    super();
    this.data = data;
    this.cancellationToken = cancellationToken;
    this.ended = false;
    this.stream = newWriteableStream(null);
    if (cancellationToken?.isCancellationRequested) {
      this.end();
      return;
    }
    this.send(true);
  }
  /**
   * Starts process of sending data to the stream.
   *
   * @param stopAfterFirstSend whether to continue sending data to the stream
   *             or stop sending after the first batch of data is sent instead
   */
  send(stopAfterFirstSend = false) {
    if (this.cancellationToken?.isCancellationRequested || this.ended) {
      this.end();
      return;
    }
    this.sendData().then(() => {
      if (this.cancellationToken?.isCancellationRequested || this.ended) {
        this.end();
        return;
      }
      if (stopAfterFirstSend === true) {
        this.stopStream();
        return;
      }
      this.timeoutHandle = setTimeout(this.send.bind(this));
    }).catch((error) => {
      this.stream.error(error);
      this.dispose();
    });
  }
  /**
   * Stop the data sending loop.
   */
  stopStream() {
    if (this.timeoutHandle === void 0) {
      return this;
    }
    clearTimeout(this.timeoutHandle);
    this.timeoutHandle = void 0;
    return this;
  }
  /**
   * Sends a provided number of objects to the stream.
   */
  async sendData(objectsCount = 25) {
    while (objectsCount > 0) {
      try {
        const next = this.data.next();
        if (next.done || this.cancellationToken?.isCancellationRequested) {
          this.end();
          return;
        }
        await this.stream.write(next.value);
        objectsCount--;
      } catch (error) {
        this.stream.error(error);
        this.dispose();
        return;
      }
    }
  }
  /**
   * Ends the stream and stops sending data objects.
   */
  end() {
    if (this.ended) {
      return this;
    }
    this.ended = true;
    this.stopStream();
    this.stream.end();
    return this;
  }
  pause() {
    this.stopStream();
    this.stream.pause();
    return;
  }
  resume() {
    this.send();
    this.stream.resume();
    return;
  }
  destroy() {
    this.dispose();
  }
  removeListener(event, callback) {
    this.stream.removeListener(event, callback);
    return;
  }
  on(event, callback) {
    if (event === "data") {
      this.stream.on(event, callback);
      this.send();
      return;
    }
    if (event === "error") {
      this.stream.on(event, callback);
      return;
    }
    if (event === "end") {
      this.stream.on(event, callback);
      return;
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
  /**
   * Create new instance of the stream from a provided array.
   */
  static fromArray(array, cancellationToken) {
    return new ObjectStream(arrayToGenerator(array), cancellationToken);
  }
}
function arrayToGenerator(array) {
  return function* () {
    for (const item of array) {
      yield item;
    }
  }();
}
__name(arrayToGenerator, "arrayToGenerator");
export {
  ObjectStream,
  arrayToGenerator
};
//# sourceMappingURL=objectStream.js.map
