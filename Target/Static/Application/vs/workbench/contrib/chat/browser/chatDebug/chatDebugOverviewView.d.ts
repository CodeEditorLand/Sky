import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IChatDebugService } from '../../common/chatDebugService.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { IChatSessionsService } from '../../common/chatSessionsService.js';
import { IChatWidgetService } from '../chat.js';
export declare const enum OverviewNavigation {
    Home = "home",
    Logs = "logs",
    FlowChart = "flowchart"
}
export declare class ChatDebugOverviewView extends Disposable {
    private readonly chatService;
    private readonly chatDebugService;
    private readonly chatWidgetService;
    private readonly chatSessionsService;
    private readonly _onNavigate;
    readonly onNavigate: import("../../../../../base/common/event.js").Event<OverviewNavigation>;
    readonly container: HTMLElement;
    private readonly content;
    private readonly breadcrumbWidget;
    private readonly loadDisposables;
    private currentSessionResource;
    private metricsContainer;
    private isFirstLoad;
    constructor(parent: HTMLElement, chatService: IChatService, chatDebugService: IChatDebugService, chatWidgetService: IChatWidgetService, chatSessionsService: IChatSessionsService);
    setSession(sessionResource: URI): void;
    show(): void;
    hide(): void;
    refresh(): void;
    updateBreadcrumb(): void;
    private load;
    private renderSessionDetails;
    private getLocationLabel;
    private renderDerivedOverview;
    private renderMetricsShimmer;
    private renderMetricsContent;
}
