import { IMarkdownString } from '../../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../base/common/uri.js';
import { ILanguageService } from '../../../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../../../editor/common/services/model.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { LanguageModelPartAudience } from '../../../common/languageModels.js';
import { ChatTreeItem, IChatCodeBlockInfo } from '../../chat.js';
import { ICodeBlockRenderOptions } from './codeBlockPart.js';
import { IChatContentPartRenderContext } from './chatContentParts.js';
import { IChatMarkdownAnchorService } from './chatMarkdownAnchorService.js';
export interface IChatCollapsibleIOCodePart {
    kind: 'code';
    data: string;
    languageId: string;
    options: ICodeBlockRenderOptions;
    codeBlockIndex: number;
    ownerMarkdownPartId: string;
    title?: string | IMarkdownString;
}
export interface IChatCollapsibleIODataPart {
    kind: 'data';
    value?: Uint8Array;
    /**
     * Base64-encoded value that can be decoded lazily to avoid expensive
     * decoding during scroll. Takes precedence over `value` when present.
     */
    base64Value?: string;
    audience?: LanguageModelPartAudience[];
    mimeType: string | undefined;
    uri: URI;
}
export type ChatCollapsibleIOPart = IChatCollapsibleIOCodePart | IChatCollapsibleIODataPart;
export interface IChatCollapsibleInputData extends IChatCollapsibleIOCodePart {
}
export interface IChatCollapsibleOutputData {
    parts: ChatCollapsibleIOPart[];
}
export declare class ChatCollapsibleInputOutputContentPart extends Disposable {
    private readonly context;
    private readonly input;
    private readonly output;
    private readonly contextKeyService;
    private readonly _instantiationService;
    private readonly modelService;
    private readonly languageService;
    private readonly chatMarkdownAnchorService;
    private readonly configurationService;
    private readonly _editorReferences;
    private readonly _titlePart;
    private _outputSubPart;
    readonly domNode: HTMLElement;
    private _contentInitialized;
    get codeblocks(): IChatCodeBlockInfo[];
    set title(s: string | IMarkdownString);
    get title(): string | IMarkdownString;
    private readonly _expanded;
    get expanded(): boolean;
    constructor(title: IMarkdownString | string, subtitle: string | IMarkdownString | undefined, progressTooltip: IMarkdownString | string | undefined, context: IChatContentPartRenderContext, input: IChatCollapsibleInputData, output: IChatCollapsibleOutputData | undefined, isError: boolean, initiallyExpanded: boolean, contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, hoverService: IHoverService, modelService: IModelService, languageService: ILanguageService, chatMarkdownAnchorService: IChatMarkdownAnchorService, configurationService: IConfigurationService);
    private createMessageContents;
    private addCodeBlock;
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    layout(width: number): void;
}
