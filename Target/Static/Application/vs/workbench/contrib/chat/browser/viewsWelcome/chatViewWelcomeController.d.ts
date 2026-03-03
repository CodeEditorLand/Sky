import { Event } from '../../../../../base/common/event.js';
import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI } from '../../../../../base/common/uri.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IMarkdownRendererService } from '../../../../../platform/markdown/browser/markdownRenderer.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { ChatAgentLocation } from '../../common/constants.js';
import { IChatViewsWelcomeDescriptor } from './chatViewsWelcome.js';
export interface IViewWelcomeDelegate {
    readonly onDidChangeViewWelcomeState: Event<void>;
    shouldShowWelcome(): boolean;
}
export declare class ChatViewWelcomeController extends Disposable {
    private readonly container;
    private readonly delegate;
    private readonly location;
    private contextKeyService;
    private instantiationService;
    private element;
    private enabled;
    private readonly enabledDisposables;
    private readonly renderDisposables;
    private readonly _isShowingWelcome;
    get isShowingWelcome(): IObservable<boolean>;
    constructor(container: HTMLElement, delegate: IViewWelcomeDelegate, location: ChatAgentLocation, contextKeyService: IContextKeyService, instantiationService: IInstantiationService);
    getMatchingWelcomeView(): IChatViewsWelcomeDescriptor | undefined;
    private update;
    private render;
}
export interface IChatViewWelcomeContent {
    readonly icon?: ThemeIcon | URI;
    readonly title: string;
    readonly message: IMarkdownString;
    readonly additionalMessage?: string | IMarkdownString;
    tips?: IMarkdownString;
    readonly inputPart?: HTMLElement;
    readonly useLargeIcon?: boolean;
}
export interface IChatViewWelcomeRenderOptions {
    readonly firstLinkToButton?: boolean;
    readonly location: ChatAgentLocation;
    readonly isWidgetAgentWelcomeViewContent?: boolean;
}
export declare class ChatViewWelcomePart extends Disposable {
    readonly content: IChatViewWelcomeContent;
    private openerService;
    private logService;
    private readonly markdownRendererService;
    readonly element: HTMLElement;
    constructor(content: IChatViewWelcomeContent, options: IChatViewWelcomeRenderOptions | undefined, openerService: IOpenerService, logService: ILogService, markdownRendererService: IMarkdownRendererService);
    needsRerender(content: IChatViewWelcomeContent): boolean;
    private renderMarkdownMessageContent;
}
