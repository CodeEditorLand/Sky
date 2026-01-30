var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename, dirname } from "../../../../../../base/common/path.js";
import { PromptsType } from "../promptTypes.js";
import { PromptsStorage } from "../service/promptsService.js";
const PROMPT_FILE_EXTENSION = ".prompt.md";
const INSTRUCTION_FILE_EXTENSION = ".instructions.md";
const LEGACY_MODE_FILE_EXTENSION = ".chatmode.md";
const AGENT_FILE_EXTENSION = ".agent.md";
const SKILL_FILENAME = "SKILL.md";
const COPILOT_CUSTOM_INSTRUCTIONS_FILENAME = "copilot-instructions.md";
const PROMPT_DEFAULT_SOURCE_FOLDER = ".github/prompts";
const INSTRUCTIONS_DEFAULT_SOURCE_FOLDER = ".github/instructions";
const LEGACY_MODE_DEFAULT_SOURCE_FOLDER = ".github/chatmodes";
const AGENTS_SOURCE_FOLDER = ".github/agents";
var PromptFileSource;
(function(PromptFileSource2) {
  PromptFileSource2["GitHubWorkspace"] = "github-workspace";
  PromptFileSource2["CopilotPersonal"] = "copilot-personal";
  PromptFileSource2["ClaudePersonal"] = "claude-personal";
  PromptFileSource2["ClaudeWorkspace"] = "claude-workspace";
  PromptFileSource2["ConfigWorkspace"] = "config-workspace";
  PromptFileSource2["ConfigPersonal"] = "config-personal";
  PromptFileSource2["ExtensionContribution"] = "extension-contribution";
  PromptFileSource2["ExtensionAPI"] = "extension-api";
})(PromptFileSource || (PromptFileSource = {}));
const DEFAULT_SKILL_SOURCE_FOLDERS = [
  { path: ".github/skills", source: PromptFileSource.GitHubWorkspace, storage: PromptsStorage.local },
  { path: ".claude/skills", source: PromptFileSource.ClaudeWorkspace, storage: PromptsStorage.local },
  { path: "~/.copilot/skills", source: PromptFileSource.CopilotPersonal, storage: PromptsStorage.user },
  { path: "~/.claude/skills", source: PromptFileSource.ClaudePersonal, storage: PromptsStorage.user }
];
const DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS = [
  { path: INSTRUCTIONS_DEFAULT_SOURCE_FOLDER, source: PromptFileSource.GitHubWorkspace, storage: PromptsStorage.local }
];
const DEFAULT_PROMPT_SOURCE_FOLDERS = [
  { path: PROMPT_DEFAULT_SOURCE_FOLDER, source: PromptFileSource.GitHubWorkspace, storage: PromptsStorage.local }
];
const DEFAULT_AGENT_SOURCE_FOLDERS = [
  { path: AGENTS_SOURCE_FOLDER, source: PromptFileSource.GitHubWorkspace, storage: PromptsStorage.local }
];
function isInAgentsFolder(fileUri) {
  const dir = dirname(fileUri.path);
  return dir.endsWith("/" + AGENTS_SOURCE_FOLDER) || dir === AGENTS_SOURCE_FOLDER;
}
__name(isInAgentsFolder, "isInAgentsFolder");
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
  if (filename.endsWith(".md") && isInAgentsFolder(fileUri)) {
    return PromptsType.agent;
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
  if (fileName.endsWith(".md") && isInAgentsFolder(fileUri)) {
    return basename(fileUri.path, ".md");
  }
  return basename(fileUri.path);
}
__name(getCleanPromptName, "getCleanPromptName");
export {
  AGENTS_SOURCE_FOLDER,
  AGENT_FILE_EXTENSION,
  COPILOT_CUSTOM_INSTRUCTIONS_FILENAME,
  DEFAULT_AGENT_SOURCE_FOLDERS,
  DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS,
  DEFAULT_PROMPT_SOURCE_FOLDERS,
  DEFAULT_SKILL_SOURCE_FOLDERS,
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
  isPromptOrInstructionsFile
};
//# sourceMappingURL=promptFileLocations.js.map
