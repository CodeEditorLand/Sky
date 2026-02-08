import { URI } from '../../../../../base/common/uri.js';
import { IRange } from '../../../../../editor/common/core/range.js';
import { Action2, ICommandPaletteOptions, MenuId } from '../../../../../platform/actions/common/actions.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatAgentResult } from '../../common/participants/chatAgents.js';
import { IChatModel } from '../../common/model/chatModel.js';
import { IChatMode } from '../../common/chatModes.js';
import { IChatRequestViewModel, IChatResponseViewModel } from '../../common/model/chatViewModel.js';
import { ChatModeKind } from '../../common/constants.js';
import { ILanguageModelChatSelector } from '../../common/languageModels.js';
import { IToolData, IToolSet } from '../../common/tools/languageModelToolsService.js';
export declare const CHAT_CATEGORY: import("../../../../../nls.js").ILocalizedString;
export declare const ACTION_ID_NEW_CHAT = "workbench.action.chat.newChat";
export declare const ACTION_ID_NEW_EDIT_SESSION = "workbench.action.chat.newEditSession";
export declare const ACTION_ID_OPEN_CHAT = "workbench.action.openChat";
export declare const CHAT_OPEN_ACTION_ID = "workbench.action.chat.open";
export declare const CHAT_SETUP_ACTION_ID = "workbench.action.chat.triggerSetup";
export declare const CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID = "workbench.action.chat.triggerSetupSupportAnonymousAction";
export interface IChatViewOpenOptions {
    /**
     * The query for chat.
     */
    query: string;
    /**
     * Whether the query is partial and will await more input from the user.
     */
    isPartialQuery?: boolean;
    /**
     * A list of tools IDs with `canBeReferencedInPrompt` that will be resolved and attached if they exist.
     */
    toolIds?: string[];
    /**
     * Any previous chat requests and responses that should be shown in the chat view.
     */
    previousRequests?: IChatViewOpenRequestEntry[];
    /**
     * Whether a screenshot of the focused window should be taken and attached
     */
    attachScreenshot?: boolean;
    /**
     * A list of file URIs to attach to the chat as context.
     */
    attachFiles?: (URI | {
        uri: URI;
        range: IRange;
    })[];
    /**
     * A list of source control history item changes to attach to the chat as context.
     */
    attachHistoryItemChanges?: {
        uri: URI;
        historyItemId: string;
    }[];
    /**
     * A list of source control history item change ranges to attach to the chat as context.
     */
    attachHistoryItemChangeRanges?: {
        start: {
            uri: URI;
            historyItemId: string;
        };
        end: {
            uri: URI;
            historyItemId: string;
        };
    }[];
    /**
     * The mode ID or name to open the chat in.
     */
    mode?: ChatModeKind | string;
    /**
     * The language model selector to use for the chat.
     * An Error will be thrown if there's no match. If there are multiple
     * matches, the first match will be used.
     *
     * Examples:
     *
     * ```
     * {
     *   id: 'claude-sonnet-4',
     *   vendor: 'copilot'
     * }
     * ```
     *
     * Use `claude-sonnet-4` from any vendor:
     *
     * ```
     * {
     *   id: 'claude-sonnet-4',
     * }
     * ```
     */
    modelSelector?: ILanguageModelChatSelector;
    /**
     * Wait to resolve the command until the chat response reaches a terminal state (complete, error, or pending user confirmation, etc.).
     */
    blockOnResponse?: boolean;
    /**
     * A list of tool identifiers to include. When specified alone, only these tools will be enabled.
     * Identifiers can be tool IDs, tool reference names (`toolReferenceName`),
     * toolset IDs, or toolset reference names (`referenceName`).
     * When a toolset identifier matches, all tools in that toolset are included.
     * Can be combined with `toolsExclude` for fine-grained control.
     */
    toolsInclude?: string[];
    /**
     * A list of tool identifiers to exclude. When specified alone, all tools except these will be enabled.
     * Identifiers can be tool IDs, tool reference names (`toolReferenceName`),
     * toolset IDs, or toolset reference names (`referenceName`).
     * When a toolset identifier matches, all tools in that toolset are excluded.
     * Can be combined with `toolsInclude` - exclusions are applied after inclusions.
     * Explicit tool references in `toolsInclude` override toolset exclusions,
     * but explicit tool exclusions always win.
     */
    toolsExclude?: string[];
}
export interface IChatViewOpenRequestEntry {
    request: string;
    response: string;
}
export declare const CHAT_CONFIG_MENU_ID: MenuId;
declare abstract class OpenChatGlobalAction extends Action2 {
    private readonly mode?;
    constructor(overrides: Pick<ICommandPaletteOptions, 'keybinding' | 'title' | 'id' | 'menu'>, mode?: IChatMode | undefined);
    run(accessor: ServicesAccessor, opts?: string | IChatViewOpenOptions): Promise<IChatAgentResult & {
        type?: 'confirmation';
    } | undefined>;
    private handleSwitchToMode;
}
export declare function getOpenChatActionIdForMode(mode: IChatMode): string;
export declare abstract class ModeOpenChatGlobalAction extends OpenChatGlobalAction {
    constructor(mode: IChatMode, keybinding?: ICommandPaletteOptions['keybinding']);
}
export declare function registerChatActions(): void;
export declare function stringifyItem(item: IChatRequestViewModel | IChatResponseViewModel, includeName?: boolean): string;
export interface IToolFilteringOptions {
    allTools: IToolData[];
    allToolSets: IToolSet[];
    toolsInclude?: string[];
    toolsExclude?: string[];
}
export interface IToolFilteringResult {
    enablementMap: Map<IToolData | IToolSet, boolean>;
    unknownIdentifiers: string[];
}
/**
 * Computes the tool enablement map based on include/exclude filters.
 *
 * Resolution algorithm:
 * 1. If `toolsInclude` is specified, start with only those tools/toolsets enabled
 * 2. If `toolsExclude` is specified, remove those tools/toolsets
 * 3. Explicit tool references in `toolsInclude` override toolset exclusions
 * 4. Explicit tool exclusions always win
 * 5. Toolset enablement is calculated based on whether all member tools are enabled
 *
 * @throws Error if filtering results in zero enabled tools
 */
export declare function computeToolEnablementMap(options: IToolFilteringOptions): IToolFilteringResult;
/**
 * Returns whether we can continue clearing/switching chat sessions, false to cancel.
 */
export declare function handleCurrentEditingSession(model: IChatModel, phrase: string | undefined, dialogService: IDialogService): Promise<boolean>;
/**
 * Returns whether we can switch the agent, based on whether the user had to agree to clear the session, false to cancel.
 */
export declare function handleModeSwitch(accessor: ServicesAccessor, fromMode: ChatModeKind, toMode: ChatModeKind, requestCount: number, model: IChatModel | undefined): Promise<false | {
    needToClearSession: boolean;
}>;
export interface IClearEditingSessionConfirmationOptions {
    titleOverride?: string;
    messageOverride?: string;
    isArchiveAction?: boolean;
}
export {};
