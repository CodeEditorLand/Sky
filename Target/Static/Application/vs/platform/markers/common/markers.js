var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import Severity from "../../../base/common/severity.js";
import { localize } from "../../../nls.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
var MarkerTag;
(function(MarkerTag2) {
  MarkerTag2[MarkerTag2["Unnecessary"] = 1] = "Unnecessary";
  MarkerTag2[MarkerTag2["Deprecated"] = 2] = "Deprecated";
})(MarkerTag || (MarkerTag = {}));
var MarkerSeverity;
(function(MarkerSeverity2) {
  MarkerSeverity2[MarkerSeverity2["Hint"] = 1] = "Hint";
  MarkerSeverity2[MarkerSeverity2["Info"] = 2] = "Info";
  MarkerSeverity2[MarkerSeverity2["Warning"] = 4] = "Warning";
  MarkerSeverity2[MarkerSeverity2["Error"] = 8] = "Error";
})(MarkerSeverity || (MarkerSeverity = {}));
(function(MarkerSeverity2) {
  function compare(a, b) {
    return b - a;
  }
  __name(compare, "compare");
  MarkerSeverity2.compare = compare;
  const _displayStrings = /* @__PURE__ */ Object.create(null);
  _displayStrings[MarkerSeverity2.Error] = localize("sev.error", "Error");
  _displayStrings[MarkerSeverity2.Warning] = localize("sev.warning", "Warning");
  _displayStrings[MarkerSeverity2.Info] = localize("sev.info", "Info");
  function toString(a) {
    return _displayStrings[a] || "";
  }
  __name(toString, "toString");
  MarkerSeverity2.toString = toString;
  const _displayStringsPlural = /* @__PURE__ */ Object.create(null);
  _displayStringsPlural[MarkerSeverity2.Error] = localize("sev.errors", "Errors");
  _displayStringsPlural[MarkerSeverity2.Warning] = localize("sev.warnings", "Warnings");
  _displayStringsPlural[MarkerSeverity2.Info] = localize("sev.infos", "Infos");
  function toStringPlural(a) {
    return _displayStringsPlural[a] || "";
  }
  __name(toStringPlural, "toStringPlural");
  MarkerSeverity2.toStringPlural = toStringPlural;
  function fromSeverity(severity) {
    switch (severity) {
      case Severity.Error:
        return MarkerSeverity2.Error;
      case Severity.Warning:
        return MarkerSeverity2.Warning;
      case Severity.Info:
        return MarkerSeverity2.Info;
      case Severity.Ignore:
        return MarkerSeverity2.Hint;
    }
  }
  __name(fromSeverity, "fromSeverity");
  MarkerSeverity2.fromSeverity = fromSeverity;
  function toSeverity(severity) {
    switch (severity) {
      case MarkerSeverity2.Error:
        return Severity.Error;
      case MarkerSeverity2.Warning:
        return Severity.Warning;
      case MarkerSeverity2.Info:
        return Severity.Info;
      case MarkerSeverity2.Hint:
        return Severity.Ignore;
    }
  }
  __name(toSeverity, "toSeverity");
  MarkerSeverity2.toSeverity = toSeverity;
})(MarkerSeverity || (MarkerSeverity = {}));
var IMarkerData;
(function(IMarkerData2) {
  const emptyString = "";
  function makeKey(markerData) {
    return makeKeyOptionalMessage(markerData, true);
  }
  __name(makeKey, "makeKey");
  IMarkerData2.makeKey = makeKey;
  function makeKeyOptionalMessage(markerData, useMessage) {
    const result = [emptyString];
    if (markerData.source) {
      result.push(markerData.source.replace("\xA6", "\\\xA6"));
    } else {
      result.push(emptyString);
    }
    if (markerData.code) {
      if (typeof markerData.code === "string") {
        result.push(markerData.code.replace("\xA6", "\\\xA6"));
      } else {
        result.push(markerData.code.value.replace("\xA6", "\\\xA6"));
      }
    } else {
      result.push(emptyString);
    }
    if (markerData.severity !== void 0 && markerData.severity !== null) {
      result.push(MarkerSeverity.toString(markerData.severity));
    } else {
      result.push(emptyString);
    }
    if (markerData.message && useMessage) {
      result.push(markerData.message.replace("\xA6", "\\\xA6"));
    } else {
      result.push(emptyString);
    }
    if (markerData.startLineNumber !== void 0 && markerData.startLineNumber !== null) {
      result.push(markerData.startLineNumber.toString());
    } else {
      result.push(emptyString);
    }
    if (markerData.startColumn !== void 0 && markerData.startColumn !== null) {
      result.push(markerData.startColumn.toString());
    } else {
      result.push(emptyString);
    }
    if (markerData.endLineNumber !== void 0 && markerData.endLineNumber !== null) {
      result.push(markerData.endLineNumber.toString());
    } else {
      result.push(emptyString);
    }
    if (markerData.endColumn !== void 0 && markerData.endColumn !== null) {
      result.push(markerData.endColumn.toString());
    } else {
      result.push(emptyString);
    }
    result.push(emptyString);
    return result.join("\xA6");
  }
  __name(makeKeyOptionalMessage, "makeKeyOptionalMessage");
  IMarkerData2.makeKeyOptionalMessage = makeKeyOptionalMessage;
})(IMarkerData || (IMarkerData = {}));
const IMarkerService = createDecorator("markerService");
export {
  IMarkerData,
  IMarkerService,
  MarkerSeverity,
  MarkerTag
};
//# sourceMappingURL=markers.js.map
