import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { ILayoutService } from '../../../../../platform/layout/browser/layoutService.js';
import { IEditorService, type PreferredGroup } from '../../../../services/editor/common/editorService.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { ChatAgentLocation } from '../../common/constants.js';
import { ChatViewPaneTarget, IChatWidget, IChatWidgetService, IQuickChatService } from '../chat.js';
import { IChatEditorOptions } from '../widgetHosts/editor/chatEditor.js';
export declare class ChatWidgetService extends Disposable implements IChatWidgetService {
    private readonly editorGroupsService;
    private readonly viewsService;
    private readonly quickChatService;
    private readonly layoutService;
    private readonly editorService;
    private readonly chatService;
    readonly _serviceBrand: undefined;
    private _widgets;
    private _lastFocusedWidget;
    private readonly _onDidAddWidget;
    readonly onDidAddWidget: Event<IChatWidget>;
    private readonly _onDidBackgroundSession;
    readonly onDidBackgroundSession: Event<URI>;
    private readonly _onDidChangeFocusedWidget;
    readonly onDidChangeFocusedWidget: Event<IChatWidget | undefined>;
    private readonly _onDidChangeFocusedSession;
    readonly onDidChangeFocusedSession: Event<void>;
    constructor(editorGroupsService: IEditorGroupsService, viewsService: IViewsService, quickChatService: IQuickChatService, layoutService: ILayoutService, editorService: IEditorService, chatService: IChatService);
    get lastFocusedWidget(): IChatWidget | undefined;
    getAllWidgets(): ReadonlyArray<IChatWidget>;
    getWidgetsByLocations(location: ChatAgentLocation): ReadonlyArray<IChatWidget>;
    getWidgetByInputUri(uri: URI): IChatWidget | undefined;
    getWidgetBySessionResource(sessionResource: URI): IChatWidget | undefined;
    revealWidget(preserveFocus?: boolean): Promise<IChatWidget | undefined>;
    reveal(widget: IChatWidget, preserveFocus?: boolean): Promise<boolean>;
    /**
     * Reveal the session if already open, otherwise open it.
     */
    openSession(sessionResource: URI, target?: typeof ChatViewPaneTarget): Promise<IChatWidget | undefined>;
    openSession(sessionResource: URI, target?: PreferredGroup, options?: IChatEditorOptions): Promise<IChatWidget | undefined>;
    private revealSessionIfAlreadyOpen;
    private prepareSessionForMove;
    private findExistingChatEditorByUri;
    private isSameEditorTarget;
    private setLastFocusedWidget;
    register(newWidget: IChatWidget): IDisposable;
}
