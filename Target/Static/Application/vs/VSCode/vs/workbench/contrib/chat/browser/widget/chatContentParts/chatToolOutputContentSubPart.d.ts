import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ILanguageService } from '../../../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../../../editor/common/services/model.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IMarkdownRendererService } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IChatCodeBlockInfo } from '../../chat.js';
import { IChatContentPartRenderContext } from './chatContentParts.js';
import { ChatCollapsibleIOPart } from './chatToolInputOutputContentPart.js';
/**
 * A reusable component for rendering tool output consisting of code blocks and/or resources.
 * This is used by both ChatCollapsibleInputOutputContentPart and ChatToolPostExecuteConfirmationPart.
 */
export declare class ChatToolOutputContentSubPart extends Disposable {
    private readonly context;
    private readonly parts;
    private readonly _instantiationService;
    private readonly contextKeyService;
    private readonly _markdownRendererService;
    private readonly modelService;
    private readonly languageService;
    private readonly _editorReferences;
    readonly domNode: HTMLElement;
    readonly codeblocks: IChatCodeBlockInfo[];
    constructor(context: IChatContentPartRenderContext, parts: ChatCollapsibleIOPart[], _instantiationService: IInstantiationService, contextKeyService: IContextKeyService, _markdownRendererService: IMarkdownRendererService, modelService: IModelService, languageService: ILanguageService);
    private toMdString;
    private createOutputContents;
    private addResourceGroup;
    private addCodeBlock;
    layout(width: number): void;
}
