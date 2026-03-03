import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IChatDebugService } from '../../common/chatDebugService.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { IChatWidgetService } from '../chat.js';
export declare class ChatDebugHomeView extends Disposable {
    private readonly chatService;
    private readonly chatDebugService;
    private readonly chatWidgetService;
    private readonly _onNavigateToSession;
    readonly onNavigateToSession: import("../../../../../base/common/event.js").Event<URI>;
    readonly container: HTMLElement;
    private readonly scrollContent;
    private readonly renderDisposables;
    constructor(parent: HTMLElement, chatService: IChatService, chatDebugService: IChatDebugService, chatWidgetService: IChatWidgetService);
    show(): void;
    hide(): void;
    render(): void;
}
