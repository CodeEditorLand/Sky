import { Dimension } from '../../../../../base/browser/dom.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatDebugEvent, IChatDebugService } from '../../common/chatDebugService.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { ChatDebugFilterState } from './chatDebugFilters.js';
export declare const enum LogsNavigation {
    Home = "home",
    Overview = "overview"
}
export declare class ChatDebugLogsView extends Disposable {
    private readonly filterState;
    private readonly chatService;
    private readonly chatDebugService;
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly _onNavigate;
    readonly onNavigate: import("../../../../../base/common/event.js").Event<LogsNavigation>;
    readonly container: HTMLElement;
    private readonly breadcrumbWidget;
    private readonly headerContainer;
    private readonly tableHeader;
    private readonly bodyContainer;
    private readonly listContainer;
    private readonly treeContainer;
    private readonly detailPanel;
    private readonly filterWidget;
    private readonly viewModeToggle;
    private list;
    private tree;
    private currentSessionResource;
    private logsViewMode;
    private events;
    private currentDimension;
    private readonly eventListener;
    private readonly sessionStateDisposable;
    private shimmerRow;
    constructor(parent: HTMLElement, filterState: ChatDebugFilterState, chatService: IChatService, chatDebugService: IChatDebugService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService);
    setSession(sessionResource: URI): void;
    show(): void;
    hide(): void;
    focus(): void;
    updateBreadcrumb(): void;
    layout(dimension: Dimension): void;
    refreshList(): void;
    private updateShimmerPosition;
    addEvent(event: IChatDebugEvent): void;
    private loadEvents;
    private trackSessionState;
    private refreshTree;
    private buildTreeHierarchy;
    private toggleViewMode;
    private updateViewModeToggle;
    private updateMoreFiltersChecked;
}
