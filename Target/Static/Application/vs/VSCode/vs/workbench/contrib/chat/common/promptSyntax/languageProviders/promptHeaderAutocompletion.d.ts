import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Position } from '../../../../../../editor/common/core/position.js';
import { CompletionContext, CompletionItemProvider, CompletionList } from '../../../../../../editor/common/languages.js';
import { ITextModel } from '../../../../../../editor/common/model.js';
import { ILanguageModelsService } from '../../languageModels.js';
import { ILanguageModelToolsService } from '../../tools/languageModelToolsService.js';
import { IChatModeService } from '../../chatModes.js';
import { IPromptsService } from '../service/promptsService.js';
import { IWorkbenchEnvironmentService } from '../../../../../services/environment/common/environmentService.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
export declare class PromptHeaderAutocompletion implements CompletionItemProvider {
    private readonly promptsService;
    private readonly languageModelsService;
    private readonly languageModelToolsService;
    private readonly chatModeService;
    private readonly environmentService;
    private readonly configurationService;
    /**
     * Debug display name for this provider.
     */
    readonly _debugDisplayName: string;
    /**
     * List of trigger characters handled by this provider.
     */
    readonly triggerCharacters: string[];
    constructor(promptsService: IPromptsService, languageModelsService: ILanguageModelsService, languageModelToolsService: ILanguageModelToolsService, chatModeService: IChatModeService, environmentService: IWorkbenchEnvironmentService, configurationService: IConfigurationService);
    /**
     * The main function of this provider that calculates
     * completion items based on the provided arguments.
     */
    provideCompletionItems(model: ITextModel, position: Position, context: CompletionContext, token: CancellationToken): Promise<CompletionList | undefined>;
    private provideAttributeNameCompletions;
    private provideValueCompletions;
    /**
     * Provides completions inside the `hooks:` map.
     * Determines what to suggest based on nesting depth:
     * - At hook event level: suggest event names (SessionStart, PreToolUse, etc.)
     * - Inside a command object: suggest command fields (type, command, timeout, etc.)
     */
    private provideHookEventCompletions;
    /**
     * Provides completions for hook command fields (type, command, windows, etc.)
     * when the cursor is inside a command object within the hooks map.
     * Detects nesting by checking if the position falls within a sequence item
     * of a hook event's value.
     */
    private provideHookCommandFieldCompletions;
    /**
     * Walks the hooks map AST to find the command map object containing the position.
     * Handles both direct command objects and nested matcher format.
     * Also handles trailing lines after the last parsed property of a command map.
     */
    private findContainingCommandMap;
    private findCommandMapInSequence;
    private getValueSuggestions;
    private getModelNames;
    private provideArrayCompletions;
}
