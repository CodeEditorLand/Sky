var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const CDPErrorCode = {
  /** Method not found */
  MethodNotFound: -32601,
  /** Invalid params */
  InvalidParams: -32602,
  /** Internal error */
  InternalError: -32603,
  /** Server error (generic) */
  ServerError: -32e3
};
class CDPError extends Error {
  static {
    __name(this, "CDPError");
  }
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "CDPError";
  }
}
class CDPMethodNotFoundError extends CDPError {
  static {
    __name(this, "CDPMethodNotFoundError");
  }
  constructor(method) {
    super(`Method not found: ${method}`, CDPErrorCode.MethodNotFound);
    this.name = "CDPMethodNotFoundError";
  }
}
class CDPInvalidParamsError extends CDPError {
  static {
    __name(this, "CDPInvalidParamsError");
  }
  constructor(message) {
    super(message, CDPErrorCode.InvalidParams);
    this.name = "CDPInvalidParamsError";
  }
}
class CDPInternalError extends CDPError {
  static {
    __name(this, "CDPInternalError");
  }
  constructor(message) {
    super(message, CDPErrorCode.InternalError);
    this.name = "CDPInternalError";
  }
}
class CDPServerError extends CDPError {
  static {
    __name(this, "CDPServerError");
  }
  constructor(message) {
    super(message, CDPErrorCode.ServerError);
    this.name = "CDPServerError";
  }
}
export {
  CDPError,
  CDPErrorCode,
  CDPInternalError,
  CDPInvalidParamsError,
  CDPMethodNotFoundError,
  CDPServerError
};
//# sourceMappingURL=types.js.map
