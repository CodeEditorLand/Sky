import { IAgentSession } from './agentSessionsModel.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { IEditorOptions } from '../../../../../platform/editor/common/editor.js';
export declare function openSession(accessor: ServicesAccessor, session: IAgentSession, openOptions?: {
    sideBySide?: boolean;
    editorOptions?: IEditorOptions;
    expanded?: boolean;
}): Promise<void>;
/**
 * Opens a session in the traditional chat widget (side panel or editor).
 * Use this when you explicitly want to open in the chat widget rather than agent session projection mode.
 */
export declare function openSessionInChatWidget(accessor: ServicesAccessor, session: IAgentSession, openOptions?: {
    sideBySide?: boolean;
    editorOptions?: IEditorOptions;
    expanded?: boolean;
}): Promise<void>;
