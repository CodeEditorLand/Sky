var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { IJSONSchema } from "../../../../base/common/jsonSchema.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { ContextKeyExpression } from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Location } from "../../../../editor/common/languages.js";
import { IChatTerminalToolInvocationData, IChatToolInputInvocationData } from "./chatService.js";
import { Schemas } from "../../../../base/common/network.js";
import { PromptElementJSON, stringifyPromptElementJSON } from "./tools/promptTsxTypes.js";
var ToolDataSource;
((ToolDataSource2) => {
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
  ToolDataSource2.toKey = toKey;
  __name(toKey, "toKey");
})(ToolDataSource || (ToolDataSource = {}));
function isToolInvocationContext(obj) {
  return typeof obj === "object" && typeof obj.sessionId === "string";
}
__name(isToolInvocationContext, "isToolInvocationContext");
function isToolResultInputOutputDetails(obj) {
  return typeof obj === "object" && typeof obj?.input === "string" && typeof obj?.output === "string";
}
__name(isToolResultInputOutputDetails, "isToolResultInputOutputDetails");
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
  stringifyPromptTsxPart
};
//# sourceMappingURL=languageModelToolsService.js.map
