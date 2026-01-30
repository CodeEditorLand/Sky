var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as strings from "./strings.js";
var Severity;
(function(Severity2) {
  Severity2[Severity2["Ignore"] = 0] = "Ignore";
  Severity2[Severity2["Info"] = 1] = "Info";
  Severity2[Severity2["Warning"] = 2] = "Warning";
  Severity2[Severity2["Error"] = 3] = "Error";
})(Severity || (Severity = {}));
(function(Severity2) {
  const _error = "error";
  const _warning = "warning";
  const _warn = "warn";
  const _info = "info";
  const _ignore = "ignore";
  function fromValue(value) {
    if (!value) {
      return Severity2.Ignore;
    }
    if (strings.equalsIgnoreCase(_error, value)) {
      return Severity2.Error;
    }
    if (strings.equalsIgnoreCase(_warning, value) || strings.equalsIgnoreCase(_warn, value)) {
      return Severity2.Warning;
    }
    if (strings.equalsIgnoreCase(_info, value)) {
      return Severity2.Info;
    }
    return Severity2.Ignore;
  }
  __name(fromValue, "fromValue");
  Severity2.fromValue = fromValue;
  function toString(severity) {
    switch (severity) {
      case Severity2.Error:
        return _error;
      case Severity2.Warning:
        return _warning;
      case Severity2.Info:
        return _info;
      default:
        return _ignore;
    }
  }
  __name(toString, "toString");
  Severity2.toString = toString;
})(Severity || (Severity = {}));
var severity_default = Severity;
export {
  severity_default as default
};
//# sourceMappingURL=severity.js.map
