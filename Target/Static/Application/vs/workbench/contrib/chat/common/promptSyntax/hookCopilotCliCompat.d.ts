import { HookType } from './hookSchema.js';
/**
 * Resolves a Copilot CLI hook type name to our abstract HookType.
 */
export declare function resolveCopilotCliHookType(name: string): HookType | undefined;
/**
 * Gets the Copilot CLI hook type name for a given abstract HookType.
 * Returns undefined if the hook type is not supported in Copilot CLI.
 */
export declare function getCopilotCliHookTypeName(hookType: HookType): string | undefined;
