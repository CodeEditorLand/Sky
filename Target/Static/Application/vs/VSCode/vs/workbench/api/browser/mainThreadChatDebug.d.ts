import { Disposable } from '../../../base/common/lifecycle.js';
import { IChatDebugService } from '../../contrib/chat/common/chatDebugService.js';
import { IChatService } from '../../contrib/chat/common/chatService/chatService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IChatDebugEventDto, MainThreadChatDebugShape } from '../common/extHost.protocol.js';
export declare class MainThreadChatDebug extends Disposable implements MainThreadChatDebugShape {
    private readonly _chatDebugService;
    private readonly _chatService;
    private readonly _proxy;
    private readonly _providerDisposables;
    private readonly _activeSessionResources;
    private readonly _coreEventForwarder;
    constructor(extHostContext: IExtHostContext, _chatDebugService: IChatDebugService, _chatService: IChatService);
    $subscribeToCoreDebugEvents(): void;
    $unsubscribeFromCoreDebugEvents(): void;
    $registerChatDebugLogProvider(handle: number): void;
    $unregisterChatDebugLogProvider(handle: number): void;
    $acceptChatDebugEvent(handle: number, dto: IChatDebugEventDto): void;
    private _serializeEvent;
    private _reviveEvent;
}
