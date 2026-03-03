import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IBulkEditService } from '../../../../../editor/browser/services/bulkEditService.js';
import { ILanguageFeaturesService } from '../../../../../editor/common/services/languageFeatures.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { CountTokensCallback, ILanguageModelToolsService, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../../common/tools/languageModelToolsService.js';
export declare const RenameToolId = "vscode_renameSymbol";
export declare class RenameTool extends Disposable implements IToolImpl {
    private readonly _languageFeaturesService;
    private readonly _textModelService;
    private readonly _workspaceContextService;
    private readonly _chatService;
    private readonly _bulkEditService;
    private readonly _onDidUpdateToolData;
    readonly onDidUpdateToolData: Event<void>;
    constructor(_languageFeaturesService: ILanguageFeaturesService, _textModelService: ITextModelService, _workspaceContextService: IWorkspaceContextService, _chatService: IChatService, _bulkEditService: IBulkEditService);
    getToolData(): IToolData;
    prepareToolInvocation(context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    private _successResult;
}
export declare class RenameToolContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chat.renameTool";
    constructor(toolsService: ILanguageModelToolsService, instantiationService: IInstantiationService);
}
