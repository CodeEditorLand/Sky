var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { stringifyPromptElementJSON } from "./tools/promptTsxTypes.js";
var ToolDataSource;
(function(ToolDataSource2) {
  function toKey(source) {
    switch (source.type) {
      case "extension":
        return `extension:${source.extensionId.value}`;
      case "mcp":
        return `mcp:${source.collectionId}:${source.definitionId}`;
      case "internal":
        return "internal";
    }
  }
  __name(toKey, "toKey");
  ToolDataSource2.toKey = toKey;
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
  createToolInputUri,
  createToolSchemaUri,
  isToolInvocationContext,
  isToolResultInputOutputDetails,
  stringifyPromptTsxPart,
  toolResultHasBuffers
};
//# sourceMappingURL=languageModelToolsService.js.map
