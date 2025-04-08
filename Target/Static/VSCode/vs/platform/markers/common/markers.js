var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import Severity from "../../../base/common/severity.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
var MarkerTag = /* @__PURE__ */ ((MarkerTag2) => {
  MarkerTag2[MarkerTag2["Unnecessary"] = 1] = "Unnecessary";
  MarkerTag2[MarkerTag2["Deprecated"] = 2] = "Deprecated";
  return MarkerTag2;
})(MarkerTag || {});
var MarkerSeverity = /* @__PURE__ */ ((MarkerSeverity2) => {
  MarkerSeverity2[MarkerSeverity2["Hint"] = 1] = "Hint";
  MarkerSeverity2[MarkerSeverity2["Info"] = 2] = "Info";
  MarkerSeverity2[MarkerSeverity2["Warning"] = 4] = "Warning";
  MarkerSeverity2[MarkerSeverity2["Error"] = 8] = "Error";
  return MarkerSeverity2;
})(MarkerSeverity || {});
((MarkerSeverity2) => {
  function compare(a, b) {
    return b - a;
  }
  MarkerSeverity2.compare = compare;
  __name(compare, "compare");
  const _displayStrings = /* @__PURE__ */ Object.create(null);
  _displayStrings[8 /* Error */] = localize("sev.error", "Error");
  _displayStrings[4 /* Warning */] = localize("sev.warning", "Warning");
  _displayStrings[2 /* Info */] = localize("sev.info", "Info");
  function toString(a) {
    return _displayStrings[a] || "";
  }
  MarkerSeverity2.toString = toString;
  __name(toString, "toString");
  const _displayStringsPlural = /* @__PURE__ */ Object.create(null);
  _displayStringsPlural[8 /* Error */] = localize("sev.errors", "Errors");
  _displayStringsPlural[4 /* Warning */] = localize("sev.warnings", "Warnings");
  _displayStringsPlural[2 /* Info */] = localize("sev.infos", "Infos");
  function toStringPlural(a) {
    return _displayStringsPlural[a] || "";
  }
  MarkerSeverity2.toStringPlural = toStringPlural;
  __name(toStringPlural, "toStringPlural");
  function fromSeverity(severity) {
    switch (severity) {
      case Severity.Error:
        return 8 /* Error */;
      case Severity.Warning:
        return 4 /* Warning */;
      case Severity.Info:
        return 2 /* Info */;
      case Severity.Ignore:
        return 1 /* Hint */;
    }
  }
  MarkerSeverity2.fromSeverity = fromSeverity;
  __name(fromSeverity, "fromSeverity");
  function toSeverity(severity) {
    switch (severity) {
      case 8 /* Error */:
        return Severity.Error;
      case 4 /* Warning */:
        return Severity.Warning;
      case 2 /* Info */:
        return Severity.Info;
      case 1 /* Hint */:
        return Severity.Ignore;
    }
  }
  MarkerSeverity2.toSeverity = toSeverity;
  __name(toSeverity, "toSeverity");
})(MarkerSeverity || (MarkerSeverity = {}));
var IMarkerData;
((IMarkerData2) => {
  const emptyString = "";
  function makeKey(markerData) {
    return makeKeyOptionalMessage(markerData, true);
  }
  IMarkerData2.makeKey = makeKey;
  __name(makeKey, "makeKey");
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
  IMarkerData2.makeKeyOptionalMessage = makeKeyOptionalMessage;
  __name(makeKeyOptionalMessage, "makeKeyOptionalMessage");
})(IMarkerData || (IMarkerData = {}));
const IMarkerService = createDecorator("markerService");
export {
  IMarkerData,
  IMarkerService,
  MarkerSeverity,
  MarkerTag
};
//# sourceMappingURL=markers.js.map
