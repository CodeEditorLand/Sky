import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IChatDebugEventToolCallContent } from '../../common/chatDebugService.js';
/**
 * Render a resolved tool call content with structured sections for
 * tool name, status, duration, arguments, and output.
 * Reuses the existing message content and collapsible section components.
 * When JSON is detected in input/output, renders it with syntax highlighting
 * using the editor's tokenization.
 */
export declare function renderToolCallContent(content: IChatDebugEventToolCallContent, languageService: ILanguageService): Promise<{
    element: HTMLElement;
    disposables: DisposableStore;
}>;
/**
 * Convert a resolved tool call content to plain text for clipboard / editor output.
 */
export declare function toolCallContentToPlainText(content: IChatDebugEventToolCallContent): string;
