import { IJSONSchema } from '../../../../../base/common/jsonSchema.js';
import { URI } from '../../../../../base/common/uri.js';
import { OperatingSystem } from '../../../../../base/common/platform.js';
/**
 * Enum of available hook types that can be configured in hooks .json
 */
export declare enum HookType {
    SessionStart = "SessionStart",
    UserPromptSubmit = "UserPromptSubmit",
    PreToolUse = "PreToolUse",
    PostToolUse = "PostToolUse",
    PreCompact = "PreCompact",
    SubagentStart = "SubagentStart",
    SubagentStop = "SubagentStop",
    Stop = "Stop"
}
/**
 * Maps Copilot CLI hook type names to our abstract HookType.
 * Copilot CLI uses camelCase names.
 */
export declare const COPILOT_CLI_HOOK_TYPE_MAP: {
    readonly sessionStart: HookType.SessionStart;
    readonly userPromptSubmitted: HookType.UserPromptSubmit;
    readonly preToolUse: HookType.PreToolUse;
    readonly postToolUse: HookType.PostToolUse;
};
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
    readonly id: HookType.UserPromptSubmit;
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
    readonly id: HookType.PreCompact;
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
    /** Windows-specific command override. */
    readonly windows?: string;
    /** Linux-specific command override. */
    readonly linux?: string;
    /** macOS-specific command override. */
    readonly osx?: string;
    /** Resolved working directory URI. */
    readonly cwd?: URI;
    readonly env?: Record<string, string>;
    readonly timeout?: number;
    /** Original JSON field name that provided the windows command. */
    readonly windowsSource?: 'windows' | 'powershell';
    /** Original JSON field name that provided the linux command. */
    readonly linuxSource?: 'linux' | 'bash';
    /** Original JSON field name that provided the osx command. */
    readonly osxSource?: 'osx' | 'bash';
}
/**
 * Collected hooks for a chat request, organized by hook type.
 * This is passed to the extension host so it knows what hooks are available.
 */
export interface IChatRequestHooks {
    readonly [HookType.SessionStart]?: readonly IHookCommand[];
    readonly [HookType.UserPromptSubmit]?: readonly IHookCommand[];
    readonly [HookType.PreToolUse]?: readonly IHookCommand[];
    readonly [HookType.PostToolUse]?: readonly IHookCommand[];
    readonly [HookType.PreCompact]?: readonly IHookCommand[];
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
export declare const HOOK_FILE_GLOB = ".github/hooks/*.json";
/**
 * Normalizes a raw hook type identifier to the canonical HookType enum value.
 * Only matches exact enum values. For tool-specific naming conventions (e.g., Claude, Copilot CLI),
 * use the corresponding compat module's resolver function.
 */
export declare function toHookType(rawHookTypeId: string): HookType | undefined;
/**
 * Gets a label for the given platform.
 */
export declare function getPlatformLabel(os: OperatingSystem): string;
/**
 * Resolves the effective command for the given platform.
 * This applies OS-specific overrides (windows, linux, osx) to get the actual command that will be executed.
 * Similar to how launch.json handles platform-specific configurations in debugAdapter.ts.
 */
export declare function resolveEffectiveCommand(hook: IHookCommand, os: OperatingSystem): string | undefined;
/**
 * Checks if the hook is using a platform-specific command override.
 */
export declare function isUsingPlatformOverride(hook: IHookCommand, os: OperatingSystem): boolean;
/**
 * Gets the source shell type for the effective command on the given platform.
 * Returns 'powershell' if the Windows command came from a powershell field,
 * 'bash' if the Linux/macOS command came from a bash field,
 * or undefined for default shell handling.
 */
export declare function getEffectiveCommandSource(hook: IHookCommand, os: OperatingSystem): 'powershell' | 'bash' | undefined;
/**
 * Gets the original JSON field key name for the given platform's command.
 * Returns the actual field name from the JSON (e.g., 'bash' instead of 'osx' if bash was used).
 * This is used for editor focus to highlight the correct field.
 */
export declare function getEffectiveCommandFieldKey(hook: IHookCommand, os: OperatingSystem): string;
/**
 * Formats a hook command for display.
 * Resolves OS-specific overrides to show the effective command for the given platform.
 * If using a platform-specific override, includes the platform as a prefix badge.
 */
export declare function formatHookCommandLabel(hook: IHookCommand, os: OperatingSystem): string;
/**
 * Resolves a raw hook command object to the canonical IHookCommand format.
 * Normalizes the command and resolves the cwd path relative to the workspace root.
 * @param raw The raw hook command object from JSON
 * @param workspaceRootUri The workspace root URI to resolve relative cwd paths against
 * @param userHome The user's home directory path for tilde expansion
 */
export declare function resolveHookCommand(raw: Record<string, unknown>, workspaceRootUri: URI | undefined, userHome: string): IHookCommand | undefined;
