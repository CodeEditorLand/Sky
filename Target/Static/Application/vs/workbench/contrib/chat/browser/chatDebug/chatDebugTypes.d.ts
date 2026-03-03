import { BreadcrumbsItem, BreadcrumbsWidget } from '../../../../../base/browser/ui/breadcrumbs/breadcrumbsWidget.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { IEditorOptions } from '../../../../../platform/editor/common/editor.js';
/**
 * Options passed to the chat debug editor pane to control
 * which session and view to navigate to.
 */
export interface IChatDebugEditorOptions extends IEditorOptions {
    readonly sessionResource?: URI;
    readonly viewHint?: 'home' | 'overview' | 'logs' | 'flowchart';
}
export declare const enum ViewState {
    Home = "home",
    Overview = "overview",
    Logs = "logs",
    FlowChart = "flowchart"
}
export declare const enum LogsViewMode {
    List = "list",
    Tree = "tree"
}
export declare const CHAT_DEBUG_FILTER_ACTIVE: RawContextKey<boolean>;
export declare const CHAT_DEBUG_KIND_TOOL_CALL: RawContextKey<boolean>;
export declare const CHAT_DEBUG_KIND_MODEL_TURN: RawContextKey<boolean>;
export declare const CHAT_DEBUG_KIND_PROMPT_DISCOVERY: RawContextKey<boolean>;
export declare const CHAT_DEBUG_KIND_SUBAGENT: RawContextKey<boolean>;
export declare const CHAT_DEBUG_CMD_TOGGLE_TOOL_CALL = "chatDebug.filter.toggleToolCall";
export declare const CHAT_DEBUG_CMD_TOGGLE_MODEL_TURN = "chatDebug.filter.toggleModelTurn";
export declare const CHAT_DEBUG_CMD_TOGGLE_PROMPT_DISCOVERY = "chatDebug.filter.togglePromptDiscovery";
export declare const CHAT_DEBUG_CMD_TOGGLE_SUBAGENT = "chatDebug.filter.toggleSubagent";
export declare class TextBreadcrumbItem extends BreadcrumbsItem {
    private readonly _text;
    private readonly _isLink;
    constructor(_text: string, _isLink?: boolean);
    equals(other: BreadcrumbsItem): boolean;
    dispose(): void;
    render(container: HTMLElement): void;
}
/**
 * Wire up Left/Right arrow, Home/End, and Enter keyboard navigation
 * on a BreadcrumbsWidget container.
 */
export declare function setupBreadcrumbKeyboardNavigation(container: HTMLElement, widget: BreadcrumbsWidget): IDisposable;
