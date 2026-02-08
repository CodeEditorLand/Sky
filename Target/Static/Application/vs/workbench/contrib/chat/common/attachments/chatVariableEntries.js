var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { basename } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { isLocation } from "../../../../../editor/common/languages.js";
import { localize } from "../../../../../nls.js";
import { decodeBase64, encodeBase64, VSBuffer } from "../../../../../base/common/buffer.js";
var OmittedState;
(function(OmittedState2) {
  OmittedState2[OmittedState2["NotOmitted"] = 0] = "NotOmitted";
  OmittedState2[OmittedState2["Partial"] = 1] = "Partial";
  OmittedState2[OmittedState2["Full"] = 2] = "Full";
})(OmittedState || (OmittedState = {}));
var IDiagnosticVariableEntryFilterData;
(function(IDiagnosticVariableEntryFilterData2) {
  IDiagnosticVariableEntryFilterData2.icon = Codicon.error;
  function fromMarker(marker) {
    return {
      filterUri: marker.resource,
      owner: marker.owner,
      problemMessage: marker.message,
      filterRange: { startLineNumber: marker.startLineNumber, endLineNumber: marker.endLineNumber, startColumn: marker.startColumn, endColumn: marker.endColumn }
    };
  }
  __name(fromMarker, "fromMarker");
  IDiagnosticVariableEntryFilterData2.fromMarker = fromMarker;
  function toEntry(data) {
    return {
      id: id(data),
      name: label(data),
      icon: IDiagnosticVariableEntryFilterData2.icon,
      value: data,
      kind: "diagnostic",
      ...data
    };
  }
  __name(toEntry, "toEntry");
  IDiagnosticVariableEntryFilterData2.toEntry = toEntry;
  function id(data) {
    return [data.filterUri, data.owner, data.filterSeverity, data.filterRange?.startLineNumber, data.filterRange?.startColumn].join(":");
  }
  __name(id, "id");
  IDiagnosticVariableEntryFilterData2.id = id;
  function label(data) {
    let TrimThreshold;
    (function(TrimThreshold2) {
      TrimThreshold2[TrimThreshold2["MaxChars"] = 30] = "MaxChars";
      TrimThreshold2[TrimThreshold2["MaxSpaceLookback"] = 10] = "MaxSpaceLookback";
    })(TrimThreshold || (TrimThreshold = {}));
    if (data.problemMessage) {
      if (data.problemMessage.length < 30) {
        return data.problemMessage;
      }
      const lastSpace = data.problemMessage.lastIndexOf(
        " ",
        30
        /* TrimThreshold.MaxChars */
      );
      if (lastSpace === -1 || lastSpace + 10 < 30) {
        return data.problemMessage.substring(
          0,
          30
          /* TrimThreshold.MaxChars */
        ) + "\u2026";
      }
      return data.problemMessage.substring(0, lastSpace) + "\u2026";
    }
    let labelStr = localize("chat.attachment.problems.all", "All Problems");
    if (data.filterUri) {
      labelStr = localize("chat.attachment.problems.inFile", "Problems in {0}", basename(data.filterUri));
    }
    return labelStr;
  }
  __name(label, "label");
  IDiagnosticVariableEntryFilterData2.label = label;
})(IDiagnosticVariableEntryFilterData || (IDiagnosticVariableEntryFilterData = {}));
var IChatRequestVariableEntry;
(function(IChatRequestVariableEntry2) {
  function toUri(entry) {
    return URI.isUri(entry.value) ? entry.value : isLocation(entry.value) ? entry.value.uri : void 0;
  }
  __name(toUri, "toUri");
  IChatRequestVariableEntry2.toUri = toUri;
  function toExport(v) {
    if (v.value instanceof Uint8Array) {
      const dup = { ...v };
      dup.value = { $base64: encodeBase64(VSBuffer.wrap(v.value)) };
      return dup;
    }
    return v;
  }
  __name(toExport, "toExport");
  IChatRequestVariableEntry2.toExport = toExport;
  function fromExport(v) {
    if (v && "values" in v && Array.isArray(v.values)) {
      return {
        kind: "generic",
        id: v.id ?? "",
        name: v.name,
        value: v.values[0]?.value,
        range: v.range,
        modelDescription: v.modelDescription,
        references: v.references
      };
    } else {
      if (v.value && typeof v.value === "object" && "$base64" in v.value && typeof v.value.$base64 === "string") {
        const dup = { ...v };
        dup.value = decodeBase64(v.value.$base64).buffer;
        return dup;
      }
      return v;
    }
  }
  __name(fromExport, "fromExport");
  IChatRequestVariableEntry2.fromExport = fromExport;
})(IChatRequestVariableEntry || (IChatRequestVariableEntry = {}));
function isImplicitVariableEntry(obj) {
  return obj.kind === "implicit";
}
__name(isImplicitVariableEntry, "isImplicitVariableEntry");
function isStringVariableEntry(obj) {
  return obj.kind === "string";
}
__name(isStringVariableEntry, "isStringVariableEntry");
function isTerminalVariableEntry(obj) {
  return obj.kind === "terminalCommand";
}
__name(isTerminalVariableEntry, "isTerminalVariableEntry");
function isDebugVariableEntry(obj) {
  return obj.kind === "debugVariable";
}
__name(isDebugVariableEntry, "isDebugVariableEntry");
function isPasteVariableEntry(obj) {
  return obj.kind === "paste";
}
__name(isPasteVariableEntry, "isPasteVariableEntry");
function isWorkspaceVariableEntry(obj) {
  return obj.kind === "workspace";
}
__name(isWorkspaceVariableEntry, "isWorkspaceVariableEntry");
function isImageVariableEntry(obj) {
  return obj.kind === "image";
}
__name(isImageVariableEntry, "isImageVariableEntry");
function isNotebookOutputVariableEntry(obj) {
  return obj.kind === "notebookOutput";
}
__name(isNotebookOutputVariableEntry, "isNotebookOutputVariableEntry");
function isElementVariableEntry(obj) {
  return obj.kind === "element";
}
__name(isElementVariableEntry, "isElementVariableEntry");
function isDiagnosticsVariableEntry(obj) {
  return obj.kind === "diagnostic";
}
__name(isDiagnosticsVariableEntry, "isDiagnosticsVariableEntry");
function isChatRequestFileEntry(obj) {
  return obj.kind === "file";
}
__name(isChatRequestFileEntry, "isChatRequestFileEntry");
function isPromptFileVariableEntry(obj) {
  return obj.kind === "promptFile";
}
__name(isPromptFileVariableEntry, "isPromptFileVariableEntry");
function isPromptTextVariableEntry(obj) {
  return obj.kind === "promptText";
}
__name(isPromptTextVariableEntry, "isPromptTextVariableEntry");
function isChatRequestVariableEntry(obj) {
  const entry = obj;
  return typeof entry === "object" && entry !== null && typeof entry.id === "string" && typeof entry.name === "string";
}
__name(isChatRequestVariableEntry, "isChatRequestVariableEntry");
function isSCMHistoryItemVariableEntry(obj) {
  return obj.kind === "scmHistoryItem";
}
__name(isSCMHistoryItemVariableEntry, "isSCMHistoryItemVariableEntry");
function isSCMHistoryItemChangeVariableEntry(obj) {
  return obj.kind === "scmHistoryItemChange";
}
__name(isSCMHistoryItemChangeVariableEntry, "isSCMHistoryItemChangeVariableEntry");
function isSCMHistoryItemChangeRangeVariableEntry(obj) {
  return obj.kind === "scmHistoryItemChangeRange";
}
__name(isSCMHistoryItemChangeRangeVariableEntry, "isSCMHistoryItemChangeRangeVariableEntry");
function isStringImplicitContextValue(value) {
  const asStringImplicitContextValue = value;
  return typeof asStringImplicitContextValue === "object" && asStringImplicitContextValue !== null && (typeof asStringImplicitContextValue.value === "string" || typeof asStringImplicitContextValue.value === "undefined") && (typeof asStringImplicitContextValue.name === "string" || typeof asStringImplicitContextValue.name === "undefined") && (asStringImplicitContextValue.icon === void 0 || ThemeIcon.isThemeIcon(asStringImplicitContextValue.icon)) && URI.isUri(asStringImplicitContextValue.uri);
}
__name(isStringImplicitContextValue, "isStringImplicitContextValue");
var PromptFileVariableKind;
(function(PromptFileVariableKind2) {
  PromptFileVariableKind2["Instruction"] = "vscode.prompt.instructions.root";
  PromptFileVariableKind2["InstructionReference"] = "vscode.prompt.instructions";
  PromptFileVariableKind2["PromptFile"] = "vscode.prompt.file";
})(PromptFileVariableKind || (PromptFileVariableKind = {}));
function toPromptFileVariableEntry(uri, kind, originLabel, automaticallyAdded = false, toolReferences) {
  return {
    id: `${kind}__${uri.toString()}`,
    name: `prompt:${basename(uri)}`,
    value: uri,
    kind: "promptFile",
    modelDescription: "Prompt instructions file",
    isRoot: kind !== PromptFileVariableKind.InstructionReference,
    originLabel,
    toolReferences,
    automaticallyAdded
  };
}
__name(toPromptFileVariableEntry, "toPromptFileVariableEntry");
function toPromptTextVariableEntry(content, automaticallyAdded = false, toolReferences) {
  return {
    id: `vscode.prompt.instructions.text`,
    name: `prompt:instructionsList`,
    value: content,
    kind: "promptText",
    modelDescription: "Prompt instructions list",
    automaticallyAdded,
    toolReferences
  };
}
__name(toPromptTextVariableEntry, "toPromptTextVariableEntry");
function toFileVariableEntry(uri, range) {
  return {
    kind: "file",
    value: range ? { uri, range } : uri,
    id: uri.toString() + (range?.toString() ?? ""),
    name: basename(uri)
  };
}
__name(toFileVariableEntry, "toFileVariableEntry");
function toToolVariableEntry(entry, range) {
  return {
    kind: "tool",
    id: entry.id,
    icon: ThemeIcon.isThemeIcon(entry.icon) ? entry.icon : void 0,
    name: entry.displayName,
    value: void 0,
    range
  };
}
__name(toToolVariableEntry, "toToolVariableEntry");
function toToolSetVariableEntry(entry, range) {
  return {
    kind: "toolset",
    id: entry.id,
    icon: entry.icon,
    name: entry.referenceName,
    value: Array.from(entry.getTools()).map((t) => toToolVariableEntry(t)),
    range
  };
}
__name(toToolSetVariableEntry, "toToolSetVariableEntry");
class ChatRequestVariableSet {
  static {
    __name(this, "ChatRequestVariableSet");
  }
  constructor(entries) {
    this._ids = /* @__PURE__ */ new Set();
    this._entries = [];
    if (entries) {
      this.add(...entries);
    }
  }
  add(...entry) {
    for (const e of entry) {
      if (!this._ids.has(e.id)) {
        this._ids.add(e.id);
        this._entries.push(e);
      }
    }
  }
  insertFirst(entry) {
    if (!this._ids.has(entry.id)) {
      this._ids.add(entry.id);
      this._entries.unshift(entry);
    }
  }
  remove(entry) {
    this._ids.delete(entry.id);
    this._entries = this._entries.filter((e) => e.id !== entry.id);
  }
  has(entry) {
    return this._ids.has(entry.id);
  }
  asArray() {
    return this._entries.slice(0);
  }
  get length() {
    return this._entries.length;
  }
}
export {
  ChatRequestVariableSet,
  IChatRequestVariableEntry,
  IDiagnosticVariableEntryFilterData,
  OmittedState,
  PromptFileVariableKind,
  isChatRequestFileEntry,
  isChatRequestVariableEntry,
  isDebugVariableEntry,
  isDiagnosticsVariableEntry,
  isElementVariableEntry,
  isImageVariableEntry,
  isImplicitVariableEntry,
  isNotebookOutputVariableEntry,
  isPasteVariableEntry,
  isPromptFileVariableEntry,
  isPromptTextVariableEntry,
  isSCMHistoryItemChangeRangeVariableEntry,
  isSCMHistoryItemChangeVariableEntry,
  isSCMHistoryItemVariableEntry,
  isStringImplicitContextValue,
  isStringVariableEntry,
  isTerminalVariableEntry,
  isWorkspaceVariableEntry,
  toFileVariableEntry,
  toPromptFileVariableEntry,
  toPromptTextVariableEntry,
  toToolSetVariableEntry,
  toToolVariableEntry
};
//# sourceMappingURL=chatVariableEntries.js.map
