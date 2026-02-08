import { URI } from '../../../../../../base/common/uri.js';
import { PromptsType } from '../promptTypes.js';
import { PromptsStorage } from '../service/promptsService.js';
/**
 * File extension for the reusable prompt files.
 */
export declare const PROMPT_FILE_EXTENSION = ".prompt.md";
/**
 * File extension for the reusable instruction files.
 */
export declare const INSTRUCTION_FILE_EXTENSION = ".instructions.md";
/**
 * File extension for the modes files.
 */
export declare const LEGACY_MODE_FILE_EXTENSION = ".chatmode.md";
/**
 * File extension for the agent files.
 */
export declare const AGENT_FILE_EXTENSION = ".agent.md";
/**
 * Skill file name (case insensitive).
 */
export declare const SKILL_FILENAME = "SKILL.md";
/**
 * Default hook file name (case insensitive).
 */
export declare const HOOKS_FILENAME = "hooks.json";
/**
 * Copilot custom instructions file name.
 */
export declare const COPILOT_CUSTOM_INSTRUCTIONS_FILENAME = "copilot-instructions.md";
/**
 * Default reusable prompt files source folder.
 */
export declare const PROMPT_DEFAULT_SOURCE_FOLDER = ".github/prompts";
/**
 * Default reusable instructions files source folder.
 */
export declare const INSTRUCTIONS_DEFAULT_SOURCE_FOLDER = ".github/instructions";
/**
 * Default modes source folder.
 */
export declare const LEGACY_MODE_DEFAULT_SOURCE_FOLDER = ".github/chatmodes";
/**
 * Agents folder.
 */
export declare const AGENTS_SOURCE_FOLDER = ".github/agents";
/**
 * Hooks folder.
 */
export declare const HOOKS_SOURCE_FOLDER = ".github/hooks";
/**
 * Tracks where prompt files originate from.
 */
export declare enum PromptFileSource {
    GitHubWorkspace = "github-workspace",
    CopilotPersonal = "copilot-personal",
    ClaudePersonal = "claude-personal",
    ClaudeWorkspace = "claude-workspace",
    ClaudeWorkspaceLocal = "claude-workspace-local",
    AgentsWorkspace = "agents-workspace",
    AgentsPersonal = "agents-personal",
    ConfigWorkspace = "config-workspace",
    ConfigPersonal = "config-personal",
    ExtensionContribution = "extension-contribution",
    ExtensionAPI = "extension-api"
}
/**
 * Prompt source folder path with source and storage type.
 */
export interface IPromptSourceFolder {
    readonly path: string;
    readonly source: PromptFileSource;
    readonly storage: PromptsStorage;
}
/**
 * Resolved prompt folder with source and storage type.
 */
export interface IResolvedPromptSourceFolder {
    readonly uri: URI;
    readonly source: PromptFileSource;
    readonly storage: PromptsStorage;
    /**
     * The original path string before resolution (e.g., '~/.copilot/agents' or '.github/agents').
     * Used for display purposes.
     */
    readonly displayPath?: string;
    /**
     * Whether this is a default location (vs user-configured).
     */
    readonly isDefault?: boolean;
}
/**
 * Resolved prompt markdown file with source and storage type.
 */
export interface IResolvedPromptFile {
    readonly fileUri: URI;
    readonly source: PromptFileSource;
    readonly storage: PromptsStorage;
}
/**
 * All default skill source folders (both workspace and user home).
 */
export declare const DEFAULT_SKILL_SOURCE_FOLDERS: readonly IPromptSourceFolder[];
/**
 * Default instructions source folders.
 */
export declare const DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS: readonly IPromptSourceFolder[];
/**
 * Default prompt source folders.
 */
export declare const DEFAULT_PROMPT_SOURCE_FOLDERS: readonly IPromptSourceFolder[];
/**
 * Default agent source folders.
 */
export declare const DEFAULT_AGENT_SOURCE_FOLDERS: readonly IPromptSourceFolder[];
/**
 * Default hook file paths.
 */
export declare const DEFAULT_HOOK_FILE_PATHS: readonly IPromptSourceFolder[];
/**
 * Gets the prompt file type from the provided path.
 */
export declare function getPromptFileType(fileUri: URI): PromptsType | undefined;
/**
 * Check if provided URI points to a file that with prompt file extension.
 */
export declare function isPromptOrInstructionsFile(fileUri: URI): boolean;
export declare function getPromptFileExtension(type: PromptsType): string;
export declare function getPromptFileDefaultLocations(type: PromptsType): readonly IPromptSourceFolder[];
/**
 * Gets clean prompt name without file extension.
 */
export declare function getCleanPromptName(fileUri: URI): string;
