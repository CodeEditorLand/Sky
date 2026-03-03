import { URI } from '../../../../../base/common/uri.js';
import { HookType, IHookCommand } from './hookSchema.js';
/**
 * Maps Claude hook type names to our abstract HookType.
 * Claude uses PascalCase and slightly different names.
 * @see https://docs.anthropic.com/en/docs/claude-code/hooks
 */
export declare const CLAUDE_HOOK_TYPE_MAP: Record<string, HookType>;
/**
 * Resolves a Claude hook type name to our abstract HookType.
 */
export declare function resolveClaudeHookType(name: string): HookType | undefined;
/**
 * Gets the Claude hook type name for a given abstract HookType.
 * Returns undefined if the hook type is not supported in Claude.
 */
export declare function getClaudeHookTypeName(hookType: HookType): string | undefined;
/**
 * Result of parsing Claude hooks file.
 */
export interface IParseClaudeHooksResult {
    /**
     * The parsed hooks by type.
     */
    readonly hooks: Map<HookType, {
        hooks: IHookCommand[];
        originalId: string;
    }>;
    /**
     * Whether all hooks from this file were disabled via `disableAllHooks: true`.
     */
    readonly disabledAllHooks: boolean;
}
/**
 * Parses hooks from a Claude settings.json file.
 * Claude format:
 * {
 *   "hooks": {
 *     "PreToolUse": [
 *       { "matcher": "Bash", "hooks": [{ "type": "command", "command": "..." }] }
 *     ]
 *   }
 * }
 *
 * Or simpler format:
 * {
 *   "hooks": {
 *     "PreToolUse": [{ "type": "command", "command": "..." }]
 *   }
 * }
 *
 * If the file has `disableAllHooks: true` at the top level, all hooks are filtered out.
 */
export declare function parseClaudeHooks(json: unknown, workspaceRootUri: URI | undefined, userHome: string): IParseClaudeHooksResult;
/**
 * Helper to extract hook commands from an item that could be:
 * 1. A direct command object: { type: 'command', command: '...' }
 * 2. A nested structure with matcher (Claude style): { matcher: '...', hooks: [{ type: 'command', command: '...' }] }
 *
 * This allows Copilot format to handle Claude-style entries if pasted.
 * Also handles Claude's leniency where 'type' field can be omitted.
 */
export declare function extractHookCommandsFromItem(item: unknown, workspaceRootUri: URI | undefined, userHome: string): IHookCommand[];
