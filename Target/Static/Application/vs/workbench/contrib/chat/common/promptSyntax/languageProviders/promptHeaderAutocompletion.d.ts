import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Position } from '../../../../../../editor/common/core/position.js';
import { CompletionContext, CompletionItemProvider, CompletionList } from '../../../../../../editor/common/languages.js';
import { ITextModel } from '../../../../../../editor/common/model.js';
import { ILanguageModelsService } from '../../languageModels.js';
import { ILanguageModelToolsService } from '../../tools/languageModelToolsService.js';
import { IChatModeService } from '../../chatModes.js';
import { IPromptsService } from '../service/promptsService.js';
export declare class PromptHeaderAutocompletion implements CompletionItemProvider {
    private readonly promptsService;
    private readonly languageModelsService;
    private readonly languageModelToolsService;
    private readonly chatModeService;
    /**
     * Debug display name for this provider.
     */
    readonly _debugDisplayName: string;
    /**
     * List of trigger characters handled by this provider.
     */
    readonly triggerCharacters: string[];
    constructor(promptsService: IPromptsService, languageModelsService: ILanguageModelsService, languageModelToolsService: ILanguageModelToolsService, chatModeService: IChatModeService);
    /**
     * The main function of this provider that calculates
     * completion items based on the provided arguments.
     */
    provideCompletionItems(model: ITextModel, position: Position, context: CompletionContext, token: CancellationToken): Promise<CompletionList | undefined>;
    private provideAttributeNameCompletions;
    private provideValueCompletions;
    private getValueSuggestions;
    private getModelNames;
    private provideArrayCompletions;
}
