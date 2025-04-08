var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../lifecycle.js";
function getFirstStackFrameOutsideOf(stack, pattern) {
  const lines = stack.split("\n");
  let i = -1;
  for (const line of lines.slice(1)) {
    i++;
    if (pattern && pattern.test(line)) {
      continue;
    }
    const result = parseLine(line);
    if (result) {
      return result;
    }
  }
  return void 0;
}
__name(getFirstStackFrameOutsideOf, "getFirstStackFrameOutsideOf");
function parseLine(stackLine) {
  const match = stackLine.match(/\((.*):(\d+):(\d+)\)/);
  if (match) {
    return {
      fileName: match[1],
      line: parseInt(match[2]),
      column: parseInt(match[3]),
      id: stackLine
    };
  }
  const match2 = stackLine.match(/at ([^\(\)]*):(\d+):(\d+)/);
  if (match2) {
    return {
      fileName: match2[1],
      line: parseInt(match2[2]),
      column: parseInt(match2[3]),
      id: stackLine
    };
  }
  return void 0;
}
__name(parseLine, "parseLine");
class Debouncer {
  static {
    __name(this, "Debouncer");
  }
  _timeout = void 0;
  debounce(fn, timeoutMs) {
    if (this._timeout !== void 0) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => {
      this._timeout = void 0;
      fn();
    }, timeoutMs);
  }
  dispose() {
    if (this._timeout !== void 0) {
      clearTimeout(this._timeout);
    }
  }
}
class Throttler {
  static {
    __name(this, "Throttler");
  }
  _timeout = void 0;
  throttle(fn, timeoutMs) {
    if (this._timeout === void 0) {
      this._timeout = setTimeout(() => {
        this._timeout = void 0;
        fn();
      }, timeoutMs);
    }
  }
  dispose() {
    if (this._timeout !== void 0) {
      clearTimeout(this._timeout);
    }
  }
}
function deepAssign(target, source) {
  for (const key in source) {
    if (!!target[key] && typeof target[key] === "object" && !!source[key] && typeof source[key] === "object") {
      deepAssign(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}
__name(deepAssign, "deepAssign");
function deepAssignDeleteNulls(target, source) {
  for (const key in source) {
    if (source[key] === null) {
      delete target[key];
    } else if (!!target[key] && typeof target[key] === "object" && !!source[key] && typeof source[key] === "object") {
      deepAssignDeleteNulls(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}
__name(deepAssignDeleteNulls, "deepAssignDeleteNulls");
export {
  Debouncer,
  Throttler,
  deepAssign,
  deepAssignDeleteNulls,
  getFirstStackFrameOutsideOf
};
//# sourceMappingURL=utils.js.map
