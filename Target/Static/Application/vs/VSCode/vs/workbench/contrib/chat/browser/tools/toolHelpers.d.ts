import { URI } from '../../../../../base/common/uri.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IToolResult } from '../../common/tools/languageModelToolsService.js';
export interface ISymbolToolInput {
    symbol: string;
    uri?: string;
    filePath?: string;
    lineContent: string;
}
/**
 * Resolves a URI from tool input. Accepts either a full URI string or a
 * workspace-relative file path.
 */
export declare function resolveToolUri(input: ISymbolToolInput, workspaceContextService: IWorkspaceContextService): URI | undefined;
/**
 * Finds the line number in the model that matches the given line content.
 * Whitespace is normalized so that extra spaces in the input still match.
 *
 * @returns The 1-based line number, or `undefined` if not found.
 */
export declare function findLineNumber(model: ITextModel, lineContent: string): number | undefined;
/**
 * Finds the 1-based column of a symbol within a line of text using word
 * boundary matching.
 *
 * @returns The 1-based column, or `undefined` if not found.
 */
export declare function findSymbolColumn(lineText: string, symbol: string): number | undefined;
/**
 * Creates an error tool result with the given message as both the content
 * and the tool result message.
 */
export declare function errorResult(message: string): IToolResult;
