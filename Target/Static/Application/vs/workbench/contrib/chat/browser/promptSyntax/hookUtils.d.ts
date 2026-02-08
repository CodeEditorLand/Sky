import { ITextEditorSelection } from '../../../../../platform/editor/common/editor.js';
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
