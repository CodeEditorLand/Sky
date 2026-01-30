import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IMarkdownVulnerability } from './annotations.js';
import { IChatRequestViewModel, IChatResponseViewModel } from '../model/chatViewModel.js';
interface CodeBlockContent {
    readonly text: string;
    readonly languageId?: string;
    readonly isComplete: boolean;
}
export interface CodeBlockEntry {
    readonly model: Promise<ITextModel>;
    readonly vulns: readonly IMarkdownVulnerability[];
    readonly codemapperUri?: URI;
    readonly isEdit?: boolean;
}
export declare class CodeBlockModelCollection extends Disposable {
    private readonly tag;
    private readonly languageService;
    private readonly textModelService;
    private readonly _models;
    /**
     * Max number of models to keep in memory.
     *
     * Currently always maintains the most recently created models.
     */
    private readonly maxModelCount;
    constructor(tag: string | undefined, languageService: ILanguageService, textModelService: ITextModelService);
    dispose(): void;
    get(sessionResource: URI, chat: IChatRequestViewModel | IChatResponseViewModel, codeBlockIndex: number): CodeBlockEntry | undefined;
    getOrCreate(sessionResource: URI, chat: IChatRequestViewModel | IChatResponseViewModel, codeBlockIndex: number): CodeBlockEntry;
    private delete;
    clear(): void;
    updateSync(sessionResource: URI, chat: IChatRequestViewModel | IChatResponseViewModel, codeBlockIndex: number, content: CodeBlockContent): CodeBlockEntry;
    markCodeBlockCompleted(sessionResource: URI, chat: IChatRequestViewModel | IChatResponseViewModel, codeBlockIndex: number): void;
    update(sessionResource: URI, chat: IChatRequestViewModel | IChatResponseViewModel, codeBlockIndex: number, content: CodeBlockContent): Promise<CodeBlockEntry>;
    private updateInternalCodeBlockEntry;
    private trySetTextModelLanguage;
    private getKey;
    private getCodeBlockUri;
    private getUriMetaData;
}
export {};
