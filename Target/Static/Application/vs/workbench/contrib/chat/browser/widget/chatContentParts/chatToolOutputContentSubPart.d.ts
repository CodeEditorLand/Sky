import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ILanguageService } from '../../../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../../../editor/common/services/model.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
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
    private readonly _contextMenuService;
    private readonly _fileService;
    private readonly _markdownRendererService;
    private readonly modelService;
    private readonly languageService;
    private readonly _editorReferences;
    readonly domNode: HTMLElement;
    readonly codeblocks: IChatCodeBlockInfo[];
    constructor(context: IChatContentPartRenderContext, parts: ChatCollapsibleIOPart[], _instantiationService: IInstantiationService, contextKeyService: IContextKeyService, _contextMenuService: IContextMenuService, _fileService: IFileService, _markdownRendererService: IMarkdownRendererService, modelService: IModelService, languageService: ILanguageService);
    private toMdString;
    private createOutputContents;
    private addResourceGroup;
    /**
     * Delay in milliseconds before decoding base64 image data.
     * This avoids expensive decode operations during scrolling.
     */
    private static readonly IMAGE_DECODE_DELAY_MS;
    private fillInResourceGroup;
    private addCodeBlock;
    layout(width: number): void;
}
