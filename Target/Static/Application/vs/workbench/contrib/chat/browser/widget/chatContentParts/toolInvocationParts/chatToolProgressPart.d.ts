import { IMarkdownRenderer } from '../../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IConfigurationService } from '../../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../../../common/chatService/chatService.js';
import { IChatCodeBlockInfo } from '../../../chat.js';
import { IChatContentPartRenderContext } from '../chatContentParts.js';
import { BaseChatToolInvocationSubPart } from './chatToolInvocationSubPart.js';
export declare class ChatToolProgressSubPart extends BaseChatToolInvocationSubPart {
    private readonly context;
    private readonly renderer;
    private readonly announcedToolProgressKeys;
    private readonly instantiationService;
    private readonly configurationService;
    readonly domNode: HTMLElement;
    readonly codeblocks: IChatCodeBlockInfo[];
    constructor(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized, context: IChatContentPartRenderContext, renderer: IMarkdownRenderer, announcedToolProgressKeys: Set<string> | undefined, instantiationService: IInstantiationService, configurationService: IConfigurationService);
    private createProgressPart;
    private get toolIsConfirmed();
    private renderProgressContent;
    private getAnnouncementKey;
    private computeShouldAnnounce;
    private provideScreenReaderStatus;
    private hasMeaningfulContent;
}
