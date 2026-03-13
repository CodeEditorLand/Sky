import { OperatingSystem } from '../../../../../../../base/common/platform.js';
import type { ICommandLinePresenter, ICommandLinePresenterOptions, ICommandLinePresenterResult } from './commandLinePresenter.js';
/**
 * Command line presenter for Node.js inline commands (`node -e "..."`).
 * Extracts the JavaScript code and sets up JavaScript syntax highlighting.
 */
export declare class NodeCommandLinePresenter implements ICommandLinePresenter {
    present(options: ICommandLinePresenterOptions): ICommandLinePresenterResult | undefined;
}
/**
 * Extracts the JavaScript code from a `node -e "..."` or `node -e '...'` command,
 * returning the code with properly unescaped quotes.
 *
 * @param commandLine The full command line to parse
 * @param shell The shell path (to determine quote escaping style)
 * @param os The operating system
 * @returns The extracted JavaScript code, or undefined if not a node -e/--eval command
 */
export declare function extractNodeCommand(commandLine: string, shell: string, os: OperatingSystem): string | undefined;
