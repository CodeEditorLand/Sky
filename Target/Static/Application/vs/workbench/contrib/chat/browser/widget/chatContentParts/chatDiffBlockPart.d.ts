import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../base/common/uri.js';
import { ILanguageService } from '../../../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../../../editor/common/services/resolverService.js';
import { IChatResponseViewModel } from '../../../common/model/chatViewModel.js';
import { DiffEditorPool } from './chatContentCodePools.js';
/**
 * Parses unified diff format into before/after content.
 * Supports standard unified diff format with - and + prefixes.
 */
export declare function parseUnifiedDiff(diffText: string): {
    before: string;
    after: string;
};
export interface IMarkdownDiffBlockData {
    readonly element: IChatResponseViewModel;
    readonly codeBlockIndex: number;
    readonly languageId: string;
    readonly beforeContent: string;
    readonly afterContent: string;
    readonly codeBlockResource?: URI;
    readonly isReadOnly?: boolean;
    readonly horizontalPadding?: number;
}
/**
 * Renders a diff block from markdown content.
 * This is a lightweight wrapper that uses CodeCompareBlockPart for the actual rendering.
 */
export declare class MarkdownDiffBlockPart extends Disposable {
    private readonly modelService;
    private readonly textModelService;
    private readonly languageService;
    readonly element: HTMLElement;
    private readonly comparePart;
    private readonly modelRef;
    constructor(data: IMarkdownDiffBlockData, diffEditorPool: DiffEditorPool, currentWidth: number, modelService: IModelService, textModelService: ITextModelService, languageService: ILanguageService);
    layout(width: number): void;
    reset(): void;
}
