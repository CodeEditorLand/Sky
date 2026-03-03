import type { QueryCapture } from '@vscode/tree-sitter-wasm';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ITreeSitterLibraryService } from '../../../../../editor/common/services/treeSitter/treeSitterLibraryService.js';
export declare const enum TreeSitterCommandParserLanguage {
    Bash = "bash",
    PowerShell = "powershell"
}
export declare class TreeSitterCommandParser extends Disposable {
    private readonly _treeSitterLibraryService;
    private readonly _parser;
    private readonly _treeCache;
    private readonly _commandFileWriteParsers;
    constructor(_treeSitterLibraryService: ITreeSitterLibraryService);
    extractSubCommands(languageId: TreeSitterCommandParserLanguage, commandLine: string): Promise<string[]>;
    extractPwshDoubleAmpersandChainOperators(commandLine: string): Promise<QueryCapture[]>;
    getFileWrites(languageId: TreeSitterCommandParserLanguage, commandLine: string): Promise<string[]>;
    /**
     * Extracts file targets from commands that perform file writes beyond shell redirections.
     * Uses registered command parsers (e.g., for `sed -i`) to detect command-specific file writes.
     * Returns an array of file paths that would be modified.
     */
    getCommandFileWrites(languageId: TreeSitterCommandParserLanguage, commandLine: string): Promise<string[]>;
    private _queryTree;
    private _doQuery;
}
