import { Disposable } from '../../../../../../base/common/lifecycle.js';
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
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../../../base/common/event.js").Event<void>;
    private _currentWidth;
    private readonly _editorReferences;
    readonly domNode: HTMLElement;
    readonly codeblocks: IChatCodeBlockInfo[];
    constructor(context: IChatContentPartRenderContext, parts: ChatCollapsibleIOPart[], _instantiationService: IInstantiationService, contextKeyService: IContextKeyService, _contextMenuService: IContextMenuService, _fileService: IFileService, _markdownRendererService: IMarkdownRendererService);
    private toMdString;
    private createOutputContents;
    private addResourceGroup;
    private fillInResourceGroup;
    private addCodeBlock;
    layout(width: number): void;
}
