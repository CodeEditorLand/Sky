import { URI } from '../../../../../base/common/uri.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
export interface IChatRemovePendingRequestContext {
    sessionResource: URI;
    pendingRequestId: string;
}
export declare class ChatQueueMessageAction extends Action2 {
    static readonly ID = "workbench.action.chat.queueMessage";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare class ChatSteerWithMessageAction extends Action2 {
    static readonly ID = "workbench.action.chat.steerWithMessage";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare class ChatRemovePendingRequestAction extends Action2 {
    static readonly ID = "workbench.action.chat.removePendingRequest";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare class ChatSendPendingImmediatelyAction extends Action2 {
    static readonly ID = "workbench.action.chat.sendPendingImmediately";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare class ChatRemoveAllPendingRequestsAction extends Action2 {
    static readonly ID = "workbench.action.chat.removeAllPendingRequests";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare function registerChatQueueActions(): void;
