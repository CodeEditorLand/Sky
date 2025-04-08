var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { binarySearch } from "../../../base/common/arrays.js";
import { errorHandler, ErrorNoTelemetry } from "../../../base/common/errors.js";
import { DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { safeStringify } from "../../../base/common/objects.js";
import { FileOperationError } from "../../files/common/files.js";
import { ITelemetryService } from "./telemetry.js";
var ErrorEvent;
((ErrorEvent2) => {
  function compare(a, b) {
    if (a.callstack < b.callstack) {
      return -1;
    } else if (a.callstack > b.callstack) {
      return 1;
    }
    return 0;
  }
  ErrorEvent2.compare = compare;
  __name(compare, "compare");
})(ErrorEvent || (ErrorEvent = {}));
class BaseErrorTelemetry {
  static {
    __name(this, "BaseErrorTelemetry");
  }
  static ERROR_FLUSH_TIMEOUT = 5 * 1e3;
  _telemetryService;
  _flushDelay;
  _flushHandle = -1;
  _buffer = [];
  _disposables = new DisposableStore();
  constructor(telemetryService, flushDelay = BaseErrorTelemetry.ERROR_FLUSH_TIMEOUT) {
    this._telemetryService = telemetryService;
    this._flushDelay = flushDelay;
    const unbind = errorHandler.addListener((err) => this._onErrorEvent(err));
    this._disposables.add(toDisposable(unbind));
    this.installErrorListeners();
  }
  dispose() {
    clearTimeout(this._flushHandle);
    this._flushBuffer();
    this._disposables.dispose();
  }
  installErrorListeners() {
  }
  _onErrorEvent(err) {
    if (!err || err.code) {
      return;
    }
    if (err.detail && err.detail.stack) {
      err = err.detail;
    }
    if (ErrorNoTelemetry.isErrorNoTelemetry(err) || err instanceof FileOperationError || typeof err?.message === "string" && err.message.includes("Unable to read file")) {
      return;
    }
    const callstack = Array.isArray(err.stack) ? err.stack.join("\n") : err.stack;
    const msg = err.message ? err.message : safeStringify(err);
    if (!callstack) {
      return;
    }
    this._enqueue({ msg, callstack });
  }
  _enqueue(e) {
    const idx = binarySearch(this._buffer, e, ErrorEvent.compare);
    if (idx < 0) {
      e.count = 1;
      this._buffer.splice(~idx, 0, e);
    } else {
      if (!this._buffer[idx].count) {
        this._buffer[idx].count = 0;
      }
      this._buffer[idx].count += 1;
    }
    if (this._flushHandle === -1) {
      this._flushHandle = setTimeout(() => {
        this._flushBuffer();
        this._flushHandle = -1;
      }, this._flushDelay);
    }
  }
  _flushBuffer() {
    for (const error of this._buffer) {
      this._telemetryService.publicLogError2("UnhandledError", error);
    }
    this._buffer.length = 0;
  }
}
export {
  ErrorEvent,
  BaseErrorTelemetry as default
};
//# sourceMappingURL=errorTelemetry.js.map
