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
import { safeStringify } from "../../../base/common/objects.js";
import { MainContext } from "./extHost.protocol.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
let AbstractExtHostConsoleForwarder = class AbstractExtHostConsoleForwarder2 {
  static {
    __name(this, "AbstractExtHostConsoleForwarder");
  }
  constructor(extHostRpc, initData) {
    this._mainThreadConsole = extHostRpc.getProxy(MainContext.MainThreadConsole);
    this._includeStack = initData.consoleForward.includeStack;
    this._logNative = initData.consoleForward.logNative;
    this._wrapConsoleMethod("info", "log");
    this._wrapConsoleMethod("log", "log");
    this._wrapConsoleMethod("warn", "warn");
    this._wrapConsoleMethod("debug", "debug");
    this._wrapConsoleMethod("error", "error");
  }
  /**
   * Wraps a console message so that it is transmitted to the renderer. If
   * native logging is turned on, the original console message will be written
   * as well. This is needed since the console methods are "magic" in V8 and
   * are the only methods that allow later introspection of logged variables.
   *
   * The wrapped property is not defined with `writable: false` to avoid
   * throwing errors, but rather a no-op setting. See https://github.com/microsoft/vscode-extension-telemetry/issues/88
   */
  _wrapConsoleMethod(method, severity) {
    const that = this;
    const original = console[method];
    Object.defineProperty(console, method, {
      set: /* @__PURE__ */ __name(() => {
      }, "set"),
      get: /* @__PURE__ */ __name(() => (...args) => {
        that._handleConsoleCall(method, severity, original, args);
      }, "get")
    });
  }
  _handleConsoleCall(method, severity, original, args) {
    this._mainThreadConsole.$logExtensionHostMessage({
      type: "__$console",
      severity,
      arguments: safeStringifyArgumentsToArray(args, this._includeStack)
    });
    if (this._logNative) {
      this._nativeConsoleLogMessage(method, original, args);
    }
  }
};
AbstractExtHostConsoleForwarder = __decorate([
  __param(0, IExtHostRpcService),
  __param(1, IExtHostInitDataService)
], AbstractExtHostConsoleForwarder);
const MAX_LENGTH = 1e5;
function safeStringifyArgumentsToArray(args, includeStack) {
  const argsArray = [];
  if (args.length) {
    for (let i = 0; i < args.length; i++) {
      let arg = args[i];
      if (typeof arg === "undefined") {
        arg = "undefined";
      } else if (arg instanceof Error) {
        const errorObj = arg;
        if (errorObj.stack) {
          arg = errorObj.stack;
        } else {
          arg = errorObj.toString();
        }
      }
      argsArray.push(arg);
    }
  }
  if (includeStack) {
    const stack = new Error().stack;
    if (stack) {
      argsArray.push({ __$stack: stack.split("\n").slice(3).join("\n") });
    }
  }
  try {
    const res = safeStringify(argsArray);
    if (res.length > MAX_LENGTH) {
      return "Output omitted for a large object that exceeds the limits";
    }
    return res;
  } catch (error) {
    return `Output omitted for an object that cannot be inspected ('${error.toString()}')`;
  }
}
__name(safeStringifyArgumentsToArray, "safeStringifyArgumentsToArray");
export {
  AbstractExtHostConsoleForwarder
};
//# sourceMappingURL=extHostConsoleForwarder.js.map
