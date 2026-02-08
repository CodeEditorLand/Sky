import { PromptsStorage } from '../../common/promptSyntax/service/promptsService.js';
import { PromptsType } from '../../common/promptSyntax/promptTypes.js';
import { URI } from '../../../../../base/common/uri.js';
import { IWorkspaceFolder } from '../../../../../platform/workspace/common/workspace.js';
/**
 * Information about a file that was loaded or skipped.
 */
export interface IFileStatusInfo {
    uri: URI;
    status: 'loaded' | 'skipped' | 'overwritten';
    reason?: string;
    name?: string;
    storage: PromptsStorage;
    /** For overwritten files, the name of the file that took precedence */
    overwrittenBy?: string;
    /** Extension ID if this file comes from an extension */
    extensionId?: string;
}
/**
 * Path information with scan order.
 */
export interface IPathInfo {
    uri: URI;
    exists: boolean;
    storage: PromptsStorage;
    /** 1-based scan order (lower = higher priority) */
    scanOrder: number;
    /** Original path string for display (e.g., '~/.copilot/agents' or '.github/agents') */
    displayPath: string;
    /** Whether this is a default folder (vs custom configured) */
    isDefault: boolean;
}
/**
 * Status information for a specific type of prompt files.
 */
export interface ITypeStatusInfo {
    type: PromptsType;
    paths: IPathInfo[];
    files: IFileStatusInfo[];
    enabled: boolean;
}
/**
 * Registers the Diagnostics action for the chat context menu.
 */
export declare function registerChatCustomizationDiagnosticsAction(): void;
/**
 * Formats the status output as a compact markdown string with tree structure.
 * Files are grouped under their parent paths.
 * Special files (AGENTS.md, copilot-instructions.md) are merged into their respective sections.
 */
export declare function formatStatusOutput(statusInfos: ITypeStatusInfo[], specialFiles: {
    agentsMd: {
        enabled: boolean;
        files: URI[];
    };
    copilotInstructions: {
        enabled: boolean;
        files: URI[];
    };
}, workspaceFolders: readonly IWorkspaceFolder[]): string;
