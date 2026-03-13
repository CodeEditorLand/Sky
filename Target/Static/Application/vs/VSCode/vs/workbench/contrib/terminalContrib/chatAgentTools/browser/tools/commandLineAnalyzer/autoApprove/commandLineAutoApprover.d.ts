import { Disposable } from '../../../../../../../../base/common/lifecycle.js';
import type { OperatingSystem } from '../../../../../../../../base/common/platform.js';
import type { URI } from '../../../../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../../../platform/instantiation/common/instantiation.js';
import { ITerminalChatService } from '../../../../../../terminal/browser/terminal.js';
import type { IAutoApproveRule, INpmScriptAutoApproveRule } from '../commandLineAnalyzer.js';
export interface ICommandApprovalResultWithReason {
    result: ICommandApprovalResult;
    reason: string;
    rule?: IAutoApproveRule | INpmScriptAutoApproveRule;
}
export type ICommandApprovalResult = 'approved' | 'denied' | 'noMatch';
export declare class CommandLineAutoApprover extends Disposable {
    private readonly _configurationService;
    private readonly _terminalChatService;
    private _denyListRules;
    private _allowListRules;
    private _allowListCommandLineRules;
    private _denyListCommandLineRules;
    private readonly _npmScriptAutoApprover;
    constructor(_configurationService: IConfigurationService, instantiationService: IInstantiationService, _terminalChatService: ITerminalChatService);
    updateConfiguration(): void;
    isCommandAutoApproved(command: string, shell: string, os: OperatingSystem, cwd: URI | undefined, chatSessionResource?: URI): Promise<ICommandApprovalResultWithReason>;
    isCommandLineAutoApproved(commandLine: string, chatSessionResource?: URI): ICommandApprovalResultWithReason;
    private _getSessionRules;
    private _commandMatchesRule;
    private _mapAutoApproveConfigToRules;
    private _convertAutoApproveEntryToRegex;
    private _doConvertAutoApproveEntryToRegex;
}
