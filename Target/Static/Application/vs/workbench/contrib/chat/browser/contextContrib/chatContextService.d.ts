import { ThemeIcon } from '../../../../../base/common/themables.js';
import { LanguageSelector } from '../../../../../editor/common/languageSelector.js';
import { IChatContextPickService } from '../attachments/chatContextPickService.js';
import { IChatContextItem, IChatExplicitContextProvider, IChatResourceContextProvider, IChatWorkspaceContextProvider } from '../../common/contextContrib/chatContext.js';
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
    registerChatWorkspaceContextProvider(id: string, provider: IChatWorkspaceContextProvider): void;
    registerChatExplicitContextProvider(id: string, provider: IChatExplicitContextProvider): void;
    registerChatResourceContextProvider(id: string, selector: LanguageSelector, provider: IChatResourceContextProvider): void;
    unregisterChatContextProvider(id: string): void;
    updateWorkspaceContextItems(id: string, items: IChatContextItem[]): void;
    getWorkspaceContextItems(): IChatRequestWorkspaceVariableEntry[];
    contextForResource(uri: URI, language?: string): Promise<StringChatContextValue | undefined>;
    private _contextForResource;
    resolveChatContext(context: StringChatContextValue, language?: string): Promise<StringChatContextValue>;
    private _asPicker;
}
