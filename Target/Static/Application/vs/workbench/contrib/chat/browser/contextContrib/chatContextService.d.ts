import { ThemeIcon } from '../../../../../base/common/themables.js';
import { LanguageSelector } from '../../../../../editor/common/languageSelector.js';
import { IChatContextPickService } from '../attachments/chatContextPickService.js';
import { IChatContextItem, IChatContextProvider } from '../../common/contextContrib/chatContext.js';
import { IChatRequestWorkspaceVariableEntry, StringChatContextValue } from '../../common/attachments/chatVariableEntries.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
export declare const IChatContextService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatContextService>;
export interface IChatContextService extends ChatContextService {
}
export declare class ChatContextService extends Disposable {
    private readonly _contextPickService;
    private readonly _extensionService;
    _serviceBrand: undefined;
    private readonly _providers;
    private readonly _workspaceContext;
    private readonly _registeredPickers;
    private _lastResourceContext;
    private _executeCommandCallback;
    constructor(_contextPickService: IChatContextPickService, _extensionService: IExtensionService);
    setExecuteCommandCallback(callback: (itemHandle: number) => Promise<void>): void;
    executeChatContextItemCommand(handle: number): Promise<void>;
    setChatContextProvider(id: string, picker: {
        title: string;
        icon: ThemeIcon;
    }): void;
    private _registerWithPickService;
    registerChatContextProvider(id: string, selector: LanguageSelector | undefined, provider: IChatContextProvider): void;
    unregisterChatContextProvider(id: string): void;
    updateWorkspaceContextItems(id: string, items: IChatContextItem[]): void;
    getWorkspaceContextItems(): IChatRequestWorkspaceVariableEntry[];
    contextForResource(uri: URI): Promise<StringChatContextValue | undefined>;
    private _contextForResource;
    resolveChatContext(context: StringChatContextValue): Promise<StringChatContextValue>;
    private _asPicker;
}
