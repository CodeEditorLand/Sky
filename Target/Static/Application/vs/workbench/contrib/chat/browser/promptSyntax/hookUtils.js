var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findNodeAtLocation, parse as parseJSONC, parseTree } from "../../../../../base/common/json.js";
import { PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { formatHookCommandLabel, HOOK_TYPES } from "../../common/promptSyntax/hookSchema.js";
import { parseHooksFromFile, parseHooksIgnoringDisableAll } from "../../common/promptSyntax/hookCompatibility.js";
import * as nls from "../../../../../nls.js";
function offsetToPosition(content, offset) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset && i < content.length; i++) {
    if (content[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}
__name(offsetToPosition, "offsetToPosition");
function findNthCommandNode(tree, hookType, targetIndex, fieldName) {
  const hookTypeArray = findNodeAtLocation(tree, ["hooks", hookType]);
  if (!hookTypeArray || hookTypeArray.type !== "array" || !hookTypeArray.children) {
    return void 0;
  }
  let currentIndex = 0;
  for (let i = 0; i < hookTypeArray.children.length; i++) {
    const item = hookTypeArray.children[i];
    if (item.type !== "object") {
      continue;
    }
    const nestedHooksNode = findNodeAtLocation(tree, ["hooks", hookType, i, "hooks"]);
    if (nestedHooksNode && nestedHooksNode.type === "array" && nestedHooksNode.children) {
      for (let j = 0; j < nestedHooksNode.children.length; j++) {
        if (currentIndex === targetIndex) {
          return findNodeAtLocation(tree, ["hooks", hookType, i, "hooks", j, fieldName]);
        }
        currentIndex++;
      }
    } else {
      if (currentIndex === targetIndex) {
        return findNodeAtLocation(tree, ["hooks", hookType, i, fieldName]);
      }
      currentIndex++;
    }
  }
  return void 0;
}
__name(findNthCommandNode, "findNthCommandNode");
function findHookCommandSelection(content, hookType, index, fieldName) {
  const tree = parseTree(content);
  if (!tree) {
    return void 0;
  }
  const node = findNthCommandNode(tree, hookType, index, fieldName);
  if (!node || node.type !== "string") {
    return void 0;
  }
  const valueStart = node.offset + 1;
  const valueEnd = node.offset + node.length - 1;
  const start = offsetToPosition(content, valueStart);
  const end = offsetToPosition(content, valueEnd);
  return {
    startLineNumber: start.line,
    startColumn: start.column,
    endLineNumber: end.line,
    endColumn: end.column
  };
}
__name(findHookCommandSelection, "findHookCommandSelection");
async function parseAllHookFiles(promptsService, fileService, labelService, workspaceRootUri, userHome, os, token, options) {
  const hookFiles = await promptsService.listPromptFiles(PromptsType.hook, token);
  const parsedHooks = [];
  for (const hookFile of hookFiles) {
    try {
      const content = await fileService.readFile(hookFile.uri);
      const json = parseJSONC(content.value.toString());
      const { hooks } = parseHooksFromFile(hookFile.uri, json, workspaceRootUri, userHome);
      for (const [hookType, { hooks: commands, originalId }] of hooks) {
        const hookTypeMeta = HOOK_TYPES.find((h) => h.id === hookType);
        if (!hookTypeMeta) {
          continue;
        }
        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];
          const commandLabel = formatHookCommandLabel(command, os) || nls.localize("commands.hook.emptyCommand", "(empty command)");
          parsedHooks.push({
            hookType,
            hookTypeLabel: hookTypeMeta.label,
            command,
            commandLabel,
            fileUri: hookFile.uri,
            filePath: labelService.getUriLabel(hookFile.uri, { relative: true }),
            index: i,
            originalHookTypeId: originalId
          });
        }
      }
    } catch (error) {
      console.error("Failed to read or parse hook file", hookFile.uri.toString(), error);
    }
  }
  if (options?.additionalDisabledFileUris) {
    for (const uri of options.additionalDisabledFileUris) {
      try {
        const content = await fileService.readFile(uri);
        const json = parseJSONC(content.value.toString());
        const { hooks } = parseHooksIgnoringDisableAll(uri, json, workspaceRootUri, userHome);
        for (const [hookType, { hooks: commands, originalId }] of hooks) {
          const hookTypeMeta = HOOK_TYPES.find((h) => h.id === hookType);
          if (!hookTypeMeta) {
            continue;
          }
          for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const commandLabel = formatHookCommandLabel(command, os) || nls.localize("commands.hook.emptyCommand", "(empty command)");
            parsedHooks.push({
              hookType,
              hookTypeLabel: hookTypeMeta.label,
              command,
              commandLabel,
              fileUri: uri,
              filePath: labelService.getUriLabel(uri, { relative: true }),
              index: i,
              originalHookTypeId: originalId,
              disabled: true
            });
          }
        }
      } catch (error) {
        console.error("Failed to read or parse disabled hook file", uri.toString(), error);
      }
    }
  }
  return parsedHooks;
}
__name(parseAllHookFiles, "parseAllHookFiles");
export {
  findHookCommandSelection,
  parseAllHookFiles
};
//# sourceMappingURL=hookUtils.js.map
