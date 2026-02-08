import { IJSONSchema } from '../../../../../base/common/jsonSchema.js';
import { URI } from '../../../../../base/common/uri.js';
/**
 * Enum of available hook types that can be configured in hooks.json
 */
export declare enum HookType {
    SessionStart = "sessionStart",
    UserPromptSubmitted = "userPromptSubmitted",
    PreToolUse = "preToolUse",
    PostToolUse = "postToolUse",
    PostToolUseFailure = "postToolUseFailure",
    SubagentStart = "subagentStart",
    SubagentStop = "subagentStop",
    Stop = "stop"
}
/**
 * String literal type derived from HookType enum values.
 */
export type HookTypeValue = `${HookType}`;
/**
 * Metadata for hook types including localized labels and descriptions
 */
export declare const HOOK_TYPES: readonly [{
    readonly id: HookType.SessionStart;
    readonly label: string;
    readonly description: string;
}, {
    readonly id: HookType.UserPromptSubmitted;
    readonly label: string;
    readonly description: string;
}, {
    readonly id: HookType.PreToolUse;
    readonly label: string;
    readonly description: string;
}, {
    readonly id: HookType.PostToolUse;
    readonly label: string;
    readonly description: string;
}, {
    readonly id: HookType.PostToolUseFailure;
    readonly label: string;
    readonly description: string;
}, {
    readonly id: HookType.SubagentStart;
    readonly label: string;
    readonly description: string;
}, {
    readonly id: HookType.SubagentStop;
    readonly label: string;
    readonly description: string;
}, {
    readonly id: HookType.Stop;
    readonly label: string;
    readonly description: string;
}];
/**
 * A single hook command configuration.
 */
export interface IHookCommand {
    readonly type: 'command';
    /** Cross-platform command to execute. */
    readonly command?: string;
    /** Bash-specific command. */
    readonly bash?: string;
    /** PowerShell-specific command. */
    readonly powershell?: string;
    /** Resolved working directory URI. */
    readonly cwd?: URI;
    readonly env?: Record<string, string>;
    readonly timeoutSec?: number;
}
/**
 * Collected hooks for a chat request, organized by hook type.
 * This is passed to the extension host so it knows what hooks are available.
 */
export interface IChatRequestHooks {
    readonly [HookType.SessionStart]?: readonly IHookCommand[];
    readonly [HookType.UserPromptSubmitted]?: readonly IHookCommand[];
    readonly [HookType.PreToolUse]?: readonly IHookCommand[];
    readonly [HookType.PostToolUse]?: readonly IHookCommand[];
    readonly [HookType.PostToolUseFailure]?: readonly IHookCommand[];
    readonly [HookType.SubagentStart]?: readonly IHookCommand[];
    readonly [HookType.SubagentStop]?: readonly IHookCommand[];
    readonly [HookType.Stop]?: readonly IHookCommand[];
}
export declare const hookFileSchema: IJSONSchema;
/**
 * URI for the hook schema registration.
 */
export declare const HOOK_SCHEMA_URI = "vscode://schemas/hooks";
/**
 * Glob pattern for hook files.
 */
export declare const HOOK_FILE_GLOB = "hooks/hooks.json";
/**
 * Normalizes a raw hook type identifier to the canonical HookType enum value.
 * Supports alternative casing and naming conventions from different tools:
 * - Claude Code: PreToolUse, PostToolUse, SessionStart, Stop, SubagentStart, SubagentStop, UserPromptSubmit
 * - GitHub Copilot: sessionStart, userPromptSubmitted, preToolUse, postToolUse, etc.
 *
 * @see https://docs.anthropic.com/en/docs/claude-code/hooks
 * @see https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks#types-of-hooks
 */
export declare function normalizeHookTypeId(rawHookTypeId: string): HookType | undefined;
/**
 * Formats a hook command for display.
 * If `command` is present, returns just that value.
 * Otherwise, joins "bash: <value>" and "powershell: <value>" with " | ".
 */
export declare function formatHookCommandLabel(hook: IHookCommand): string;
/**
 * Resolves a raw hook command object to the canonical IHookCommand format.
 * Normalizes the command and resolves the cwd path relative to the workspace root.
 * @param raw The raw hook command object from JSON
 * @param workspaceRootUri The workspace root URI to resolve relative cwd paths against
 * @param userHome The user's home directory path for tilde expansion
 */
export declare function resolveHookCommand(raw: Record<string, unknown>, workspaceRootUri: URI | undefined, userHome: string): IHookCommand | undefined;
