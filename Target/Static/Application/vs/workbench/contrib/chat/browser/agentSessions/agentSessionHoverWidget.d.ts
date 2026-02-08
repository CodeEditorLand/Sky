import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { IChatWidgetService } from '../chat.js';
import { IAgentSession } from './agentSessionsModel.js';
import './media/agentSessionHoverWidget.css';
export declare class AgentSessionHoverWidget extends Disposable {
    readonly session: IAgentSession;
    private readonly chatService;
    private readonly instantiationService;
    private readonly chatWidgetService;
    readonly domNode: HTMLElement;
    private modelRef?;
    private listWidget?;
    private readonly contentElement;
    private readonly loadingElement;
    private readonly renderScheduler;
    private hasRendered;
    private readonly cts;
    constructor(session: IAgentSession, chatService: IChatService, instantiationService: IInstantiationService, chatWidgetService: IChatWidgetService);
    onRendered(): void;
    private loadModel;
    private render;
    private buildHeader;
    private buildFallbackTooltip;
    private toDuration;
    private toStatusLabel;
}
