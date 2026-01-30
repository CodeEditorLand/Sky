import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { ITerminalChatService } from '../../../../../terminal/browser/terminal.js';
import { IStorageService } from '../../../../../../../platform/storage/common/storage.js';
import type { RunInTerminalToolTelemetry } from '../../runInTerminalToolTelemetry.js';
import { type TreeSitterCommandParser } from '../../treeSitterCommandParser.js';
import { type ICommandLineAnalyzer, type ICommandLineAnalyzerOptions, type ICommandLineAnalyzerResult } from './commandLineAnalyzer.js';
export declare class CommandLineAutoApproveAnalyzer extends Disposable implements ICommandLineAnalyzer {
    private readonly _treeSitterCommandParser;
    private readonly _telemetry;
    private readonly _log;
    private readonly _configurationService;
    private readonly _storageService;
    private readonly _terminalChatService;
    private readonly _commandLineAutoApprover;
    constructor(_treeSitterCommandParser: TreeSitterCommandParser, _telemetry: RunInTerminalToolTelemetry, _log: (message: string, ...args: unknown[]) => void, _configurationService: IConfigurationService, instantiationService: IInstantiationService, _storageService: IStorageService, _terminalChatService: ITerminalChatService);
    analyze(options: ICommandLineAnalyzerOptions): Promise<ICommandLineAnalyzerResult>;
    private _createAutoApproveInfo;
}
