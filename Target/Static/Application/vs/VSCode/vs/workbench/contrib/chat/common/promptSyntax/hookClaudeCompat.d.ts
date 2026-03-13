import { URI } from '../../../../../base/common/uri.js';
import { IHookCommand, extractHookCommandsFromItem } from './hookSchema.js';
import { HookType } from './hookTypes.js';
export { extractHookCommandsFromItem };
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
