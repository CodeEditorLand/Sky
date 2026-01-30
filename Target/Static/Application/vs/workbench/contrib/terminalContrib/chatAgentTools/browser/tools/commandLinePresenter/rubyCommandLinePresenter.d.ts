import { OperatingSystem } from '../../../../../../../base/common/platform.js';
import type { ICommandLinePresenter, ICommandLinePresenterOptions, ICommandLinePresenterResult } from './commandLinePresenter.js';
/**
 * Command line presenter for Ruby inline commands (`ruby -e "..."`).
 * Extracts the Ruby code and sets up Ruby syntax highlighting.
 */
export declare class RubyCommandLinePresenter implements ICommandLinePresenter {
    present(options: ICommandLinePresenterOptions): ICommandLinePresenterResult | undefined;
}
/**
 * Extracts the Ruby code from a `ruby -e "..."` or `ruby -e '...'` command,
 * returning the code with properly unescaped quotes.
 *
 * @param commandLine The full command line to parse
 * @param shell The shell path (to determine quote escaping style)
 * @param os The operating system
 * @returns The extracted Ruby code, or undefined if not a ruby -e command
 */
export declare function extractRubyCommand(commandLine: string, shell: string, os: OperatingSystem): string | undefined;
