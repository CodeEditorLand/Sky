import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../../../platform/configuration/common/configuration.js';
import { IWorkspaceContextService } from '../../../../../../../platform/workspace/common/workspace.js';
import { type TreeSitterCommandParser } from '../../treeSitterCommandParser.js';
import type { ICommandLineAnalyzer, ICommandLineAnalyzerOptions, ICommandLineAnalyzerResult } from './commandLineAnalyzer.js';
import { ILabelService } from '../../../../../../../platform/label/common/label.js';
export declare class CommandLineFileWriteAnalyzer extends Disposable implements ICommandLineAnalyzer {
    private readonly _treeSitterCommandParser;
    private readonly _log;
    private readonly _configurationService;
    private readonly _labelService;
    private readonly _workspaceContextService;
    constructor(_treeSitterCommandParser: TreeSitterCommandParser, _log: (message: string, ...args: unknown[]) => void, _configurationService: IConfigurationService, _labelService: ILabelService, _workspaceContextService: IWorkspaceContextService);
    analyze(options: ICommandLineAnalyzerOptions): Promise<ICommandLineAnalyzerResult>;
    private _getFileWrites;
    private _stripSurroundingQuotes;
    private _mapNullDevice;
    private _getResult;
}
