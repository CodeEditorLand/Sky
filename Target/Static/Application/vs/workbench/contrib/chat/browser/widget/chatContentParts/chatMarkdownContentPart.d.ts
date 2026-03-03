import { type MarkdownRenderOptions } from '../../../../../../base/browser/markdownRenderer.js';
import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { Event } from '../../../../../../base/common/event.js';
import { URI } from '../../../../../../base/common/uri.js';
import { ILanguageService } from '../../../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../../../editor/common/services/resolverService.js';
import { IMenuService } from '../../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../../platform/label/common/label.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { IAiEditTelemetryService } from '../../../../editTelemetry/browser/telemetry/aiEditTelemetry/aiEditTelemetryService.js';
import { IChatProgressRenderableResponseContent } from '../../../common/model/chatModel.js';
import { IChatMarkdownContent, IChatService } from '../../../common/chatService/chatService.js';
import { CodeBlockModelCollection } from '../../../common/widget/codeBlockModelCollection.js';
import { IChatCodeBlockInfo } from '../../chat.js';
import { ICodeBlockRenderOptions } from './codeBlockPart.js';
import './media/chatCodeBlockPill.css';
import { EditorPool } from './chatContentCodePools.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import './media/chatMarkdownPart.css';
export interface IChatMarkdownContentPartOptions {
    readonly codeBlockRenderOptions?: ICodeBlockRenderOptions;
    readonly allowInlineDiffs?: boolean;
    readonly horizontalPadding?: number;
    readonly accessibilityOptions?: {
        /**
         * Message to announce to screen readers as a status update if VerboseChatProgressUpdates is enabled.
         * Will also be used as the aria-label for the container.
         * */
        statusMessage?: string;
    };
}
export declare class ChatMarkdownContentPart extends Disposable implements IChatContentPart {
    private readonly markdown;
    private readonly editorPool;
    private readonly codeBlockModelCollection;
    private readonly rendererOptions;
    private readonly textModelService;
    private readonly instantiationService;
    private readonly aiEditTelemetryService;
    private static ID_POOL;
    readonly codeblocksPartId: string;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    private readonly allRefs;
    private readonly _codeblocks;
    get codeblocks(): IChatCodeBlockInfo[];
    private readonly mathLayoutParticipants;
    constructor(markdown: IChatMarkdownContent, context: IChatContentPartRenderContext, editorPool: EditorPool, fillInIncompleteTokens: boolean | undefined, codeBlockStartIndex: number | undefined, renderer: IMarkdownRenderer, markdownRenderOptions: MarkdownRenderOptions | undefined, currentWidth: number, codeBlockModelCollection: CodeBlockModelCollection, rendererOptions: IChatMarkdownContentPartOptions, contextKeyService: IContextKeyService, configurationService: IConfigurationService, textModelService: ITextModelService, instantiationService: IInstantiationService, aiEditTelemetryService: IAiEditTelemetryService);
    private renderCodeBlockPill;
    private renderCodeBlock;
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    layout(width: number): void;
    onDidRemount(): void;
    addDisposable(disposable: IDisposable): void;
}
export declare function codeblockHasClosingBackticks(str: string): boolean;
export declare class CollapsedCodeBlock extends Disposable {
    private readonly sessionResource;
    private readonly requestId;
    private readonly inUndoStop;
    private readonly labelService;
    private readonly editorService;
    private readonly modelService;
    private readonly languageService;
    private readonly contextMenuService;
    private readonly contextKeyService;
    private readonly menuService;
    private readonly hoverService;
    private readonly chatService;
    private readonly configurationService;
    readonly element: HTMLElement;
    private readonly pillElement;
    private readonly statusIndicatorContainer;
    private _uri;
    get uri(): URI | undefined;
    private readonly hover;
    private tooltip;
    private currentDiff;
    private readonly progressStore;
    constructor(sessionResource: URI, requestId: string, inUndoStop: string | undefined, labelService: ILabelService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, menuService: IMenuService, hoverService: IHoverService, chatService: IChatService, configurationService: IConfigurationService);
    private registerListeners;
    private showDiff;
    /**
     * @param uri URI of the file on-disk being changed
     * @param isStreaming Whether the edit has completed (at the time of this being rendered)
     */
    render(uri: URI): void;
    private updateTooltip;
}
