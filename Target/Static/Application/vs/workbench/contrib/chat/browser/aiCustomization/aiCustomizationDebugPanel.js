var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { PromptsStorage } from "../../common/promptSyntax/service/promptsService.js";
import { PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { applyStorageSourceFilter } from "../../common/aiCustomizationWorkspaceService.js";
import { AICustomizationManagementSection } from "./aiCustomizationManagement.js";
function sectionToPromptType(section) {
  switch (section) {
    case AICustomizationManagementSection.Agents:
      return PromptsType.agent;
    case AICustomizationManagementSection.Skills:
      return PromptsType.skill;
    case AICustomizationManagementSection.Instructions:
      return PromptsType.instructions;
    case AICustomizationManagementSection.Hooks:
      return PromptsType.hook;
    case AICustomizationManagementSection.Prompts:
    default:
      return PromptsType.prompt;
  }
}
__name(sectionToPromptType, "sectionToPromptType");
async function generateCustomizationDebugReport(section, promptsService, workspaceService, widgetState) {
  const promptType = sectionToPromptType(section);
  const filter = workspaceService.getStorageSourceFilter(promptType);
  const lines = [];
  lines.push(`== Customization Debug: ${section} (${promptType}) ==`);
  lines.push(`Window: ${workspaceService.isSessionsWindow ? "Sessions" : "Core VS Code"}`);
  lines.push(`Active root: ${workspaceService.getActiveProjectRoot()?.fsPath ?? "(none)"}`);
  lines.push(`Sections: [${workspaceService.managementSections.join(", ")}]`);
  lines.push(`Filter sources: [${filter.sources.join(", ")}]`);
  if (filter.includedUserFileRoots) {
    lines.push(`Filter includedUserFileRoots:`);
    for (const r of filter.includedUserFileRoots) {
      lines.push(`  ${r.fsPath}`);
    }
  } else {
    lines.push(`Filter includedUserFileRoots: (all)`);
  }
  lines.push("");
  await appendRawServiceData(lines, promptsService, promptType);
  await appendFilteredData(lines, promptsService, promptType, filter);
  appendWidgetState(lines, widgetState);
  await appendSourceFolders(lines, promptsService, promptType);
  return lines.join("\n");
}
__name(generateCustomizationDebugReport, "generateCustomizationDebugReport");
async function appendRawServiceData(lines, promptsService, promptType) {
  lines.push("--- Stage 1: Raw PromptsService Data ---");
  const [localFiles, userFiles, extensionFiles] = await Promise.all([
    promptsService.listPromptFilesForStorage(promptType, PromptsStorage.local, CancellationToken.None),
    promptsService.listPromptFilesForStorage(promptType, PromptsStorage.user, CancellationToken.None),
    promptsService.listPromptFilesForStorage(promptType, PromptsStorage.extension, CancellationToken.None)
  ]);
  lines.push(`  listPromptFilesForStorage(local):  ${localFiles.length} files`);
  appendFileList(lines, localFiles);
  lines.push(`  listPromptFilesForStorage(user):   ${userFiles.length} files`);
  appendFileList(lines, userFiles);
  lines.push(`  listPromptFilesForStorage(ext):    ${extensionFiles.length} files`);
  appendFileList(lines, extensionFiles);
  const allFiles = await promptsService.listPromptFiles(promptType, CancellationToken.None);
  lines.push(`  listPromptFiles (merged):          ${allFiles.length} files`);
  if (promptType === PromptsType.instructions) {
    const agentInstructions = await promptsService.listAgentInstructions(CancellationToken.None, void 0);
    lines.push(`  listAgentInstructions (extra):     ${agentInstructions.length} files`);
    appendFileList(lines, agentInstructions);
  }
  if (promptType === PromptsType.skill) {
    const skills = await promptsService.findAgentSkills(CancellationToken.None);
    lines.push(`  findAgentSkills:                   ${skills?.length ?? 0} skills`);
    for (const s of skills ?? []) {
      lines.push(`    ${s.name ?? "?"} [${s.storage}] ${s.uri.fsPath}`);
    }
  }
  if (promptType === PromptsType.agent) {
    const agents = await promptsService.getCustomAgents(CancellationToken.None);
    lines.push(`  getCustomAgents:                   ${agents.length} agents`);
    for (const a of agents) {
      lines.push(`    ${a.name} [${a.source.storage}] ${a.uri.fsPath}`);
    }
  }
  if (promptType === PromptsType.prompt) {
    const commands = await promptsService.getPromptSlashCommands(CancellationToken.None);
    lines.push(`  getPromptSlashCommands:            ${commands.length} commands`);
    for (const c of commands) {
      lines.push(`    /${c.name} [${c.promptPath.storage}] ${c.promptPath.uri.fsPath} (type=${c.promptPath.type})`);
    }
  }
  lines.push("");
}
__name(appendRawServiceData, "appendRawServiceData");
async function appendFilteredData(lines, promptsService, promptType, filter) {
  lines.push("--- Stage 2: After applyStorageSourceFilter ---");
  const [localFiles, userFiles, extensionFiles] = await Promise.all([
    promptsService.listPromptFilesForStorage(promptType, PromptsStorage.local, CancellationToken.None),
    promptsService.listPromptFilesForStorage(promptType, PromptsStorage.user, CancellationToken.None),
    promptsService.listPromptFilesForStorage(promptType, PromptsStorage.extension, CancellationToken.None)
  ]);
  const all = [...localFiles, ...userFiles, ...extensionFiles];
  const filtered = applyStorageSourceFilter(all, filter);
  lines.push(`  Input: ${all.length} \u2192 Filtered: ${filtered.length}`);
  lines.push(`    local:     ${filtered.filter((f) => f.storage === PromptsStorage.local).length}`);
  lines.push(`    user:      ${filtered.filter((f) => f.storage === PromptsStorage.user).length}`);
  lines.push(`    extension: ${filtered.filter((f) => f.storage === PromptsStorage.extension).length}`);
  const removedCount = all.length - filtered.length;
  if (removedCount > 0) {
    const filteredUris = new Set(filtered.map((f) => f.uri.toString()));
    const removed = all.filter((f) => !filteredUris.has(f.uri.toString()));
    lines.push(`  Removed (${removedCount}):`);
    for (const f of removed) {
      lines.push(`    [${f.storage}] ${f.uri.fsPath}`);
    }
  }
  lines.push("");
}
__name(appendFilteredData, "appendFilteredData");
function appendWidgetState(lines, state) {
  lines.push("--- Stage 3: Widget State (loadItems \u2192 filterItems) ---");
  lines.push(`  allItems (after loadItems): ${state.allItems.length}`);
  lines.push(`    local:     ${state.allItems.filter((i) => i.storage === PromptsStorage.local).length}`);
  lines.push(`    user:      ${state.allItems.filter((i) => i.storage === PromptsStorage.user).length}`);
  lines.push(`    extension: ${state.allItems.filter((i) => i.storage === PromptsStorage.extension).length}`);
  lines.push(`    plugin:    ${state.allItems.filter((i) => i.storage === PromptsStorage.plugin).length}`);
  lines.push(`  displayEntries (after filterItems): ${state.displayEntries.length}`);
  const fileEntries = state.displayEntries.filter((e) => e.type === "file-item");
  lines.push(`    file items shown: ${fileEntries.length}`);
  const groupEntries = state.displayEntries.filter((e) => e.type === "group-header");
  for (const g of groupEntries) {
    lines.push(`    group "${g.label}": count=${g.count}, collapsed=${g.collapsed}`);
  }
  lines.push("");
}
__name(appendWidgetState, "appendWidgetState");
async function appendSourceFolders(lines, promptsService, promptType) {
  lines.push("--- Source Folders (creation targets) ---");
  const sourceFolders = await promptsService.getSourceFolders(promptType);
  for (const sf of sourceFolders) {
    lines.push(`  [${sf.storage}] ${sf.uri.fsPath}`);
  }
  try {
    const resolvedFolders = await promptsService.getResolvedSourceFolders(promptType);
    lines.push("");
    lines.push("--- Resolved Source Folders (discovery order) ---");
    for (const rf of resolvedFolders) {
      lines.push(`  [${rf.storage}] ${rf.uri.fsPath} (source=${rf.source})`);
    }
  } catch {
  }
}
__name(appendSourceFolders, "appendSourceFolders");
function appendFileList(lines, files) {
  for (const f of files) {
    lines.push(`    ${f.uri.fsPath}`);
  }
}
__name(appendFileList, "appendFileList");
export {
  generateCustomizationDebugReport
};
//# sourceMappingURL=aiCustomizationDebugPanel.js.map
