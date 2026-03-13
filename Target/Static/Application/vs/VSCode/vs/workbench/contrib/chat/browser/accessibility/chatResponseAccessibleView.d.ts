import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { AccessibleViewProviderId, AccessibleViewType, IAccessibleViewContentProvider } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplementation } from '../../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { AccessibilityVerbositySettingId } from '../../../accessibility/browser/accessibilityConfiguration.js';
import { IChatExtensionsContent, IChatModifiedFilesConfirmationData, IChatPullRequestContent, IChatSimpleToolInvocationData, IChatSubagentToolInvocationData, IChatTerminalToolInvocationData, IChatTodoListContent, IChatToolInputInvocationData, IChatToolResourcesInvocationData, ILegacyChatTerminalToolInvocationData, IToolResultOutputDetailsSerialized } from '../../common/chatService/chatService.js';
import { IToolResultInputOutputDetails, IToolResultOutputDetails } from '../../common/tools/languageModelToolsService.js';
import { ChatTreeItem, IChatWidget } from '../chat.js';
import { Location } from '../../../../../editor/common/languages.js';
export declare class ChatResponseAccessibleView implements IAccessibleViewImplementation {
    readonly priority = 100;
    readonly name = "panelChat";
    readonly type = AccessibleViewType.View;
    readonly when: import("../../../../../platform/contextkey/common/contextkey.ts").RawContextKey<boolean>;
    getProvider(accessor: ServicesAccessor): ChatResponseAccessibleProvider | undefined;
}
type ToolSpecificData = IChatTerminalToolInvocationData | ILegacyChatTerminalToolInvocationData | IChatToolInputInvocationData | IChatExtensionsContent | IChatPullRequestContent | IChatTodoListContent | IChatSubagentToolInvocationData | IChatSimpleToolInvocationData | IChatToolResourcesInvocationData | IChatModifiedFilesConfirmationData;
type ResultDetails = Array<URI | Location> | IToolResultInputOutputDetails | IToolResultOutputDetails | IToolResultOutputDetailsSerialized;
export declare const CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_STORAGE_KEY = "chat.accessibleView.includeThinking";
export declare function isThinkingContentIncludedInAccessibleView(storageService: IStorageService): boolean;
export declare function getToolSpecificDataDescription(toolSpecificData: ToolSpecificData | undefined): string;
export declare function getResultDetailsDescription(resultDetails: ResultDetails | undefined): {
    input?: string;
    files?: string[];
    isError?: boolean;
};
export declare function getToolInvocationA11yDescription(invocationMessage: string | undefined, pastTenseMessage: string | undefined, toolSpecificData: ToolSpecificData | undefined, resultDetails: ResultDetails | undefined, isComplete: boolean): string;
declare class ChatResponseAccessibleProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _widget;
    private readonly _wasOpenedFromInput;
    private readonly _storageService;
    private _focusedItem;
    private readonly _focusedItemDisposables;
    private readonly _storageDisposables;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    constructor(_widget: IChatWidget, item: ChatTreeItem, _wasOpenedFromInput: boolean, _storageService: IStorageService);
    readonly id = AccessibleViewProviderId.PanelChat;
    readonly verbositySettingKey = AccessibilityVerbositySettingId.Chat;
    readonly options: {
        type: AccessibleViewType;
    };
    provideContent(): string;
    private _setFocusedItem;
    private _renderMessageAsPlaintext;
    private _getContent;
    private _normalizeWhitespace;
    private _shouldIncludeThinkingContent;
    onClose(): void;
    provideNextContent(): string | undefined;
    providePreviousContent(): string | undefined;
}
export {};
