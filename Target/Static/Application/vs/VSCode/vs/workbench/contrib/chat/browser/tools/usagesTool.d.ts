import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { ILanguageFeaturesService } from '../../../../../editor/common/services/languageFeatures.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { ISearchService } from '../../../../services/search/common/search.js';
import { CountTokensCallback, ILanguageModelToolsService, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../../common/tools/languageModelToolsService.js';
export declare const UsagesToolId = "vscode_listCodeUsages";
export declare class UsagesTool extends Disposable implements IToolImpl {
    private readonly _languageFeaturesService;
    private readonly _modelService;
    private readonly _searchService;
    private readonly _textModelService;
    private readonly _workspaceContextService;
    private readonly _onDidUpdateToolData;
    readonly onDidUpdateToolData: Event<void>;
    constructor(_languageFeaturesService: ILanguageFeaturesService, _modelService: IModelService, _searchService: ISearchService, _textModelService: ITextModelService, _workspaceContextService: IWorkspaceContextService);
    getToolData(): IToolData;
    prepareToolInvocation(context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    private _getLinePreviews;
    private _classifyReference;
    private _overlaps;
}
export declare class UsagesToolContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chat.usagesTool";
    constructor(toolsService: ILanguageModelToolsService, instantiationService: IInstantiationService);
}
