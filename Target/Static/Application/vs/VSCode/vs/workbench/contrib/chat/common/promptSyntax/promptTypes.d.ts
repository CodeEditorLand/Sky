import { LanguageSelector } from '../../../../../editor/common/languageSelector.js';
/**
 * Documentation link for the reusable prompts feature.
 */
export declare const PROMPT_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-prompt-snippets";
export declare const INSTRUCTIONS_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-custom-instructions";
export declare const AGENT_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-custom-chat-modes";
export declare const SKILL_DOCUMENTATION_URL = "https://aka.ms/vscode-agent-skills";
export declare const HOOK_DOCUMENTATION_URL = "https://aka.ms/vscode-chat-hooks";
/**
 * Language ID for the reusable prompt syntax.
 */
export declare const PROMPT_LANGUAGE_ID = "prompt";
/**
 * Language ID for instructions syntax.
 */
export declare const INSTRUCTIONS_LANGUAGE_ID = "instructions";
/**
 * Language ID for agent syntax.
 */
export declare const AGENT_LANGUAGE_ID = "chatagent";
/**
 * Language ID for skill syntax.
 */
export declare const SKILL_LANGUAGE_ID = "skill";
/**
 * Prompt and instructions files language selector.
 */
export declare const ALL_PROMPTS_LANGUAGE_SELECTOR: LanguageSelector;
/**
 * The language id for a prompts type.
 */
export declare function getLanguageIdForPromptsType(type: PromptsType): string;
export declare function getPromptsTypeForLanguageId(languageId: string): PromptsType | undefined;
/**
 * What the prompt is used for.
 */
export declare enum PromptsType {
    instructions = "instructions",
    prompt = "prompt",
    agent = "agent",
    skill = "skill",
    hook = "hook"
}
export declare function isValidPromptType(type: string): type is PromptsType;
export declare enum Target {
    VSCode = "vscode",
    GitHubCopilot = "github-copilot",
    Claude = "claude",
    Undefined = "undefined"
}
