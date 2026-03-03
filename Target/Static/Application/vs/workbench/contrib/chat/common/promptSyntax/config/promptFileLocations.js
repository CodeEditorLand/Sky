var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { posix } from "../../../../../../base/common/path.js";
import { PromptsType } from "../promptTypes.js";
import { PromptsStorage } from "../service/promptsService.js";
const { basename, dirname } = posix;
const PROMPT_FILE_EXTENSION = ".prompt.md";
const INSTRUCTION_FILE_EXTENSION = ".instructions.md";
const LEGACY_MODE_FILE_EXTENSION = ".chatmode.md";
const AGENT_FILE_EXTENSION = ".agent.md";
const SKILL_FILENAME = "SKILL.md";
const AGENT_MD_FILENAME = "AGENTS.md";
const CLAUDE_MD_FILENAME = "CLAUDE.md";
const CLAUDE_LOCAL_MD_FILENAME = "CLAUDE.local.md";
const CLAUDE_CONFIG_FOLDER = ".claude";
const COPILOT_CUSTOM_INSTRUCTIONS_FILENAME = "copilot-instructions.md";
const PROMPT_DEFAULT_SOURCE_FOLDER = ".github/prompts";
const INSTRUCTIONS_DEFAULT_SOURCE_FOLDER = ".github/instructions";
const LEGACY_MODE_DEFAULT_SOURCE_FOLDER = ".github/chatmodes";
const AGENTS_SOURCE_FOLDER = ".github/agents";
const CLAUDE_AGENTS_SOURCE_FOLDER = ".claude/agents";
const CLAUDE_RULES_SOURCE_FOLDER = ".claude/rules";
const HOOKS_SOURCE_FOLDER = ".github/hooks";
var PromptFileSource;
(function(PromptFileSource2) {
  PromptFileSource2["GitHubWorkspace"] = "github-workspace";
  PromptFileSource2["CopilotPersonal"] = "copilot-personal";
  PromptFileSource2["ClaudePersonal"] = "claude-personal";
  PromptFileSource2["ClaudeWorkspace"] = "claude-workspace";
  PromptFileSource2["ClaudeWorkspaceLocal"] = "claude-workspace-local";
  PromptFileSource2["AgentsWorkspace"] = "agents-workspace";
  PromptFileSource2["AgentsPersonal"] = "agents-personal";
  PromptFileSource2["ConfigWorkspace"] = "config-workspace";
  PromptFileSource2["ConfigPersonal"] = "config-personal";
  PromptFileSource2["ExtensionContribution"] = "extension-contribution";
  PromptFileSource2["ExtensionAPI"] = "extension-api";
  PromptFileSource2["Plugin"] = "plugin";
})(PromptFileSource || (PromptFileSource = {}));
const DEFAULT_SKILL_SOURCE_FOLDERS = [
  { path: ".github/skills", source: PromptFileSource.GitHubWorkspace, storage: PromptsStorage.local },
  { path: ".agents/skills", source: PromptFileSource.AgentsWorkspace, storage: PromptsStorage.local },
  { path: ".claude/skills", source: PromptFileSource.ClaudeWorkspace, storage: PromptsStorage.local },
  { path: "~/.copilot/skills", source: PromptFileSource.CopilotPersonal, storage: PromptsStorage.user },
  { path: "~/.agents/skills", source: PromptFileSource.AgentsPersonal, storage: PromptsStorage.user },
  { path: "~/.claude/skills", source: PromptFileSource.ClaudePersonal, storage: PromptsStorage.user }
];
const DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS = [
  { path: INSTRUCTIONS_DEFAULT_SOURCE_FOLDER, source: PromptFileSource.GitHubWorkspace, storage: PromptsStorage.local },
  { path: CLAUDE_RULES_SOURCE_FOLDER, source: PromptFileSource.ClaudeWorkspace, storage: PromptsStorage.local },
  { path: "~/.copilot/instructions", source: PromptFileSource.CopilotPersonal, storage: PromptsStorage.user },
  { path: "~/" + CLAUDE_RULES_SOURCE_FOLDER, source: PromptFileSource.ClaudePersonal, storage: PromptsStorage.user }
];
const DEFAULT_PROMPT_SOURCE_FOLDERS = [
  { path: PROMPT_DEFAULT_SOURCE_FOLDER, source: PromptFileSource.GitHubWorkspace, storage: PromptsStorage.local }
];
const DEFAULT_AGENT_SOURCE_FOLDERS = [
  { path: AGENTS_SOURCE_FOLDER, source: PromptFileSource.GitHubWorkspace, storage: PromptsStorage.local },
  { path: CLAUDE_AGENTS_SOURCE_FOLDER, source: PromptFileSource.ClaudeWorkspace, storage: PromptsStorage.local },
  { path: "~/" + CLAUDE_AGENTS_SOURCE_FOLDER, source: PromptFileSource.ClaudePersonal, storage: PromptsStorage.user }
];
const DEFAULT_HOOK_FILE_PATHS = [
  { path: ".github/hooks", source: PromptFileSource.GitHubWorkspace, storage: PromptsStorage.local },
  { path: ".claude/settings.local.json", source: PromptFileSource.ClaudeWorkspaceLocal, storage: PromptsStorage.local },
  { path: ".claude/settings.json", source: PromptFileSource.ClaudeWorkspace, storage: PromptsStorage.local },
  { path: "~/.claude/settings.json", source: PromptFileSource.ClaudePersonal, storage: PromptsStorage.user }
];
function isInAgentsFolder(fileUri) {
  const dir = dirname(fileUri.path);
  return dir.endsWith("/" + AGENTS_SOURCE_FOLDER) || dir.endsWith("/" + CLAUDE_AGENTS_SOURCE_FOLDER);
}
__name(isInAgentsFolder, "isInAgentsFolder");
function isInClaudeAgentsFolder(fileUri) {
  const dir = dirname(fileUri.path);
  return dir.endsWith("/" + CLAUDE_AGENTS_SOURCE_FOLDER);
}
__name(isInClaudeAgentsFolder, "isInClaudeAgentsFolder");
function isInClaudeRulesFolder(fileUri) {
  const path = fileUri.path;
  return path.includes("/" + CLAUDE_RULES_SOURCE_FOLDER + "/");
}
__name(isInClaudeRulesFolder, "isInClaudeRulesFolder");
function getPromptFileType(fileUri) {
  const filename = basename(fileUri.path);
  if (filename.endsWith(PROMPT_FILE_EXTENSION)) {
    return PromptsType.prompt;
  }
  if (filename.endsWith(INSTRUCTION_FILE_EXTENSION) || filename === COPILOT_CUSTOM_INSTRUCTIONS_FILENAME) {
    return PromptsType.instructions;
  }
  if (filename.endsWith(LEGACY_MODE_FILE_EXTENSION) || filename.endsWith(AGENT_FILE_EXTENSION)) {
    return PromptsType.agent;
  }
  if (filename.toLowerCase() === SKILL_FILENAME.toLowerCase()) {
    return PromptsType.skill;
  }
  if (filename.endsWith(".md") && filename !== "README.md" && isInAgentsFolder(fileUri)) {
    return PromptsType.agent;
  }
  if (filename.endsWith(".md") && filename !== "README.md" && isInClaudeRulesFolder(fileUri)) {
    return PromptsType.instructions;
  }
  if (filename.toLowerCase().endsWith(".json")) {
    return PromptsType.hook;
  }
  return void 0;
}
__name(getPromptFileType, "getPromptFileType");
function isPromptOrInstructionsFile(fileUri) {
  return getPromptFileType(fileUri) !== void 0;
}
__name(isPromptOrInstructionsFile, "isPromptOrInstructionsFile");
function getPromptFileExtension(type) {
  switch (type) {
    case PromptsType.instructions:
      return INSTRUCTION_FILE_EXTENSION;
    case PromptsType.prompt:
      return PROMPT_FILE_EXTENSION;
    case PromptsType.agent:
      return AGENT_FILE_EXTENSION;
    case PromptsType.skill:
      return SKILL_FILENAME;
    case PromptsType.hook:
      return ".json";
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getPromptFileExtension, "getPromptFileExtension");
function getPromptFileDefaultLocations(type) {
  switch (type) {
    case PromptsType.instructions:
      return DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS;
    case PromptsType.prompt:
      return DEFAULT_PROMPT_SOURCE_FOLDERS;
    case PromptsType.agent:
      return DEFAULT_AGENT_SOURCE_FOLDERS;
    case PromptsType.skill:
      return DEFAULT_SKILL_SOURCE_FOLDERS;
    case PromptsType.hook:
      return DEFAULT_HOOK_FILE_PATHS;
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getPromptFileDefaultLocations, "getPromptFileDefaultLocations");
function getCleanPromptName(fileUri) {
  const fileName = basename(fileUri.path);
  const extensions = [
    PROMPT_FILE_EXTENSION,
    INSTRUCTION_FILE_EXTENSION,
    LEGACY_MODE_FILE_EXTENSION,
    AGENT_FILE_EXTENSION
  ];
  for (const ext of extensions) {
    if (fileName.endsWith(ext)) {
      return basename(fileUri.path, ext);
    }
  }
  if (fileName === COPILOT_CUSTOM_INSTRUCTIONS_FILENAME) {
    return basename(fileUri.path, ".md");
  }
  if (fileName.toLowerCase() === SKILL_FILENAME.toLowerCase()) {
    return basename(fileUri.path, ".md");
  }
  if (fileName.endsWith(".md") && fileName !== "README.md" && isInAgentsFolder(fileUri)) {
    return basename(fileUri.path, ".md");
  }
  if (fileName.endsWith(".md") && fileName !== "README.md" && isInClaudeRulesFolder(fileUri)) {
    return basename(fileUri.path, ".md");
  }
  return basename(fileUri.path);
}
__name(getCleanPromptName, "getCleanPromptName");
export {
  AGENTS_SOURCE_FOLDER,
  AGENT_FILE_EXTENSION,
  AGENT_MD_FILENAME,
  CLAUDE_AGENTS_SOURCE_FOLDER,
  CLAUDE_CONFIG_FOLDER,
  CLAUDE_LOCAL_MD_FILENAME,
  CLAUDE_MD_FILENAME,
  CLAUDE_RULES_SOURCE_FOLDER,
  COPILOT_CUSTOM_INSTRUCTIONS_FILENAME,
  DEFAULT_AGENT_SOURCE_FOLDERS,
  DEFAULT_HOOK_FILE_PATHS,
  DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS,
  DEFAULT_PROMPT_SOURCE_FOLDERS,
  DEFAULT_SKILL_SOURCE_FOLDERS,
  HOOKS_SOURCE_FOLDER,
  INSTRUCTIONS_DEFAULT_SOURCE_FOLDER,
  INSTRUCTION_FILE_EXTENSION,
  LEGACY_MODE_DEFAULT_SOURCE_FOLDER,
  LEGACY_MODE_FILE_EXTENSION,
  PROMPT_DEFAULT_SOURCE_FOLDER,
  PROMPT_FILE_EXTENSION,
  PromptFileSource,
  SKILL_FILENAME,
  getCleanPromptName,
  getPromptFileDefaultLocations,
  getPromptFileExtension,
  getPromptFileType,
  isInClaudeAgentsFolder,
  isInClaudeRulesFolder,
  isPromptOrInstructionsFile
};
//# sourceMappingURL=promptFileLocations.js.map
