var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Schemas } from "../../../../../base/common/network.js";
import { localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IPromptsService } from "../../common/promptSyntax/service/promptsService.js";
import { PromptsConfig } from "../../common/promptSyntax/config/config.js";
import { PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { basename, dirname, relativePath } from "../../../../../base/common/resources.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import * as nls from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { COPILOT_CUSTOM_INSTRUCTIONS_FILENAME } from "../../common/promptSyntax/config/promptFileLocations.js";
import { IUntitledTextEditorService } from "../../../../services/untitled/common/untitledTextEditorService.js";
import { CHAT_CATEGORY, CHAT_CONFIG_MENU_ID } from "./chatActions.js";
import { ChatViewId } from "../chat.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
function encodePathForMarkdown(path) {
  return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}
__name(encodePathForMarkdown, "encodePathForMarkdown");
function getRelativePath(uri, workspaceFolders) {
  const normalizedUri = uri.scheme === Schemas.vscodeUserData ? uri.with({ scheme: Schemas.file }) : uri;
  for (const folder of workspaceFolders) {
    const relative = relativePath(folder.uri, normalizedUri);
    if (relative) {
      return encodePathForMarkdown(relative);
    }
  }
  return encodePathForMarkdown(normalizedUri.fsPath.replace(/\\/g, "/"));
}
__name(getRelativePath, "getRelativePath");
const TREE_BRANCH = "\u251C\u2500";
const TREE_END = "\u2514\u2500";
const ICON_ERROR = "\u274C";
const ICON_WARN = "\u26A0\uFE0F";
function registerChatCustomizationDiagnosticsAction() {
  registerAction2(class DiagnosticsAction extends Action2 {
    static {
      __name(this, "DiagnosticsAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.diagnostics",
        title: localize2("chat.diagnostics.label", "Diagnostics"),
        f1: false,
        category: CHAT_CATEGORY,
        menu: [{
          id: MenuId.ChatContext,
          group: "z_clear",
          order: -1
        }, {
          id: CHAT_CONFIG_MENU_ID,
          when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId)),
          order: 14,
          group: "3_configure"
        }, {
          id: MenuId.ChatWelcomeContext,
          group: "2_settings",
          order: 0,
          when: ChatContextKeys.inChatEditor.negate()
        }]
      });
    }
    async run(accessor) {
      const promptsService = accessor.get(IPromptsService);
      const configurationService = accessor.get(IConfigurationService);
      const fileService = accessor.get(IFileService);
      const untitledTextEditorService = accessor.get(IUntitledTextEditorService);
      const commandService = accessor.get(ICommandService);
      const workspaceContextService = accessor.get(IWorkspaceContextService);
      const token = CancellationToken.None;
      const workspaceFolders = workspaceContextService.getWorkspace().folders;
      const statusInfos = [];
      const agentsStatus = await collectAgentsStatus(promptsService, fileService, token);
      statusInfos.push(agentsStatus);
      const instructionsStatus = await collectInstructionsStatus(promptsService, fileService, token);
      statusInfos.push(instructionsStatus);
      const promptsStatus = await collectPromptsStatus(promptsService, fileService, token);
      statusInfos.push(promptsStatus);
      const skillsStatus = await collectSkillsStatus(promptsService, configurationService, fileService, token);
      statusInfos.push(skillsStatus);
      const specialFilesStatus = await collectSpecialFilesStatus(promptsService, configurationService, token);
      const output = formatStatusOutput(statusInfos, specialFilesStatus, workspaceFolders);
      const untitledModel = untitledTextEditorService.create({
        initialValue: output,
        languageId: "markdown"
      });
      await commandService.executeCommand("vscode.open", untitledModel.resource);
    }
  });
}
__name(registerChatCustomizationDiagnosticsAction, "registerChatCustomizationDiagnosticsAction");
async function collectAgentsStatus(promptsService, fileService, token) {
  const type = PromptsType.agent;
  const enabled = true;
  const resolvedFolders = await promptsService.getResolvedSourceFolders(type);
  const paths = await convertResolvedFoldersToPathInfo(resolvedFolders, fileService);
  const discoveryInfo = await promptsService.getPromptDiscoveryInfo(type, token);
  const files = discoveryInfo.files.map(convertDiscoveryResultToFileStatus);
  return { type, paths, files, enabled };
}
__name(collectAgentsStatus, "collectAgentsStatus");
async function collectInstructionsStatus(promptsService, fileService, token) {
  const type = PromptsType.instructions;
  const enabled = true;
  const resolvedFolders = await promptsService.getResolvedSourceFolders(type);
  const paths = await convertResolvedFoldersToPathInfo(resolvedFolders, fileService);
  const discoveryInfo = await promptsService.getPromptDiscoveryInfo(type, token);
  const files = discoveryInfo.files.filter((f) => basename(f.uri) !== COPILOT_CUSTOM_INSTRUCTIONS_FILENAME).map(convertDiscoveryResultToFileStatus);
  return { type, paths, files, enabled };
}
__name(collectInstructionsStatus, "collectInstructionsStatus");
async function collectPromptsStatus(promptsService, fileService, token) {
  const type = PromptsType.prompt;
  const enabled = true;
  const resolvedFolders = await promptsService.getResolvedSourceFolders(type);
  const paths = await convertResolvedFoldersToPathInfo(resolvedFolders, fileService);
  const discoveryInfo = await promptsService.getPromptDiscoveryInfo(type, token);
  const files = discoveryInfo.files.map(convertDiscoveryResultToFileStatus);
  return { type, paths, files, enabled };
}
__name(collectPromptsStatus, "collectPromptsStatus");
async function collectSkillsStatus(promptsService, configurationService, fileService, token) {
  const type = PromptsType.skill;
  const enabled = configurationService.getValue(PromptsConfig.USE_AGENT_SKILLS) ?? false;
  const resolvedFolders = await promptsService.getResolvedSourceFolders(type);
  const paths = await convertResolvedFoldersToPathInfo(resolvedFolders, fileService);
  const discoveryInfo = await promptsService.getPromptDiscoveryInfo(type, token);
  const files = discoveryInfo.files.map(convertDiscoveryResultToFileStatus);
  return { type, paths, files, enabled };
}
__name(collectSkillsStatus, "collectSkillsStatus");
async function collectSpecialFilesStatus(promptsService, configurationService, token) {
  const useAgentMd = configurationService.getValue(PromptsConfig.USE_AGENT_MD) ?? false;
  let agentMdFiles = [];
  if (useAgentMd) {
    agentMdFiles = await promptsService.listAgentMDs(token, false);
  }
  const useCopilotInstructions = configurationService.getValue(PromptsConfig.USE_COPILOT_INSTRUCTION_FILES) ?? false;
  let copilotInstructionsFiles = [];
  if (useCopilotInstructions) {
    copilotInstructionsFiles = await promptsService.listCopilotInstructionsMDs(token);
  }
  return {
    agentsMd: { enabled: useAgentMd, files: agentMdFiles },
    copilotInstructions: { enabled: useCopilotInstructions, files: copilotInstructionsFiles }
  };
}
__name(collectSpecialFilesStatus, "collectSpecialFilesStatus");
async function checkDirectoryExists(fileService, uri) {
  try {
    const stat = await fileService.stat(uri);
    return stat.isDirectory;
  } catch {
    return false;
  }
}
__name(checkDirectoryExists, "checkDirectoryExists");
async function convertResolvedFoldersToPathInfo(resolvedFolders, fileService) {
  const paths = [];
  let scanOrder = 1;
  for (const folder of resolvedFolders) {
    const exists = await checkDirectoryExists(fileService, folder.uri);
    paths.push({
      uri: folder.uri,
      exists,
      storage: folder.storage,
      scanOrder: scanOrder++,
      displayPath: folder.displayPath ?? folder.uri.path,
      isDefault: folder.isDefault ?? false
    });
  }
  return paths;
}
__name(convertResolvedFoldersToPathInfo, "convertResolvedFoldersToPathInfo");
function getSkipReasonMessage(skipReason, errorMessage) {
  switch (skipReason) {
    case "missing-name":
      return nls.localize("status.missingName", "Missing name attribute");
    case "missing-description":
      return nls.localize("status.skillMissingDescription", "Missing description attribute");
    case "name-mismatch":
      return errorMessage ?? nls.localize("status.skillNameMismatch2", "Name does not match folder");
    case "duplicate-name":
      return nls.localize("status.overwrittenByHigherPriority", "Overwritten by higher priority file");
    case "parse-error":
      return errorMessage ?? nls.localize("status.parseError", "Parse error");
    case "disabled":
      return nls.localize("status.typeDisabled", "Disabled");
    default:
      return errorMessage ?? nls.localize("status.unknownError", "Unknown error");
  }
}
__name(getSkipReasonMessage, "getSkipReasonMessage");
function convertDiscoveryResultToFileStatus(result) {
  if (result.status === "loaded") {
    return {
      uri: result.uri,
      status: "loaded",
      name: result.name,
      storage: result.storage,
      extensionId: result.extensionId
    };
  }
  if (result.skipReason === "duplicate-name" && result.duplicateOf) {
    return {
      uri: result.uri,
      status: "overwritten",
      name: result.name,
      storage: result.storage,
      overwrittenBy: result.name,
      extensionId: result.extensionId
    };
  }
  return {
    uri: result.uri,
    status: "skipped",
    name: result.name,
    reason: getSkipReasonMessage(result.skipReason, result.errorMessage),
    storage: result.storage,
    extensionId: result.extensionId
  };
}
__name(convertDiscoveryResultToFileStatus, "convertDiscoveryResultToFileStatus");
function formatStatusOutput(statusInfos, specialFiles, workspaceFolders) {
  const lines = [];
  lines.push(`## ${nls.localize("status.title", "Chat Customization Diagnostics")}`);
  lines.push(`*${nls.localize("status.sensitiveWarning", "WARNING: This file may contain sensitive information.")}*`);
  lines.push("");
  for (const info of statusInfos) {
    const typeName = getTypeName(info.type);
    if (info.type === PromptsType.skill && !info.enabled) {
      lines.push(`**${typeName}**`);
      lines.push(`*${nls.localize("status.skillsDisabled", "Skills are disabled. Enable them by setting `chat.useAgentSkills` to `true` in your settings.")}*`);
      lines.push("");
      continue;
    }
    const enabledStatus = info.enabled ? "" : ` *(${nls.localize("status.disabled", "disabled")})*`;
    let loadedCount = info.files.filter((f) => f.status === "loaded").length;
    const skippedCount = info.files.filter((f) => f.status === "skipped" || f.status === "overwritten").length;
    if (info.type === PromptsType.instructions) {
      if (specialFiles.agentsMd.enabled) {
        loadedCount += specialFiles.agentsMd.files.length;
      }
      if (specialFiles.copilotInstructions.enabled) {
        loadedCount += specialFiles.copilotInstructions.files.length;
      }
    }
    lines.push(`**${typeName}**${enabledStatus}<br>`);
    const statsParts = [];
    if (loadedCount > 0) {
      if (info.type === PromptsType.skill) {
        statsParts.push(loadedCount === 1 ? nls.localize("status.skillLoaded", "1 skill loaded") : nls.localize("status.skillsLoaded", "{0} skills loaded", loadedCount));
      } else {
        statsParts.push(loadedCount === 1 ? nls.localize("status.fileLoaded", "1 file loaded") : nls.localize("status.filesLoaded", "{0} files loaded", loadedCount));
      }
    }
    if (skippedCount > 0) {
      statsParts.push(nls.localize("status.skippedCount", "{0} skipped", skippedCount));
    }
    if (statsParts.length > 0) {
      lines.push(`*${statsParts.join(", ")}*`);
    }
    lines.push("");
    const allPaths = info.paths;
    const allFiles = info.files;
    const filesByPath = /* @__PURE__ */ new Map();
    const unmatchedFiles = [];
    for (const file of allFiles) {
      let matched = false;
      for (const path of allPaths) {
        if (isFileUnderPath(file.uri, path.uri)) {
          const key = path.uri.toString();
          if (!filesByPath.has(key)) {
            filesByPath.set(key, []);
          }
          filesByPath.get(key).push(file);
          matched = true;
          break;
        }
      }
      if (!matched) {
        unmatchedFiles.push(file);
      }
    }
    let hasContent = false;
    for (const path of allPaths) {
      const pathFiles = filesByPath.get(path.uri.toString()) || [];
      if (path.exists) {
        lines.push(`${path.displayPath}<br>`);
      } else if (path.isDefault) {
        lines.push(`${path.displayPath}<br>`);
      } else {
        lines.push(`${ICON_ERROR} ${path.displayPath} - *${nls.localize("status.folderNotFound", "Folder does not exist")}*<br>`);
      }
      if (path.exists && pathFiles.length > 0) {
        for (let i = 0; i < pathFiles.length; i++) {
          const file = pathFiles[i];
          let fileName;
          if (info.type === PromptsType.skill) {
            fileName = file.name || `${basename(dirname(file.uri))}`;
          } else {
            fileName = basename(file.uri);
          }
          const isLast = i === pathFiles.length - 1;
          const prefix = isLast ? TREE_END : TREE_BRANCH;
          const filePath = getRelativePath(file.uri, workspaceFolders);
          if (file.status === "loaded") {
            lines.push(`${prefix} [\`${fileName}\`](${filePath})<br>`);
          } else if (file.status === "overwritten") {
            lines.push(`${prefix} ${ICON_WARN} [\`${fileName}\`](${filePath}) - *${nls.localize("status.overwrittenByHigherPriority", "Overwritten by higher priority file")}*<br>`);
          } else {
            lines.push(`${prefix} ${ICON_ERROR} [\`${fileName}\`](${filePath}) - *${file.reason}*<br>`);
          }
        }
      }
      hasContent = true;
    }
    if (unmatchedFiles.length > 0) {
      const filesByExtension = /* @__PURE__ */ new Map();
      for (const file of unmatchedFiles) {
        const extId = file.extensionId || "unknown";
        if (!filesByExtension.has(extId)) {
          filesByExtension.set(extId, []);
        }
        filesByExtension.get(extId).push(file);
      }
      for (const [extId, extFiles] of filesByExtension) {
        lines.push(`${nls.localize("status.extension", "Extension")}: ${extId}<br>`);
        for (let i = 0; i < extFiles.length; i++) {
          const file = extFiles[i];
          let fileName;
          if (info.type === PromptsType.skill) {
            fileName = file.name || `${basename(dirname(file.uri))}`;
          } else {
            fileName = basename(file.uri);
          }
          const isLast = i === extFiles.length - 1;
          const prefix = isLast ? TREE_END : TREE_BRANCH;
          const filePath = getRelativePath(file.uri, workspaceFolders);
          if (file.status === "loaded") {
            lines.push(`${prefix} [\`${fileName}\`](${filePath})<br>`);
          } else if (file.status === "overwritten") {
            lines.push(`${prefix} ${ICON_WARN} [\`${fileName}\`](${filePath}) - *${nls.localize("status.overwrittenByHigherPriority", "Overwritten by higher priority file")}*<br>`);
          } else {
            lines.push(`${prefix} ${ICON_ERROR} [\`${fileName}\`](${filePath}) - *${file.reason}*<br>`);
          }
        }
      }
      hasContent = true;
    }
    if (info.type === PromptsType.instructions) {
      if (specialFiles.agentsMd.enabled && specialFiles.agentsMd.files.length > 0) {
        lines.push(`AGENTS.md<br>`);
        for (let i = 0; i < specialFiles.agentsMd.files.length; i++) {
          const file = specialFiles.agentsMd.files[i];
          const fileName = basename(file);
          const isLast = i === specialFiles.agentsMd.files.length - 1;
          const prefix = isLast ? TREE_END : TREE_BRANCH;
          const filePath = getRelativePath(file, workspaceFolders);
          lines.push(`${prefix} [\`${fileName}\`](${filePath})<br>`);
        }
        hasContent = true;
      } else if (!specialFiles.agentsMd.enabled) {
        lines.push(`AGENTS.md -<br>`);
        hasContent = true;
      }
      if (specialFiles.copilotInstructions.enabled && specialFiles.copilotInstructions.files.length > 0) {
        lines.push(`${COPILOT_CUSTOM_INSTRUCTIONS_FILENAME}<br>`);
        for (let i = 0; i < specialFiles.copilotInstructions.files.length; i++) {
          const file = specialFiles.copilotInstructions.files[i];
          const fileName = basename(file);
          const isLast = i === specialFiles.copilotInstructions.files.length - 1;
          const prefix = isLast ? TREE_END : TREE_BRANCH;
          const filePath = getRelativePath(file, workspaceFolders);
          lines.push(`${prefix} [\`${fileName}\`](${filePath})<br>`);
        }
        hasContent = true;
      } else if (!specialFiles.copilotInstructions.enabled) {
        lines.push(`${COPILOT_CUSTOM_INSTRUCTIONS_FILENAME} -<br>`);
        hasContent = true;
      }
    }
    if (!hasContent && info.enabled) {
      lines.push(`*${nls.localize("status.noFilesLoaded", "No files loaded")}*`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
__name(formatStatusOutput, "formatStatusOutput");
function isFileUnderPath(fileUri, pathUri) {
  const filePath = fileUri.toString();
  const folderPath = pathUri.toString();
  return filePath.startsWith(folderPath + "/") || filePath.startsWith(folderPath + "\\");
}
__name(isFileUnderPath, "isFileUnderPath");
function getTypeName(type) {
  switch (type) {
    case PromptsType.agent:
      return nls.localize("status.type.agents", "Custom Agents");
    case PromptsType.instructions:
      return nls.localize("status.type.instructions", "Instructions");
    case PromptsType.prompt:
      return nls.localize("status.type.prompts", "Prompt Files");
    case PromptsType.skill:
      return nls.localize("status.type.skills", "Skills");
    default:
      return type;
  }
}
__name(getTypeName, "getTypeName");
export {
  formatStatusOutput,
  registerChatCustomizationDiagnosticsAction
};
//# sourceMappingURL=chatCustomizationDiagnosticsAction.js.map
