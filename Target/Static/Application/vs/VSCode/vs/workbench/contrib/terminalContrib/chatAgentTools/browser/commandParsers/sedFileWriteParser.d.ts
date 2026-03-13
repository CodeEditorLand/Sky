import { ICommandFileWriteParser } from './commandFileWriteParser.js';
/**
 * Parser for detecting file writes from `sed` commands using in-place editing.
 *
 * Handles:
 * - `sed -i 's/foo/bar/' file.txt` (GNU)
 * - `sed -i.bak 's/foo/bar/' file.txt` (GNU with backup suffix)
 * - `sed -i '' 's/foo/bar/' file.txt` (macOS/BSD with empty backup suffix)
 * - `sed --in-place 's/foo/bar/' file.txt` (GNU long form)
 * - `sed --in-place=.bak 's/foo/bar/' file.txt` (GNU long form with backup)
 * - `sed -I 's/foo/bar/' file.txt` (BSD case-insensitive variant)
 */
export declare class SedFileWriteParser implements ICommandFileWriteParser {
    readonly commandName = "sed";
    canHandle(commandText: string): boolean;
    extractFileWrites(commandText: string): string[];
    /**
     * Tokenizes a command into individual arguments, handling quotes and escapes.
     */
    private _tokenizeCommand;
    /**
     * Extracts file targets from tokenized sed command arguments.
     * Files are generally the last non-option, non-script arguments.
     */
    private _extractFileTargets;
}
