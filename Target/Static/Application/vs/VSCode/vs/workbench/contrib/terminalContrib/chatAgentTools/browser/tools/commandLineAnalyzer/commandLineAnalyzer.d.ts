import type { IMarkdownString } from '../../../../../../../base/common/htmlContent.js';
import type { IDisposable } from '../../../../../../../base/common/lifecycle.js';
import type { OperatingSystem } from '../../../../../../../base/common/platform.js';
import type { URI } from '../../../../../../../base/common/uri.js';
import type { ConfigurationTarget } from '../../../../../../../platform/configuration/common/configuration.js';
import type { ToolConfirmationAction } from '../../../../../chat/common/tools/languageModelToolsService.js';
import type { INpmScriptAutoApproveResult } from './autoApprove/npmScriptAutoApprover.js';
import type { TreeSitterCommandParserLanguage } from '../../treeSitterCommandParser.js';
export interface IAutoApproveRule {
    regex: RegExp;
    regexCaseInsensitive: RegExp;
    sourceText: string;
    sourceTarget: ConfigurationTarget | 'session';
    isDefaultRule: boolean;
}
export interface INpmScriptAutoApproveRule {
    type: 'npmScript';
    npmScriptResult: INpmScriptAutoApproveResult;
}
export declare function isAutoApproveRule(rule: IAutoApproveRule | INpmScriptAutoApproveRule | undefined): rule is IAutoApproveRule;
export declare function isNpmScriptAutoApproveRule(rule: IAutoApproveRule | INpmScriptAutoApproveRule | undefined): rule is INpmScriptAutoApproveRule;
export interface ICommandLineAnalyzer extends IDisposable {
    analyze(options: ICommandLineAnalyzerOptions): Promise<ICommandLineAnalyzerResult>;
}
export interface ICommandLineAnalyzerOptions {
    commandLine: string;
    cwd: URI | undefined;
    shell: string;
    os: OperatingSystem;
    treeSitterLanguage: TreeSitterCommandParserLanguage;
    terminalToolSessionId: string;
    chatSessionResource: URI | undefined;
}
export interface ICommandLineAnalyzerResult {
    /**
     * Whether auto approval is allowed based on the analysis, when false this
     * will block auto approval.
    */
    readonly isAutoApproveAllowed: boolean;
    /**
     * Whether the command line was explicitly auto approved by this analyzer.
     * - `true`: This analyzer explicitly approves auto-execution
     * - `false`: This analyzer explicitly denies auto-execution
     * - `undefined`: This analyzer does not make an approval/denial decision
     */
    readonly isAutoApproved?: boolean;
    readonly disclaimers?: readonly (string | IMarkdownString)[];
    readonly autoApproveInfo?: IMarkdownString;
    readonly customActions?: ToolConfirmationAction[];
    readonly forceAutoApproval?: boolean;
    /**
     * Optional denial details when this analyzer explicitly denied auto-execution.
     */
    readonly denialDetails?: {
        readonly scope: 'subCommand' | 'commandLine';
        readonly deniedCommand: string;
        readonly reason: string;
        readonly ruleSourceText?: string;
    };
}
