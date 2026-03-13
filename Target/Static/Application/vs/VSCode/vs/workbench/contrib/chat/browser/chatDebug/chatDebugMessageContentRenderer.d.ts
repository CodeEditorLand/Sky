import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IChatDebugUserMessageEvent, IChatDebugAgentResponseEvent, IChatDebugEventMessageContent } from '../../common/chatDebugService.js';
/**
 * Render a user message event with collapsible prompt sections.
 */
export declare function renderUserMessageContent(event: IChatDebugUserMessageEvent): {
    element: HTMLElement;
    disposables: DisposableStore;
};
/**
 * Render an agent response event with collapsible response sections.
 */
export declare function renderAgentResponseContent(event: IChatDebugAgentResponseEvent): {
    element: HTMLElement;
    disposables: DisposableStore;
};
/**
 * Convert a user message or agent response event to plain text for clipboard / editor output.
 */
export declare function messageEventToPlainText(event: IChatDebugUserMessageEvent | IChatDebugAgentResponseEvent): string;
/**
 * Render a resolved message content (from resolveChatDebugLogEvent) with collapsible sections.
 */
export declare function renderResolvedMessageContent(content: IChatDebugEventMessageContent): {
    element: HTMLElement;
    disposables: DisposableStore;
};
/**
 * Convert a resolved message content to plain text.
 */
export declare function resolvedMessageToPlainText(content: IChatDebugEventMessageContent): string;
