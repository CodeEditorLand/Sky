import { Disposable } from '../../../base/common/lifecycle.js';
import { IChatDebugService } from '../../contrib/chat/common/chatDebugService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IChatDebugEventDto, MainThreadChatDebugShape } from '../common/extHost.protocol.js';
export declare class MainThreadChatDebug extends Disposable implements MainThreadChatDebugShape {
    private readonly _chatDebugService;
    private readonly _proxy;
    private readonly _providerDisposables;
    private readonly _activeSessionResources;
    constructor(extHostContext: IExtHostContext, _chatDebugService: IChatDebugService);
    $registerChatDebugLogProvider(handle: number): void;
    $unregisterChatDebugLogProvider(handle: number): void;
    $acceptChatDebugEvent(handle: number, dto: IChatDebugEventDto): void;
    private _reviveEvent;
}
