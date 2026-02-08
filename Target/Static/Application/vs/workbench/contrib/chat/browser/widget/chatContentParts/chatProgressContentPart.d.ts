import { MarkdownString, type IMarkdownString } from '../../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../../base/common/themables.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IChatProgressMessage, IChatTask, IChatTaskSerialized, IChatToolInvocation, IChatToolInvocationSerialized } from '../../../common/chatService/chatService.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { ChatTreeItem } from '../../chat.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { IChatMarkdownAnchorService } from './chatMarkdownAnchorService.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { ILanguageModelToolsService } from '../../../common/tools/languageModelToolsService.js';
export declare class ChatProgressContentPart extends Disposable implements IChatContentPart {
    private readonly chatContentMarkdownRenderer;
    private readonly toolInvocation;
    private readonly instantiationService;
    private readonly chatMarkdownAnchorService;
    private readonly configurationService;
    readonly domNode: HTMLElement;
    private readonly showSpinner;
    private readonly isHidden;
    private readonly renderedMessage;
    private currentContent;
    constructor(progress: IChatProgressMessage | IChatTask | IChatTaskSerialized | {
        content: IMarkdownString;
    }, chatContentMarkdownRenderer: IMarkdownRenderer, context: IChatContentPartRenderContext, forceShowSpinner: boolean | undefined, forceShowMessage: boolean | undefined, icon: ThemeIcon | undefined, toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized | undefined, instantiationService: IInstantiationService, chatMarkdownAnchorService: IChatMarkdownAnchorService, configurationService: IConfigurationService);
    updateMessage(content: MarkdownString): void;
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    private createApprovalMessage;
}
export declare class ChatProgressSubPart extends Disposable {
    readonly domNode: HTMLElement;
    constructor(messageElement: HTMLElement, icon: ThemeIcon, tooltip: IMarkdownString | string | undefined, hoverService: IHoverService);
}
export declare class ChatWorkingProgressContentPart extends ChatProgressContentPart implements IChatContentPart {
    constructor(_workingProgress: {
        kind: 'working';
    }, chatContentMarkdownRenderer: IMarkdownRenderer, context: IChatContentPartRenderContext, instantiationService: IInstantiationService, chatMarkdownAnchorService: IChatMarkdownAnchorService, configurationService: IConfigurationService, languageModelToolsService: ILanguageModelToolsService);
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
}
