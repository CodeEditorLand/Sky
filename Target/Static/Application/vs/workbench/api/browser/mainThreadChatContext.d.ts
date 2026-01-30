import { Disposable } from '../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import { IChatContextItem, IChatContextSupport } from '../../contrib/chat/common/contextContrib/chatContext.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IDocumentFilterDto, MainThreadChatContextShape } from '../common/extHost.protocol.js';
import { IChatContextService } from '../../contrib/chat/browser/contextContrib/chatContextService.js';
export declare class MainThreadChatContext extends Disposable implements MainThreadChatContextShape {
    private readonly _chatContextService;
    private readonly _proxy;
    private readonly _providers;
    constructor(extHostContext: IExtHostContext, _chatContextService: IChatContextService);
    $registerChatContextProvider(handle: number, id: string, selector: IDocumentFilterDto[] | undefined, _options: {
        icon: ThemeIcon;
    }, support: IChatContextSupport): void;
    $unregisterChatContextProvider(handle: number): void;
    $updateWorkspaceContextItems(handle: number, items: IChatContextItem[]): void;
    $executeChatContextItemCommand(itemHandle: number): Promise<void>;
}
