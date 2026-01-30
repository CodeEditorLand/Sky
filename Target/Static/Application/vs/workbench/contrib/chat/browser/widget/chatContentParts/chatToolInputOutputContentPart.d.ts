import { IMarkdownString } from '../../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../base/common/uri.js';
import { ITextModel } from '../../../../../../editor/common/model.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { LanguageModelPartAudience } from '../../../common/languageModels.js';
import { ChatTreeItem, IChatCodeBlockInfo } from '../../chat.js';
import { ICodeBlockRenderOptions } from './codeBlockPart.js';
import { IChatContentPartRenderContext } from './chatContentParts.js';
export interface IChatCollapsibleIOCodePart {
    kind: 'code';
    textModel: ITextModel;
    languageId: string;
    options: ICodeBlockRenderOptions;
    codeBlockInfo: IChatCodeBlockInfo;
    title?: string | IMarkdownString;
}
export interface IChatCollapsibleIODataPart {
    kind: 'data';
    value?: Uint8Array;
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
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../../../base/common/event.js").Event<void>;
    private _currentWidth;
    private readonly _editorReferences;
    private readonly _titlePart;
    private _outputSubPart;
    readonly domNode: HTMLElement;
    get codeblocks(): IChatCodeBlockInfo[];
    set title(s: string | IMarkdownString);
    get title(): string | IMarkdownString;
    private readonly _expanded;
    get expanded(): boolean;
    constructor(title: IMarkdownString | string, subtitle: string | IMarkdownString | undefined, progressTooltip: IMarkdownString | string | undefined, context: IChatContentPartRenderContext, input: IChatCollapsibleInputData, output: IChatCollapsibleOutputData | undefined, isError: boolean, initiallyExpanded: boolean, contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, hoverService: IHoverService);
    private createMessageContents;
    private addCodeBlock;
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    layout(width: number): void;
}
