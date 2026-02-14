var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class TelemetryCollectionError extends Error {
  static {
    __name(this, "TelemetryCollectionError");
  }
  _tag = "TelemetryCollectionError";
  operation;
  cause;
  constructor(operation, cause) {
    super(`Telemetry collection failed for '${operation}': ${String(cause)}`);
    this.operation = operation;
    this.cause = cause;
    Object.setPrototypeOf(this, TelemetryCollectionError.prototype);
  }
  get name() {
    return "TelemetryCollectionError";
  }
}
export {
  TelemetryCollectionError as default
};
//# sourceMappingURL=TelemetryCollectionError.js.map
