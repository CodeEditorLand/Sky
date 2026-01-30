import { OperatingSystem } from '../../../../../../../base/common/platform.js';
import type { ICommandLinePresenter, ICommandLinePresenterOptions, ICommandLinePresenterResult } from './commandLinePresenter.js';
/**
 * Command line presenter for Python inline commands (`python -c "..."`).
 * Extracts the Python code and sets up Python syntax highlighting.
 */
export declare class PythonCommandLinePresenter implements ICommandLinePresenter {
    present(options: ICommandLinePresenterOptions): ICommandLinePresenterResult | undefined;
}
/**
 * Extracts the Python code from a `python -c "..."` or `python -c '...'` command,
 * returning the code with properly unescaped quotes.
 *
 * @param commandLine The full command line to parse
 * @param shell The shell path (to determine quote escaping style)
 * @param os The operating system
 * @returns The extracted Python code, or undefined if not a python -c command
 */
export declare function extractPythonCommand(commandLine: string, shell: string, os: OperatingSystem): string | undefined;
