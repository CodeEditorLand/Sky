import { URI } from '../../../../../base/common/uri.js';
/**
 * Target location for importing a chat session.
 * - 'chatViewPane': Opens in the chat view pane (sidebar/panel)
 * - 'default': Opens in the active editor group
 */
export type ChatImportTarget = 'chatViewPane' | 'default';
export interface ChatImportOptions {
    inputPath?: URI;
    target?: ChatImportTarget;
}
export declare function registerChatExportActions(): void;
