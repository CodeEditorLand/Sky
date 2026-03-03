import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IChatDebugEventModelTurnContent } from '../../common/chatDebugService.js';
/**
 * Render a resolved model turn content with structured display of
 * request metadata, token usage, and timing.
 */
export declare function renderModelTurnContent(content: IChatDebugEventModelTurnContent): {
    element: HTMLElement;
    disposables: DisposableStore;
};
/**
 * Convert a resolved model turn content to plain text for clipboard / editor output.
 */
export declare function modelTurnContentToPlainText(content: IChatDebugEventModelTurnContent): string;
