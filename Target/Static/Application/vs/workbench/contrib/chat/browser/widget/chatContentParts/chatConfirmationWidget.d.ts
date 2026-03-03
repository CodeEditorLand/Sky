import { Separator } from '../../../../../../base/common/actions.js';
import { Event } from '../../../../../../base/common/event.js';
import { IMarkdownString } from '../../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import type { ThemeIcon } from '../../../../../../base/common/themables.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IMarkdownRendererService } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IChatContentPartRenderContext } from './chatContentParts.js';
import { IChatMarkdownAnchorService } from './chatMarkdownAnchorService.js';
import './media/chatConfirmationWidget.css';
export interface IChatConfirmationButton<T> {
    label: string;
    isSecondary?: boolean;
    tooltip?: string;
    data: T;
    disabled?: boolean;
    readonly onDidChangeDisablement?: Event<boolean>;
    moreActions?: (IChatConfirmationButton<T> | Separator)[];
}
export interface IChatConfirmationWidgetOptions<T> {
    title: string | IMarkdownString;
    message: string | IMarkdownString;
    subtitle?: string | IMarkdownString;
    buttons: IChatConfirmationButton<T>[];
    toolbarData?: {
        arg: unknown;
        partType: string;
        partSource?: string;
    };
}
export declare class ChatQueryTitlePart extends Disposable {
    private readonly element;
    private _title;
    private readonly _renderer;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    private readonly _renderedTitle;
    get title(): string | IMarkdownString;
    set title(value: string | IMarkdownString);
    constructor(element: HTMLElement, _title: IMarkdownString | string, subtitle: string | IMarkdownString | undefined, _renderer: IMarkdownRendererService);
    private toMdString;
}
declare abstract class BaseSimpleChatConfirmationWidget<T> extends Disposable {
    protected readonly context: IChatContentPartRenderContext;
    protected readonly instantiationService: IInstantiationService;
    protected readonly _markdownRendererService: IMarkdownRendererService;
    private _onDidClick;
    get onDidClick(): Event<IChatConfirmationButton<T>>;
    private _domNode;
    get domNode(): HTMLElement;
    setShowButtons(showButton: boolean): void;
    private readonly messageElement;
    constructor(context: IChatContentPartRenderContext, options: IChatConfirmationWidgetOptions<T>, instantiationService: IInstantiationService, _markdownRendererService: IMarkdownRendererService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService);
    protected renderMessage(element: HTMLElement): void;
}
/** @deprecated Use ChatConfirmationWidget instead */
export declare class SimpleChatConfirmationWidget<T> extends BaseSimpleChatConfirmationWidget<T> {
    private _renderedMessage;
    constructor(context: IChatContentPartRenderContext, options: IChatConfirmationWidgetOptions<T>, instantiationService: IInstantiationService, markdownRendererService: IMarkdownRendererService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService);
    updateMessage(message: string | IMarkdownString): void;
}
export interface IChatConfirmationWidget2Options<T> {
    title: string | IMarkdownString;
    message: string | IMarkdownString | HTMLElement;
    icon?: ThemeIcon;
    subtitle?: string | IMarkdownString;
    buttons: IChatConfirmationButton<T>[];
    toolbarData?: {
        arg: unknown;
        partType: string;
        partSource?: string;
    };
}
declare abstract class BaseChatConfirmationWidget<T> extends Disposable {
    protected readonly _context: IChatContentPartRenderContext;
    protected readonly instantiationService: IInstantiationService;
    protected readonly markdownRendererService: IMarkdownRendererService;
    private readonly contextMenuService;
    private readonly chatMarkdownAnchorService;
    private _onDidClick;
    get onDidClick(): Event<IChatConfirmationButton<T>>;
    private _domNode;
    get domNode(): HTMLElement;
    private _buttonsDomNode;
    setShowButtons(showButton: boolean): void;
    private readonly messageElement;
    private readonly markdownContentPart;
    get codeblocksPartId(): string | undefined;
    get codeblocks(): import("../../chat.ts").IChatCodeBlockInfo[] | undefined;
    constructor(_context: IChatContentPartRenderContext, options: IChatConfirmationWidget2Options<T>, instantiationService: IInstantiationService, markdownRendererService: IMarkdownRendererService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, chatMarkdownAnchorService: IChatMarkdownAnchorService);
    updateButtons(buttons: IChatConfirmationButton<T>[]): void;
    protected renderMessage(element: HTMLElement | IMarkdownString | string): void;
}
export declare class ChatConfirmationWidget<T> extends BaseChatConfirmationWidget<T> {
    private _renderedMessage;
    constructor(context: IChatContentPartRenderContext, options: IChatConfirmationWidget2Options<T>, instantiationService: IInstantiationService, markdownRendererService: IMarkdownRendererService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, chatMarkdownAnchorService: IChatMarkdownAnchorService);
    updateMessage(message: string | IMarkdownString): void;
}
export declare class ChatCustomConfirmationWidget<T> extends BaseChatConfirmationWidget<T> {
    constructor(context: IChatContentPartRenderContext, options: IChatConfirmationWidget2Options<T>, instantiationService: IInstantiationService, markdownRendererService: IMarkdownRendererService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, chatMarkdownAnchorService: IChatMarkdownAnchorService);
}
export {};
