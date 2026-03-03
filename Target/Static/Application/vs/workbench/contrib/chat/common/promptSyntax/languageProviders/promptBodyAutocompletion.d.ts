import { ITextModel } from '../../../../../../editor/common/model.js';
import { Position } from '../../../../../../editor/common/core/position.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { CompletionContext, CompletionItemProvider, CompletionList } from '../../../../../../editor/common/languages.js';
import { ILanguageModelToolsService } from '../../tools/languageModelToolsService.js';
/**
 * Provides autocompletion for the variables inside prompt bodies.
 * - #file: paths to files and folders in the workspace
 * - # tool names
 */
export declare class PromptBodyAutocompletion implements CompletionItemProvider {
    private readonly fileService;
    private readonly languageModelToolsService;
    /**
     * Debug display name for this provider.
     */
    readonly _debugDisplayName: string;
    /**
     * List of trigger characters handled by this provider.
     */
    readonly triggerCharacters: string[];
    constructor(fileService: IFileService, languageModelToolsService: ILanguageModelToolsService);
    /**
     * The main function of this provider that calculates
     * completion items based on the provided arguments.
     */
    provideCompletionItems(model: ITextModel, position: Position, context: CompletionContext, token: CancellationToken): Promise<CompletionList | undefined>;
    private collectToolCompletions;
    private collectFilePathCompletions;
    /**
     * Finds a file reference that suites the provided `position`.
     */
    private findVariableReference;
    private collectDefaultCompletions;
}
