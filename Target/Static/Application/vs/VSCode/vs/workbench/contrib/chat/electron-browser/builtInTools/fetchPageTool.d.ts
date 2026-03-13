import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IWebContentExtractorService } from '../../../../../platform/webContentExtractor/common/webContentExtractor.js';
import { ITrustedDomainService } from '../../../url/browser/trustedDomainService.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../../common/tools/languageModelToolsService.js';
export declare const FetchWebPageToolData: IToolData;
export interface IFetchWebPageToolParams {
    urls?: string[];
}
export declare class FetchWebPageTool implements IToolImpl {
    private readonly _readerModeService;
    private readonly _fileService;
    private readonly _trustedDomainService;
    private readonly _chatService;
    constructor(_readerModeService: IWebContentExtractorService, _fileService: IFileService, _trustedDomainService: ITrustedDomainService, _chatService: IChatService);
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    prepareToolInvocation(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    private _parseUris;
    private _getPromptPartsForResults;
    private _getSupportedImageMimeType;
}
