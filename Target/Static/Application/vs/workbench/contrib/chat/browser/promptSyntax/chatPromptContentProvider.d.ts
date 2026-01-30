import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { ITextModelContentProvider, ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IChatPromptContentStore } from '../../common/promptSyntax/chatPromptContentStore.js';
/**
 * Content provider for virtual chat prompt files created with inline content.
 * These URIs have the scheme 'vscode-chat-prompt' and retrieve their content
 * from the {@link IChatPromptContentStore} which maintains an in-memory map
 * of content indexed by URI. This approach avoids putting content in the URI
 * query string which is a misuse of URIs.
 */
export declare class ChatPromptContentProvider extends Disposable implements ITextModelContentProvider {
    private readonly modelService;
    private readonly languageService;
    private readonly chatPromptContentStore;
    constructor(textModelService: ITextModelService, modelService: IModelService, languageService: ILanguageService, chatPromptContentStore: IChatPromptContentStore);
    provideTextContent(resource: URI): Promise<ITextModel | null>;
}
