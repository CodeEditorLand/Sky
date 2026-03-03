import { URI } from '../../../../../base/common/uri.js';
import { HookType, IHookCommand } from './hookSchema.js';
/**
 * Represents a hook source with its original and normalized properties.
 * Used to display hooks from different formats in a unified view.
 */
export interface IResolvedHookEntry {
    /** The normalized hook type (our canonical HookType enum) */
    readonly hookType: HookType;
    /** The original hook type ID as it appears in the source file */
    readonly originalHookTypeId: string;
    /** The source format this hook came from */
    readonly sourceFormat: HookSourceFormat;
    /** The resolved hook command */
    readonly command: IHookCommand;
    /** The index of this hook in its array (for editing) */
    readonly index: number;
}
/**
 * Supported hook file formats.
 */
export declare enum HookSourceFormat {
    /** GitHub Copilot hooks .json format */
    Copilot = "copilot",
    /** Claude settings.json / settings.local.json format */
    Claude = "claude"
}
/**
 * Determines the hook source format based on the file URI.
 */
export declare function getHookSourceFormat(fileUri: URI): HookSourceFormat;
/**
 * Checks if a file is read-only based on its source format.
 * Claude settings files should be read-only from our perspective since they have a different format.
 */
export declare function isReadOnlyHookSource(format: HookSourceFormat): boolean;
/**
 * Parses hooks from a Copilot hooks .json file (our native format).
 */
export declare function parseCopilotHooks(json: unknown, workspaceRootUri: URI | undefined, userHome: string): Map<HookType, {
    hooks: IHookCommand[];
    originalId: string;
}>;
/**
 * Result of parsing hooks from a file.
 */
export interface IParseHooksFromFileResult {
    readonly format: HookSourceFormat;
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
 * Parses hooks from any supported format, auto-detecting the format from the file URI.
 */
export declare function parseHooksFromFile(fileUri: URI, json: unknown, workspaceRootUri: URI | undefined, userHome: string): IParseHooksFromFileResult;
/**
 * Parses hooks from a file, ignoring the `disableAllHooks` flag.
 * Used by diagnostics to show which hooks are hidden when `disableAllHooks: true` is set.
 */
export declare function parseHooksIgnoringDisableAll(fileUri: URI, json: unknown, workspaceRootUri: URI | undefined, userHome: string): IParseHooksFromFileResult;
/**
 * Gets a human-readable label for a hook source format.
 */
export declare function getHookSourceFormatLabel(format: HookSourceFormat): string;
/**
 * Builds a new hook entry object in the appropriate format for the given source format.
 * - Copilot format: `{ type: 'command', command: '' }`
 * - Claude format: `{ matcher: '', hooks: [{ type: 'command', command: '' }] }`
 */
export declare function buildNewHookEntry(format: HookSourceFormat): Record<string, unknown>;
