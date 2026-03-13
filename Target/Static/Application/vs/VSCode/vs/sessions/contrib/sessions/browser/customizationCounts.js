var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { isEqualOrParent } from "../../../../base/common/resources.js";
import { PromptsType } from "../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { PromptsStorage } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { BUILTIN_STORAGE } from "../../chat/common/builtinPromptsStorage.js";
import { applyStorageSourceFilter } from "../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
import { parseHooksFromFile } from "../../../../workbench/contrib/chat/common/promptSyntax/hookCompatibility.js";
import { parse as parseJSONC } from "../../../../base/common/jsonc.js";
const storageToCountKey = {
  [PromptsStorage.local]: "workspace",
  [PromptsStorage.user]: "user",
  [PromptsStorage.extension]: "extension",
  [BUILTIN_STORAGE]: "builtin"
};
function getSourceCountsTotal(counts, filter) {
  let total = 0;
  for (const storage of filter.sources) {
    const key = storageToCountKey[storage];
    if (key) {
      total += counts[key];
    }
  }
  return total;
}
__name(getSourceCountsTotal, "getSourceCountsTotal");
async function getSourceCounts(promptsService, promptType, filter, workspaceContextService, workspaceService, fileService) {
  const items = [];
  if (promptType === PromptsType.agent) {
    const agents = await promptsService.getCustomAgents(CancellationToken.None);
    for (const a of agents) {
      items.push({ storage: a.source.storage, uri: a.uri });
    }
  } else if (promptType === PromptsType.skill) {
    const skills = await promptsService.findAgentSkills(CancellationToken.None);
    for (const s of skills ?? []) {
      items.push({ storage: s.storage, uri: s.uri });
    }
  } else if (promptType === PromptsType.prompt) {
    const commands = await promptsService.getPromptSlashCommands(CancellationToken.None);
    for (const c of commands) {
      if (c.promptPath.type === PromptsType.skill) {
        continue;
      }
      items.push({ storage: c.promptPath.storage, uri: c.promptPath.uri });
    }
  } else if (promptType === PromptsType.instructions) {
    const promptFiles = await promptsService.listPromptFiles(promptType, CancellationToken.None);
    for (const f of promptFiles) {
      items.push({ storage: f.storage, uri: f.uri });
    }
    const agentInstructions = await promptsService.listAgentInstructions(CancellationToken.None, void 0);
    const workspaceFolderUris = workspaceContextService.getWorkspace().folders.map((f) => f.uri);
    const activeRoot = workspaceService.getActiveProjectRoot();
    if (activeRoot) {
      workspaceFolderUris.push(activeRoot);
    }
    for (const file of agentInstructions) {
      const isWorkspaceFile = workspaceFolderUris.some((root) => isEqualOrParent(file.uri, root));
      items.push({
        storage: isWorkspaceFile ? PromptsStorage.local : PromptsStorage.user,
        uri: file.uri
      });
    }
  } else if (promptType === PromptsType.hook && fileService) {
    const hookFiles = await promptsService.listPromptFiles(PromptsType.hook, CancellationToken.None);
    const activeRoot = workspaceService.getActiveProjectRoot();
    for (const hookFile of hookFiles) {
      try {
        const content = await fileService.readFile(hookFile.uri);
        const json = parseJSONC(content.value.toString());
        const { hooks } = parseHooksFromFile(hookFile.uri, json, activeRoot, "");
        if (hooks.size > 0) {
          for (const [, entry] of hooks) {
            for (let i = 0; i < entry.hooks.length; i++) {
              items.push({ storage: hookFile.storage, uri: hookFile.uri });
            }
          }
        } else {
          items.push({ storage: hookFile.storage, uri: hookFile.uri });
        }
      } catch {
        items.push({ storage: hookFile.storage, uri: hookFile.uri });
      }
    }
  } else {
    const files = await promptsService.listPromptFiles(promptType, CancellationToken.None);
    for (const f of files) {
      items.push({ storage: f.storage, uri: f.uri });
    }
  }
  const filtered = applyStorageSourceFilter(items, filter);
  return {
    workspace: filtered.filter((i) => i.storage === PromptsStorage.local).length,
    user: filtered.filter((i) => i.storage === PromptsStorage.user).length,
    extension: filtered.filter((i) => i.storage === PromptsStorage.extension).length,
    builtin: filtered.filter((i) => i.storage === BUILTIN_STORAGE).length
  };
}
__name(getSourceCounts, "getSourceCounts");
async function getCustomizationTotalCount(promptsService, mcpService, workspaceService, workspaceContextService, agentPluginService) {
  const types = [PromptsType.agent, PromptsType.skill, PromptsType.instructions, PromptsType.prompt, PromptsType.hook];
  const results = await Promise.all(types.map((type) => {
    const filter = workspaceService.getStorageSourceFilter(type);
    return getSourceCounts(promptsService, type, filter, workspaceContextService, workspaceService).then((counts) => getSourceCountsTotal(counts, filter));
  }));
  const pluginCount = agentPluginService?.plugins.get().length ?? 0;
  return results.reduce((sum, n) => sum + n, 0) + mcpService.servers.get().length + pluginCount;
}
__name(getCustomizationTotalCount, "getCustomizationTotalCount");
export {
  getCustomizationTotalCount,
  getSourceCounts,
  getSourceCountsTotal
};
//# sourceMappingURL=customizationCounts.js.map
