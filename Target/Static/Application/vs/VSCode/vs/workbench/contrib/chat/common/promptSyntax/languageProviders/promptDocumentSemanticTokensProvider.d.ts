import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { DocumentSemanticTokensProvider, ProviderResult, SemanticTokens, SemanticTokensLegend } from '../../../../../../editor/common/languages.js';
import { ITextModel } from '../../../../../../editor/common/model.js';
import { IPromptsService } from '../service/promptsService.js';
export declare class PromptDocumentSemanticTokensProvider implements DocumentSemanticTokensProvider {
    private readonly promptsService;
    /**
     * Debug display name for this provider.
     */
    readonly _debugDisplayName: string;
    constructor(promptsService: IPromptsService);
    provideDocumentSemanticTokens(model: ITextModel, lastResultId: string | null, token: CancellationToken): ProviderResult<SemanticTokens>;
    getLegend(): SemanticTokensLegend;
    releaseDocumentSemanticTokens(resultId: string | undefined): void;
}
