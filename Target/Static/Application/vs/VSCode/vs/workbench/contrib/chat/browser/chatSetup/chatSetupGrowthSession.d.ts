import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ILifecycleService } from '../../../../services/lifecycle/common/lifecycle.js';
import { IChatSessionItem, IChatSessionItemController, IChatSessionItemsDelta, IChatSessionsService } from '../../common/chatSessionsService.js';
import { IAgentSession } from '../agentSessions/agentSessionsModel.js';
import { ISessionOpenerParticipant, ISessionOpenOptions } from '../agentSessions/agentSessionsOpener.js';
import { IChatWidgetService } from '../chat.js';
/**
 * Core-side growth session controller that shows a single "attention needed"
 * session item in the agent sessions view for anonymous/new users.
 *
 * When the user clicks the session, we open the chat panel (which triggers the
 * anonymous setup flow). When the user opens chat at all, the badge is cleared.
 *
 * The session is shown at most once, tracked via a storage flag.
 */
export declare class GrowthSessionController extends Disposable implements IChatSessionItemController {
    private readonly storageService;
    private readonly chatWidgetService;
    private readonly lifecycleService;
    private readonly logService;
    static readonly STORAGE_KEY = "chat.growthSession.dismissed";
    private static readonly SESSION_URI;
    private readonly _onDidChangeChatSessionItems;
    readonly onDidChangeChatSessionItems: Event<IChatSessionItemsDelta>;
    private readonly _onDidDismiss;
    readonly onDidDismiss: Event<void>;
    private readonly _created;
    private _dismissed;
    get isDismissed(): boolean;
    constructor(storageService: IStorageService, chatWidgetService: IChatWidgetService, lifecycleService: ILifecycleService, logService: ILogService);
    get items(): readonly IChatSessionItem[];
    refresh(): Promise<void>;
    private dismiss;
}
/**
 * Handles clicks on the growth session item in the agent sessions view.
 * Opens a new local chat session with a pre-seeded welcome message.
 * The user can then send messages that go through the normal agent.
 */
export declare class GrowthSessionOpenerParticipant implements ISessionOpenerParticipant {
    handleOpenSession(accessor: ServicesAccessor, session: IAgentSession, _openOptions?: ISessionOpenOptions): Promise<boolean>;
}
/**
 * Registers the growth session controller and opener participant.
 * Returns a disposable that cleans up all registrations.
 */
export declare function registerGrowthSession(chatSessionsService: IChatSessionsService, growthController: GrowthSessionController): IDisposable;
