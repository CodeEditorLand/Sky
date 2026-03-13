import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { IChatSessionItem, IChatSessionItemController, IChatSessionItemsDelta, IChatSessionsService } from '../../common/chatSessionsService.js';
export declare class LocalAgentsSessionsController extends Disposable implements IChatSessionItemController, IWorkbenchContribution {
    private readonly chatService;
    private readonly chatSessionsService;
    private readonly logService;
    static readonly ID = "workbench.contrib.localAgentsSessionsController";
    readonly chatSessionType = "local";
    private readonly _onDidChange;
    readonly onDidChange: import("../../../../../base/common/event.js").Event<void>;
    readonly _onDidChangeChatSessionItems: Emitter<IChatSessionItemsDelta>;
    readonly onDidChangeChatSessionItems: import("../../../../../base/common/event.js").Event<IChatSessionItemsDelta>;
    constructor(chatService: IChatService, chatSessionsService: IChatSessionsService, logService: ILogService);
    private _items;
    get items(): readonly IChatSessionItem[];
    refresh(token: CancellationToken): Promise<void>;
    private registerListeners;
    private getItem;
    private provideChatSessionItems;
    private getHistoryItems;
    private toChatSessionItem;
    private modelToStatus;
    private chatResponseStateToStatus;
}
