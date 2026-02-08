var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Iterable } from "../../../../../base/common/iterator.js";
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { derived, ObservableSet } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { ByteSize } from "../../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { stringifyPromptElementJSON } from "./promptTsxTypes.js";
function toolMatchesModel(toolData, model) {
  if (!toolData.models || toolData.models.length === 0) {
    return true;
  }
  if (!model) {
    return true;
  }
  return toolData.models.some((selector) => (!selector.id || selector.id === model.id) && (!selector.vendor || selector.vendor === model.vendor) && (!selector.family || selector.family === model.family) && (!selector.version || selector.version === model.version));
}
__name(toolMatchesModel, "toolMatchesModel");
var ToolDataSource;
(function(ToolDataSource2) {
  ToolDataSource2.Internal = { type: "internal", label: "Built-In" };
  ToolDataSource2.External = { type: "external", label: "External" };
  function toKey(source) {
    switch (source.type) {
      case "extension":
        return `extension:${source.extensionId.value}`;
      case "mcp":
        return `mcp:${source.collectionId}:${source.definitionId}`;
      case "user":
        return `user:${source.file.toString()}`;
      case "internal":
        return "internal";
      case "external":
        return "external";
    }
  }
  __name(toKey, "toKey");
  ToolDataSource2.toKey = toKey;
  function equals(a, b) {
    return toKey(a) === toKey(b);
  }
  __name(equals, "equals");
  ToolDataSource2.equals = equals;
  function classify(source) {
    if (source.type === "internal") {
      return { ordinal: 1, label: localize("builtin", "Built-In") };
    } else if (source.type === "mcp") {
      return { ordinal: 2, label: source.label };
    } else if (source.type === "user") {
      return { ordinal: 0, label: localize("user", "User Defined") };
    } else {
      return { ordinal: 3, label: source.label };
    }
  }
  __name(classify, "classify");
  ToolDataSource2.classify = classify;
})(ToolDataSource || (ToolDataSource = {}));
function isToolInvocationContext(obj) {
  return typeof obj === "object" && typeof obj.sessionId === "string" && URI.isUri(obj.sessionResource);
}
__name(isToolInvocationContext, "isToolInvocationContext");
function isToolResultInputOutputDetails(obj) {
  return typeof obj === "object" && typeof obj?.input === "string" && (typeof obj?.output === "string" || Array.isArray(obj?.output));
}
__name(isToolResultInputOutputDetails, "isToolResultInputOutputDetails");
function isToolResultOutputDetails(obj) {
  return typeof obj === "object" && typeof obj?.output === "object" && typeof obj?.output?.mimeType === "string" && obj?.output?.type === "data";
}
__name(isToolResultOutputDetails, "isToolResultOutputDetails");
function toolContentToA11yString(part) {
  return part.map((p) => {
    switch (p.kind) {
      case "promptTsx":
        return stringifyPromptTsxPart(p);
      case "text":
        return p.value;
      case "data":
        return localize("toolResultDataPartA11y", "{0} of {1} binary data", ByteSize.formatSize(p.value.data.byteLength), p.value.mimeType || "unknown");
    }
  }).join(", ");
}
__name(toolContentToA11yString, "toolContentToA11yString");
function toolResultHasBuffers(result) {
  return result.content.some((part) => part.kind === "data");
}
__name(toolResultHasBuffers, "toolResultHasBuffers");
function stringifyPromptTsxPart(part) {
  return stringifyPromptElementJSON(part.value);
}
__name(stringifyPromptTsxPart, "stringifyPromptTsxPart");
var ToolInvocationPresentation;
(function(ToolInvocationPresentation2) {
  ToolInvocationPresentation2["Hidden"] = "hidden";
  ToolInvocationPresentation2["HiddenAfterComplete"] = "hiddenAfterComplete";
})(ToolInvocationPresentation || (ToolInvocationPresentation = {}));
function isToolSet(obj) {
  return !!obj && obj.getTools !== void 0;
}
__name(isToolSet, "isToolSet");
class ToolSet {
  static {
    __name(this, "ToolSet");
  }
  constructor(id, referenceName, icon, source, description, legacyFullNames, _contextKeyService) {
    this.id = id;
    this.referenceName = referenceName;
    this.icon = icon;
    this.source = source;
    this.description = description;
    this.legacyFullNames = legacyFullNames;
    this._contextKeyService = _contextKeyService;
    this._tools = new ObservableSet();
    this._toolSets = new ObservableSet();
    this.isHomogenous = derived((r) => {
      return !Iterable.some(this._tools.observable.read(r), (tool) => !ToolDataSource.equals(tool.source, this.source)) && !Iterable.some(this._toolSets.observable.read(r), (toolSet) => !ToolDataSource.equals(toolSet.source, this.source));
    });
  }
  addTool(data, tx) {
    this._tools.add(data, tx);
    return toDisposable(() => {
      this._tools.delete(data);
    });
  }
  addToolSet(toolSet, tx) {
    if (toolSet === this) {
      return Disposable.None;
    }
    this._toolSets.add(toolSet, tx);
    return toDisposable(() => {
      this._toolSets.delete(toolSet);
    });
  }
  getTools(r) {
    return Iterable.concat(Iterable.filter(this._tools.observable.read(r), (toolData) => this._contextKeyService.contextMatchesRules(toolData.when)), ...Iterable.map(this._toolSets.observable.read(r), (toolSet) => toolSet.getTools(r)));
  }
}
class ToolSetForModel {
  static {
    __name(this, "ToolSetForModel");
  }
  get id() {
    return this._toolSet.id;
  }
  get referenceName() {
    return this._toolSet.referenceName;
  }
  get icon() {
    return this._toolSet.icon;
  }
  get source() {
    return this._toolSet.source;
  }
  get description() {
    return this._toolSet.description;
  }
  get legacyFullNames() {
    return this._toolSet.legacyFullNames;
  }
  constructor(_toolSet, model) {
    this._toolSet = _toolSet;
    this.model = model;
  }
  getTools(r) {
    return Iterable.filter(this._toolSet.getTools(r), (toolData) => toolMatchesModel(toolData, this.model));
  }
}
const ILanguageModelToolsService = createDecorator("ILanguageModelToolsService");
function createToolInputUri(toolCallId) {
  return URI.from({ scheme: Schemas.inMemory, path: `/lm/tool/${toolCallId}/tool_input.json` });
}
__name(createToolInputUri, "createToolInputUri");
function createToolSchemaUri(toolOrId) {
  if (typeof toolOrId !== "string") {
    toolOrId = toolOrId.id;
  }
  return URI.from({ scheme: Schemas.vscode, authority: "schemas", path: `/lm/tool/${toolOrId}` });
}
__name(createToolSchemaUri, "createToolSchemaUri");
var SpecedToolAliases;
(function(SpecedToolAliases2) {
  SpecedToolAliases2.execute = "execute";
  SpecedToolAliases2.edit = "edit";
  SpecedToolAliases2.search = "search";
  SpecedToolAliases2.agent = "agent";
  SpecedToolAliases2.read = "read";
  SpecedToolAliases2.web = "web";
  SpecedToolAliases2.todo = "todo";
})(SpecedToolAliases || (SpecedToolAliases = {}));
var VSCodeToolReference;
(function(VSCodeToolReference2) {
  VSCodeToolReference2.runSubagent = "runSubagent";
  VSCodeToolReference2.vscode = "vscode";
})(VSCodeToolReference || (VSCodeToolReference = {}));
export {
  ILanguageModelToolsService,
  SpecedToolAliases,
  ToolDataSource,
  ToolInvocationPresentation,
  ToolSet,
  ToolSetForModel,
  VSCodeToolReference,
  createToolInputUri,
  createToolSchemaUri,
  isToolInvocationContext,
  isToolResultInputOutputDetails,
  isToolResultOutputDetails,
  isToolSet,
  stringifyPromptTsxPart,
  toolContentToA11yString,
  toolMatchesModel,
  toolResultHasBuffers
};
//# sourceMappingURL=languageModelToolsService.js.map
