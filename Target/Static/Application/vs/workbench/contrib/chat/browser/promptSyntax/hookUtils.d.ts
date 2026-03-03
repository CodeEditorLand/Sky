import { ITextEditorSelection } from '../../../../../platform/editor/common/editor.js';
import { URI } from '../../../../../base/common/uri.js';
import { IPromptsService } from '../../common/promptSyntax/service/promptsService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { HookType, IHookCommand } from '../../common/promptSyntax/hookSchema.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { OperatingSystem } from '../../../../../base/common/platform.js';
/**
 * Finds the selection range for a hook command field value in JSON content.
 * Supports both simple format and nested matcher format:
 * - Simple: { hooks: { hookType: [{ command: "..." }] } }
 * - Nested: { hooks: { hookType: [{ matcher: "", hooks: [{ command: "..." }] }] } }
 *
 * The index is a flattened index across all commands in the hook type, regardless of nesting.
 *
 * @param content The JSON file content
 * @param hookType The hook type (e.g., "sessionStart")
 * @param index The flattened index of the hook command within the hook type
 * @param fieldName The field name to find ('command', 'bash', or 'powershell')
 * @returns The selection range for the field value, or undefined if not found
 */
export declare function findHookCommandSelection(content: string, hookType: string, index: number, fieldName: string): ITextEditorSelection | undefined;
/**
 * Parsed hook information.
 */
export interface IParsedHook {
    hookType: HookType;
    hookTypeLabel: string;
    command: IHookCommand;
    commandLabel: string;
    fileUri: URI;
    filePath: string;
    index: number;
    /** The original hook type ID as it appears in the JSON file */
    originalHookTypeId: string;
    /** If true, this hook is disabled via `disableAllHooks: true` in its file */
    disabled?: boolean;
}
export interface IParseAllHookFilesOptions {
    /** Additional file URIs to parse (e.g., files skipped due to disableAllHooks) */
    additionalDisabledFileUris?: readonly URI[];
}
/**
 * Parses all hook files and extracts individual hooks.
 * This is a shared helper used by both the configure action and diagnostics.
 */
export declare function parseAllHookFiles(promptsService: IPromptsService, fileService: IFileService, labelService: ILabelService, workspaceRootUri: URI | undefined, userHome: string, os: OperatingSystem, token: CancellationToken, options?: IParseAllHookFilesOptions): Promise<IParsedHook[]>;
