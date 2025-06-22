var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { stringifyPromptElementJSON } from "./tools/promptTsxTypes.js";
import { derived, ObservableSet } from "../../../../base/common/observable.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { localize } from "../../../../nls.js";
var ToolDataSource;
(function(ToolDataSource2) {
  ToolDataSource2.Internal = { type: "internal", label: "Built-In" };
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
      return { ordinal: 2, label: localize("mcp", "MCP Server: {0}", source.label) };
    } else if (source.type === "user") {
      return { ordinal: 0, label: localize("user", "User Defined") };
    } else {
      return { ordinal: 3, label: localize("ext", "Extension: {0}", source.label) };
    }
  }
  __name(classify, "classify");
  ToolDataSource2.classify = classify;
})(ToolDataSource || (ToolDataSource = {}));
function isToolInvocationContext(obj) {
  return typeof obj === "object" && typeof obj.sessionId === "string";
}
__name(isToolInvocationContext, "isToolInvocationContext");
function isToolResultInputOutputDetails(obj) {
  return typeof obj === "object" && typeof obj?.input === "string" && (typeof obj?.output === "string" || Array.isArray(obj?.output));
}
__name(isToolResultInputOutputDetails, "isToolResultInputOutputDetails");
function toolResultHasBuffers(result) {
  return result.content.some((part) => part.kind === "data");
}
__name(toolResultHasBuffers, "toolResultHasBuffers");
function stringifyPromptTsxPart(part) {
  return stringifyPromptElementJSON(part.value);
}
__name(stringifyPromptTsxPart, "stringifyPromptTsxPart");
class ToolSet {
  static {
    __name(this, "ToolSet");
  }
  constructor(id, referenceName, icon, source, description) {
    this.id = id;
    this.referenceName = referenceName;
    this.icon = icon;
    this.source = source;
    this.description = description;
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
    return Iterable.concat(this._tools.observable.read(r), ...Iterable.map(this._toolSets.observable.read(r), (toolSet) => toolSet.getTools(r)));
  }
}
const ILanguageModelToolsService = createDecorator("ILanguageModelToolsService");
function createToolInputUri(toolOrId) {
  if (typeof toolOrId !== "string") {
    toolOrId = toolOrId.id;
  }
  return URI.from({ scheme: Schemas.inMemory, path: `/lm/tool/${toolOrId}/tool_input.json` });
}
__name(createToolInputUri, "createToolInputUri");
function createToolSchemaUri(toolOrId) {
  if (typeof toolOrId !== "string") {
    toolOrId = toolOrId.id;
  }
  return URI.from({ scheme: Schemas.vscode, authority: "schemas", path: `/lm/tool/${toolOrId}` });
}
__name(createToolSchemaUri, "createToolSchemaUri");
export {
  ILanguageModelToolsService,
  ToolDataSource,
  ToolSet,
  createToolInputUri,
  createToolSchemaUri,
  isToolInvocationContext,
  isToolResultInputOutputDetails,
  stringifyPromptTsxPart,
  toolResultHasBuffers
};
//# sourceMappingURL=languageModelToolsService.js.map
