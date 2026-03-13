var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { escapeRegExpCharacters } from "../../../../../base/common/strings.js";
import { URI } from "../../../../../base/common/uri.js";
import { createToolSimpleTextResult } from "../../common/tools/builtinTools/toolHelpers.js";
function resolveToolUri(input, workspaceContextService) {
  if (input.uri) {
    return URI.parse(input.uri);
  }
  if (input.filePath) {
    const folders = workspaceContextService.getWorkspace().folders;
    if (folders.length === 1) {
      return folders[0].toResource(input.filePath);
    }
    for (const folder of folders) {
      return folder.toResource(input.filePath);
    }
  }
  return void 0;
}
__name(resolveToolUri, "resolveToolUri");
function findLineNumber(model, lineContent) {
  const parts = lineContent.trim().split(/\s+/);
  const pattern = parts.map(escapeRegExpCharacters).join("\\s+");
  const matches = model.findMatches(pattern, false, true, false, null, false, 1);
  if (matches.length === 0) {
    return void 0;
  }
  return matches[0].range.startLineNumber;
}
__name(findLineNumber, "findLineNumber");
function findSymbolColumn(lineText, symbol) {
  const pattern = new RegExp(`\\b${escapeRegExpCharacters(symbol)}\\b`);
  const match = pattern.exec(lineText);
  if (match) {
    return match.index + 1;
  }
  return void 0;
}
__name(findSymbolColumn, "findSymbolColumn");
function errorResult(message) {
  const result = createToolSimpleTextResult(message);
  result.toolResultMessage = new MarkdownString(message);
  return result;
}
__name(errorResult, "errorResult");
export {
  errorResult,
  findLineNumber,
  findSymbolColumn,
  resolveToolUri
};
//# sourceMappingURL=toolHelpers.js.map
