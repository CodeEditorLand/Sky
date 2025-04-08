var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { mainWindow } from "../../../base/browser/window.js";
import { ErrorNoTelemetry } from "../../../base/common/errors.js";
import { toDisposable } from "../../../base/common/lifecycle.js";
import BaseErrorTelemetry, { ErrorEvent } from "../common/errorTelemetry.js";
class ErrorTelemetry extends BaseErrorTelemetry {
  static {
    __name(this, "ErrorTelemetry");
  }
  installErrorListeners() {
    let oldOnError;
    const that = this;
    if (typeof mainWindow.onerror === "function") {
      oldOnError = mainWindow.onerror;
    }
    mainWindow.onerror = function(message, filename, line, column, error) {
      that._onUncaughtError(message, filename, line, column, error);
      oldOnError?.apply(this, [message, filename, line, column, error]);
    };
    this._disposables.add(toDisposable(() => {
      if (oldOnError) {
        mainWindow.onerror = oldOnError;
      }
    }));
  }
  _onUncaughtError(msg, file, line, column, err) {
    const data = {
      callstack: msg,
      msg,
      file,
      line,
      column
    };
    if (err) {
      if (ErrorNoTelemetry.isErrorNoTelemetry(err)) {
        return;
      }
      const { name, message, stack } = err;
      data.uncaught_error_name = name;
      if (message) {
        data.uncaught_error_msg = message;
      }
      if (stack) {
        data.callstack = Array.isArray(err.stack) ? err.stack = err.stack.join("\n") : err.stack;
      }
    }
    this._enqueue(data);
  }
}
export {
  ErrorTelemetry as default
};
//# sourceMappingURL=errorTelemetry.js.map
